import "@tanstack/react-start/server-only"

/**
 * Two-tier cache with zero paid-service dependencies:
 *
 * - L1: per-isolate in-process memory (via the `cached()` memory hooks that
 *   callers own, e.g. the AniList/themes modules).
 * - L2: the Cloudflare Workers Cache API (`caches.default`). It is part of the
 *   normal CDN cache, is free on every plan, and has no command quota — unlike
 *   a hosted Redis, which previously breached its 500k commands/month limit.
 *
 * Keys are mapped onto a synthetic URL namespace so the platform cache treats
 * them as first-class cacheable responses. When the Cache API is unavailable
 * (plain Node SSR / `bun run dev`), L2 is skipped and only L1 applies.
 */

const KEY_PREFIX = "yozora:v1"
const CACHE_ORIGIN = "cache.yozora.internal"
const DEFAULT_TTL_SECONDS = 60 * 60

/** Standard cache TTL configurations in seconds. */
export const CACHE_TTL = {
  LIFETIME_FINISHED: 60 * 60 * 24 * 30, // 30 days for finished media and immutable bios
  CHARACTER: 60 * 60 * 24 * 30, // 30 days
  THEMES: 60 * 60 * 24 * 30, // 30 days
  THEMES_NEGATIVE: 60 * 60 * 6, // 6 hours for absent themes
  AIRING_ANIME: 60 * 60, // 1 hour
  UPCOMING_ANIME: 60 * 60 * 24, // 24 hours
  COLLECTIONS: 60 * 60 * 2, // 2 hours
  AIRING_SCHEDULE: 60 * 30, // 30 minutes
  SEARCH_QUERY: 60 * 60 * 6, // 6 hours
  PUBLIC_PROFILE: 60 * 10, // 10 minutes
} as const

/** Resolves the optimal TTL based on broadcast status and next airing time. */
export function getAnimeCacheTtl(
  status?: string,
  nextAiring?: { timeUntilAiring?: number }
): number {
  const norm = (status || "").toUpperCase()
  if (norm === "FINISHED" || norm === "CANCELLED") {
    return CACHE_TTL.LIFETIME_FINISHED
  }
  if (norm === "RELEASING") {
    if (nextAiring?.timeUntilAiring && nextAiring.timeUntilAiring > 0) {
      return Math.min(
        Math.max(nextAiring.timeUntilAiring + 300, 300),
        CACHE_TTL.AIRING_ANIME
      )
    }
    return CACHE_TTL.AIRING_ANIME
  }
  if (norm === "NOT_YET_RELEASED") {
    return CACHE_TTL.UPCOMING_ANIME
  }
  return CACHE_TTL.LIFETIME_FINISHED
}

type EdgeCacheStorage = CacheStorage & { default?: Cache }

function getEdgeCache(): Cache | null {
  const storage = (globalThis as { caches?: EdgeCacheStorage }).caches
  return storage?.default ?? null
}

/** Returns true if the platform edge cache is usable in this runtime. */
export function isEdgeCacheConfigured(): boolean {
  return getEdgeCache() !== null
}

function resolveKey(
  key: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): { request: Request; ttl: number } {
  const prefixed = key.startsWith(`${KEY_PREFIX}:`)
    ? key
    : `${KEY_PREFIX}:${key}`
  return {
    request: new Request(`https://${CACHE_ORIGIN}/${prefixed}`),
    ttl: Math.max(1, Math.round(ttlSeconds)),
  }
}

/** Retrieves a deserialized value from the edge cache. Returns null on miss or error. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const cache = getEdgeCache()
  if (!cache) return null

  try {
    const { request } = resolveKey(key)
    const response = await cache.match(request)
    if (!response) return null
    return (await response.json()) as T
  } catch (error) {
    console.warn(
      "[Cache] Edge cache read failed:",
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/** Sets a value in the edge cache with an expiration in seconds. */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<void> {
  const cache = getEdgeCache()
  if (!cache) return

  try {
    const { request, ttl } = resolveKey(key, ttlSeconds)
    await cache.put(
      request,
      new Response(JSON.stringify(value), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": `public, max-age=${ttl}`,
        },
      })
    )
  } catch (error) {
    console.warn(
      "[Cache] Edge cache write failed:",
      error instanceof Error ? error.message : error
    )
  }
}

/** Deletes a single key from the edge cache. */
export async function cacheDelete(key: string): Promise<void> {
  const cache = getEdgeCache()
  if (!cache) return

  try {
    const { request } = resolveKey(key)
    await cache.delete(request)
  } catch (error) {
    console.warn(
      "[Cache] Edge cache delete failed:",
      error instanceof Error ? error.message : error
    )
  }
}

/** Deletes multiple keys from the edge cache. */
export async function cacheDeleteMany(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await Promise.all(keys.map((key) => cacheDelete(key)))
}

/** Reads multiple values in parallel. Each key is one free cache lookup. */
export async function cacheMGet<T>(keys: string[]): Promise<(T | null)[]> {
  if (keys.length === 0) return []
  return Promise.all(keys.map((key) => cacheGet<T>(key)))
}

/** Writes multiple items in parallel with individual TTLs. */
export async function cacheMSet<T>(
  items: Array<{ key: string; value: T; ttlSeconds?: number }>
): Promise<void> {
  if (items.length === 0) return
  await Promise.all(
    items.map((item) =>
      cacheSet(item.key, item.value, item.ttlSeconds ?? DEFAULT_TTL_SECONDS)
    )
  )
}

const inFlightRequests = new Map<string, Promise<unknown>>()

/**
 * Read-through cache with single-flight deduplication:
 * 1. Checks the caller-owned memory cache (L1 hook)
 * 2. Deduplicates concurrent in-flight fetches for the same key
 * 3. Reads from the platform edge cache (L2)
 * 4. Invokes fetcher on miss and populates both tiers
 */
export async function cached<T>(options: {
  key: string
  ttlSeconds?: number
  fetcher: () => Promise<T>
  memoryGet?: () => T | null
  memorySet?: (value: T) => void
}): Promise<T> {
  const {
    key,
    ttlSeconds = DEFAULT_TTL_SECONDS,
    fetcher,
    memoryGet,
    memorySet,
  } = options

  const memory = memoryGet?.()
  if (memory !== null && memory !== undefined) return memory

  const existingPromise = inFlightRequests.get(key)
  if (existingPromise) return existingPromise as Promise<T>

  const requestPromise = (async () => {
    try {
      const edgeHit = await cacheGet<T>(key)
      if (edgeHit !== null && edgeHit !== undefined) {
        memorySet?.(edgeHit)
        return edgeHit
      }

      const value = await fetcher()
      memorySet?.(value)
      void cacheSet(key, value, ttlSeconds)
      return value
    } finally {
      inFlightRequests.delete(key)
    }
  })()

  inFlightRequests.set(key, requestPromise)
  return requestPromise
}
