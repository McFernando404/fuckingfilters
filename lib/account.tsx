"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const KEY = "aiu_account";

/** Unambiguous alphabet: no 0/O or 1/I/l. 57 symbols. */
const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * Cryptographically random code over the unambiguous alphabet, generated in
 * the browser via crypto.getRandomValues with rejection sampling (no modulo
 * bias, so every symbol is exactly equally likely).
 *
 * For the default 128-char account body the keyspace is ~2.3 × 10^225
 * (57^128); by the birthday bound ~10^112 accounts are needed for a 50%
 * collision chance, so a fresh code is practically unique. Final uniqueness
 * is enforced server-side (regenerate-on-collision) once a backend exists.
 */
export function generateCode(length: number): string {
  const n = ALPHABET.length; // 57 unambiguous symbols
  // Largest multiple of n that fits in 32 bits. Accepting only values below
  // this limit makes each of the n symbols exactly equally likely.
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(Math.max(length, 64));
  let out = "";
  let filled = 0;
  while (filled < length) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && filled < length; i++) {
      const v = buf[i];
      if (v < limit) {
        out += ALPHABET[v % n];
        filled++;
      }
    }
  }
  return out;
}

/** Serious, branded account key: `aiu-key-` prefix + 128 random chars. */
export const ACCOUNT_PREFIX = "aiu-key-";
export const ACCOUNT_BODY_LENGTH = 128;

export function generateAccountKey(): string {
  return ACCOUNT_PREFIX + generateCode(ACCOUNT_BODY_LENGTH);
}

/**
 * Generate an account key guaranteed unique by checking each candidate
 * against `isTaken` (query the backend's HMAC-hash store, e.g. a SELECT on a
 * UNIQUE-indexed column), retrying on collision.
 *
 * The raw generator is a 746-bit CSPRNG, so collisions are already
 * astronomically unlikely; this loop makes uniqueness absolute once paired
 * with a database UNIQUE constraint.
 *
 * Per the privacy model the server stores only an HMAC hash of the key, so
 * `isTaken` should hash the candidate before checking existence.
 */
export async function generateUniqueAccountKey(
  isTaken: (key: string) => Promise<boolean>,
  maxAttempts = 8,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = generateAccountKey();
    try {
      if (!(await isTaken(key))) return key;
    } catch {
      // If the uniqueness check itself errors, fall back to the raw key on the
      // last attempt rather than leaving the user without one.
      if (attempt === maxAttempts - 1) return key;
    }
  }
  throw new Error("Could not generate a unique account key after retries.");
}

/**
 * Format check for a pasted key: prefix + exactly ACCOUNT_BODY_LENGTH chars
 * from the alphabet. This does NOT prove the key "exists" anywhere — in this
 * system the key IS the credential. Existence is validated server-side once a
 * backend exists.
 */
export function isValidAccountKey(code: string): boolean {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  if (!trimmed.startsWith(ACCOUNT_PREFIX)) return false;
  const body = trimmed.slice(ACCOUNT_PREFIX.length);
  if (body.length !== ACCOUNT_BODY_LENGTH) return false;
  for (let i = 0; i < body.length; i++) {
    if (!ALPHABET.includes(body[i])) return false;
  }
  return true;
}

type AccountState = {
  account: string | null;
  mounted: boolean;
  setAccount: (code: string, opts?: { requirePersist?: boolean }) => boolean;
  clearAccount: () => void;
};

const AccountContext = createContext<AccountState | null>(null);

/**
 * Shared account store: every consumer reads the same state, so a create or
 * login in the dialog instantly updates the hero buttons, chat gate, and
 * account page.
 *
 * NOTE: intentionally client/localStorage only — no server, no DB yet.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const v = window.localStorage.getItem(KEY);
      // Only restore a well-formed key; a corrupt/manually-edited value would
      // otherwise unlock the UI with an unusable credential.
      if (v && isValidAccountKey(v)) setAccountState(v);
    } catch {
      /* ignore */
    }
  }, []);

  // Multi-tab: keep the account in sync across tabs (login/logout/switch in
  // one tab propagates to the others via the 'storage' event).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      try {
        const v = e.newValue;
        if (v && isValidAccountKey(v)) setAccountState(v);
        else setAccountState(null);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Returns true if persisted to localStorage, false if storage is unavailable
  // (private mode / quota / disabled).
  // - default (ephemeral): still set the in-memory account so the session
  //   works (login and "continue anyway" flow).
  // - { requirePersist: true }: leave the in-memory account untouched on
  //   failure, so creation callers can warn the user and an unrecoverable key
  //   isn't silently committed to a stale session.
  const setAccount = useCallback(
    (code: string, opts?: { requirePersist?: boolean }): boolean => {
      const trimmed = code.trim();
      const requirePersist = opts?.requirePersist ?? false;
      try {
        window.localStorage.setItem(KEY, trimmed);
        setAccountState(trimmed);
        return true;
      } catch {
        if (!requirePersist) setAccountState(trimmed);
        return false;
      }
    },
    [],
  );

  const clearAccount = useCallback(() => {
    setAccountState(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ account, mounted, setAccount, clearAccount }),
    [account, mounted, setAccount, clearAccount],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountState {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount must be used within <AccountProvider>");
  }
  return ctx;
}
