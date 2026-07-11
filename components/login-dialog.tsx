"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { isValidAccountKey, useAccount } from "@/lib/account";
import { useFocusTrap } from "@/lib/focus-trap";
import { useInertAppRoot } from "@/lib/use-inert-app-root";
import { createPortal } from "react-dom";

export function LoginDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { setAccount, clearAccount } = useAccount();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [persistWarn, setPersistWarn] = useState(false);
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);
  const dialogRef = useFocusTrap<HTMLDivElement>(visible);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useInertAppRoot(visible);

  // Reset the field every time the dialog opens.
  useEffect(() => {
    if (open) {
      setValue("");
      setError(false);
      setPersistWarn(false);
    }
  }, [open]);

  // Discard an unpersisted in-memory account on dismiss (cancel/escape) so the
  // user is never left silently logged in after a persistence warning.
  const dismiss = useCallback(() => {
    if (persistWarn) clearAccount();
    onClose();
  }, [persistWarn, clearAccount, onClose]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const submit = () => {
    if (persistWarn) {
      // Second activation after a persistence warning = proceed anyway.
      onClose();
      return;
    }
    if (!isValidAccountKey(value)) {
      setError(true);
      return;
    }
    if (!setAccount(value.trim())) {
      // localStorage unavailable — the key isn't persisted. Warn (the user
      // holds the key, so it's recoverable, but the failure must not be silent).
      setPersistWarn(true);
      return;
    }
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
            aria-label={t.login.title}
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
              <h2 className="text-xl font-semibold">{t.login.title}</h2>
            </div>
            <p className="mt-2 text-sm text-muted">{t.login.subtitle}</p>

            <textarea
              aria-label={t.login.title}
              aria-describedby="login-error"
              aria-invalid={error}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
              placeholder={t.login.placeholder}
              rows={4}
              spellCheck={false}
              autoComplete="off"
              className={`mt-4 w-full resize-none rounded-2xl border bg-surface-2 p-3 font-mono text-sm leading-relaxed text-fg outline-none transition focus:ring-2 focus:ring-[var(--ring)] ${
                error ? "border-accent-warm" : "border-line"
              }`}
            />
            {error && (
              <p id="login-error" role="alert" className="mt-2 text-xs text-accent-warm">{t.login.error}</p>
            )}
            {persistWarn && (
              <p role="alert" className="mt-2 text-xs text-accent-warm">{t.login.persistWarn}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                {t.account.cancel}
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_var(--glow)] transition hover:brightness-110"
              >
                {persistWarn ? t.account.persistContinue : t.login.submit}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
