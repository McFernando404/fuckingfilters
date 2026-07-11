import { NextResponse } from "next/server";

// Same LM Studio base as the chat route. Server-side only, so the URL never
// reaches the browser.
const BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1").replace(/\/+$/, "");
// Origin (strip the /v1 OpenAI path) for LM Studio's NATIVE API, which reports
// the real per-model load state (`state: "loaded"`).
const ORIGIN = BASE_URL.replace(/\/v1$/, "");
const API_KEY = process.env.LMSTUDIO_API_KEY?.trim() || "";
const authHeaders = API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {};

/**
 * Report which models are currently LOADED in LM Studio. Uses the native
 * /api/v0/models (which exposes `state`) and falls back to the OpenAI list
 * (presence == online) on older builds. `online` is false if the server is
 * down/unreachable.
 */
export async function GET() {
  // Prefer the native API — it knows which models are actually loaded.
  try {
    const native = await fetch(`${ORIGIN}/api/v0/models`, {
      headers: authHeaders,
      cache: "no-store",
    }).catch(() => null);
    if (native && native.ok) {
      const data = await native.json();
      const list: Array<{ id?: string; state?: string }> = Array.isArray(data?.data)
        ? data.data
        : [];
      const loaded = list
        .filter((m) => m?.state === "loaded")
        .map((m) => m.id)
        .filter((x): x is string => typeof x === "string");
      return NextResponse.json({ online: true, models: loaded });
    }
  } catch {
    /* fall through to OpenAI list */
  }

  // Fallback: OpenAI-compatible list — a model counts as online if present.
  try {
    const res = await fetch(`${BASE_URL}/models`, {
      headers: authHeaders,
      cache: "no-store",
    }).catch(() => null);
    if (!res || !res.ok) {
      return NextResponse.json({ online: false, models: [] });
    }
    const data = await res.json();
    const list: unknown = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.models)
        ? data.models
        : [];
    const ids = (list as Array<unknown>)
      .map((m) => (typeof m === "string" ? m : (m as { id?: string })?.id))
      .filter((x): x is string => typeof x === "string");
    return NextResponse.json({ online: true, models: ids });
  } catch {
    return NextResponse.json({ online: false, models: [] });
  }
}
