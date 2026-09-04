import { createIsomorphicFn } from "@tanstack/react-start"
import type {
  AiringScheduleItem,
  Anime,
  AnimeCharacter,
  AnimeDetailResponse,
  CharacterDetail,
} from "@/lib/types/anime"

const DEFAULT_JIKAN_ENDPOINT = "https://api.jikan.moe/v4"
const PLACEHOLDER_COVER =
  "https://placehold.co/600x850/171622/F8F7FC?text=Yozora"

function getJikanEndpoint(): string {
  if (import.meta.env.SSR) {
    return process.env.JIKAN_API_URL || DEFAULT_JIKAN_ENDPOINT
  }
  return import.meta.env.VITE_JIKAN_API_URL || DEFAULT_JIKAN_ENDPOINT
}

/** Isomorphic cache helpers. */

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

// In-flight single-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>()

// In-memory response cache
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
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// Individual entity cache
const jikanEntityCache = new Map<number, { anime: Anime; expiresAt: number }>()

function cacheJikanEntity(anime: Anime, ttlMs = 1000 * 60 * 60 * 2) {
  if (jikanEntityCache.size >= 1000) {
    const firstKey = jikanEntityCache.keys().next().value
    if (firstKey) jikanEntityCache.delete(firstKey)
  }
  jikanEntityCache.set(anime.id, { anime, expiresAt: Date.now() + ttlMs })
}

function getCachedJikanAnime(id: number): Anime | null {
  const entry = jikanEntityCache.get(id)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    jikanEntityCache.delete(id)
    return null
  }
  return entry.anime
}

/** Rate limiter for Jikan public API (~3 requests/second). */

let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 340 // ~3 requests per second

async function rateLimitDelay(): Promise<void> {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    const delay = MIN_REQUEST_INTERVAL_MS - timeSinceLast
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  lastRequestTime = Date.now()
}

/** Jikan v4 REST response schemas. */

export interface JikanImages {
  jpg: {
    image_url: string | null
    small_image_url: string | null
    large_image_url: string | null
  }
  webp?: {
    image_url: string | null
    small_image_url: string | null
    large_image_url: string | null
  }
}

export interface JikanTrailer {
  youtube_id: string | null
  url: string | null
  embed_url: string | null
  images?: {
    image_url: string | null
    small_image_url: string | null
    medium_image_url: string | null
    large_image_url: string | null
    maximum_image_url: string | null
  }
}

export interface JikanBroadcast {
  day: string | null
  time: string | null
  timezone: string | null
  string: string | null
}

export interface JikanAnime {
  mal_id: number
  url: string
  images: JikanImages
  trailer: JikanTrailer
  approved?: boolean
  titles: Array<{ type: string; title: string }>
  title: string
  title_english: string | null
  title_japanese: string | null
  title_synonyms?: string[]
  type: string | null
  source?: string | null
  episodes: number | null
  status: string | null
  airing?: boolean
  aired?: {
    from: string | null
    to: string | null
    prop?: {
      from: { day: number | null; month: number | null; year: number | null }
      to: { day: number | null; month: number | null; year: number | null }
    }
    string?: string | null
  }
  duration?: string | null
  rating?: string | null
  score: number | null
  scored_by?: number | null
  rank?: number | null
  popularity?: number | null
  members?: number | null
  favorites?: number | null
  synopsis: string | null
  background?: string | null
  season?: string | null
  year: number | null
  broadcast?: JikanBroadcast | null
  producers?: Array<{ mal_id: number; name: string; url: string }>
  licensors?: Array<{ mal_id: number; name: string; url: string }>
  studios?: Array<{ mal_id: number; name: string; url: string }>
  genres?: Array<{ mal_id: number; name: string; url: string }>
  explicit_genres?: Array<{ mal_id: number; name: string; url: string }>
  themes?: Array<{ mal_id: number; name: string; url: string }>
  demographics?: Array<{ mal_id: number; name: string; url: string }>
  relations?: Array<{
    relation: string
    entry: Array<{ mal_id: number; type: string; name: string; url: string }>
  }>
  theme?: {
    openings?: string[]
    endings?: string[]
  }
  external?: Array<{ name: string; url: string }>
  streaming?: Array<{ name: string; url: string }>
}

export interface JikanCharacterVoice {
  person: {
    mal_id: number
    name: string
    images?: {
      jpg?: {
        image_url: string | null
      }
    }
  }
  language: string
}

export interface JikanCharacterEdge {
  character: {
    mal_id: number
    name: string
    images?: {
      jpg?: {
        image_url: string | null
      }
      webp?: {
        image_url: string | null
      }
    }
  }
  role: string
  voice_actors?: JikanCharacterVoice[]
}

export interface JikanApiResponse<T> {
  data?: T
  pagination?: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
  }
  status?: number
  type?: string
  message?: string
  error?: string | null
}

/** Error thrown when Jikan upstream requests fail. */
export class JikanUpstreamError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "JikanUpstreamError"
    this.status = status
  }
}

/** Field parsers and normalizers. */

function stripSynopsis(synopsis?: string | null): string | undefined {
  if (!synopsis) return undefined
  return synopsis
    .replace(/\[Written by MAL Rewrite\]/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
}

function parseDurationMinutes(durationStr?: string | null): number | undefined {
  if (!durationStr) return undefined
  let total = 0
  const hrMatch = durationStr.match(/(\d+)\s*hr/)
  if (hrMatch) total += parseInt(hrMatch[1], 10) * 60
  const minMatch = durationStr.match(/(\d+)\s*min/)
  if (minMatch) total += parseInt(minMatch[1], 10)
  return total > 0 ? total : undefined
}

function normalizeStatus(status?: string | null): string | undefined {
  if (!status) return undefined
  const s = status.toLowerCase()
  if (s.includes("currently") || s.includes("airing")) return "RELEASING"
  if (s.includes("finished")) return "FINISHED"
  if (s.includes("not yet")) return "NOT_YET_RELEASED"
  if (s.includes("cancelled")) return "CANCELLED"
  return status
}

/**
 * Calculates the next airing timestamp (UTC epoch seconds) from a Tokyo broadcast description.
 */
function calculateNextAiring(
  broadcast?: JikanBroadcast | null
): { episode: number; airingAt: number; timeUntilAiring: number } | undefined {
  if (!broadcast || !broadcast.day || !broadcast.time) return undefined

  const daysMap: Record<string, number | undefined> = {
    sundays: 0,
    mondays: 1,
    tuesdays: 2,
    wednesdays: 3,
    thursdays: 4,
    fridays: 5,
    saturdays: 6,
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

  const dayKey = broadcast.day.toLowerCase().trim()
  const targetDay = daysMap[dayKey]
  if (targetDay === undefined) return undefined

  const [hoursStr, minutesStr] = broadcast.time.split(":")
  const targetHour = parseInt(hoursStr, 10)
  const targetMinute = parseInt(minutesStr || "0", 10)
  if (Number.isNaN(targetHour)) return undefined

  // Current time in JST (UTC+9)
  const now = new Date()
  const nowUtc = now.getTime() + now.getTimezoneOffset() * 60000
  const jstNow = new Date(nowUtc + 9 * 3600000)

  const currentDay = jstNow.getDay()
  let daysDiff = targetDay - currentDay
  if (
    daysDiff < 0 ||
    (daysDiff === 0 &&
      (jstNow.getHours() > targetHour ||
        (jstNow.getHours() === targetHour &&
          jstNow.getMinutes() >= targetMinute)))
  ) {
    daysDiff += 7
  }

  const nextAirJst = new Date(jstNow)
  nextAirJst.setDate(jstNow.getDate() + daysDiff)
  nextAirJst.setHours(targetHour, targetMinute, 0, 0)

  // Convert back to UTC epoch timestamp
  const nextAirUtc = nextAirJst.getTime() - 9 * 3600000
  const airingAt = Math.floor(nextAirUtc / 1000)
  const currentEpoch = Math.floor(Date.now() / 1000)

  return {
    episode: 1, // Jikan does not provide next episode number directly
    airingAt,
    timeUntilAiring: Math.max(0, airingAt - currentEpoch),
  }
}

/** Maps raw Jikan schemas to Yozora types. */

export function toAnimeFromJikan(media: JikanAnime): Anime {
  const english = media.title_english || undefined
  const romaji = media.title || undefined
  const native = media.title_japanese || undefined

  const coverLarge =
    media.images.webp?.large_image_url ||
    media.images.jpg.large_image_url ||
    media.images.webp?.image_url ||
    media.images.jpg.image_url ||
    PLACEHOLDER_COVER

  const coverMedium =
    media.images.webp?.image_url ||
    media.images.jpg.image_url ||
    media.images.webp?.small_image_url ||
    media.images.jpg.small_image_url ||
    undefined

  const anime: Anime = {
    id: media.mal_id,
    idMal: media.mal_id,
    title: english || romaji || native || "Untitled",
    subtitle: english
      ? romaji || native
      : romaji && native
        ? native
        : undefined,
    cover: coverLarge,
    coverMedium,
    coverLarge,
    coverExtraLarge: coverLarge,
    banner: coverLarge, // Jikan does not supply separate banners; use large cover
    accent: "#8b7cb8",
    score: media.score ? Number(media.score.toFixed(1)) : 0,
    year:
      media.year || media.aired?.prop?.from.year || new Date().getUTCFullYear(),
    format: media.type || "TV",
    status: normalizeStatus(media.status),
    episodes: media.episodes || undefined,
    duration: parseDurationMinutes(media.duration),
    popularity: media.popularity || undefined,
    favourites: media.favorites || undefined,
    tags: (media.genres || []).map((g) => g.name).slice(0, 3),
    description: stripSynopsis(media.synopsis),
    titles: { romaji, english, native },
    trailer: media.trailer.youtube_id
      ? {
          id: media.trailer.youtube_id,
          site: "youtube",
          thumbnail:
            media.trailer.images?.maximum_image_url ||
            media.trailer.images?.large_image_url ||
            media.trailer.images?.medium_image_url ||
            undefined,
        }
      : undefined,
    studios: (media.studios || []).map((s) => s.name),
    nextAiring: calculateNextAiring(media.broadcast),
  }

  cacheJikanEntity(anime)
  return anime
}

function toCharacterFromJikan(edge: JikanCharacterEdge): AnimeCharacter {
  const jpVa =
    edge.voice_actors?.find((va) => va.language.toLowerCase() === "japanese") ||
    edge.voice_actors?.[0]

  return {
    id: edge.character.mal_id,
    name: edge.character.name,
    image:
      edge.character.images?.webp?.image_url ||
      edge.character.images?.jpg?.image_url ||
      undefined,
    role: edge.role,
    voiceActor: jpVa
      ? {
          name: jpVa.person.name,
          image: jpVa.person.images?.jpg?.image_url || undefined,
          language: jpVa.language,
        }
      : undefined,
  }
}

/** HTTP fetcher with rate limiting and exponential retry. */

async function executeJikanFetch<T>(path: string): Promise<T> {
  const url = `${getJikanEndpoint()}${path.startsWith("/") ? path : `/${path}`}`

  const makeRequest = async () => {
    await rateLimitDelay()

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "user-agent": "Yozora/1.0 (https://yozora.moe)",
      },
    })

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Anime not found")
      }
      let errMessage = `Jikan returned status ${res.status}`
      try {
        const errorJson = await res.json<JikanApiResponse<never>>()
        errMessage = errorJson.message || errMessage
      } catch {}
      throw new JikanUpstreamError(
        errMessage,
        res.status >= 500 ? 503 : res.status
      )
    }

    const json = await res.json<JikanApiResponse<T>>()
    if (json.status && json.status >= 400) {
      throw new JikanUpstreamError(
        json.message || "Jikan API error",
        json.status >= 500 ? 503 : json.status
      )
    }

    if (json.data === undefined) {
      throw new Error("Jikan returned empty data")
    }

    return json.data
  }

  try {
    return await makeRequest()
  } catch (err) {
    // Retry once on rate limit (429) or transient gateway errors (503/504)
    if (
      err instanceof JikanUpstreamError &&
      (err.status === 429 || err.status === 503 || err.status === 504)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return await makeRequest()
    }
    throw err
  }
}

async function requestJikan<T>(
  path: string,
  ttlMs = 1000 * 60 * 60
): Promise<T> {
  const cacheKey = `jikan:${path}`

  // 1. Check in-memory cache
  const memory = getCached<T>(cacheKey)
  if (memory) {
    return memory
  }

  // 2. Check in-flight promise deduplication
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>
  }

  // 3. Initiate request with Redis cache fallback
  const requestPromise = (async () => {
    const redisHit = (await redisGet(cacheKey)) as T | null
    if (redisHit !== null && redisHit !== undefined) {
      setCached(cacheKey, redisHit, ttlMs)
      return redisHit
    }

    const data = await executeJikanFetch<T>(path)
    setCached(cacheKey, data, ttlMs)
    void redisSet(cacheKey, data, Math.round(ttlMs / 1000))
    return data
  })().finally(() => {
    inFlightRequests.delete(cacheKey)
  })

  inFlightRequests.set(cacheKey, requestPromise)
  return requestPromise
}

/** Catalog queries matching the AniList interface. */

export type JikanCatalogCollection =
  "trending" | "popular" | "seasonal" | "upcoming" | "top"

export async function getJikanAnimeCollection(
  collection: JikanCatalogCollection
): Promise<Anime[]> {
  let path: string
  if (collection === "seasonal") {
    path = "/seasons/now"
  } else if (collection === "upcoming") {
    path = "/seasons/upcoming"
  } else if (collection === "popular") {
    path = "/top/anime?filter=bypopularity"
  } else if (collection === "top") {
    path = "/top/anime"
  } else {
    // Trending: try airing filter first, fallback to seasons/now if airing fails
    path = "/top/anime?filter=airing"
  }

  try {
    const items = await requestJikan<JikanAnime[]>(path, 1000 * 60 * 60 * 2)
    return items.slice(0, 18).map(toAnimeFromJikan)
  } catch {
    // Fallback: if specific filter fails, use default top/anime
    const fallbackItems = await requestJikan<JikanAnime[]>("/top/anime")
    return fallbackItems.slice(0, 18).map(toAnimeFromJikan)
  }
}

export async function searchJikanAnime(search: string): Promise<Anime[]> {
  try {
    const items = await requestJikan<JikanAnime[]>(
      `/anime?q=${encodeURIComponent(search)}&sfw=true`,
      1000 * 60 * 60 * 6
    )
    return items.slice(0, 16).map(toAnimeFromJikan)
  } catch {
    // If search endpoint 504s on Jikan, filter against cached top/popular anime
    const top = await getJikanAnimeCollection("popular")
    const lowerQuery = search.toLowerCase()
    const matches = top.filter(
      (a) =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.titles?.romaji?.toLowerCase().includes(lowerQuery) ||
        a.titles?.english?.toLowerCase().includes(lowerQuery)
    )
    return matches.length > 0 ? matches : top.slice(0, 10)
  }
}

export async function getJikanAiringSchedule(): Promise<AiringScheduleItem[]> {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]
  const today = days[new Date().getDay()]

  try {
    const items = await requestJikan<JikanAnime[]>(
      `/schedules?filter=${today}&sfw=true`,
      1000 * 60 * 30
    )
    return items.slice(0, 12).map((media) => {
      const anime = toAnimeFromJikan(media)
      const airing = anime.nextAiring || {
        episode: 1,
        airingAt: Math.floor(Date.now() / 1000) + 3600,
        timeUntilAiring: 3600,
      }
      return {
        id: media.mal_id,
        episode: airing.episode,
        airingAt: airing.airingAt,
        timeUntilAiring: airing.timeUntilAiring,
        media: anime,
      }
    })
  } catch {
    // Fallback to currently airing top anime
    const airingList = await getJikanAnimeCollection("trending")
    const now = Math.floor(Date.now() / 1000)
    return airingList.slice(0, 12).map((anime, index) => ({
      id: anime.id,
      episode: 1,
      airingAt: anime.nextAiring?.airingAt || now + (index + 1) * 3600,
      timeUntilAiring: anime.nextAiring?.timeUntilAiring || (index + 1) * 3600,
      media: anime,
    }))
  }
}

export async function getJikanAnimeDetail(
  id: number
): Promise<AnimeDetailResponse> {
  // 1. Fetch full anime detail
  let data: JikanAnime
  try {
    data = await requestJikan<JikanAnime>(
      `/anime/${id}/full`,
      1000 * 60 * 60 * 2
    )
  } catch {
    data = await requestJikan<JikanAnime>(`/anime/${id}`, 1000 * 60 * 60 * 2)
  }

  const anime = toAnimeFromJikan(data)

  // 2. Map relations from data.relations if available
  const relations: Anime[] = []
  if (data.relations) {
    for (const rel of data.relations) {
      for (const entry of rel.entry) {
        if (entry.type === "anime") {
          relations.push({
            id: entry.mal_id,
            title: entry.name,
            cover: anime.cover,
            accent: anime.accent,
            score: 0,
            year: anime.year,
            format: "TV",
            tags: [rel.relation],
          })
        }
      }
    }
  }

  // 3. Characters: attempt secondary fetch safely (never fails the main detail page)
  let characters: AnimeCharacter[] = []
  try {
    const charsData = await requestJikan<JikanCharacterEdge[]>(
      `/anime/${id}/characters`,
      1000 * 60 * 60 * 24 * 30
    )
    characters = charsData.slice(0, 12).map(toCharacterFromJikan)
  } catch {
    characters = []
  }

  // 4. External links
  const externalLinks = [
    ...(data.external || []).map((ext, idx) => ({
      id: idx + 1,
      url: ext.url,
      site: ext.name,
    })),
    ...(data.streaming || []).map((stream, idx) => ({
      id: 1000 + idx,
      url: stream.url,
      site: stream.name,
    })),
  ]

  return {
    anime,
    relations,
    recommendations: [],
    characters,
    externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
  }
}

export async function getJikanCharacterDetail(
  id: number
): Promise<CharacterDetail> {
  interface JikanFullChar {
    mal_id: number
    name: string
    name_kanji?: string | null
    nicknames?: string[]
    images?: JikanImages
    about?: string | null
    favorites?: number | null
    anime?: Array<{
      role: string
      anime: JikanAnime
    }>
  }

  const data = await requestJikan<JikanFullChar>(
    `/characters/${id}/full`,
    1000 * 60 * 60 * 24 * 30
  )

  return {
    id: data.mal_id,
    name: {
      full: data.name,
      native: data.name_kanji || undefined,
      alternative: data.nicknames || undefined,
    },
    image:
      data.images?.webp?.image_url || data.images?.jpg.image_url || undefined,
    description: stripSynopsis(data.about),
    favourites: data.favorites || undefined,
    media: (data.anime || []).map((a) => toAnimeFromJikan(a.anime)),
  }
}

export async function getMultipleJikanAnime(ids: number[]): Promise<Anime[]> {
  if (!ids.length) return []
  const uniqueIds = Array.from(new Set(ids))
  const results: Anime[] = []

  for (const id of uniqueIds) {
    const cached = getCachedJikanAnime(id)
    if (cached) {
      results.push(cached)
    } else {
      try {
        const detail = await getJikanAnimeDetail(id)
        results.push(detail.anime)
      } catch {
        // Skip unavailable entries
      }
    }
  }

  return results
}
