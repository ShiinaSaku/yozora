import type { APIRoute } from "astro"
import { isEdgeCacheConfigured } from "@/lib/cache"

export const prerender = false

/** Lightweight status JSON for uptime monitors and agents (see llms.txt). */
export const GET: APIRoute = () =>
  Response.json(
    {
      status: "ok",
      service: "yozora",
      cache: isEdgeCacheConfigured() ? "edge" : "memory-only",
      timestamp: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } }
  )
