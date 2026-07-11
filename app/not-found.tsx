import Link from "next/link";

/**
 * Branded 404 for any unknown route (renders inside the root layout, so the
 * theme tokens / font apply — not Next's default unstyled 404).
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--base)] px-6 text-center text-fg">
      <h1 className="text-6xl font-semibold tracking-tight text-gradient">
        404
      </h1>
      <p className="mt-4 max-w-sm text-sm text-muted">
        This page doesn&apos;t exist. It may have moved or the link is broken.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_var(--glow)] transition hover:brightness-110"
      >
        Back to home
      </Link>
    </div>
  );
}
