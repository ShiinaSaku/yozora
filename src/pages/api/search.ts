import type { APIRoute } from "astro"
import { searchCatalog } from "@/lib/server/catalog"

export const prerender = false

/**
 * GET /api/search?q= — instant search for the Cmd+K dialog and search page.
 */
export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q") ?? ""
  const items = await searchCatalog(query)

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        "public, max-age=600, s-maxage=21600, stale-while-revalidate=86400",
    },
  })
}
