import { createMiddleware } from "hono/factory"
import { cacheIncrement } from "@/lib/cache"

/**
 * Redis-backed fixed-window rate limiter for expensive public endpoints.
 * Fail-open: without Redis configured (or on Redis errors) requests pass through,
 * since Vercel CDN caching and upstream single-flight already absorb most abuse.
 * Keys are scoped per route + client IP.
 */
export function rateLimit(limit: number, windowSeconds: number) {
  return createMiddleware(async (c, next) => {
    const clientIp =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown"

    const count = await cacheIncrement(
      `ratelimit:${c.req.path}:${clientIp}`,
      windowSeconds
    )

    if (count !== null && count > limit) {
      c.header("Retry-After", String(windowSeconds))
      c.header("X-RateLimit-Limit", String(limit))
      c.header("X-RateLimit-Remaining", "0")
      return c.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please retry shortly.",
        },
        429
      )
    }

    await next()
  })
}
