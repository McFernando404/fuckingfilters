"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Renders either /terms or /privacy from the typed dictionary. Standalone
 * page (no global nav) consistent with /account and /chat.
 */
export function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const { t } = useI18n();
  const isTerms = kind === "terms";
  const title = isTerms ? t.legal.termsTitle : t.legal.privacyTitle;
  const intro = isTerms ? t.legal.termsIntro : t.legal.privacyIntro;
  const sections = isTerms ? t.legal.terms : t.legal.privacy;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">{t.nav.skipToContent}</a>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora absolute left-[-10%] top-[-10%] h-[34rem] w-[34rem]" />
        <div className="aurora absolute right-[-10%] bottom-[-20%] h-[30rem] w-[30rem]" />
      </div>

      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <span aria-hidden>←</span>
          {t.legal.back}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 pb-24 outline-none sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-xs text-muted">{t.legal.updated}</p>
          <p className="mt-5 select-text text-sm leading-relaxed text-muted">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-base font-semibold text-fg">
                  {i + 1}. {s.h}
                </h2>
                <p className="mt-2 whitespace-pre-line select-text text-sm leading-relaxed text-muted">
                  {s.p}
                </p>
              </section>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
