"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function listFocusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null,
  );
}

/**
 * Minimal click-outside popover. `children` is a render prop that receives a
 * `close` callback so menu items can close after an action.
 * The trigger is wrapped in a div with role="button"; pass a non-<button>
 * element as the trigger to avoid invalid button-in-button nesting.
 */
export function Popover({
  trigger,
  children,
  align = "left",
  placement = "bottom",
  className = "",
  triggerClassName = "inline-block",
  label = "Options",
}: {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  placement?: "bottom" | "top";
  className?: string;
  triggerClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closedByOutside = useRef(false);
  const contentId = useId();

  useEffect(() => {
    if (!open) return;
    closedByOutside.current = false;
    let dismissedByTab = false;
    const node = contentRef.current;
    // Move focus into the content so keyboard users can reach the options.
    const focusables = listFocusables(node);
    (focusables[0] ?? node)?.focus();

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closedByOutside.current = true;
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        // Tabbing past either edge dismisses the popup and lets focus move
        // naturally to the next element (APG menu-button pattern).
        const list = listFocusables(node);
        if (list.length === 0) return;
        const cur = document.activeElement;
        const leaving =
          (!e.shiftKey && cur === list[list.length - 1]) ||
          (e.shiftKey && cur === list[0]);
        if (leaving) {
          dismissedByTab = true;
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      // Restore focus to the trigger unless the user left via click or Tab.
      if (!closedByOutside.current && !dismissedByTab) {
        triggerRef.current?.focus();
      }
    };
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? contentId : undefined}
        className={triggerClassName}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={contentRef}
            id={contentId}
            role="group"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className={`absolute z-50 ${
              placement === "top" ? "bottom-full mb-2" : "mt-2"
            } ${align === "right" ? "right-0" : "left-0"}`}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
