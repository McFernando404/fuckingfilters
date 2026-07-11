"use client";

// Cloudflare Worker backend (accounts + chat proxy + usage). This is a PUBLIC
// URL the browser calls directly — it is NOT your PC and NOT a secret. Set it
// via NEXT_PUBLIC_WORKER_URL (.env.local for dev, Vercel env for production).
const RAW = (process.env.NEXT_PUBLIC_WORKER_URL || "").trim();
export const WORKER_URL = RAW.replace(/\/+$/, "");
export const hasWorker = () => WORKER_URL.length > 0;

/** Auth + JSON headers. The account code is the credential (Bearer). */
export function authHeaders(code: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (code) h["Authorization"] = "Bearer " + code;
  return h;
}

/** Register a new account code. The Worker stores only its HMAC hash. */
export async function createAccountOnServer(code: string): Promise<boolean> {
  if (!hasWorker()) return true; // no backend configured (dev fallback)
  try {
    const r = await fetch(WORKER_URL + "/account/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Verify a pasted code is a registered account.
 *  Returns true (exists) | false (not registered) | null (couldn't check). */
export async function verifyAccountOnServer(
  code: string,
): Promise<boolean | null> {
  if (!hasWorker()) return true;
  try {
    const r = await fetch(WORKER_URL + "/account/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { exists?: boolean };
    return !!d.exists;
  } catch {
    return null;
  }
}

export type ServerUsage = {
  tokens_used: number;
  messages: number;
  chats: number;
  daily_limit: number;
  messages_today: number;
  remaining: number;
};

/** Authoritative lifetime usage + daily remaining for the signed-in account. */
export async function fetchUsage(code: string): Promise<ServerUsage | null> {
  if (!hasWorker() || !code) return null;
  try {
    const r = await fetch(WORKER_URL + "/usage", {
      method: "POST",
      headers: authHeaders(code),
    });
    if (!r.ok) return null;
    return (await r.json()) as ServerUsage;
  } catch {
    return null;
  }
}
