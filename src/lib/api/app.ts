import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { etag } from "hono/etag"
import { catalogRouter } from "@/lib/api/catalog"
import { collectionsRouter } from "@/lib/api/collections"
import { entriesRouter } from "@/lib/api/entries"
import { userRouter } from "@/lib/api/user"
import { webhooksRouter } from "@/lib/api/webhooks"
import { AniListUpstreamError, JikanUpstreamError } from "@/lib/catalog"

/**
 * Top-level Hono API instance mounted on `/api`.
 */
export const apiApp = new Hono().basePath("/api")

apiApp.use("*", etag())

apiApp.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error("[API Error]:", err)
  const status: ContentfulStatusCode =
    err instanceof AniListUpstreamError || err instanceof JikanUpstreamError
      ? 503
      : "status" in err && typeof err.status === "number"
        ? (err.status as ContentfulStatusCode)
        : 500
  const message =
    status >= 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error"
  return c.json({ error: message, status }, status)
})

apiApp.notFound((c) =>
  c.json(
    { error: "Not Found", message: `Cannot ${c.req.method} ${c.req.path}` },
    404
  )
)

apiApp.get("/health", async (c) => {
  const { isRedisConfigured } = await import("@/lib/cache")
  return c.json({
    status: "ok",
    time: new Date().toISOString(),
    cache: isRedisConfigured() ? "redis" : "memory",
  })
})

export const routes = apiApp
  .route("/catalog", catalogRouter)
  .route("/user", userRouter)
  .route("/entries", entriesRouter)
  .route("/collections", collectionsRouter)
  .route("/webhooks", webhooksRouter)

export type AppType = typeof routes
