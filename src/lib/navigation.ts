import { useNavigate, useRouterState } from "@tanstack/react-router"

export function usePathname() {
  return useRouterState({ select: (state) => state.location.pathname })
}

function splitHref(href: string): {
  to: string
  search?: Record<string, string>
} {
  const [pathname, queryString = ""] = href.split("?")
  if (!queryString) {
    return { to: pathname }
  }
  const search = Object.fromEntries(new URLSearchParams(queryString))
  return { to: pathname, search }
}

export function useRouter() {
  const navigate = useNavigate()
  return {
    // Pass search params explicitly so TanStack does not merge the current
    // location's search into the destination (e.g. `/search?q=a?q=b`).
    push: (href: string) => navigate({ ...splitHref(href) } as any),
    replace: (href: string) =>
      navigate({ ...splitHref(href), replace: true } as any),
  }
}
