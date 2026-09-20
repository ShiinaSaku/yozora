import { createFileRoute } from "@tanstack/react-router"
import { handleOgImageRequest } from "@/lib/og/image"

export const Route = createFileRoute("/og-image")({
  server: {
    handlers: {
      GET: handleOgImageRequest,
    },
  },
})
