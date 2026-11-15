import type { APIRoute } from "astro"
import { getMultipleAnime } from "@/lib/catalog"

export const prerender = false

/**
 * GET /api/batch-anime?ids=1,2,3 — batched AniList catalog lookups.
 */
export const GET: APIRoute = async ({ url }) => {
  const raw = url.searchParams.get("ids") ?? ""
  const ids = raw
    .split(",")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, 50)

  const anime = await getMultipleAnime(ids)
  return new Response(JSON.stringify(anime), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  })
}
