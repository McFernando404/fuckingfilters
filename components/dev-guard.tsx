"use client";

import { useEffect } from "react";

/**
 * Soft deterrent against casual inspection: blocks the right-click context
 * menu and the common keyboard shortcuts that open browser devtools / view
 * source.
 *
 * NOTE: this is NOT real security. A determined user can still open devtools
 * via the browser menu, a different browser, a bookmarklet, or by disabling
 * JavaScript. Treat client code as public — never put secrets in it. This
 * guard only raises the bar for casual inspection.
 */
export function DevGuard() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      // Allow the native context menu inside form fields (paste/copy/select);
      // only suppress it elsewhere as a soft anti-inspection deterrent.
      const t = e.target as HTMLElement | null;
      if (t && t.closest('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + I / J / C  (devtools / console / inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === "i" || k === "j" || k === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + U  (view source)
      if ((e.ctrlKey || e.metaKey) && k === "u") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
