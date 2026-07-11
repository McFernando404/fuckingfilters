"use client";

import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

export function Nav() {
  const { t } = useI18n();

  const links = [
    { href: "#privacy", label: t.nav.privacy },
    { href: "#models", label: t.nav.models },
    { href: "#how", label: t.nav.how },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[var(--base)]/90">
      <nav aria-label={t.nav.ariaLabel} className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-2xl">
            <span className="text-gradient">F*ckingFilters</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
