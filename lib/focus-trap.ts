import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function listFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null,
  );
}

/**
 * Modal focus management: when `active`, focus moves into the returned
 * ref's element, Tab/Shift+Tab stay trapped inside it, and on cleanup focus
 * returns to whatever was focused before (the trigger button). Returns a ref
 * to attach to the dialog container.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    node.setAttribute("tabindex", "-1");
    const prev = document.activeElement as HTMLElement | null;
    const initial = listFocusables(node);
    (initial[0] ?? node).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = listFocusables(node);
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey && cur === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && cur === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      if (prev && document.contains(prev)) {
        prev.focus();
      } else {
        // The trigger was unmounted (e.g. successful auth swapped the view).
        // Move focus into the now-visible page instead of stranding it on body.
        const next = document.querySelector<HTMLElement>(
          'main a[href], main button:not([disabled]), main input, main textarea, main select, main [tabindex]:not([tabindex="-1"]), a[href], button:not([disabled])',
        );
        next?.focus();
      }
    };
  }, [active]);

  return ref;
}
