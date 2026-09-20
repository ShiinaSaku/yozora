import {
  Outlet,
  createFileRoute,
  isRedirect,
  redirect,
} from "@tanstack/react-router"
import { requireAuthFn } from "@/lib/server/auth"

function signInRedirect(href: string) {
  return redirect({
    to: "/sign-in/$",
    search: {
      redirect: href,
    },
  })
}

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    try {
      return await requireAuthFn()
    } catch (error) {
      if (isRedirect(error)) {
        throw signInRedirect(location.href)
      }
      throw signInRedirect(location.href)
    }
  },
  component: () => <Outlet />,
})
