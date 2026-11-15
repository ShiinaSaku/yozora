import { clerkMiddleware } from "@clerk/astro/server"
import { defineMiddleware, sequence } from "astro:middleware"

const csrfProtection = defineMiddleware(async (context, next) => {
  // Mutating requests must be same-origin: state-changing endpoints and actions
  // are CSRF-protected by verifying the request origin against the site origin.
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(
    context.request.method
  )
  if (isMutation) {
    const requestOrigin = context.request.headers.get("origin")
    if (requestOrigin) {
      try {
        if (new URL(requestOrigin).host !== new URL(context.request.url).host) {
          return new Response("Cross-origin request blocked", { status: 403 })
        }
      } catch {
        return new Response("Invalid origin header", { status: 403 })
      }
    }
  }
  return next()
})

const clerk = clerkMiddleware()
const publicCatalog = defineMiddleware((context, next) => {
  const isPublicCatalog =
    ["GET", "HEAD"].includes(context.request.method) &&
    ["/", "/seasonal", "/seasonal/"].includes(context.url.pathname)

  // These pages render the same public catalog for everyone. Like prerendered
  // pages, they use Clerk client-side rather than embedding per-user SSR data.
  if (isPublicCatalog) return next()

  // Astro's cache layer can return a Response with immutable headers. Clerk
  // appends auth headers after `next()` resolves, so hand it a mutable clone.
  return clerk(context, async () => {
    const response = await next()
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })
  })
})

export const onRequest = sequence(publicCatalog, csrfProtection)
