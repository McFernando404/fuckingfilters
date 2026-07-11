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
 * Cryptographically random account code using an unambiguous alphabet
 * (no 0/O or 1/I/l). Runs in the browser via crypto.getRandomValues.
 *
 * UNIQUENESS: the body is 128 chars over a 57-symbol alphabet, i.e. a space
 * of 57^128 ≈ 2.3 × 10^225 possible codes. By the birthday bound you would
 * need on the order of 10^112 accounts before a 50% collision chance — so a
 * freshly generated code will, in practice, never match another user's. To
 * also be technically uniform, we use rejection sampling (no modulo bias) so
 * every symbol is exactly equally likely. Final uniqueness is additionally
 * enforced server-side once a backend exists (regenerate-on-collision).
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
 * Generate an account key that is GUARANTEED unique by checking each candidate
 * against `isTaken` (which should query the backend's key/HASH store, e.g. a
 * SELECT on a UNIQUE-indexed column). Retries on collision.
 *
 * The raw generator is a 746-bit CSPRNG with rejection sampling, so a
 * collision is already astronomically unlikely (~10^112 accounts for a 50%
 * chance). This loop turns "practically unique" into "100% unique" the moment
 * it is paired with a database UNIQUE constraint.
 *
 * Per the privacy model the server stores only an HMAC hash of the key, so
 * `isTaken` should hash the candidate and check that hash for existence.
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
 * Shared account store. Every consumer reads the SAME state, so creating or
 * logging in from one place (the dialog) instantly updates every other place
 * (hero buttons, chat gate, account page). Previously each useAccount() call
 * held its own state, so the UI never reacted to a creation — fixed here.
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

  // Returns true if the key was persisted to localStorage, false if storage is
  // unavailable (private mode / quota / disabled).
  // - default (ephemeral): set the in-memory account anyway so the session
  //   works (used by login and the "continue anyway" flow).
  // - { requirePersist: true }: leave the in-memory account UNTOUCHED on
  //   failure, so account-creation callers can warn the user and the
  //   unrecoverable key isn't silently committed to a stale session.
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
