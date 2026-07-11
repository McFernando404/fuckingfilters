"use client";

/**
 * Catches errors thrown inside the root layout's tree (e.g. a provider crash
 * or malformed persisted data that bypasses validation). Must render its own
 * <html>/<<body> (it replaces the root layout). Inline styles because the
 * global stylesheet / Tailwind are not guaranteed to be loaded here.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>◈</div>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p
            style={{
              color: "#a1a1aa",
              margin: "0 0 1.5rem",
              maxWidth: "26rem",
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Your account key and chats stay in
            this browser. Try again — if it keeps happening, clear the site data
            for this page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "0.65rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
