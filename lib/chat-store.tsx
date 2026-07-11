"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAccount } from "./account";
import { useI18n } from "./i18n";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  at: number;
  modelId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type ModelTier = "filtered" | "uncensored" | "code" | "fast" | "thinking";

export interface AiModel {
  id: string;
  name: string;
  tier: ModelTier;
  desc: string;
  /** Context window in tokens (e.g. 8192). Shown rounded to "8K" / "16K". */
  context: number;
  /** Thinking model: appends step-by-step reasoning instructions. */
  reasoning?: boolean;
  /** Coder model: appends programming-focused instructions. */
  coding?: boolean;
}

export type MessageStats = {
  completionTokens: number;
  promptTokens: number | null;
  ms: number;
  tps: number;
};

/** Lifetime usage counters — persisted per account, independent of chats, so
 *  deleting conversations never reduces them. */
export type Usage = {
  tokens: number;
  messages: number;
  chats: number;
  since: number;
};

/**
 * Active model catalog. The `id` MUST match the model identifier LM Studio
 * reports (verify at /v1/models, port 1234).
 */
export const MODELS: AiModel[] = [
  {
    id: "lfm2.5-1.2b-instruct-abliterated",
    name: "FF-Speed v1.0",
    tier: "fast",
    desc: "Lightweight, fast and fully uncensored.",
    context: 8192,
  },
  {
    id: "huihui-lfm2.5-1.2b-thinking-abliterated",
    name: "FF-Speed Thinking v1.0",
    tier: "thinking",
    desc: "Thinks and reasons step-by-step — same uncensored model.",
    reasoning: true,
    context: 8192,
  },
  {
    id: "qwen2.5-coder-3b-instruct-abliterated",
    name: "Qwen2.5 Coder 3B",
    tier: "code",
    desc: "Specialized in code — fully uncensored.",
    coding: true,
    context: 16384,
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export function getModel(id: string): AiModel {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

const SCHEMA_VERSION = 2;
const GUEST_KEY = "aiu_chats_guest";
// Cap a single message so one giant paste can't blow the localStorage quota
// (which would otherwise force eviction of every other conversation).
const MAX_CONTENT = 20000;

/**
 * Chat history is keyed to the account: each account gets its own slot, so on
 * a shared device different accounts never see each other's conversations
 * (no cross-account leak on logout), while each account's chats persist across
 * logout/login (the slot is derived from the credential, not wiped on logout).
 */
function storageKeyFor(account: string | null): string {
  if (!account) return GUEST_KEY;
  return "aiu_chats_" + account.slice(-24);
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ----------------------------- shape validation ---------------------------- *
 * localStorage holds untrusted data (corruption, manual edits, old schemas).
 * Validate + normalize every entry so a malformed blob can never crash the
 * consumers that iterate it (e.g. account-view stats).
 */
function normalizeMessage(m: unknown): ChatMessage | null {
  if (!m || typeof m !== "object") return null;
  const x = m as Record<string, unknown>;
  if (typeof x.id !== "string") return null;
  if (x.role !== "user" && x.role !== "assistant") return null;
  if (typeof x.content !== "string") return null;
  if (typeof x.at !== "number") return null;
  return {
    id: x.id,
    role: x.role,
    content: x.content,
    at: x.at,
    modelId: typeof x.modelId === "string" ? x.modelId : undefined,
  };
}

function normalizeConversation(c: unknown): Conversation | null {
  if (!c || typeof c !== "object") return null;
  const x = c as Record<string, unknown>;
  if (typeof x.id !== "string") return null;
  if (typeof x.modelId !== "string") return null;
  if (!Array.isArray(x.messages)) return null;
  const messages = x.messages
    .map(normalizeMessage)
    .filter((m): m is ChatMessage => m !== null);
  return {
    id: x.id,
    title: typeof x.title === "string" ? x.title : "Chat",
    modelId: x.modelId,
    messages,
    createdAt: typeof x.createdAt === "number" ? x.createdAt : Date.now(),
    updatedAt: typeof x.updatedAt === "number" ? x.updatedAt : Date.now(),
  };
}

function loadRaw(key: string): { list: Conversation[] | null; dropped: boolean } {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { list: [], dropped: false };
    const parsed: unknown = JSON.parse(raw);
    let list: unknown[];
    if (parsed && typeof parsed === "object") {
      const obj = parsed as { list?: unknown; v?: unknown };
      if (Array.isArray(obj.list)) list = obj.list;
      else if (Array.isArray(parsed)) list = parsed;
      else return { list: [], dropped: false };
    } else if (Array.isArray(parsed)) {
      list = parsed;
    } else {
      return { list: [], dropped: false };
    }
    const normalized = list.map(normalizeConversation);
    const valid = normalized.filter((c): c is Conversation => c !== null);
    const dropped = valid.length < normalized.length;
    if (dropped) {
      try {
        const raw2 = window.localStorage.getItem(key);
        if (raw2) window.localStorage.setItem(key + "__corrupt_backup", raw2);
      } catch { /* ignore */ }
    }
    return { list: valid, dropped };
  } catch {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) window.localStorage.setItem(key + "__corrupt_backup", raw);
    } catch { /* ignore */ }
    return { list: null, dropped: true };
  }
}

/**
 * Persist with quota handling. On QuotaExceededError, evict the OLDEST
 * conversations (end of array) and retry — but never wipe to empty (keep at
 * least one; if even one won't fit, leave the existing storage untouched so we
 * don't destroy history). Returns the list actually written (may be trimmed).
 */
function persist(key: string, list: Conversation[]): Conversation[] | null {
  const envelope = (l: Conversation[]) =>
    JSON.stringify({ v: SCHEMA_VERSION, list: l });
  try {
    window.localStorage.setItem(key, envelope(list));
    return list;
  } catch {
    let trimmed = [...list];
    while (trimmed.length > 1) {
      trimmed = trimmed.slice(0, -1);
      try {
        window.localStorage.setItem(key, envelope(trimmed));
        return trimmed;
      } catch {
        /* keep evicting the oldest until it fits */
      }
    }
    // Even a single conversation won't fit — signal total failure so the
    // caller can warn the user (don't pretend success).
    return null;
  }
}

interface ChatContextValue {
  mounted: boolean;
  conversations: Conversation[];
  active: Conversation | null;
  activeId: string | null;
  storageWarning: boolean;
  typingChats: ReadonlySet<string>;
  stats: Record<string, MessageStats>;
  usage: Usage;
  /** Per-model online status (true = loaded in LM Studio & server up). */
  modelStatus: Record<string, boolean>;
  dismissStorageWarning: () => void;
  newChat: (modelId: string, title?: string) => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  setModel: (id: string, modelId: string) => void;
  /** Send a message and stream the reply. Lives in the provider so an in-flight
   *  reply keeps generating when the user navigates away from /chat and back. */
  send: (text: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  const { t } = useI18n();
  const key = storageKeyFor(account);
  const keyRef = useRef(key);
  keyRef.current = key;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [typingChats, setTypingChats] = useState<ReadonlySet<string>>(() => new Set());
  const [stats, setStats] = useState<Record<string, MessageStats>>({});
  // Lifetime usage counters (tokens / messages / chats), persisted per account
  // SEPARATELY from conversations — so deleting chats never reduces them.
  const usageKey = "aiu_usage_" + (account ? account.slice(-24) : "guest");
  const usageKeyRef = useRef(usageKey);
  usageKeyRef.current = usageKey;
  const [usage, setUsage] = useState<Usage>({ tokens: 0, messages: 0, chats: 0, since: 0 });
  const usageInit = useRef(false);
  // Per-model availability (online/offline) polled from /api/models.
  const [modelStatus, setModelStatus] = useState<Record<string, boolean>>({});
  const convsRef = useRef<Conversation[]>([]);
  const activeIdRef = useRef<string | null>(activeId);
  activeIdRef.current = activeId;
  const typingChatsRef = useRef<ReadonlySet<string>>(typingChats);
  typingChatsRef.current = typingChats;
  const tRef = useRef(t);
  tRef.current = t;
  // Generation lives here (above the routes) so it survives navigation. We do
  // NOT abort on any unmount — that would be exactly the freeze the user hit.
  const abortRef = useRef<AbortController | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const loadFailed = useRef(false);
  const firstPersist = useRef(true);

  // (Re)load whenever the storage key changes (account login/logout/switch).
  useEffect(() => {
    const result = loadRaw(key);
    const list = result.list ?? [];
    convsRef.current = list;
    setConversations(list);
    setActiveId(list[0]?.id ?? null);
    setMounted(true);
    loadFailed.current = result.list === null;
    if (result.list === null || result.dropped) setStorageWarning(true);
  }, [key]);

  // Persist + keep in-memory state in sync if quota pressure trimmed the list.
  useEffect(() => {
    convsRef.current = conversations;
    if (!mounted) return;
    if (firstPersist.current || loadFailed.current) {
      firstPersist.current = false;
      loadFailed.current = false;
      return;
    }
    const written = persist(keyRef.current, conversations);
    if (written === null) {
      setStorageWarning(true);
    } else if (written.length !== conversations.length) {
      setConversations(written);
      setStorageWarning(true);
    }
  }, [conversations, mounted]);

  // Multi-tab convergence: when another tab writes our key, reload so the two
  // tabs don't silently diverge / overwrite each other without notice.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const { list: loaded } = loadRaw(key);
      const list = loaded ?? [];
      convsRef.current = list;
      setConversations(list);
      setActiveId((cur) => (list.some((c) => c.id === cur) ? cur : list[0]?.id ?? null));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  // Self-heal: if the active conversation no longer exists, fall back to first.
  useEffect(() => {
    if (!mounted) return;
    if (activeId && !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0]?.id ?? null);
    }
  }, [conversations, activeId, mounted]);

  // Load lifetime usage for this account (keyed like chats, but a separate
  // blob). `since` is stamped on first record (~ account start).
  useEffect(() => {
    let u: Usage = { tokens: 0, messages: 0, chats: 0, since: 0 };
    try {
      const raw = window.localStorage.getItem(usageKey);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Usage>;
        if (p && typeof p === "object") {
          u = {
            tokens: typeof p.tokens === "number" ? p.tokens : 0,
            messages: typeof p.messages === "number" ? p.messages : 0,
            chats: typeof p.chats === "number" ? p.chats : 0,
            since: typeof p.since === "number" ? p.since : 0,
          };
        }
      }
    } catch {
      /* ignore corrupt usage blob */
    }
    if (!u.since) u.since = Date.now();
    setUsage(u);
    usageInit.current = true;
  }, [usageKey]);

  // Persist usage (skip until the first load completes).
  useEffect(() => {
    if (!usageInit.current) return;
    try {
      window.localStorage.setItem(usageKeyRef.current, JSON.stringify(usage));
    } catch {
      /* quota — counters keep working in-memory */
    }
  }, [usage]);

  // Poll which models are online in LM Studio (server up + model present).
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const r = await fetch("/api/models", { cache: "no-store" });
        const d = (await r.json()) as { online?: boolean; models?: string[] };
        if (cancelled) return;
        const up = d.online === true;
        const ids = new Set<string>(Array.isArray(d.models) ? d.models : []);
        const next: Record<string, boolean> = {};
        for (const m of MODELS) next[m.id] = up && ids.has(m.id);
        setModelStatus(next);
      } catch {
        if (!cancelled) setModelStatus({});
      }
    };
    check();
    const iv = window.setInterval(check, 10000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const newChat = useCallback((modelId: string, title = "New chat"): string => {
    const c: Conversation = {
      id: uid(),
      title,
      modelId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setUsage((u) => ({ ...u, chats: u.chats + 1 }));
    return c.id;
  }, []);

  const selectChat = useCallback((id: string) => setActiveId(id), []);

  const dismissStorageWarning = useCallback(() => setStorageWarning(false), []);

  const deleteChat = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((cur) => {
      if (cur !== id) return cur;
      const next = convsRef.current.filter((c) => c.id !== id);
      return next[0]?.id ?? null;
    });
  }, []);

  const setModel = useCallback((id: string, modelId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, modelId, updatedAt: Date.now() } : c
      )
    );
  }, []);

  const addMessage = useCallback(
    (id: string, msg: Omit<ChatMessage, "id" | "at">): ChatMessage => {
      const full: ChatMessage = {
        ...msg,
        content: msg.content.slice(0, MAX_CONTENT),
        id: uid(),
        at: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const messages = [...c.messages, full];
          const title =
            c.messages.length === 0 && msg.role === "user"
              ? msg.content.slice(0, 42)
              : c.title;
          return { ...c, messages, title, updatedAt: Date.now() };
        })
      );
      return full;
    },
    []
  );

  const updateMessageContent = useCallback(
    (convId: string, msgId: string, content: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== convId
            ? c
            : {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId ? { ...m, content } : m
                ),
                updatedAt: Date.now(),
              }
        )
      );
    },
    []
  );

  // Send + stream. Uses refs for the latest active id / typing set / i18n so the
  // callback stays stable but always reads current values.
  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const current = activeIdRef.current;
      if (current && typingChatsRef.current.has(current)) return; // already generating
      const id = current ?? newChat(DEFAULT_MODEL_ID, tRef.current.chat.newChat);
      const conv = convsRef.current.find((c) => c.id === id);
      const modelId = conv?.modelId ?? DEFAULT_MODEL_ID;
      const model = getModel(modelId);

      const history = (conv?.messages ?? [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
      const apiMessages = [...history, { role: "user" as const, content: trimmed }];

      addMessage(id, { role: "user", content: trimmed });
      setUsage((u) => ({ ...u, messages: u.messages + 1 }));
      setTypingChats((s) => {
        const n = new Set(s);
        n.add(id);
        return n;
      });
      const assistant = addMessage(id, {
        role: "assistant",
        content: "",
        modelId: model.id,
      });

      // Typewriter: reveal a few chars per frame so it reads like live typing.
      let pending = "";
      let typed = 0;
      let finished = false;
      const flush = () => {
        const backlog = pending.length - typed;
        if (backlog > 0) {
          const step = Math.max(2, Math.floor(backlog / 24));
          typed = Math.min(typed + step, pending.length);
          // Strip leading whitespace — thinking models often emit leading
          // spaces/newlines before the actual answer.
          updateMessageContent(id, assistant.id, pending.slice(0, typed).replace(/^\s+/, ""));
        }
        typingTimerRef.current =
          typed < pending.length || !finished
            ? window.setTimeout(flush, 16)
            : null;
      };
      typingTimerRef.current = window.setTimeout(flush, 16);

      const controller = new AbortController();
      abortRef.current = controller;
      const t0 = Date.now();
      (async () => {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model.id,
              messages: apiMessages,
              reasoning: model.reasoning ?? false,
              coding: model.coding ?? false,
            }),
          });
          if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          const MARKER = "[[FFSTATS]]";
          let tail = "";
          let markerSeen = false;
          let done = false;
          while (!done) {
            const r = await reader.read();
            done = !!r.done;
            if (!r.value) continue;
            const chunk = decoder.decode(r.value, { stream: true });
            if (!markerSeen) {
              const at = chunk.indexOf(MARKER);
              if (at === -1) {
                pending += chunk;
              } else {
                pending += chunk.slice(0, at);
                tail = chunk.slice(at + MARKER.length);
                markerSeen = true;
              }
            } else {
              tail += chunk;
            }
            if (markerSeen && tail) {
              try {
                const parsed = JSON.parse(tail);
                tail = "";
                const ms = Date.now() - t0;
                const toks = parsed.completionTokens ?? 0;
                setStats((s) => ({
                  ...s,
                  [assistant.id]: {
                    completionTokens: toks,
                    promptTokens: parsed.promptTokens ?? null,
                    ms,
                    tps: ms > 0 ? toks / (ms / 1000) : 0,
                  },
                }));
                setUsage((u) => ({ ...u, tokens: u.tokens + toks }));
              } catch {
                /* incomplete marker — wait for the rest */
              }
            }
          }
          finished = true;
          if (!pending.trim()) pending = tRef.current.chat.demoReply;
        } catch (e) {
          finished = true;
          if ((e as Error)?.name !== "AbortError") {
            if (typingTimerRef.current != null) {
              window.clearTimeout(typingTimerRef.current);
              typingTimerRef.current = null;
            }
            updateMessageContent(id, assistant.id, tRef.current.chat.errorReply);
          }
        } finally {
          setTypingChats((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
          abortRef.current = null;
        }
      })();
    },
    [newChat, addMessage, updateMessageContent]
  );

  const value: ChatContextValue = {
    mounted,
    conversations,
    active,
    activeId,
    storageWarning,
    typingChats,
    stats,
    usage,
    modelStatus,
    dismissStorageWarning,
    newChat,
    selectChat,
    deleteChat,
    setModel,
    send,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChats must be used within a ChatProvider");
  return ctx;
}
