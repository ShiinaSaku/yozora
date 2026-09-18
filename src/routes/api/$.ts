import { createFileRoute } from "@tanstack/react-router"
import { apiApp } from "@/lib/api/app"

/**
 * Universal Hono API request dispatcher.
 * Forwards all incoming HTTP methods to the Hono application router.
 */
const handle = ({ request }: { request: Request }) => apiApp.fetch(request)

/**
 * Server splat route handler for the REST API (`/api/*`).
 */
export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      HEAD: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
})
