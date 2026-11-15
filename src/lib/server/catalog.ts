import {
  getAiringSchedule,
  getAnimeCollection,
  getAnimeDetail,
  getCharacterDetail,
  getMultipleAnime,
  searchAnime,
} from "@/lib/catalog"
import { getAnimeThemes } from "@/lib/themes"

// Plain async data loaders — framework-agnostic. Astro pages call them
// directly in frontmatter (no HTTP roundtrip needed for page data), so the
// per-route CDN caching that used to live in these functions is expressed
// declaratively through `routeRules` in astro.config.ts instead.
//
// Callers handle "not found" by checking for null and rendering the 404 page.

/**
 * Home page data: three AniList collections fetched concurrently.
 */
export async function getHomeData() {
  const [trending, seasonal, popular] = await Promise.all([
    getAnimeCollection("trending"),
    getAnimeCollection("seasonal"),
    getAnimeCollection("popular"),
  ])
  return { trending, seasonal, popular }
}

/**
 * Live airing radar schedule for the home page radar section.
 */
export async function getHomeAiring() {
  return getAiringSchedule()
}

/**
 * Seasonal releases page data.
 */
export async function getSeasonalData() {
  return getAnimeCollection("seasonal")
}

/**
 * Search page data: falls back to trending when the query is too short.
 */
export async function getSearchPageData(query: string) {
  const trimmed = query.trim().slice(0, 100)
  return {
    query: trimmed,
    items:
      trimmed.length >= 2
        ? await searchAnime(trimmed)
        : await getAnimeCollection("trending"),
  }
}

/**
 * Airing radar page data.
 */
export async function getAiringData() {
  return {
    items: await getAiringSchedule(),
    generatedAt: Math.floor(Date.now() / 1000),
  }
}

/**
 * Anime detail page data: AniList detail + creditless theme songs.
 * Returns null when the anime does not exist (page renders 404).
 */
export async function getAnimePageData(id: string) {
  const animeId = Number.parseInt(id, 10)
  if (!Number.isInteger(animeId) || animeId <= 0) {
    return null
  }
  try {
    const [detail, themes] = await Promise.all([
      getAnimeDetail(animeId),
      getAnimeThemes(animeId).catch(() => ({ animeId, themes: [] })),
    ])
    return { detail, themes: themes.themes }
  } catch (error) {
    if (error instanceof Error && error.message === "Anime not found") {
      return null
    }
    throw error
  }
}

/**
 * Character detail page data. Returns null when the character does not exist.
 */
export async function getCharacterPageData(id: string) {
  const characterId = Number.parseInt(id, 10)
  if (!Number.isInteger(characterId) || characterId <= 0) {
    return null
  }
  try {
    return await getCharacterDetail(characterId)
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Character not found" ||
        error.message === "Anime not found")
    ) {
      return null
    }
    throw error
  }
}

/**
 * Batch fetch for server islands / client prefetch paths.
 */
export async function getBatchAnimeData(ids: number[]) {
  if (ids.length === 0) return []
  return getMultipleAnime(ids)
}

/**
 * Instant search for the Cmd+K dialog. Returns [] for short queries.
 */
export async function searchCatalog(query: string) {
  const trimmed = query.trim().slice(0, 100)
  if (trimmed.length < 2) return []
  return searchAnime(trimmed)
}
