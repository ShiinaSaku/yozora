import { createFileRoute } from "@tanstack/react-router"
import { isEdgeCacheConfigured } from "@/lib/cache"

/**
 * Health check endpoint advertised in llms.txt / llms-full.txt.
 * Returns lightweight status JSON for uptime monitors and agents.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            status: "ok",
            service: "yozora",
            cache: isEdgeCacheConfigured() ? "edge" : "memory-only",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
          }
        )
      },
    },
  },
})
