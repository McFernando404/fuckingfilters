"use client";

import { type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { EmblemA } from "./emblem";

/* ------------------------------------------------------------------ *
 * F*ckingFilters hero emblem — the shared "F" gem on a soft, theme-aware halo.
 * Static (no float). The ambient particle field lives in
 * components/particle-field.tsx (full-page, document-anchored).
 * Pure HTML/CSS + inline SVG — no WebGL. Halo alphas are CSS vars.
 * ------------------------------------------------------------------ */

export function HeroEmblem() {
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === "light";

  const rootStyle = {
    ...(light
      ? {
          "--cool-bridge": "rgba(220,38,38,0.08)",
          "--halo-1": "rgba(220,38,38,0.22)",
          "--halo-2": "rgba(225,29,29,0.12)",
          "--halo-3": "rgba(248,113,113,0.05)",
          "--core-1": "rgba(248,113,113,0.30)",
          "--core-2": "rgba(220,38,38,0.16)",
        }
      : {
          "--cool-bridge": "rgba(252,165,165,0.10)",
          "--halo-1": "rgba(239,68,68,0.30)",
          "--halo-2": "rgba(244,63,94,0.16)",
          "--halo-3": "rgba(252,165,165,0.06)",
          "--core-1": "rgba(248,113,113,0.42)",
          "--core-2": "rgba(239,68,68,0.22)",
        }),
  } as CSSProperties;

  return (
    <div className="relative h-full w-full overflow-hidden" style={rootStyle}>
      {/* L1 — faint cool bridge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--cool-bridge) 0%, transparent 60%)",
        }}
      />

      {/* L2 — wide halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 52%, var(--halo-1) 0%, var(--halo-2) 30%, var(--halo-3) 52%, transparent 70%)",
        }}
      />

      {/* L3 — core glow (peeks around the emblem edge) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, var(--core-1) 0%, var(--core-2) 40%, transparent 70%)",
        }}
      />

      {/* the static, theme-aware emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[70%] w-[70%]">
          <EmblemA className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
