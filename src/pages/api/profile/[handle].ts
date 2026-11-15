import type { APIRoute } from "astro"
import { getPublicProfilePageData } from "@/lib/server/profile"

export const prerender = false

/**
 * GET /api/profile/:handle — public profile page data for client refetching.
 */
export const GET: APIRoute = async ({ params }) => {
  const handle = params.handle ?? ""
  if (!handle || handle.length > 50) {
    return new Response(JSON.stringify({ error: "Invalid handle" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const data = await getPublicProfilePageData(handle)
  if (!data) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    },
  })
}
