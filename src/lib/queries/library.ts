import { queryOptions } from "@tanstack/react-query"
import { getMyLibraryData } from "@/lib/server/library"
import { getMyEntryFn } from "@/lib/server/entries"

/**
 * Shared query options for the authenticated user's library and watchlists.
 */
export const myLibraryQueryOptions = () =>
  queryOptions({
    queryKey: ["my-entries"],
    queryFn: () => getMyLibraryData(),
  })

/**
 * Shared query options for a specific anime entry tracked by the user.
 */
export const animeEntryQueryOptions = (
  anilistId: number | undefined,
  enabled = true
) =>
  queryOptions({
    queryKey: ["entry", anilistId],
    queryFn: async () => {
      if (!anilistId) return null
      return await getMyEntryFn({ data: anilistId })
    },
    enabled: Boolean(anilistId && enabled),
  })
