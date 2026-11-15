import type { APIRoute } from "astro"
import { getUserId } from "@/lib/server/auth"
import { getMyEntry } from "@/lib/server/entries"

export const prerender = false

/**
 * GET /api/entries/:anilistId — a single library entry for the signed-in user.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const userId = await getUserId(locals as never)
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const anilistId = Number.parseInt(params.anilistId ?? "", 10)
  if (!Number.isInteger(anilistId) || anilistId <= 0) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const entry = await getMyEntry(userId, anilistId)
  return new Response(JSON.stringify(entry), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  })
}
