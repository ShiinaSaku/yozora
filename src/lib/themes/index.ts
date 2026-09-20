import { createIsomorphicFn } from "@tanstack/react-start"
import type {
  AnimeTheme,
  AnimeThemeEntry,
  AnimeThemesResponse,
  AnimeThemeVideo,
} from "@/lib/types/anime"

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

interface AnimeThemesRestVideo {
  id: number
  link: string
  resolution: number | null
  size: number | null
  tags: string | null
  nc: boolean
  subbed: boolean
  lyrics: boolean
  source: string | null
  audio?: { link: string; mimetype: string | null; size: number | null } | null
}

interface AnimeThemesRestEntry {
  id: number
  version: number
  episodes?: string | null
  notes?: string | null
  nsfw: boolean
  spoiler: boolean
  videos?: AnimeThemesRestVideo[]
}

interface AnimeThemesRestTheme {
  id: number
  type: "OP" | "ED"
  sequence: number | null
  slug: string
  song?: {
    id: number
    // Legacy: plain string. New API: SongTitle object — use `title.romaji`.
    title?: string | { romaji?: string | null } | null
    artists?: Array<{
      id: number
      name: string | { main?: string | null } | null
    }> | null
  } | null
  animethemeentries?: AnimeThemesRestEntry[]
}

interface AnimeThemesRestAnime {
  id: number
  // Legacy: plain string. New API: deprecated in favor of `title.romaji`.
  name?: string | null
  title?: { romaji?: string | null } | null
  slug: string
  animethemes?: AnimeThemesRestTheme[]
}

/**
 * Song.title now returns a SongTitle object (use `.romaji`); older payloads
 * still return a plain string. Handle both during the API transition.
 */
function songTitle(value: unknown): string | null {
  if (typeof value === "string") return value || null
  if (value && typeof value === "object" && "romaji" in value) {
    const romaji = (value as { romaji?: string | null }).romaji
    return romaji || null
  }
  return null
}

/**
 * Artist.name now returns an ArtistName object (use `.main`); older payloads
 * still return a plain string. Handle both during the API transition.
 */
function artistName(value: unknown): string | null {
  if (typeof value === "string") return value || null
  if (value && typeof value === "object" && "main" in value) {
    const main = (value as { main?: string | null }).main
    return main || null
  }
  return null
}

interface AnimeThemesRestResponse {
  anime?: AnimeThemesRestAnime[]
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
      const url = `https://api.animethemes.moe/anime?filter[has]=resources&filter[site]=AniList&filter[external_id]=${animeId}&include=animethemes.animethemeentries.videos.audio,animethemes.song.artists`

      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          "user-agent": "Yozora/1.0 (https://yozora.moe)",
        },
      })

      if (!res.ok) {
        const result = { animeId, themes: [] }
        cacheThemes(animeId, result, THEMES_NEGATIVE_TTL_MS)
        void redisSet(
          cacheKey,
          result,
          Math.round(THEMES_NEGATIVE_TTL_MS / 1000)
        )
        return result
      }

      const payload = await res.json<AnimeThemesRestResponse>()
      const match = payload.anime?.[0]
      if (!match || !match.animethemes) {
        const result: AnimeThemesResponse = { animeId, themes: [] }
        cacheThemes(animeId, result, THEMES_NEGATIVE_TTL_MS)
        void redisSet(
          cacheKey,
          result,
          Math.round(THEMES_NEGATIVE_TTL_MS / 1000)
        )
        return result
      }

      const themes: AnimeTheme[] = match.animethemes.map((theme) => {
        const entries: AnimeThemeEntry[] = (theme.animethemeentries || []).map(
          (entry) => {
            const videos: AnimeThemeVideo[] = (entry.videos || []).map((v) => ({
              id: v.id,
              link: v.link,
              resolution: v.resolution,
              size: v.size,
              tags: v.tags,
              nc: v.nc,
              subbed: v.subbed,
              lyrics: v.lyrics,
              source: v.source,
              audio: v.audio
                ? {
                    link: v.audio.link,
                    mimetype: v.audio.mimetype,
                    size: v.audio.size,
                  }
                : undefined,
            }))

            // Pick best video (prefer 1080p NCBD over 720p)
            const bestVideo =
              videos.find((v) => v.resolution === 1080) || videos[0]

            return {
              version: entry.version,
              episodes: entry.episodes || undefined,
              notes: entry.notes || undefined,
              nsfw: entry.nsfw,
              spoiler: entry.spoiler,
              video: bestVideo,
              videos,
            }
          }
        )

        const artists = (theme.song?.artists || [])
          .map((a) => artistName(a.name))
          .filter((name): name is string => Boolean(name))

        return {
          id: theme.id,
          type: theme.type,
          sequence: theme.sequence,
          slug: theme.slug,
          title: songTitle(theme.song?.title) || theme.slug,
          artists,
          entries,
        }
      })

      const result: AnimeThemesResponse = {
        animeId,
        slug: match.title?.romaji || match.name || match.slug,
        themes,
      }

      cacheThemes(animeId, result, THEMES_TTL_MS)
      void redisSet(cacheKey, result, Math.round(THEMES_TTL_MS / 1000))

      return result
    } catch {
      // Network/parse errors: don't cache so the next request can retry.
      return { animeId, themes: [] }
    } finally {
      inFlightThemes.delete(animeId)
    }
  })()

  inFlightThemes.set(animeId, fetchPromise)
  return fetchPromise
}
