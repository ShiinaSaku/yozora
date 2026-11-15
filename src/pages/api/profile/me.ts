import type { APIRoute } from "astro"
import { getUserId } from "@/lib/server/auth"
import { getMyProfile } from "@/lib/server/profile"

export const prerender = false

/**
 * GET /api/profile/me — the signed-in user's private profile.
 */
export const GET: APIRoute = async ({ locals }) => {
  const userId = await getUserId(locals as never)
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const profile = await getMyProfile(userId)
  return new Response(JSON.stringify(profile), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  })
}
