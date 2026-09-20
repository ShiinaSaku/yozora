import { QueryClient } from "@tanstack/react-query"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 300_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        retry: (failureCount, error: unknown) => {
          const status =
            typeof error === "object" && error !== null && "status" in error
              ? Number((error as { status?: unknown }).status)
              : undefined
          if (status === 404 || status === 401 || status === 403) {
            return false
          }
          return failureCount < 2
        },
      },
    },
  })
}
