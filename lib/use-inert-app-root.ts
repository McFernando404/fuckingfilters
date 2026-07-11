import { useEffect } from "react";

/**
 * When `active`, set `inert` on the #app-root element so screen-reader browse
 * mode and Tab can't reach the page behind a modal dialog. The dialog itself
 * must render in a portal (a sibling of #app-root) to stay interactive.
 */
export function useInertAppRoot(active: boolean) {
  useEffect(() => {
    const root = document.getElementById("app-root");
    if (!root) return;
    if (active) root.setAttribute("inert", "");
    else root.removeAttribute("inert");
    return () => {
      root.removeAttribute("inert");
    };
  }, [active]);
}
