import type { NextConfig } from "next";
import path from "path";
import os from "os";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy. Dev allows 'unsafe-eval' (HMR / React Refresh);
// production drops it. script 'unsafe-inline' is currently required for Next's
// inline runtime hydration scripts (a strict nonce-based CSP is a future
// improvement).
//
// connect-src defaults to 'self'. If the LLM proxy (Cloudflare Worker) is
// called directly from the browser, append its origin via the
// NEXT_PUBLIC_WORKER_URL env var — NEVER hardcode it here. NOTE: any origin in
// connect-src is visible to every visitor in the response header, so a truly
// hidden backend must be proxied through a server-side Route Handler (which
// keeps connect-src at 'self').
const workerOrigin = process.env.NEXT_PUBLIC_WORKER_URL?.trim() || null;
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "object-src 'none'",
  `connect-src 'self'${workerOrigin ? ` ${workerOrigin}` : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so module resolution
  // doesn't wander up to a parent folder that happens to contain a lockfile.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // Clickjacking protection (also enforced via CSP frame-ancestors).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Force HTTPS and prevent downgrade / SSL-strip attacks.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Cross-origin isolation (mitigates Spectre-class / data exfiltration).
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
