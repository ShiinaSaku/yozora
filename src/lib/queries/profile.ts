import { queryOptions } from "@tanstack/react-query"
import { getMyProfileFn, getPublicProfilePageData } from "@/lib/server/profile"

/**
 * Shared query options for the current authenticated user's profile settings.
 */
export const myProfileQueryOptions = (enabled = true) =>
  queryOptions({
    queryKey: ["profile", "me"],
    queryFn: () => getMyProfileFn(),
    enabled,
  })

/**
 * Shared query options for a public user profile page.
 */
export const publicProfileQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: ["public-profile", handle.toLowerCase()],
    queryFn: () => getPublicProfilePageData({ data: handle }),
  })
