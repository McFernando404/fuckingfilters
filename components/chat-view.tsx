"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { Dict } from "@/lib/dictionaries";
import { useAccount } from "@/lib/account";
import {
  DEFAULT_MODEL_ID,
  MODELS,
  getModel,
  useChats,
  type MessageStats,
  type ModelTier,
} from "@/lib/chat-store";
import { Popover } from "./popover";
import { Markdown } from "./markdown";
import { useFocusTrap } from "@/lib/focus-trap";
import { AccountMenu } from "./account-panel";
import { AccountDialog } from "./account-dialog";
import { LoginButton } from "./buttons";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

const tierColor: Record<ModelTier, string> = {
  filtered: "text-muted",
  uncensored: "text-muted",
  code: "text-muted",
  fast: "text-muted",
  thinking: "text-muted",
};
const tierDot: Record<ModelTier, string> = {
  filtered: "bg-accent",
  uncensored: "bg-accent-warm",
  code: "bg-accent-code",
  fast: "bg-accent-fast",
  thinking: "bg-accent-3",
};

/** Translate a model tier for display (the enum itself is English). */
function tierLabel(tier: ModelTier, t: Dict): string {
  return tier === "filtered"
    ? t.chat.tierFiltered
    : tier === "uncensored"
      ? t.chat.tierUncensored
      : tier === "code"
        ? t.chat.tierCode
        : tier === "thinking"
          ? t.chat.tierThinking
          : t.chat.tierFast;
}

/** Small "uncensored" pill — FF-Speed is a zero-censorship model. */
function UncensoredBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-accent-warm/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-warm">
      {label}
    </span>
  );
}

/** Per-variant description (default / thinking / coder). */
function modelDescOf(
  m: { reasoning?: boolean; coding?: boolean },
  t: Dict,
): string {
  if (m.coding) return t.chat.modelDescCoder;
  if (m.reasoning) return t.chat.modelDescThinking;
  return t.chat.modelDesc;
}

/** Context window as a rounded label, e.g. 8192 -> "8K". */
function contextLabel(tokens: number): string {
  return `${Math.round(tokens / 1024)}K`;
}

/** Online (green) / offline (red) indicator for a model. */
function StatusDot({ online, label }: { online: boolean; label?: string }) {
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${
        online ? "bg-emerald-500" : "bg-red-500"
      }`}
      title={label}
      aria-label={label}
    />
  );
}

function timeLabel(ts: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "es" ? "es" : "en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(ts);
  } catch {
    return "";
  }
}

/* ------------------------------- Model picker ------------------------------ */

function ModelPicker({
  modelId,
  onChange,
  variant = "header",
}: {
  modelId: string;
  onChange: (id: string) => void;
  variant?: "header" | "bar";
}) {
  const { t } = useI18n();
  const { modelStatus } = useChats();
  const m = getModel(modelId);

  const trigger =
    variant === "header" ? (
      <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2">
        <span className={`h-2 w-2 rounded-full ${tierDot[m.tier]}`} />
        <span>{m.name}</span>
        <span className={`text-[10px] uppercase tracking-wide ${tierColor[m.tier]}`}>
          {tierLabel(m.tier, t)}
        </span>
        <UncensoredBadge label={t.chat.tierUncensored} />
        <span className="text-muted">▾</span>
      </div>
    ) : (
      <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg transition-colors hover:bg-surface-2">
        <span className={`h-2 w-2 rounded-full ${tierDot[m.tier]}`} />
        <span className="hidden text-muted sm:inline">{t.chat.replyingWith}</span>
        <span className="font-medium">{m.name}</span>
        <UncensoredBadge label={t.chat.tierUncensored} />
        <StatusDot
          online={modelStatus[m.id] ?? false}
          label={(modelStatus[m.id] ?? false) ? t.chat.online : t.chat.offline}
        />
        <span className="text-muted">▾</span>
      </div>
    );

  return (
    <Popover
      trigger={trigger}
      align="left"
      placement={variant === "bar" ? "top" : "bottom"}
      label={t.chat.modelLabel}
    >
      {(close) => (
        <div className="w-72 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-2xl">
          {MODELS.map((mm) => (
            <button
              key={mm.id}
              type="button"
              onClick={() => {
                onChange(mm.id);
                close();
              }}
              className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors ${
                mm.id === modelId ? "bg-surface-2" : "hover:bg-surface-2/60"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={`h-2 w-2 rounded-full ${tierDot[mm.tier]}`} />
                {mm.name}
                <span className="ml-auto text-[10px] uppercase tracking-wide text-muted">
                  {tierLabel(mm.tier, t)}
                </span>
                <span className="text-[10px] tabular-nums text-muted">{contextLabel(mm.context)}</span>
                <StatusDot
                  online={modelStatus[mm.id] ?? false}
                  label={(modelStatus[mm.id] ?? false) ? t.chat.online : t.chat.offline}
                />
              </span>
              <span className="pl-4 text-xs text-muted">{modelDescOf(mm, t)}</span>
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}

/* --------------------------------- View ----------------------------------- */

export function ChatView() {
  const { t, locale } = useI18n();
  const { account, mounted } = useAccount();
  const {
    mounted: chatsMounted,
    conversations,
    active,
    activeId,
    storageWarning,
    dismissStorageWarning,
    newChat,
    selectChat,
    deleteChat,
    setModel,
    send,
    typingChats,
    stats,
    modelStatus,
  } = useChats();

  const [input, setInput] = useState("");
  const typing = activeId != null && typingChats.has(activeId);
  const [guestDialog, setGuestDialog] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  useEffect(() => {
    if (navOpen) setDrawerVisible(true);
  }, [navOpen]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useFocusTrap<HTMLElement>(drawerVisible);
  const reduce = useReducedMotion() ?? false;
  const stickToBottom = useRef(true);
  const prevActiveId = useRef<string | null>(activeId);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const modelId = active?.modelId ?? DEFAULT_MODEL_ID;
  const model = getModel(modelId);

  const onScrollList = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Track whether the user is near the bottom; only auto-scroll then, so an
    // arriving reply doesn't yank someone who scrolled up to read history.
    stickToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  useEffect(() => {
    const chatChanged = prevActiveId.current !== activeId;
    prevActiveId.current = activeId;
    if (chatChanged) stickToBottom.current = true;
    if (!stickToBottom.current) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: chatChanged || reduce ? "auto" : "smooth",
    });
  }, [active?.messages.length, typing, activeId, reduce]);

  // Close the mobile sidebar drawer when the active chat changes.
  useEffect(() => {
    setNavOpen(false);
  }, [activeId]);

  // Auto-grow the composer textarea with its content (up to ~max-h-40 / 160px).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    send(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send while an IME composition is in progress (CJK input); Enter
    // confirms the candidate instead.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const changeModel = (id: string) => {
    const target = activeId ?? newChat(DEFAULT_MODEL_ID, t.chat.newChat);
    setModel(target, id);
  };

  const startWithModel = (id: string) => {
    // Reuse the current chat if it's still empty instead of stacking empties.
    if (active && active.messages.length === 0) {
      setModel(active.id, id);
    } else {
      newChat(id, t.chat.newChat);
    }
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    // Don't create a new chat if the current one is still empty.
    if (active && active.messages.length === 0) {
      setNavOpen(false); // close the mobile drawer so the composer is visible
      inputRef.current?.focus();
      return;
    }
    newChat(modelId, t.chat.newChat);
  };

  const pickChat = (id: string) => {
    selectChat(id);
    setInput(""); // don't carry a draft from another conversation
  };

  // Chat is account-gated: guests see a locked screen and must create an
  // account. On accept, `account` is set and this view re-renders unlocked.
  if (!mounted) {
    // Avoid flashing the signed-in shell before the mount effect runs (guests
    // would briefly see the chat UI). Render a neutral shell until mounted.
    return <div className="relative flex min-h-dvh flex-col bg-[var(--base)]" />;
  }
  if (!account) {
    return (
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--base)] text-fg">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="aurora absolute left-[-10%] top-[-10%] h-[34rem] w-[34rem]" />
          <div className="aurora absolute right-[-10%] bottom-[-20%] h-[30rem] w-[30rem]" />
        </div>
        <header className="mx-auto flex h-16 w-full max-w-3xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <span aria-hidden>←</span>
            {t.chat.back}
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-3xl text-white shadow-[0_10px_40px_-12px_var(--glow)]">
            ◈
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {t.chat.lockedTitle}
          </h1>
          <p className="mt-2 max-w-xs text-sm text-muted">{t.chat.lockedBody}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setGuestDialog(true)}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-12px_var(--glow)] transition hover:brightness-110"
            >
              {t.hero.primary}
            </button>
            <LoginButton />
          </div>
        </main>
        <AccountDialog open={guestDialog} onClose={() => setGuestDialog(false)} />
      </div>
    );
  }

  const messages = active?.messages ?? [];

  const sidebarContent = (
    <>
        <div className="flex h-16 items-center gap-2 px-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm text-white shadow-[0_6px_20px_-6px_var(--glow)]">
            ◈
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">
              <span className="text-gradient">F*ckingFilters</span>
            </div>
            <div className="text-[11px] text-muted">{t.chat.title}</div>
          </div>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_var(--glow)] transition hover:brightness-110"
          >
            <span aria-hidden>＋</span>
            {t.chat.newChat}
          </button>
        </div>

        <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t.chat.history}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {!chatsMounted ? null : conversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted">
              {t.chat.noHistory}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => {
                const cm = getModel(c.modelId);
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <div
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-surface-2 text-fg"
                          : "text-muted hover:bg-surface-2/60 hover:text-fg"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => pickChat(c.id)}
                        aria-current={isActive ? "true" : undefined}
                        className="flex flex-1 items-center gap-2.5 truncate text-left"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${tierDot[cm.tier]}`}
                        />
                        <span className="flex-1 truncate">{c.title}</span>
                        <span className="shrink-0 text-[10px] text-muted">
                          {timeLabel(c.updatedAt, locale)}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={t.chat.delete}
                        onClick={() => deleteChat(c.id)}
                        className="shrink-0 opacity-0 transition-opacity hover:text-accent-warm focus:opacity-100 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer: account menu or guest CTA */}
        <div className="border-t border-line p-3">
          {mounted && account ? (
            <AccountMenu variant="sidebar" />
          ) : (
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                {t.account.guest}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {t.account.guestInfo}
              </p>
              <button
                type="button"
                onClick={() => setGuestDialog(true)}
                className="mt-2.5 w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
              >
                {t.hero.primary}
              </button>
              <AccountDialog
                open={guestDialog}
                onClose={() => setGuestDialog(false)}
              />
            </div>
          )}
        </div>
    </>
  );

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[var(--base)] text-fg">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">{t.nav.skipToContent}</a>
      {/* ----------------------------- Sidebar (desktop) ----------------------------- */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-line bg-surface/40 backdrop-blur-xl md:flex">
        {sidebarContent}
      </aside>

      {/* ----------------------------- Sidebar (mobile drawer) ----------------------------- */}
      <AnimatePresence onExitComplete={() => setDrawerVisible(false)}>
        {navOpen && (
          <div className="fixed inset-0 z-[80] md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.chat.history}
              className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col border-r border-line bg-surface shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------- Main ------------------------------ */}
      <div role="main" id="main-content" tabIndex={-1} aria-label={t.chat.title} inert={drawerVisible || undefined} className="flex min-w-0 flex-1 flex-col outline-none">
        <h1 className="sr-only">{t.chat.title}</h1>
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-[var(--base)]/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={t.chat.history}
              onClick={() => setNavOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-line text-fg transition-colors hover:bg-surface-2 md:hidden"
            >
              <span aria-hidden className="text-lg leading-none">
                ☰
              </span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
            >
              <span aria-hidden>←</span>
              <span className="hidden sm:inline">{t.chat.back}</span>
            </Link>
          </div>
          {/* Static current-model indicator (selection happens via the
              composer bar below — no chooser button up here). */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${tierDot[model.tier]}`} />
            <span className="font-medium text-fg">{model.name}</span>
            <span className={`hidden text-[10px] uppercase tracking-wide ${tierColor[model.tier]} sm:inline`}>
              {tierLabel(model.tier, t)}
            </span>
            <span className="hidden sm:inline-flex">
              <UncensoredBadge label={t.chat.tierUncensored} />
            </span>
            <StatusDot
              online={modelStatus[model.id] ?? false}
              label={(modelStatus[model.id] ?? false) ? t.chat.online : t.chat.offline}
            />
            <div className="ml-1 flex items-center gap-1.5">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {storageWarning && (
          <div role="status" className="flex items-center justify-center gap-3 border-b border-accent-warm/30 bg-accent-warm/10 px-4 py-2 text-center text-[11px] text-accent-warm sm:px-6">
            <span>{t.chat.storageWarning}</span>
            <button
              type="button"
              onClick={dismissStorageWarning}
              aria-label={t.chat.dismiss}
              className="shrink-0 rounded px-1 transition hover:brightness-125"
            >
              ✕
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} onScroll={onScrollList} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            {messages.length === 0 && !typing ? (
              <EmptyState
                onPick={startWithModel}
              />
            ) : (
              <ul className="space-y-6" aria-live="polite" aria-label={t.chat.title}>
                {messages.map((msg) => (
                  <MessageRow
                    key={msg.id}
                    role={msg.role}
                    name={msg.role === "user" ? t.chat.you : t.chat.assistant}
                    content={msg.content}
                    modelId={msg.modelId}
                    at={msg.at}
                    locale={locale}
                    youLabel={t.chat.you}
                    stats={msg.role === "assistant" ? stats[msg.id] : undefined}
                    streaming={
                      typing && msg.id === messages[messages.length - 1]?.id
                    }
                  />
                ))}
                {typing && (
                  <li className="flex items-center gap-2 pl-11 text-muted">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                    <span className="ml-1 text-xs">
                      {model.reasoning ? t.chat.thinking : t.chat.typing}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-line bg-[var(--base)]/70 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-2">
              <ModelPicker modelId={modelId} onChange={changeModel} variant="bar" />
            </div>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                aria-label={t.chat.placeholder}
                maxLength={20000}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t.chat.placeholder}
                rows={1}
                className="max-h-40 min-h-[48px] flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[var(--ring)]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || typing}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-white shadow-[0_8px_30px_-10px_var(--glow)] transition hover:brightness-110 disabled:opacity-40"
                aria-label={t.chat.send}
              >
                ↑
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">
              {model.name} · {t.chat.tierUncensored} · {contextLabel(model.context)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Sub-components ----------------------------- */

function EmptyState({ onPick }: { onPick: (id: string) => void }) {
  const { t } = useI18n();
  const { modelStatus } = useChats();
  const suggestions = MODELS.map((m) => ({
    tier: m.tier,
    id: m.id,
    name: m.name,
    reasoning: m.reasoning,
    coding: m.coding,
    context: m.context,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-3xl text-white shadow-[0_10px_40px_-12px_var(--glow)]">
        ◈
      </span>
      <h2 className="mt-5 text-xl font-semibold">{t.chat.emptyTitle}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{t.chat.emptySubtitle}</p>

      <div className="mt-7 w-full">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t.chat.suggestions}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s.id)}
              className="group flex flex-col gap-1 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:bg-surface-2"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={`h-2 w-2 rounded-full ${tierDot[s.tier]}`} />
                {s.name}
                <UncensoredBadge label={t.chat.tierUncensored} />
                <span className="ml-auto text-[10px] tabular-nums text-muted">{contextLabel(s.context)}</span>
                <StatusDot
                  online={modelStatus[s.id] ?? false}
                  label={(modelStatus[s.id] ?? false) ? t.chat.online : t.chat.offline}
                />
              </span>
              <span className="text-xs text-muted">
                {modelDescOf(s, t)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const MessageRow = memo(function MessageRow({
  role,
  name,
  content,
  modelId,
  at,
  locale,
  youLabel,
  stats,
  streaming,
}: {
  role: "user" | "assistant";
  name: string;
  content: string;
  modelId?: string;
  at: number;
  locale: string;
  youLabel: string;
  stats?: MessageStats;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  const m = modelId ? getModel(modelId) : null;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* avatar */}
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
          isUser
            ? "bg-surface-2 text-fg"
            : "bg-gradient-to-br from-accent to-accent-2 text-white"
        }`}
      >
        {isUser ? youLabel.charAt(0) : "◈"}
      </span>

      <div className={`flex max-w-[80%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <span className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted">
          {name}
          {m && !isUser && <span>· {m.name}</span>}
          <span>· {timeLabel(at, locale)}</span>
        </span>
        <div
          className={`select-text rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "whitespace-pre-wrap rounded-tr-md bg-accent text-white"
              : "rounded-tl-md border border-line bg-surface text-fg"
          }`}
        >
          {isUser ? (
            content
          ) : (
            <Markdown content={content} streaming={streaming} />
          )}
        </div>
        {!isUser && stats && (
          <span className="px-1 text-[10px] tabular-nums text-muted">
            {stats.completionTokens} tokens · {(stats.ms / 1000).toFixed(1)}s · {stats.tps.toFixed(0)} tok/s
          </span>
        )}
      </div>
    </motion.li>
  );
});
