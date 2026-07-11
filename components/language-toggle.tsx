"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/dictionaries";

const OPTIONS: Locale[] = ["es", "en"];

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.toggles.languageAria}
      className="relative inline-flex items-center rounded-full border border-line bg-surface p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = opt === locale;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setLocale(opt)}
            aria-pressed={active}
            className="relative rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative ${active ? "text-white" : "text-muted"}`}>
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}
