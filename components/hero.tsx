"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { HeroCtas } from "./buttons";

// 3D emblem — client only.
const HeroEmblem = dynamic(
  () => import("./hero-emblem").then((m) => m.HeroEmblem),
  { ssr: false, loading: () => <div className="h-full w-full" /> },
);

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative overflow-hidden">
      {/* aurora background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora absolute left-[-10%] top-[-10%] h-[40rem] w-[40rem]" />
        <div className="aurora absolute right-[-10%] bottom-[-25%] h-[34rem] w-[34rem]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-24">
        {/* copy */}
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t.hero.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t.hero.titleA}
            <br />
            <span className="text-gradient">{t.hero.titleB}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.12 }}
            className="max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg"
          >
            {t.hero.subtitle}
          </motion.p>

          <HeroCtas />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="text-xs text-muted"
          >
            {t.hero.note}
          </motion.p>
        </div>

        {/* 3D emblem */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="relative aspect-square w-full max-w-[30rem] justify-self-center"
        >
          <div className="absolute inset-0">
            <HeroEmblem />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
