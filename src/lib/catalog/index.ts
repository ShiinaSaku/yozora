/**
 * Unified Anime Catalog Provider Interface
 *
 * Provides a single, resilient entry point for anime metadata.
 * Uses AniList GraphQL as the primary authoritative catalog, with safe failover.
 * Never allows upstream scraping errors (e.g. MyAnimeList connection dropouts)
 * to crash the application.
 */

import {
  AniListUpstreamError,
  catalogCollections,
  getAiringSchedule as getAniListAiring,
  getAnimeCollection as getAniListCollection,
  getAnimeDetail as getAniListDetail,
  getCharacterDetail as getAniListCharacter,
  getMultipleAnime as getAniListMultiple,
  searchAnime as searchAniList,
} from "@/lib/anilist"
import {
  JikanUpstreamError,
  getJikanAiringSchedule,
  getJikanAnimeCollection,
  getJikanAnimeDetail,
  getJikanCharacterDetail,
  getMultipleJikanAnime,
  searchJikanAnime,
} from "@/lib/jikan"
import type {
  AiringScheduleItem,
  Anime,
  AnimeDetailResponse,
  CharacterDetail,
} from "@/lib/types/anime"

export { catalogCollections }
export type CatalogCollection = (typeof catalogCollections)[number]
export { AniListUpstreamError, JikanUpstreamError }

export type CatalogProvider = "auto" | "anilist" | "jikan"

export function getActiveProvider(): CatalogProvider {
  const provider = (
    process.env.ANIME_PROVIDER ||
    import.meta.env.VITE_ANIME_PROVIDER ||
    "anilist"
  ).toLowerCase()

  if (provider === "jikan") return "jikan"
  if (provider === "auto") return "auto"
  return "anilist"
}

/**
 * Fetch a curated anime collection (trending, seasonal, popular, upcoming, top).
 * Uses AniList as primary; safely falls back to Jikan without crashing if Jikan is down.
 */
export async function getAnimeCollection(
  collection: CatalogCollection
): Promise<Anime[]> {
  const provider = getActiveProvider()

  if (provider === "jikan") {
    try {
      return await getJikanAnimeCollection(collection)
    } catch (err) {
      console.warn(`[Catalog] Jikan collection "${collection}" failed:`, err)
      return []
    }
  }

  try {
    return await getAniListCollection(collection)
  } catch (error) {
    if (provider === "anilist") {
      console.warn(
        `[Catalog] AniList collection "${collection}" failed:`,
        error
      )
      return []
    }
    console.warn(
      `[Catalog] AniList collection "${collection}" failed; attempting Jikan fallback:`,
      error instanceof Error ? error.message : error
    )
    try {
      return await getJikanAnimeCollection(collection)
    } catch (jikanErr) {
      console.warn(
        `[Catalog] Jikan fallback collection "${collection}" also failed:`,
        jikanErr
      )
      return []
    }
  }
}

/**
 * Search anime by title query.
 * Falls back to Jikan if AniList is unreachable, failing open to empty results.
 */
export async function searchAnime(query: string): Promise<Anime[]> {
  const provider = getActiveProvider()

  if (provider === "jikan") {
    try {
      return await searchJikanAnime(query)
    } catch (err) {
      console.warn(`[Catalog] Jikan search "${query}" failed:`, err)
      return []
    }
  }

  try {
    return await searchAniList(query)
  } catch (error) {
    if (provider === "anilist") {
      console.warn(`[Catalog] AniList search "${query}" failed:`, error)
      return []
    }
    console.warn(
      `[Catalog] AniList search "${query}" failed; attempting Jikan fallback:`,
      error instanceof Error ? error.message : error
    )
    try {
      return await searchJikanAnime(query)
    } catch (jikanErr) {
      console.warn(
        `[Catalog] Jikan search fallback "${query}" also failed:`,
        jikanErr
      )
      return []
    }
  }
}

/**
 * Get real-time broadcast schedules and countdowns.
 */
export async function getAiringSchedule(): Promise<AiringScheduleItem[]> {
  const provider = getActiveProvider()

  if (provider === "jikan") {
    try {
      return await getJikanAiringSchedule()
    } catch (err) {
      console.warn("[Catalog] Jikan airing schedule failed:", err)
      return []
    }
  }

  try {
    return await getAniListAiring()
  } catch (error) {
    if (provider === "anilist") {
      console.warn("[Catalog] AniList airing schedule failed:", error)
      return []
    }
    console.warn(
      "[Catalog] AniList airing schedule failed; attempting Jikan fallback:",
      error instanceof Error ? error.message : error
    )
    try {
      return await getJikanAiringSchedule()
    } catch (jikanErr) {
      console.warn("[Catalog] Jikan airing schedule fallback failed:", jikanErr)
      return []
    }
  }
}

/**
 * Get full anime details, relations, characters, and external links.
 */
export async function getAnimeDetail(id: number): Promise<AnimeDetailResponse> {
  const provider = getActiveProvider()

  if (provider === "jikan") {
    return getJikanAnimeDetail(id)
  }

  try {
    return await getAniListDetail(id)
  } catch (error) {
    if (provider === "anilist") {
      throw error
    }
    console.warn(
      `[Catalog] AniList detail #${id} failed; attempting Jikan fallback:`,
      error instanceof Error ? error.message : error
    )
    try {
      return await getJikanAnimeDetail(id)
    } catch (jikanErr) {
      console.warn(
        `[Catalog] Jikan detail #${id} fallback also failed:`,
        jikanErr
      )
      // Throw clean error rather than Jikan's internal MyAnimeList connection message
      throw new Error(
        error instanceof Error
          ? error.message
          : "Anime details temporarily unavailable"
      )
    }
  }
}

/**
 * Get character biography and media appearances.
 */
export async function getCharacterDetail(id: number): Promise<CharacterDetail> {
  const provider = getActiveProvider()

  if (provider === "jikan") {
    return getJikanCharacterDetail(id)
  }

  try {
    return await getAniListCharacter(id)
  } catch (error) {
    if (provider === "anilist") {
      throw error
    }
    console.warn(
      `[Catalog] AniList character #${id} failed; attempting Jikan fallback:`,
      error instanceof Error ? error.message : error
    )
    try {
      return await getJikanCharacterDetail(id)
    } catch (jikanErr) {
      console.warn(
        `[Catalog] Jikan character #${id} fallback also failed:`,
        jikanErr
      )
      throw new Error(
        error instanceof Error
          ? error.message
          : "Character details temporarily unavailable"
      )
    }
  }
}

/**
 * Batch lookup of multiple anime by ID.
 */
export async function getMultipleAnime(ids: number[]): Promise<Anime[]> {
  const provider = getActiveProvider()

  if (provider === "jikan") {
    try {
      return await getMultipleJikanAnime(ids)
    } catch (err) {
      console.warn("[Catalog] Jikan batch lookup failed:", err)
      return []
    }
  }

  try {
    return await getAniListMultiple(ids)
  } catch (error) {
    if (provider === "anilist") {
      console.warn("[Catalog] AniList batch lookup failed:", error)
      return []
    }
    console.warn(
      `[Catalog] AniList batch lookup failed; attempting Jikan fallback:`,
      error instanceof Error ? error.message : error
    )
    try {
      return await getMultipleJikanAnime(ids)
    } catch (jikanErr) {
      console.warn(
        "[Catalog] Jikan batch lookup fallback also failed:",
        jikanErr
      )
      return []
    }
  }
}
