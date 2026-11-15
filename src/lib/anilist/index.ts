import { ClientError, GraphQLClient } from "graphql-request"
import type { DocumentNode } from "graphql"
import { print } from "graphql"
import type {
  AiringScheduleItem,
  Anime,
  AnimeCharacter,
  AnimeDetailResponse,
  CharacterDetail,
} from "@/lib/types/anime"
import {
  AiringScheduleDocument,
  AnimeCatalogDocument,
  AnimeDetailDocument,
  AnimeSearchDocument,
  BatchAnimeDocument,
  CharacterDetailDocument,
} from "./operations"
import { searchWithFallback } from "./fuzzy-search"

const DEFAULT_ANILIST_ENDPOINT = "https://okotsuu.vercel.app/graphql"
const PLACEHOLDER_COVER =
  "https://placehold.co/600x850/171622/F8F7FC?text=Yozora"

function getAniListEndpoint() {
  if (import.meta.env.SSR) {
    return process.env.ANILIST_API_URL || DEFAULT_ANILIST_ENDPOINT
  }
  return import.meta.env.PUBLIC_ANILIST_API_URL || DEFAULT_ANILIST_ENDPOINT
}

// Edge-cache helpers. The cache layer only exists on the server (Workers
// Cache API); these are no-ops in the browser.
const edgeCacheGet = async (key: string) => {
  if (!import.meta.env.SSR) return null
  const { cacheGet } = await import("@/lib/cache")
  return cacheGet(key)
}

const edgeCacheGetStale = async <T>(key: string) => {
  if (!import.meta.env.SSR) return null
  const { cacheGetStale } = await import("@/lib/cache")
  return cacheGetStale<T>(key)
}

const edgeCacheSet = async (
  key: string,
  value: unknown,
  ttlSeconds: number
) => {
  if (!import.meta.env.SSR) return
  const { cacheSet } = await import("@/lib/cache")
  await cacheSet(key, value, ttlSeconds)
}

const edgeCacheMGet = async (keys: string[]) => {
  if (!import.meta.env.SSR) return keys.map(() => null)
  const { cacheMGet } = await import("@/lib/cache")
  return cacheMGet(keys)
}

const edgeCacheMSet = async (
  items: Array<{ key: string; value: unknown; ttlSeconds?: number }>
) => {
  if (!import.meta.env.SSR) return
  const { cacheMSet } = await import("@/lib/cache")
  await cacheMSet(items)
}

/**
 * Stable, collision-resistant cache key from a query + variables pair.
 * Hashes instead of inlining the full query so cache keys stay short.
 */
function hashCacheKey(
  query: string | { toString: () => string },
  variables: Record<string, unknown>
): string {
  const queryStr = typeof query === "string" ? query : query.toString()
  const raw = `${queryStr}::${JSON.stringify(variables)}`
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) | 0
  }
  return `${Math.abs(hash).toString(36)}-${raw.length}`
}

export const catalogCollections = [
  "trending",
  "popular",
  "seasonal",
  "upcoming",
  "top",
] as const
export type CatalogCollection = (typeof catalogCollections)[number]

interface AniListTitle {
  romaji: string | null
  english: string | null
  native: string | null
}

interface AniListMedia {
  id: number
  idMal?: number | null
  title: AniListTitle
  coverImage: {
    medium: string | null
    large: string | null
    extraLarge: string | null
    color: string | null
  }
  bannerImage: string | null
  averageScore: number | null
  seasonYear: number | null
  startDate: { year: number | null }
  format: string | null
  status: string | null
  episodes: number | null
  duration: number | null
  popularity: number | null
  favourites: number | null
  genres: string[]
  description: string | null
  trailer: { id: string; site: string; thumbnail: string | null } | null
  nextAiringEpisode: {
    episode: number
    airingAt: number
    timeUntilAiring: number
  } | null
  studios: { nodes: Array<{ name: string }> } | null
}

interface AniListCharacterEdge {
  role: string
  node: {
    id: number
    name: { full: string }
    image: { large: string | null; medium: string | null } | null
  }
  voiceActors: Array<{
    name: { full: string }
    image: { large: string | null; medium: string | null } | null
    language: string
  }> | null
}

interface AniListExternalLink {
  id: number
  url: string
  site: string
  icon: string | null
  color: string | null
  type: string | null
  language: string | null
}

interface AniListDetailMedia extends AniListMedia {
  relations: { edges: Array<{ node: AniListMedia }> } | null
  recommendations: {
    nodes: Array<{ mediaRecommendation: AniListMedia | null }>
  } | null
  characters: { edges: AniListCharacterEdge[] } | null
  externalLinks: AniListExternalLink[] | null
}

interface AniListAiringSchedule {
  id: number
  episode: number
  airingAt: number
  timeUntilAiring: number
  media: AniListMedia
}

function getCurrentSeason() {
  const date = new Date()
  const month = date.getUTCMonth() + 1
  const season =
    month <= 3
      ? "WINTER"
      : month <= 6
        ? "SPRING"
        : month <= 9
          ? "SUMMER"
          : "FALL"

  return { season, year: date.getUTCFullYear() }
}

function getCollectionVariables(collection: CatalogCollection) {
  if (collection === "seasonal") {
    const { season, year } = getCurrentSeason()
    return {
      sort: ["POPULARITY_DESC"],
      season,
      seasonYear: year,
      status: "RELEASING",
    }
  }

  if (collection === "upcoming")
    return { sort: ["POPULARITY_DESC"], status: "NOT_YET_RELEASED" }
  if (collection === "top") return { sort: ["SCORE_DESC"] }
  if (collection === "popular") return { sort: ["POPULARITY_DESC"] }
  return { sort: ["TRENDING_DESC", "POPULARITY_DESC"] }
}

function stripDescription(description?: string | null) {
  return (
    description
      ?.replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim() || undefined
  )
}

// In-flight single-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>()

// In-memory response cache with TTL + stale-while-error grace window
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const MAX_CACHE_ENTRIES = 500
// How long past expiry an entry stays available as a failure fallback.
// Upstream blips are served stale instead of throwing — the cache never
// becomes a liability the moment its TTL ends.
const STALE_GRACE_MS = 1000 * 60 * 15

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) return null
  return entry.data as T
}

/** Fresh OR recently-expired data — the fail-open fallback when upstream fails. */
function getStaleCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt + STALE_GRACE_MS) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = memoryCache.keys().next().value
    if (firstKey) memoryCache.delete(firstKey)
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}

// Individual anime entity cache to optimize batch lookups
const animeEntityCache = new Map<number, { anime: Anime; expiresAt: number }>()

function cacheAnimeEntity(anime: Anime, ttlMs = 1000 * 60 * 60 * 2) {
  if (animeEntityCache.size >= 1000) {
    const firstKey = animeEntityCache.keys().next().value
    if (firstKey) animeEntityCache.delete(firstKey)
  }
  animeEntityCache.set(anime.id, {
    anime,
    expiresAt: Date.now() + ttlMs,
  })
}

function getCachedAnime(id: number): Anime | null {
  const entry = animeEntityCache.get(id)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    animeEntityCache.delete(id)
    return null
  }
  return entry.anime
}

export function toAnime(media: AniListMedia): Anime {
  const english = media.title.english || undefined
  const romaji = media.title.romaji || undefined
  const native = media.title.native || undefined

  const anime: Anime = {
    id: media.id,
    idMal: media.idMal || undefined,
    title: english || romaji || native || "Untitled",
    subtitle: english
      ? romaji || native
      : romaji && native
        ? native
        : undefined,
    cover:
      media.coverImage.large ||
      media.coverImage.medium ||
      media.coverImage.extraLarge ||
      PLACEHOLDER_COVER,
    coverMedium: media.coverImage.medium || undefined,
    coverLarge: media.coverImage.large || undefined,
    coverExtraLarge: media.coverImage.extraLarge || undefined,
    banner: media.bannerImage || undefined,
    accent: media.coverImage.color || "#8b7cb8",
    score: (media.averageScore || 0) / 10,
    year:
      media.seasonYear || media.startDate.year || new Date().getUTCFullYear(),
    format: media.format || "TV",
    status: media.status || undefined,
    episodes: media.episodes || undefined,
    duration: media.duration || undefined,
    popularity: media.popularity || undefined,
    favourites: media.favourites || undefined,
    tags: media.genres.slice(0, 3),
    description: stripDescription(media.description),
    titles: { romaji, english, native },
    trailer: media.trailer
      ? {
          id: media.trailer.id,
          site: media.trailer.site,
          thumbnail: media.trailer.thumbnail || undefined,
        }
      : undefined,
    studios: media.studios?.nodes.flatMap((studio) =>
      studio.name ? [studio.name] : []
    ),
    nextAiring: media.nextAiringEpisode
      ? {
          episode: media.nextAiringEpisode.episode,
          airingAt: media.nextAiringEpisode.airingAt,
          timeUntilAiring: media.nextAiringEpisode.timeUntilAiring,
        }
      : undefined,
  }

  cacheAnimeEntity(anime)
  return anime
}

export class AniListUpstreamError extends Error {
  status: number
  /** Upstream-provided retry hint in seconds (from the Retry-After header). */
  retryAfter?: number

  constructor(message: string, status: number, retryAfter?: number) {
    super(message)
    this.name = "AniListUpstreamError"
    this.status = status
    this.retryAfter = retryAfter
  }
}

async function executeAniListFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const client = new GraphQLClient(getAniListEndpoint(), {
    headers: {
      accept: "application/json",
    },
  })

  const makeRequest = async (): Promise<{ data: T; retryAfter?: number }> => {
    try {
      return { data: await client.request<T>(query, variables) }
    } catch (err) {
      if (err instanceof ClientError) {
        const status = err.response.status
        const errors = err.response.errors
        const upstreamMessage =
          errors?.[0]?.message || `AniList returned status ${status}`

        if (
          status === 404 ||
          errors?.some((e) => (e as { status?: number }).status === 404)
        ) {
          throw new Error("Anime not found")
        }
        const retryAfterHeader = err.response.headers.get("retry-after")
        const retryAfter = retryAfterHeader
          ? Number(retryAfterHeader)
          : undefined
        if (
          status === 403 &&
          upstreamMessage.toLowerCase().includes("manually blocked")
        ) {
          throw new AniListUpstreamError(
            "AniList is rejecting requests from this server IP",
            503
          )
        }
        throw new AniListUpstreamError(
          upstreamMessage,
          status >= 500 ? 503 : status,
          Number.isFinite(retryAfter) ? retryAfter : undefined
        )
      }
      throw err
    }
  }

  // Rate limits (429) and transient 5xx/network failures get up to three
  // attempts, honoring AniList's Retry-After hint when present.
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data } = await makeRequest()
      return data
    } catch (err) {
      lastError = err
      if (err instanceof Error && err.message === "Anime not found") throw err
      if (!(err instanceof AniListUpstreamError)) throw err
      if (attempt === 2) throw err
      const backoff = err.retryAfter
        ? Math.min(Math.max(err.retryAfter, 1), 10) * 1000
        : 600 * 2 ** attempt
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }
  throw lastError
}

async function requestAniList<T>(
  query: string | DocumentNode,
  variables: Record<string, unknown>,
  ttlMs = 1000 * 60 * 60
): Promise<T> {
  const queryString = typeof query === "string" ? query : print(query)
  const cacheKey = `anilist:${hashCacheKey(queryString, variables)}`

  // 1. Check in-memory cache (per-isolate, instant)
  const memory = getCached<T>(cacheKey)
  if (memory) {
    return memory
  }

  // 2. Check in-flight promise deduplication (single-flight)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>
  }

  // 3. Initiate single request: edge cache (shared across isolates) → upstream
  const requestPromise = (async () => {
    const edgeHit = (await edgeCacheGet(cacheKey)) as T | null
    if (edgeHit !== null && edgeHit !== undefined) {
      return edgeHit
    }

    try {
      const data = await executeAniListFetch<T>(queryString, variables)
      setCached(cacheKey, data, ttlMs)
      void edgeCacheSet(cacheKey, data, Math.round(ttlMs / 1000))
      return data
    } catch (error) {
      // Fail-open: never let an upstream blip take a page down while we hold
      // perfectly good recently-expired data in memory or the edge cache.
      const stale = getStaleCached<T>(cacheKey)
      if (stale !== null) {
        console.warn(
          `[AniList] Upstream failed, serving stale cache for ${cacheKey}:`,
          error instanceof Error ? error.message : error
        )
        return stale
      }
      const edgeStale = await edgeCacheGetStale<T>(cacheKey)
      if (edgeStale !== null && edgeStale !== undefined) return edgeStale
      throw error
    }
  })().finally(() => {
    inFlightRequests.delete(cacheKey)
  })

  inFlightRequests.set(cacheKey, requestPromise)
  return requestPromise
}

export async function getAnimeCollection(collection: CatalogCollection) {
  const data = await requestAniList<{ Page: { media: AniListMedia[] } }>(
    AnimeCatalogDocument,
    getCollectionVariables(collection),
    1000 * 60 * 60 * 2
  )
  return data.Page.media.map(toAnime)
}

async function searchAnimeExact(search: string) {
  const data = await requestAniList<{ Page: { media: AniListMedia[] } }>(
    AnimeSearchDocument,
    { search },
    1000 * 60 * 60 * 6
  )
  return data.Page.media.map(toAnime)
}

const searchCandidatesQuery = `
  query SearchCandidates($search: String) {
    Page(page: 1, perPage: 50) {
      media(type: ANIME, isAdult: false, search: $search, sort: [POPULARITY_DESC]) {
        id
        idMal
        title { romaji english native }
        coverImage { medium large extraLarge color }
        bannerImage
        averageScore
        seasonYear
        startDate { year }
        format
        status
        episodes
        duration
        popularity
        favourites
        genres
        description(asHtml: false)
        trailer { id site thumbnail }
        nextAiringEpisode { episode airingAt timeUntilAiring }
        studios(isMain: true) { nodes { name } }
      }
    }
  }
`

async function getSearchCandidates(search: string | null) {
  const data = await requestAniList<{ Page: { media: AniListMedia[] } }>(
    searchCandidatesQuery,
    { search },
    1000 * 60 * 60 * 6
  )
  return data.Page.media.map(toAnime)
}

export async function searchAnime(search: string) {
  return searchWithFallback(search, searchAnimeExact, getSearchCandidates)
}

export async function getAiringSchedule(): Promise<AiringScheduleItem[]> {
  // Bucket "now" to 5-minute windows so the query cache key stays stable
  // (a raw per-second timestamp would defeat the memory cache entirely).
  const rawNow = Math.floor(Date.now() / 1000)
  const now = rawNow - (rawNow % 300)
  const data = await requestAniList<{
    Page: { airingSchedules: AniListAiringSchedule[] }
  }>(AiringScheduleDocument, { now }, 1000 * 60 * 30)

  return data.Page.airingSchedules.map((schedule) => ({
    id: schedule.id,
    episode: schedule.episode,
    airingAt: schedule.airingAt,
    timeUntilAiring: schedule.timeUntilAiring,
    media: toAnime(schedule.media),
  }))
}

function toCharacter(edge: AniListCharacterEdge): AnimeCharacter {
  const voiceActor = edge.voiceActors?.[0]

  return {
    id: edge.node.id,
    name: edge.node.name.full,
    image: edge.node.image?.large || edge.node.image?.medium || undefined,
    role: edge.role,
    voiceActor: voiceActor
      ? {
          name: voiceActor.name.full,
          image:
            voiceActor.image?.large || voiceActor.image?.medium || undefined,
          language: voiceActor.language,
        }
      : undefined,
  }
}

export async function getAnimeDetail(id: number): Promise<AnimeDetailResponse> {
  const cacheKey = `anime:detail:${id}`
  const cached = (await edgeCacheGet(cacheKey)) as AnimeDetailResponse | null
  if (cached) {
    // Warm in-memory entity cache so relations / recommendations are warm
    cacheAnimeEntity(cached.anime)
    for (const rel of cached.relations) cacheAnimeEntity(rel)
    for (const rec of cached.recommendations) cacheAnimeEntity(rec)
    return cached
  }

  let data
  try {
    data = await requestAniList<{ Media: AniListDetailMedia | null }>(
      AnimeDetailDocument,
      { id },
      1000 * 60 * 5
    )
  } catch (error) {
    // Fail-open: an expired-but-present detail beats a broken page.
    const stale = await edgeCacheGetStale<AnimeDetailResponse>(cacheKey)
    if (stale) return stale
    throw error
  }

  if (!data.Media) throw new Error("Anime not found")

  const media = data.Media

  const detail: AnimeDetailResponse = {
    anime: toAnime(media),
    relations: media.relations?.edges.map((edge) => toAnime(edge.node)) || [],
    recommendations:
      media.recommendations?.nodes
        .map((node) =>
          node.mediaRecommendation ? toAnime(node.mediaRecommendation) : null
        )
        .filter((anime): anime is Anime => Boolean(anime)) || [],
    characters: media.characters?.edges.map(toCharacter) || [],
    externalLinks:
      media.externalLinks?.map((link) => ({
        id: link.id,
        url: link.url,
        site: link.site,
        icon: link.icon || undefined,
        color: link.color || undefined,
        type: link.type || undefined,
        language: link.language || undefined,
      })) || [],
  }

  // Calculate smart TTL:
  // Finished anime -> 30 days (lifetime scale)
  // Airing anime -> dynamic (until next episode airs or max 1 hour)
  // Upcoming -> 12 hours
  const status = (media.status || detail.anime.status || "").toUpperCase()
  let ttlSeconds = 60 * 60 * 24 * 30 // 30 days default
  if (status === "RELEASING") {
    const timeUntil = media.nextAiringEpisode?.timeUntilAiring
    ttlSeconds =
      timeUntil && timeUntil > 0
        ? Math.min(Math.max(timeUntil + 300, 300), 3600)
        : 3600
  } else if (status === "NOT_YET_RELEASED") {
    ttlSeconds = 60 * 60 * 24
  }

  // Write detail to the edge cache
  void edgeCacheSet(cacheKey, detail, ttlSeconds)

  // Also cache the individual anime entity and relations/recommendations into the edge cache
  const relatedAnime = [
    detail.anime,
    ...detail.relations,
    ...detail.recommendations,
  ]
  const entityItems = relatedAnime.map((a) => ({
    key: `anime:entity:${a.id}`,
    value: a,
    ttlSeconds:
      (a.status || "").toUpperCase() === "RELEASING" ? 3600 : 60 * 60 * 24 * 30,
  }))
  void edgeCacheMSet(entityItems)

  return detail
}

interface AniListCharacterDetailGql {
  id: number
  name: {
    full: string
    native?: string | null
    alternative?: string[] | null
  }
  image?: {
    large?: string | null
    medium?: string | null
  } | null
  description?: string | null
  gender?: string | null
  age?: string | null
  bloodType?: string | null
  dateOfBirth?: {
    year?: number | null
    month?: number | null
    day?: number | null
  } | null
  favourites?: number | null
  media?: {
    nodes: AniListMedia[]
  } | null
}

export async function getCharacterDetail(id: number): Promise<CharacterDetail> {
  const cacheKey = `character:detail:${id}`
  const cached = (await edgeCacheGet(cacheKey)) as CharacterDetail | null
  if (cached) {
    return cached
  }

  let data
  try {
    data = await requestAniList<{
      Character: AniListCharacterDetailGql | null
    }>(CharacterDetailDocument, { id }, 1000 * 60 * 60 * 24 * 30)
  } catch (error) {
    // Fail-open: an expired-but-present biography beats a broken page.
    const stale = await edgeCacheGetStale<CharacterDetail>(cacheKey)
    if (stale) return stale
    throw error
  }

  if (!data.Character) throw new Error("Character not found")

  const c = data.Character
  const detail: CharacterDetail = {
    id: c.id,
    name: {
      full: c.name.full,
      native: c.name.native || undefined,
      alternative: c.name.alternative?.filter(Boolean) || undefined,
    },
    image: c.image?.large || c.image?.medium || undefined,
    description: stripDescription(c.description),
    gender: c.gender || undefined,
    age: c.age || undefined,
    bloodType: c.bloodType || undefined,
    dateOfBirth: c.dateOfBirth?.month
      ? {
          year: c.dateOfBirth.year || undefined,
          month: c.dateOfBirth.month || undefined,
          day: c.dateOfBirth.day || undefined,
        }
      : undefined,
    favourites: c.favourites || undefined,
    media: c.media?.nodes.map(toAnime) || [],
  }

  // Character biographies are immutable, cache for 30 days (lifetime scale)
  void edgeCacheSet(cacheKey, detail, 60 * 60 * 24 * 30)

  // Also seed the media entities into the edge cache
  if (detail.media.length > 0) {
    const entityItems = detail.media.map((a) => ({
      key: `anime:entity:${a.id}`,
      value: a,
      ttlSeconds:
        (a.status || "").toUpperCase() === "RELEASING"
          ? 3600
          : 60 * 60 * 24 * 30,
    }))
    void edgeCacheMSet(entityItems)
  }

  return detail
}

export async function getMultipleAnime(ids: number[]): Promise<Anime[]> {
  if (!ids.length) return []
  const uniqueIds = Array.from(new Set(ids))

  const resultsMap = new Map<number, Anime>()
  const missingIds: number[] = []

  // 1. Check in-memory L1 cache
  for (const id of uniqueIds) {
    const cached = getCachedAnime(id)
    if (cached) {
      resultsMap.set(id, cached)
    } else {
      missingIds.push(id)
    }
  }

  // 2. Check edge cache L2 in a single batch read
  let stillMissingIds = missingIds
  if (missingIds.length > 0) {
    const entityKeys = missingIds.map((id) => `anime:entity:${id}`)
    const entityHits = await edgeCacheMGet(entityKeys)
    const unresolved: number[] = []

    for (let i = 0; i < missingIds.length; i++) {
      const id = missingIds[i]
      const hit = entityHits[i] as Anime | null
      if (hit) {
        cacheAnimeEntity(hit)
        resultsMap.set(id, hit)
      } else {
        unresolved.push(id)
      }
    }
    stillMissingIds = unresolved
  }

  // 3. Upstream fallback: Only query AniList for entities still missing from both caches
  if (stillMissingIds.length > 0) {
    const chunks: number[][] = []
    for (let i = 0; i < stillMissingIds.length; i += 50) {
      chunks.push(stillMissingIds.slice(i, i + 50))
    }

    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const data = await requestAniList<{
            Page: { media: AniListMedia[] }
          }>(
            BatchAnimeDocument,
            { ids: chunk },
            1000 * 60 * 60 * 24 // 24 hour query cache
          )
          return data.Page.media.map(toAnime)
        } catch {
          return []
        }
      })
    )

    const newlyFetched = chunkResults.flat()
    for (const anime of newlyFetched) {
      cacheAnimeEntity(anime)
      resultsMap.set(anime.id, anime)
    }

    // Persist all newly fetched entities into the edge cache with smart lifetime/airing TTL
    if (newlyFetched.length > 0) {
      const itemsToCache = newlyFetched.map((a) => ({
        key: `anime:entity:${a.id}`,
        value: a,
        ttlSeconds:
          (a.status || "").toUpperCase() === "RELEASING"
            ? 3600
            : 60 * 60 * 24 * 30,
      }))
      void edgeCacheMSet(itemsToCache)
    }
  }

  return uniqueIds
    .map((id) => resultsMap.get(id))
    .filter((a): a is Anime => Boolean(a))
}
