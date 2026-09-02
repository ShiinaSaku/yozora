import { auth } from "@clerk/tanstack-react-start/server"
import { createMiddleware } from "hono/factory"

export type AuthContext = {
  Variables: { userId: string }
}

export const requireAuth = createMiddleware<AuthContext>(async (c, next) => {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated || !userId) {
    return c.json(
      { error: "Unauthorized", message: "Authentication required" },
      401
    )
  }
  c.set("userId", userId)
  await next()
})
