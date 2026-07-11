"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EmblemA } from "./emblem";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 1900; // ms to fill 0 -> 100

function LoaderOverlay({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPct(100);
      const id = window.setTimeout(onDone, 350);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    let doneTimer: number | undefined;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / DURATION) * 100);
      setPct(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        doneTimer = window.setTimeout(onDone, 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (doneTimer) window.clearTimeout(doneTimer);
    };
    // run once on mount; onDone only ever flips a parent setState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
      transition={{ duration: 0.6, ease }}
    >
      {/* brand mark — the F*ckingFilters "F" emblem (static, large) */}
      <div className="mb-10 h-40 w-40">
        <EmblemA className="h-full w-full" />
      </div>

      {/* the word that fills left -> right */}
      <div className="relative inline-block">
        <span className="block text-2xl font-bold tracking-tight text-muted/30 sm:text-3xl">
          F*ckingFilters
        </span>
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <span className="block whitespace-nowrap text-2xl font-bold tracking-tight text-gradient sm:text-3xl">
            F*ckingFilters
          </span>
        </div>
      </div>

      {/* progress track */}
      <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mt-3 font-mono text-xs tabular-nums text-muted">
        {Math.round(pct)}%
      </span>
    </motion.div>
  );
}

export function Loader({ children }: { children: ReactNode }) {
  // done defaults to true (SSR-safe: no overlay, page interactive). It is only
  // flipped to false in a post-mount effect for a first-visit intro — so SSR
  // and the first client render always agree (no hydration mismatch), and the
  // intro plays at most once per browser session.
  const [done, setDone] = useState(true);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let already = false;
    try {
      already = window.sessionStorage.getItem("ff_loader_done") === "1";
    } catch {
      /* sessionStorage unavailable */
    }
    if (already) return;
    setShow(true);
    setDone(false);
  }, []);
  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem("ff_loader_done", "1");
    } catch {
      /* sessionStorage unavailable */
    }
    setDone(true);
  }, []);
  const active = show && !done;
  return (
    <>
      <AnimatePresence>
        {active && <LoaderOverlay onDone={finish} />}
      </AnimatePresence>
      {/* While loading, hide the page underneath from AT and make it
          non-interactive so Tab/Screen-reader can't reach covered content. */}
      <div aria-hidden={active || undefined} inert={active || undefined}>
        {children}
      </div>
    </>
  );
}
