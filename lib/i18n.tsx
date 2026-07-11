"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Dict, type Locale } from "./dictionaries";

type I18nValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
};

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "aiu-locale";

/**
 * Lightweight i18n. The default locale is "en" so the server render and the
 * first client render agree (preventing a hydration mismatch). The saved
 * preference is then applied in an effect after mount.
 */
export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  // Seed from the server-derived locale (cookie) so SSR and first paint use
  // the user's language — no English flash, and <html lang> matches content.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Apply any saved preference once, on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "es" || saved === "en") setLocaleState(saved);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, []);

  // Keep <html lang> in sync for accessibility / SEO, and mirror the locale to
  // a cookie so the server (app/layout.tsx) can render the right lang on first
  // paint (helps screen readers and crawlers for returning users).
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      document.cookie = `aiu_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
  }, [locale]);

  // Multi-tab: propagate locale changes across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === "es" || e.newValue === "en") setLocaleState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value: I18nValue = { locale, setLocale, t: dictionaries[locale] };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
