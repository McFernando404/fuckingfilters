"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

/**
 * "My account" entry point. Navigates to the dedicated /account page
 * (a full page is clearer than a popover). `variant="hero"` for the landing
 * CTA row, `variant="sidebar"` for the chat sidebar footer.
 */
export function AccountMenu({ variant = "hero" }: { variant?: "hero" | "sidebar" }) {
  const { t } = useI18n();

  if (variant === "sidebar") {
    return (
      <Link
        href="/account?from=chat"
        className="flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
      >
        <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-2 text-[11px] text-white">
          ◈
        </span>
        <span className="flex-1 text-left">{t.account.myAccount}</span>
        <span className="text-muted">→</span>
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-transparent px-6 py-3 text-sm font-semibold text-fg transition-[background-color] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base)]"
    >
      <span aria-hidden>◈</span>
      {t.account.myAccount}
      <span className="text-muted">→</span>
    </Link>
  );
}
