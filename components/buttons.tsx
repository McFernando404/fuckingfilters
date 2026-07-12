"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAccount } from "@/lib/account";
import { AccountDialog } from "./account-dialog";
import { LoginDialog } from "./login-dialog";
import { AccountMenu } from "./account-panel";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Size = "sm" | "md";
const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base)]";

export function CreateAccountButton({ size = "md" }: { size?: Size }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white shadow-[0_10px_40px_-12px_var(--glow)] transition-[filter] hover:brightness-110 ${sizeStyles[size]} ${focusRing}`}
      >
        <span aria-hidden>✦</span>
        {t.hero.primary}
      </motion.button>

      {/* On accept we just close; the hero CTAs then switch to [Open chat]
          [My account] via account-aware state. */}
      <AccountDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function LoginButton({ size = "md" }: { size?: Size }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-full border border-line bg-transparent font-semibold text-fg transition-[background-color] hover:bg-surface-2 ${sizeStyles[size]} ${focusRing}`}
      >
        {t.login.button}
      </motion.button>
      <LoginDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function GoToChatButton() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push("/chat")}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white shadow-[0_10px_40px_-12px_var(--glow)] transition-[filter] hover:brightness-110 ${sizeStyles.md} ${focusRing}`}
    >
      <span aria-hidden>→</span>
      {t.hero.goToChat}
    </motion.button>
  );
}

/** Account-aware hero call-to-action row. */
export function HeroCtas() {
  const { account, mounted } = useAccount();
  const loggedIn = mounted && !!account;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.18 }}
      className="flex flex-wrap items-center gap-3 pb-2"
    >
      {loggedIn ? (
        <>
          <GoToChatButton />
          <AccountMenu variant="hero" />
        </>
      ) : (
        <>
          <CreateAccountButton />
          <LoginButton />
        </>
      )}
    </motion.div>
  );
}
