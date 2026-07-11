"use client";

import { useId } from "react";
import { useTheme } from "next-themes";

/* F*ckingFilters "F" emblem — a gradient gem orb (red shades),
 * theme-aware (vivid in dark, softer in light). Shared by the loader
 * and the hero so the brand mark is identical everywhere. Pure inline
 * SVG (no WebGL). Unique gradient ids per instance via useId. */
export function EmblemA({ className }: { className?: string }) {
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === "light";
  const c = light
    ? { top: "#ef4444", mid: "#dc2626", bot: "#991b1b", a: "#0a0a0a", shade: 0.2, gloss: 0.45 }
    : { top: "#f87171", mid: "#ef4444", bot: "#991b1b", a: "#0a0a0a", shade: 0.3, gloss: 0.5 };
  const disc = `emblem-${rid}-disc`;
  const shade = `emblem-${rid}-shade`;
  const gloss = `emblem-${rid}-gloss`;
  return (
    <svg viewBox="0 0 240 240" className={className ?? "h-full w-full"} role="img" aria-label="F*ckingFilters">
      <defs>
        <linearGradient id={disc} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="0.5" stopColor={c.mid} />
          <stop offset="1" stopColor={c.bot} />
        </linearGradient>
        <radialGradient id={shade} cx="0.68" cy="0.74" r="0.55">
          <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity={c.shade} />
        </radialGradient>
        <radialGradient id={gloss} cx="0.36" cy="0.30" r="0.42">
          <stop offset="0" stopColor="#ffffff" stopOpacity={c.gloss} />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="110" fill={`url(#${disc})`} />
      <circle cx="120" cy="120" r="110" fill={`url(#${shade})`} />
      <circle cx="120" cy="120" r="110" fill={`url(#${gloss})`} />
      <circle cx="120" cy="120" r="93" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />
      <text
        x="118"
        y="121"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="160"
        fontWeight="700"
        fill={c.a}
      >
        F
      </text>
      <circle cx="174" cy="70" r="2.8" fill="#ffffff" opacity="0.95" />
      <circle cx="68" cy="164" r="2.1" fill="#ffffff" opacity="0.75" />
      <circle cx="188" cy="150" r="1.6" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}
