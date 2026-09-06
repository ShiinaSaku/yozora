import { createMiddleware, createServerFn } from "@tanstack/react-start"
import { auth } from "@clerk/tanstack-react-start/server"

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { isAuthenticated, userId } = await auth()
    if (!isAuthenticated || !userId) {
      throw new Error("Unauthorized")
    }
    return next({ context: { userId } })
  }
)

export const requireAuthFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return { userId: context.userId }
  })
