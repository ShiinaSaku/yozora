import { createIsomorphicFn } from "@tanstack/react-start"
import type {
  AiringScheduleItem,
  Anime,
  AnimeCharacter,
  AnimeDetailResponse,
  CharacterDetail,
} from "@/lib/types/anime"

const DEFAULT_ANILIST_ENDPOINT = "https://graphql.anilist.co"
const PLACEHOLDER_COVER =
  "https://placehold.co/600x850/171622/F8F7FC?text=Yozora"

function getAniListEndpoint() {
  if (import.meta.env.SSR) {
    return process.env.ANILIST_API_URL || DEFAULT_ANILIST_ENDPOINT
  }
  return import.meta.env.VITE_ANILIST_API_URL || DEFAULT_ANILIST_ENDPOINT
}

const redisGet = createIsomorphicFn()
  .server(async (key: string) => {
    const { cacheGet } = await import("@/lib/cache")
    return cacheGet(key)
  })
  .client(async (_key: string) => null)

const redisSet = createIsomorphicFn()
  .server(async (key: string, value: unknown, ttlSeconds: number) => {
    const { cacheSet } = await import("@/lib/cache")
    await cacheSet(key, value, ttlSeconds)
  })
  .client(async (_key: string, _value: unknown, _ttlSeconds: number) => {})

const redisMGet = createIsomorphicFn()
  .server(async (keys: string[]) => {
    const { cacheMGet } = await import("@/lib/cache")
    return cacheMGet(keys)
  })
  .client(async (keys: string[]) => keys.map(() => null))

const redisMSet = createIsomorphicFn()
  .server(
    async (
      items: Array<{ key: string; value: unknown; ttlSeconds?: number }>
    ) => {
      const { cacheMSet } = await import("@/lib/cache")
      await cacheMSet(items)
    }
  )
  .client(async (_items: unknown) => {})

/**
 * Stable, collision-resistant cache key from a query + variables pair.
 * Hashes instead of inlining the full query so Redis keys stay short.
 */
function hashCacheKey(
  query: string,
  variables: Record<string, unknown>
): string {
  const raw = `${query}::${JSON.stringify(variables)}`
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

interface AniListResponse<T> {
  data?: T
  errors?: Array<{ message: string; status?: number }>
}

const mediaFields = `
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
`

const catalogQuery = `
  query AnimeCatalog(
    $sort: [MediaSort]
    $season: MediaSeason
    $seasonYear: Int
    $status: MediaStatus
  ) {
    Page(page: 1, perPage: 18) {
      media(
        type: ANIME
        isAdult: false
        sort: $sort
        season: $season
        seasonYear: $seasonYear
        status: $status
      ) {
        ${mediaFields}
      }
    }
  }
`

const searchQuery = `
  query AnimeSearch($search: String!) {
    Page(page: 1, perPage: 16) {
      media(type: ANIME, isAdult: false, search: $search, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
        ${mediaFields}
      }
    }
  }
`

const airingQuery = `
  query AiringSchedule($now: Int!) {
    Page(page: 1, perPage: 12) {
      airingSchedules(airingAt_greater: $now, sort: TIME) {
        id
        episode
        airingAt
        timeUntilAiring
        media {
          ${mediaFields}
        }
      }
    }
  }
`

const animeDetailQuery = `
  query AnimeDetail($id: Int!) {
    Media(id: $id, type: ANIME) {
      ${mediaFields}
      relations {
        edges {
          node {
            ${mediaFields}
          }
        }
      }
      recommendations(page: 1, perPage: 8, sort: RATING_DESC) {
        nodes {
          mediaRecommendation {
            ${mediaFields}
          }
        }
      }
      characters(page: 1, perPage: 8, sort: [ROLE, RELEVANCE]) {
        edges {
          role
          node {
            id
            name { full }
            image { large medium }
          }
          voiceActors(language: JAPANESE) {
            name { full }
            image { large medium }
            language
          }
        }
      }
      externalLinks {
        id
        url
        site
        icon
        color
        type
        language
      }
    }
  }
`

const characterDetailQuery = `
  query CharacterDetail($id: Int!) {
    Character(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        large
        medium
      }
      description
      gender
      age
      bloodType
      dateOfBirth {
        year
        month
        day
      }
      favourites
      media(page: 1, perPage: 12, sort: POPULARITY_DESC, type: ANIME) {
        nodes {
          ${mediaFields}
        }
      }
    }
  }
`

const batchMediaQuery = `
  query ($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        ${mediaFields}
      }
    }
  }
`

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

// In-memory response cache with TTL
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const MAX_CACHE_ENTRIES = 500

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
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

  constructor(message: string, status: number) {
    super(message)
    this.name = "AniListUpstreamError"
    this.status = status
  }
}

async function executeAniListFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const makeRequest = async () => {
    const res = await fetch(getAniListEndpoint(), {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) {
      let upstreamMessage = `AniList returned status ${res.status}`
      try {
        const errorResponse = await res.json<AniListResponse<never>>()
        upstreamMessage = errorResponse.errors?.[0]?.message || upstreamMessage
      } catch {
        // Preserve the status-only message when the upstream body is not JSON.
      }

      if (res.status === 404) {
        throw new Error("Anime not found")
      }
      if (
        res.status === 403 &&
        upstreamMessage.toLowerCase().includes("manually blocked")
      ) {
        throw new AniListUpstreamError(
          "AniList blocks requests from this server IP; retrying directly from the browser",
          503
        )
      }
      throw new AniListUpstreamError(
        upstreamMessage,
        res.status >= 500 ? 503 : res.status
      )
    }

    const response = await res.json<AniListResponse<T>>()
    const apiErrors = response.errors

    if (apiErrors && apiErrors.length > 0) {
      const notFound = apiErrors.some((err) => err.status === 404)
      throw new Error(
        notFound
          ? "Anime not found"
          : apiErrors[0]?.message || "AniList is unavailable"
      )
    }

    if (!response.data) {
      throw new Error("AniList returned empty data")
    }

    return response.data
  }

  try {
    return await makeRequest()
  } catch (err) {
    // Retry once on rate limits or transient upstream responses.
    if (
      err instanceof Error &&
      (err.message.includes("429") || err.message.includes("status 5"))
    ) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return await makeRequest()
    }
    if (err instanceof AniListUpstreamError) {
      throw err
    }
    if (
      err instanceof Error &&
      /fetch|network|connection|socket/i.test(err.message)
    ) {
      throw new AniListUpstreamError(
        "AniList is temporarily unreachable from this server",
        503
      )
    }
    throw err
  }
}

async function requestAniList<T>(
  query: string,
  variables: Record<string, unknown>,
  ttlMs = 1000 * 60 * 60
): Promise<T> {
  const cacheKey = `anilist:${hashCacheKey(query, variables)}`

  // 1. Check in-memory cache (per-isolate, instant)
  const memory = getCached<T>(cacheKey)
  if (memory) {
    return memory
  }

  // 2. Check in-flight promise deduplication (single-flight)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>
  }

  // 3. Initiate single request: Redis (shared across isolates) → upstream
  const requestPromise = (async () => {
    const redisHit = (await redisGet(cacheKey)) as T | null
    if (redisHit !== null && redisHit !== undefined) {
      setCached(cacheKey, redisHit, ttlMs)
      return redisHit
    }

    const data = await executeAniListFetch<T>(query, variables)
    setCached(cacheKey, data, ttlMs)
    void redisSet(cacheKey, data, Math.round(ttlMs / 1000))
    return data
  })().finally(() => {
    inFlightRequests.delete(cacheKey)
  })

  inFlightRequests.set(cacheKey, requestPromise)
  return requestPromise
}

export async function getAnimeCollection(collection: CatalogCollection) {
  const data = await requestAniList<{ Page: { media: AniListMedia[] } }>(
    catalogQuery,
    getCollectionVariables(collection),
    1000 * 60 * 60 * 2
  )
  return data.Page.media.map(toAnime)
}

export async function searchAnime(search: string) {
  const data = await requestAniList<{ Page: { media: AniListMedia[] } }>(
    searchQuery,
    { search },
    1000 * 60 * 60 * 6
  )
  return data.Page.media.map(toAnime)
}

export async function getAiringSchedule(): Promise<AiringScheduleItem[]> {
  // Bucket "now" to 5-minute windows so the query cache key stays stable
  // (a raw per-second timestamp would defeat the memory cache entirely).
  const rawNow = Math.floor(Date.now() / 1000)
  const now = rawNow - (rawNow % 300)
  const data = await requestAniList<{
    Page: { airingSchedules: AniListAiringSchedule[] }
  }>(airingQuery, { now }, 1000 * 60 * 30)

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
  const cached = (await redisGet(cacheKey)) as AnimeDetailResponse | null
  if (cached) {
    // Warm in-memory entity cache so relations / recommendations are warm
    cacheAnimeEntity(cached.anime)
    for (const rel of cached.relations) cacheAnimeEntity(rel)
    for (const rec of cached.recommendations) cacheAnimeEntity(rec)
    return cached
  }

  const data = await requestAniList<{ Media: AniListDetailMedia | null }>(
    animeDetailQuery,
    { id },
    1000 * 60 * 60 * 2
  )

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

  // Write detail to Redis
  void redisSet(cacheKey, detail, ttlSeconds)

  // Also cache the individual anime entity and relations/recommendations into Redis
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
  void redisMSet(entityItems)

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
  const cached = (await redisGet(cacheKey)) as CharacterDetail | null
  if (cached) {
    return cached
  }

  const data = await requestAniList<{
    Character: AniListCharacterDetailGql | null
  }>(characterDetailQuery, { id }, 1000 * 60 * 60 * 24 * 30)

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
  void redisSet(cacheKey, detail, 60 * 60 * 24 * 30)

  // Also seed the media entities into Redis
  if (detail.media.length > 0) {
    const entityItems = detail.media.map((a) => ({
      key: `anime:entity:${a.id}`,
      value: a,
      ttlSeconds:
        (a.status || "").toUpperCase() === "RELEASING"
          ? 3600
          : 60 * 60 * 24 * 30,
    }))
    void redisMSet(entityItems)
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

  // 2. Check Redis L2 cache in single batch mget
  let stillMissingIds = missingIds
  if (missingIds.length > 0) {
    const redisKeys = missingIds.map((id) => `anime:entity:${id}`)
    const redisEntities = await redisMGet(redisKeys)
    const unresolved: number[] = []

    for (let i = 0; i < missingIds.length; i++) {
      const id = missingIds[i]
      const hit = redisEntities[i] as Anime | null
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
            batchMediaQuery,
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

    // Persist all newly fetched entities into Redis with smart lifetime/airing TTL
    if (newlyFetched.length > 0) {
      const itemsToCache = newlyFetched.map((a) => ({
        key: `anime:entity:${a.id}`,
        value: a,
        ttlSeconds:
          (a.status || "").toUpperCase() === "RELEASING"
            ? 3600
            : 60 * 60 * 24 * 30,
      }))
      void redisMSet(itemsToCache)
    }
  }

  return uniqueIds
    .map((id) => resultsMap.get(id))
    .filter((a): a is Anime => Boolean(a))
}
