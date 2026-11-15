import * as React from "react"

/**
 * Current pathname for React islands. With Astro's <ClientRouter /> each
 * island hydrates fresh per page, so `window.location.pathname` at mount is
 * correct; the astro:page-load listener covers remount edge cases.
 */
export function usePathname() {
  const [pathname, setPathname] = React.useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  )

  React.useEffect(() => {
    const update = () => setPathname(window.location.pathname)
    update()
    document.addEventListener("astro:page-load", update)
    return () => document.removeEventListener("astro:page-load", update)
  }, [])

  return pathname
}

/**
 * Programmatic navigation for React islands. Uses Astro's transition router
 * so navigations participate in view transitions and prefetching.
 */
export function useRouter() {
  const navigateRef = React.useRef<
    ((href: string, options?: { history?: "push" | "replace" }) => void) | null
  >(null)

  const navigate = React.useCallback(
    async (href: string, options?: { history?: "push" | "replace" }) => {
      if (!navigateRef.current) {
        // Lazy-load the transition router so islands without navigation
        // never pay for it.
        const transitions = await import("astro:transitions/client")
        navigateRef.current = transitions.navigate
      }
      navigateRef.current(href, options)
    },
    []
  )

  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { history: "replace" }),
  }
}
