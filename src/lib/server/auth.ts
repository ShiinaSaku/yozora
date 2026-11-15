/**
 * Auth helpers for server code. Clerk is wired through `src/middleware.ts`
 * (`clerkMiddleware`), so any request context (pages, endpoints, actions)
 * exposes `locals.auth()` from `@clerk/astro/server`.
 */

type AuthLocals = {
  auth: () => Promise<{
    isAuthenticated: boolean
    userId: string | null
  }>
}

/**
 * Resolve the signed-in user's id or throw Unauthorized.
 * Shared by Astro Actions and any on-demand server code.
 */
export async function requireUserId(locals: AuthLocals): Promise<string> {
  const { isAuthenticated, userId } = await locals.auth()
  if (!isAuthenticated || !userId) {
    throw new Error("Unauthorized")
  }
  return userId
}

/**
 * Resolve the signed-in user's id without throwing — null when signed out.
 */
export async function getUserId(locals: AuthLocals): Promise<string | null> {
  const { isAuthenticated, userId } = await locals.auth()
  if (!isAuthenticated || !userId) {
    return null
  }
  return userId
}
