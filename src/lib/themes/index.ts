import { createIsomorphicFn } from "@tanstack/react-start"
import { GraphQLClient } from "graphql-request"
import type {
  AnimeTheme,
  AnimeThemeEntry,
  AnimeThemeVideo,
  AnimeThemesResponse,
} from "@/lib/types/anime"
import {
  AnimeThemesDocument,
} from "./operations"
import type { AnimeThemesQuery } from "@/gql/themes/graphql"

const DEFAULT_ANIMETHEMES_ENDPOINT = "https://rs.animethemes.moe/graphql"

function getAnimeThemesEndpoint(): string {
  return process.env.ANIMETHEMES_GRAPHQL_URL || DEFAULT_ANIMETHEMES_ENDPOINT
}

const inFlightThemes = new Map<number, Promise<AnimeThemesResponse>>()
const themesCache = new Map<
  number,
  { data: AnimeThemesResponse; expiresAt: number }
>()
const MAX_THEMES_CACHE_ENTRIES = 500
const THEMES_TTL_MS = 1000 * 60 * 60 * 24 * 30
const THEMES_NEGATIVE_TTL_MS = 1000 * 60 * 60 * 6

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

function cacheThemes(
  animeId: number,
  data: AnimeThemesResponse,
  ttlMs: number
) {
  if (themesCache.size >= MAX_THEMES_CACHE_ENTRIES) {
    const firstKey = themesCache.keys().next().value
    if (firstKey !== undefined) themesCache.delete(firstKey)
  }
  themesCache.set(animeId, { data, expiresAt: Date.now() + ttlMs })
}

/**
 * Picks the highest-fidelity stream for an entry version.
 * Prefers creditless (NC) 1080p — the player's core promise — then any 1080p,
 * then the first available video.
 */
function pickBestVideo(videos: GqlVideo[]): GqlVideo | null {
  const valid = videos.filter((v) => Boolean(v.link))
  if (valid.length === 0) return null

  return (
    valid.find((v) => v.nc && v.resolution === 1080) ??
    valid.find((v) => v.resolution === 1080) ??
    valid[0]
  )
}

interface GqlVideo {
  id: number
  link: string
  resolution: number | null
  size: number | null
  tags: string
  nc: boolean
  subbed: boolean
  lyrics: boolean
  overlap: string
  source: string | null
  mimetype: string
  audio: { link: string; mimetype: string; size: number } | null
}

function toThemeVideo(v: GqlVideo): AnimeThemeVideo {
  return {
    id: v.id,
    link: v.link,
    resolution: v.resolution,
    size: v.size,
    tags: v.tags || null,
    nc: v.nc,
    subbed: v.subbed,
    lyrics: v.lyrics,
    source: v.source,
    audio: v.audio
      ? { link: v.audio.link, mimetype: v.audio.mimetype, size: v.audio.size }
      : undefined,
  }
}

/**
 * Normalizes a GraphQL theme into the app-facing shape.
 * Performance-role staff become the artist list; null slots collapse away.
 */
function toTheme(
  theme: NonNullable<
    AnimeThemesQuery["filterAnimeByExternalSite"][number]["themes"][number]
  >
): AnimeTheme {
  const entries: AnimeThemeEntry[] = theme.entries.map((entry) => {
    const videoNodes = entry.videos.nodes
    const bestVideo = pickBestVideo(videoNodes)
    const videos = videoNodes.map(toThemeVideo)

    return {
      version: entry.version,
      episodes: entry.episodes || undefined,
      notes: entry.notes || undefined,
      nsfw: entry.nsfw,
      spoiler: entry.spoiler,
      video: bestVideo ? toThemeVideo(bestVideo) : undefined,
      videos,
    }
  })

  const artists = (theme.song?.staff || [])
    .filter((staff) => /performance/i.test(staff.role) || !staff.role)
    .map((staff) => staff.as || staff.artist.name.main)
    .filter((name, index, all) => Boolean(name) && all.indexOf(name) === index)

  return {
    id: theme.id,
    type: theme.type,
    sequence: theme.sequence,
    slug: theme.slug,
    title: theme.song?.title.romaji || theme.song?.title.native || theme.slug,
    artists,
    entries,
  }
}

export async function getAnimeThemes(
  animeId: number
): Promise<AnimeThemesResponse> {
  const cached = themesCache.get(animeId)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data
  }

  if (inFlightThemes.has(animeId)) {
    return inFlightThemes.get(animeId)!
  }

  const cacheKey = `themes:${animeId}`

  const fetchPromise = (async () => {
    // 1. Check Redis L2 cache
    const redisHit = (await redisGet(cacheKey)) as AnimeThemesResponse | null
    if (redisHit !== null) {
      cacheThemes(animeId, redisHit, THEMES_TTL_MS)
      return redisHit
    }

    try {
      const client = new GraphQLClient(getAnimeThemesEndpoint(), {
        headers: {
          accept: "application/json",
          "user-agent": "Yozora/1.0 (https://yozora.moe)",
        },
      })

      const data = await client.request(AnimeThemesDocument, {
        anilistId: animeId,
      })

      const matches = data.filterAnimeByExternalSite
      if (matches.length === 0) {
        // Not in the AnimeThemes archive: negative-cache for 6h.
        const result: AnimeThemesResponse = { animeId, themes: [] }
        cacheThemes(animeId, result, THEMES_NEGATIVE_TTL_MS)
        void redisSet(
          cacheKey,
          result,
          Math.round(THEMES_NEGATIVE_TTL_MS / 1000)
        )
        return result
      }
      const match = matches[0]

      const result: AnimeThemesResponse = {
        animeId,
        slug: match.title.romaji || match.slug,
        themes: match.themes.map(toTheme),
      }

      cacheThemes(animeId, result, THEMES_TTL_MS)
      void redisSet(cacheKey, result, Math.round(THEMES_TTL_MS / 1000))

      return result
    } catch (error) {
      // GraphQL/transport errors: don't cache so the next request can retry.
      // Bare HTTP failures from AnimeThemes' Cloudflare edge are treated as a
      // temporary outage rather than an empty archive.
      console.warn(
        `[Themes] GraphQL fetch for AniList #${animeId} failed:`,
        error instanceof Error ? error.message : error
      )
      return { animeId, themes: [] }
    } finally {
      inFlightThemes.delete(animeId)
    }
  })()

  inFlightThemes.set(animeId, fetchPromise)
  return fetchPromise
}
