"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

/* ------------------------------------------------------------------ *
 * Full-page ambient particle field.
 *
 * The canvas is fixed to the viewport (cheap backing store), but the
 * particles live in DOCUMENT coordinates and are rendered at
 * (x, y - scrollY). So they are anchored to the page: when you scroll,
 * they stay where they are and you move past them — they do NOT follow
 * the viewport.
 *
 * Theme-aware + VISIBLE IN BOTH MODES:
 *   - dark:  additive "lighter" cyan particles (glow).
 *   - light: normal "source-over" indigo/violet (additive can't light white).
 *
 * Honors prefers-reduced-motion (one static frame, repainted on resize).
 * pointer-events-none.
 * ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tw: number;
  tp: number;
  cross: boolean;
};

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion() ?? false;
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const light = resolvedTheme === "light";

    const rng = mulberry32(7);
    let vw = 0;
    let vh = 0;
    let docH = 0;
    let dpr = 1;
    let particles: P[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      vw = canvas.clientWidth || window.innerWidth;
      vh = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(vw * dpr));
      canvas.height = Math.max(1, Math.round(vh * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      docH = Math.max(vh, document.documentElement.scrollHeight || vh);
      const count = Math.min(200, Math.max(60, Math.round((vw * docH) / 13000)));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: rng() * vw,
          y: rng() < 0.75 ? rng() * (vh * 1.3) : rng() * docH,
          vx: (rng() - 0.5) * 0.4,
          vy: (rng() - 0.5) * 0.4,
          r: 0.6 + rng() * 1.8,
          a: 0.25 + rng() * 0.5,
          tw: 0.4 + rng() * 1.6,
          tp: rng() * Math.PI * 2,
          cross: i % 20 === 0,
        });
      }
    };

    const draw = (tMs: number, frame: number) => {
      // keep wrapping bounds in sync with the real document height (cheap,
      // throttled layout read) without re-seeding (avoids a visible jump).
      if (frame % 30 === 0) {
        const cur = document.documentElement.scrollHeight || docH;
        if (cur !== docH) docH = cur;
      }
      const sy = window.scrollY ?? 0;
      const t = tMs / 1000;
      ctx.clearRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -12) p.x = vw + 12;
        else if (p.x > vw + 12) p.x = -12;
        if (p.y < -12) p.y = docH + 12;
        else if (p.y > docH + 12) p.y = -12;
        const drawY = p.y - sy;
        if (drawY < -16 || drawY > vh + 16) continue; // cull off-screen
        const a = p.a * (0.45 + 0.55 * Math.sin(t * p.tw + p.tp));
        if (a <= 0.02) continue;
        ctx.fillStyle = light
          ? `rgba(220,38,38,${a * 0.28})`
          : `rgba(239,68,68,${a * 0.25})`;
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = light
          ? `rgba(248,113,113,${a})`
          : `rgba(252,165,165,${a})`;
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.cross) {
          ctx.strokeStyle = light
            ? `rgba(185,28,28,${a * 0.85})`
            : `rgba(254,202,202,${a * 0.85})`;
          ctx.lineWidth = 0.6;
          const L = p.r * 4;
          ctx.beginPath();
          ctx.moveTo(p.x - L, drawY);
          ctx.lineTo(p.x + L, drawY);
          ctx.moveTo(p.x, drawY - L);
          ctx.lineTo(p.x, drawY + L);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    resize();
    seed();
    let resizeRaf = 0;
    const onResize = () => {
      // Coalesce rapid resize events into one rAF so we don't re-seed +
      // force-layout dozens of times per second during a drag-resize.
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        const prevW = vw;
        resize();
        // Only re-seed when the WIDTH changed. Height-only changes (mobile
        // address bar show/hide on scroll) must NOT re-seed or the whole field
        // teleports/flickers on every scroll.
        if (vw !== prevW) seed();
        if (reduce) draw(0, 0); // repaint (resize() cleared the canvas)
      });
    };
    window.addEventListener("resize", onResize);

    if (reduce) {
      draw(0, 0);
      return () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        window.removeEventListener("resize", onResize);
      };
    }

    let raf = 0;
    let frame = 0;
    let hidden = document.hidden;
    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    const loop = (tMs: number) => {
      if (!hidden) draw(tMs, frame++);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce, resolvedTheme]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
