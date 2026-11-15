import type { APIRoute } from "astro"
import { getAnimeCollection } from "@/lib/catalog"

export const prerender = false

/**
 * GET /api/trending — live trending collection for the Cmd+K dialog.
 */
export const GET: APIRoute = async () => {
  const items = await getAnimeCollection("trending")

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
