"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { HeroCtas } from "./buttons";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-semibold uppercase tracking-wider text-accent">
      {children}
    </span>
  );
}

export function PrivacySection() {
  const { t } = useI18n();
  return (
    <section id="privacy" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <Tag>{t.privacy.tag}</Tag>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.privacy.title}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{t.privacy.subtitle}</p>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {t.privacy.items.map((it, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-line bg-surface p-6 transition-colors hover:bg-surface-2">
              <h3 className="text-lg font-semibold">{it.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ModelsSection() {
  const { t } = useI18n();
  return (
    <section id="models" className="border-y border-line bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <Tag>{t.models.tag}</Tag>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.models.title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted">{t.models.subtitle}</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.models.items.map((m, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-transform hover:-translate-y-1">
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[var(--glow)] px-2.5 py-1 text-xs font-semibold text-fg">
                  {m.badge}
                </span>
                <h3 className="text-lg font-semibold">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowSection() {
  const { t } = useI18n();
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <Tag>{t.how.tag}</Tag>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.how.title}
        </h2>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.how.steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-line bg-surface p-6">
              <span className="text-3xl font-bold text-gradient">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center sm:px-12">
          <div className="aurora pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">{t.cta.subtitle}</p>
            <div className="mt-8 flex justify-center">
              <HeroCtas />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 flex justify-center"
      >
        <div className="aurora h-32 w-1/2 opacity-40" />
      </div>

      {/* Gradient accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 py-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + value prop + privacy pills */}
          <Reveal className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-2"
              aria-label="F*ckingFilters — home"
            >
              <span className="text-2xl font-semibold tracking-tight">
                <span className="text-gradient">F*ckingFilters</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t.footer.tagline}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {t.footer.badges.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-code shadow-[0_0_8px_var(--accent-code)]" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Legal */}
          <Reveal delay={0.08}>
            <nav aria-label={t.footer.navLabel} className="flex flex-col gap-2.5 text-sm sm:items-end">
              <Link
                href="/terms"
                className="text-muted transition-colors hover:text-fg"
              >
                {t.footer.links.terms}
              </Link>
              <Link
                href="/privacy"
                className="text-muted transition-colors hover:text-fg"
              >
                {t.footer.links.privacyPolicy}
              </Link>
            </nav>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-2 border-t border-line py-4 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
          <span>
            © <span suppressHydrationWarning>{year}</span> F*ckingFilters. {t.footer.rights}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-code shadow-[0_0_8px_var(--accent-code)]" />
            {t.footer.status}
          </span>
        </div>
      </div>
    </footer>
  );
}
