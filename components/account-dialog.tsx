"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { generateAccountKey, useAccount } from "@/lib/account";
import { createAccountOnServer } from "@/lib/worker";
import { useFocusTrap } from "@/lib/focus-trap";
import { useInertAppRoot } from "@/lib/use-inert-app-root";
import { createPortal } from "react-dom";

export function AccountDialog({
  open,
  onClose,
  onAccepted,
}: {
  open: boolean;
  onClose: () => void;
  onAccepted?: (code: string) => void;
}) {
  const { t } = useI18n();
  const { setAccount, clearAccount } = useAccount();
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [persistError, setPersistError] = useState(false);
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);
  const dialogRef = useFocusTrap<HTMLDivElement>(visible);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useInertAppRoot(visible);

  // (Re)generate whenever the dialog opens. The key is NOT user-editable.
  useEffect(() => {
    if (open) {
      setKey(generateAccountKey());
      setAccepted(false);
      setPersistError(false);
    }
  }, [open]);

  // Discard an unpersisted in-memory account on dismiss so the user is never
  // silently left "logged in" with an unrecoverable key (the only way to keep
  // it is the explicit "I copied it, continue" button).
  const dismiss = useCallback(() => {
    if (persistError) clearAccount();
    onClose();
  }, [persistError, clearAccount, onClose]);

  // Close on Escape (treats it like Cancel — discards if persistence failed).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const copy = async () => {
    const flash = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    };
    try {
      await navigator.clipboard.writeText(key);
      flash();
      return;
    } catch {
      /* Clipboard API unavailable — fallback below */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = key;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flash();
    } catch {
      /* give up — the key block is also selectable (select-all) */
    }
  };

  const accept = async () => {
    if (!key || !accepted) return;
    // Register the code's hash in the backend before closing, so the next chat
    // request is already authorized (avoids a create/verify race).
    await createAccountOnServer(key);
    if (!setAccount(key, { requirePersist: true })) {
      // localStorage write failed (private mode / quota / disabled). The key
      // was NOT persisted and the in-memory account was NOT set — keep the
      // dialog open and warn the user to copy it now (it is unrecoverable
      // after close).
      setPersistError(true);
      return;
    }
    onAccepted?.(key);
    onClose();
  };

  const continueAnyway = () => {
    // The user has the (current) key and wants to proceed without persistence:
    // commit it to the in-memory (ephemeral) session, then close.
    setAccount(key);
    onAccepted?.(key);
    onClose();
  };

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence onExitComplete={() => setVisible(false)}>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label={t.account.cancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.account.title}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white">
                ◈
              </span>
              <h2 className="text-xl font-semibold">{t.account.title}</h2>
            </div>
            <p className="mt-2 text-sm text-muted">{t.account.subtitle}</p>

            <span id="acct-key-label" className="mt-5 block text-xs font-medium uppercase tracking-wider text-muted">
              {t.account.yourCode}
            </span>
            {/* Read-only display — NOT editable. select-all so it can be copied manually. */}
            <div
              tabIndex={0}
              aria-labelledby="acct-key-label"
              className="mt-2 max-h-40 overflow-y-auto break-all rounded-2xl border border-line bg-surface-2 p-3 font-mono text-sm leading-relaxed text-fg select-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {key || " "}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setKey(generateAccountKey())}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2"
              >
                ↻ {t.account.regenerate}
              </button>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2"
              >
                {copied ? `✓ ${t.account.copied}` : `⧉ ${t.account.copy}`}
              </button>
            </div>

            <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-muted">
              {t.account.noteLocal}
            </p>

            <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span>
                {t.account.acceptIntro}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-fg underline-offset-2 hover:underline"
                >
                  {t.account.termsLink}
                </Link>
                {t.account.acceptMid}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-fg underline-offset-2 hover:underline"
                >
                  {t.account.privacyLink}
                </Link>
                {t.account.acceptOutro}
              </span>
            </label>

            {persistError && (
              <div role="alert" className="mt-4 rounded-xl border border-accent-warm/40 bg-accent-warm/10 p-3 text-xs leading-relaxed text-accent-warm">
                {t.account.persistError}
              </div>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                {t.account.cancel}
              </button>
              {persistError ? (
                <button
                  type="button"
                  onClick={continueAnyway}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--glow)] transition hover:brightness-110"
                >
                  {t.account.persistContinue}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={accept}
                  disabled={!accepted}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
                >
                  {t.account.accept}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
