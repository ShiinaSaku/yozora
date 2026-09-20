import "zod/compile"
import { createRouter } from "@tanstack/react-router"
import { dehydrate, hydrate, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { CatalogPageSkeleton } from "@/components/ui/page-skeletons"
import { createQueryClient } from "@/lib/query"

export function getRouter() {
  const queryClient = createQueryClient()

  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPendingMs: 150,
    defaultPendingComponent: CatalogPageSkeleton,
    defaultGcTime: 300_000,
    defaultStaleTime: 30_000,
    dehydrate: () => ({
      queryClientState: dehydrate(queryClient) as unknown as Record<
        string,
        never
      >,
    }),
    hydrate: (dehydrated) => {
      hydrate(queryClient, dehydrated.queryClientState)
    },
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
