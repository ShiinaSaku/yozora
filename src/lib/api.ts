/**
 * Tiny typed fetch layer for React islands.
 *
 * Reads go through the JSON API endpoints under src/pages/api/; writes go
 * through `actions` from "astro:actions" directly. This replaces the
 * react-query dependency — islands own their fetch/state effects.
 */
import type { AnimeEntry, UserProfile } from "@/lib/db/schema"
import type { Anime } from "@/lib/types/anime"

export interface UserStats {
  totalEntries: number
  totalEpisodes: number
  meanScore: number | null
  daysWatched: number
  completedCount: number
  watchingCount: number
}

export interface PublicProfileData {
  profile: UserProfile
  stats: UserStats
  entries: AnimeEntry[]
  anime: Anime[]
}

export interface LibraryData {
  entries: AnimeEntry[]
  anime: Anime[]
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return (await response.json()) as T
}

/** Instant catalog search. Empty results for short queries. */
export const searchCatalog = (query: string, signal?: AbortSignal) =>
  fetchJson<Anime[]>(
    `/api/search?q=${encodeURIComponent(query.trim().slice(0, 100))}`,
    signal
  )

/** Live trending collection for the Cmd+K dialog. */
export const fetchTrending = (signal?: AbortSignal) =>
  fetchJson<Anime[]>("/api/trending", signal)

/** Batch catalog lookup by AniList IDs. */
export const fetchBatchAnime = (ids: number[], signal?: AbortSignal) =>
  ids.length > 0
    ? fetchJson<Anime[]>(`/api/batch-anime?ids=${ids.join(",")}`, signal)
    : Promise.resolve([] as Anime[])

/** The authenticated user's library (entries + matching catalog rows). */
export const fetchMyLibrary = (signal?: AbortSignal) =>
  fetchJson<LibraryData>("/api/library", signal)

/** The authenticated user's profile (null when none exists yet). */
export const fetchMyProfile = (signal?: AbortSignal) =>
  fetchJson<UserProfile | null>("/api/profile/me", signal)

/** A public profile page payload. */
export const fetchPublicProfile = (handle: string, signal?: AbortSignal) =>
  fetchJson<PublicProfileData>(
    `/api/profile/${encodeURIComponent(handle.toLowerCase())}`,
    signal
  )

/** The authenticated user's library entry for one anime (or null). */
export const fetchEntry = (anilistId: number, signal?: AbortSignal) =>
  fetchJson<AnimeEntry | null>(`/api/entries/${anilistId}`, signal)
