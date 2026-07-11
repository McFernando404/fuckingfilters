"use client";

import Link from "next/link";

/**
 * Route-level error boundary: catches render errors in a page (e.g. a
 * malformed persisted entry that slipped past validation) and offers an
 * in-app reset instead of a blank screen. Hardcoded English on purpose —
 * no i18n dependency, so it still renders if the error came from i18n itself.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
    >
      <div className="text-3xl" aria-hidden>
        ◈
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This page hit an error. Your account key and chats are still safe in
        this browser. Try again, or go back home.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_var(--glow)] transition hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
