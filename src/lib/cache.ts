import "@tanstack/react-start/server-only"
import { Redis } from "@upstash/redis"

const KEY_PREFIX = "yozora:v1"
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

let redisInstance: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisInstance !== undefined) return redisInstance

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

  redisInstance = url && token ? new Redis({ url, token }) : null
  return redisInstance
}

/** Returns true if a Redis connection is configured. */
export function isRedisConfigured(): boolean {
  return getRedis() !== null
}

/** Pings Redis to check connectivity. Returns true if responsive. */
export async function cachePing(): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  try {
    const res = await redis.ping()
    return res === "PONG" || res === "OK"
  } catch {
    return false
  }
}

function resolveKey(
  key: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): { key: string; ttl: number } {
  const prefixed = key.startsWith(`${KEY_PREFIX}:`)
    ? key
    : `${KEY_PREFIX}:${key}`
  return {
    key: prefixed,
    ttl: Math.max(1, Math.round(ttlSeconds)),
  }
}

/** Retrieves a deserialized value from Redis. Returns null on miss or error. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const { key: fullKey } = resolveKey(key)
    const value = await redis.get<T>(fullKey)
    return value ?? null
  } catch (error) {
    console.warn(
      "[Cache] Redis read failed:",
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/** Sets a value in Redis with an expiration in seconds. */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    const { key: fullKey, ttl } = resolveKey(key, ttlSeconds)
    await redis.set(fullKey, value, { ex: ttl })
  } catch (error) {
    console.warn(
      "[Cache] Redis write failed:",
      error instanceof Error ? error.message : error
    )
  }
}

/** Deletes a single key from Redis. */
export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    const { key: fullKey } = resolveKey(key)
    await redis.del(fullKey)
  } catch (error) {
    console.warn(
      "[Cache] Redis delete failed:",
      error instanceof Error ? error.message : error
    )
  }
}

/** Deletes multiple keys from Redis in a single call. */
export async function cacheDeleteMany(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  const redis = getRedis()
  if (!redis) return

  try {
    const fullKeys = keys.map((k) => resolveKey(k).key)
    await redis.del(...fullKeys)
  } catch (error) {
    console.warn(
      "[Cache] Redis deleteMany failed:",
      error instanceof Error ? error.message : error
    )
  }
}

/** Reads multiple values from Redis in a single batch roundtrip. */
export async function cacheMGet<T>(keys: string[]): Promise<(T | null)[]> {
  if (keys.length === 0) return []
  const redis = getRedis()
  if (!redis) return keys.map(() => null)

  try {
    const fullKeys = keys.map((k) => resolveKey(k).key)
    const values = await redis.mget<T[]>(...fullKeys)
    return values.map((v) => (v !== undefined ? v : null))
  } catch (error) {
    console.warn(
      "[Cache] Redis mget failed:",
      error instanceof Error ? error.message : error
    )
    return keys.map(() => null)
  }
}

/** Writes multiple items to Redis with individual TTLs using a single pipeline. */
export async function cacheMSet<T>(
  items: Array<{ key: string; value: T; ttlSeconds?: number }>
): Promise<void> {
  if (items.length === 0) return
  const redis = getRedis()
  if (!redis) return

  try {
    const pipeline = redis.pipeline()
    for (const item of items) {
      const { key: fullKey, ttl } = resolveKey(
        item.key,
        item.ttlSeconds ?? DEFAULT_TTL_SECONDS
      )
      pipeline.set(fullKey, item.value, { ex: ttl })
    }
    await pipeline.exec()
  } catch (error) {
    console.warn(
      "[Cache] Redis mset pipeline failed:",
      error instanceof Error ? error.message : error
    )
  }
}

/** Atomically increments a counter with a TTL. Returns null on failure (fail-open). */
export async function cacheIncrement(
  key: string,
  ttlSeconds: number
): Promise<number | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const { key: fullKey, ttl } = resolveKey(key, ttlSeconds)
    const count = await redis.incr(fullKey)
    if (count === 1) {
      await redis.expire(fullKey, ttl)
    }
    return count
  } catch (error) {
    console.warn(
      "[Cache] Redis increment failed:",
      error instanceof Error ? error.message : error
    )
    return null
  }
}

const inFlightRequests = new Map<string, Promise<unknown>>()

/**
 * Read-through cache with single-flight deduplication:
 * 1. Checks memory cache (L1 hook)
 * 2. Deduplicates concurrent in-flight fetches for the same key
 * 3. Reads from Redis (L2)
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
      const redisHit = await cacheGet<T>(key)
      if (redisHit !== null && redisHit !== undefined) {
        memorySet?.(redisHit)
        return redisHit
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
