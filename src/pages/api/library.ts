import type { APIRoute } from "astro"
import { getUserId } from "@/lib/server/auth"
import { getMyLibraryData } from "@/lib/server/library"

export const prerender = false

/**
 * GET /api/library — the signed-in user's library entries + batched anime data.
 */
export const GET: APIRoute = async ({ locals }) => {
  const userId = await getUserId(locals as never)
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const data = await getMyLibraryData(userId)
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  })
}
