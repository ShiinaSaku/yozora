/**
 * Unified Anime Catalog Provider Interface
 *
 * AniList GraphQL is the single authoritative catalog. Resilience comes from
 * the layered fetch (in-memory → single-flight → Upstash Redis → AniList),
 * per-request retry on 429/5xx, and CDN cache headers set by server functions —
 * not from a secondary upstream provider.
 */

import {
  AniListUpstreamError,
  catalogCollections,
  getAiringSchedule,
  getAnimeCollection,
  getAnimeDetail,
  getCharacterDetail,
  getMultipleAnime,
  searchAnime,
} from "@/lib/anilist"

export {
  catalogCollections,
  AniListUpstreamError,
  getAnimeCollection,
  searchAnime,
  getAiringSchedule,
  getAnimeDetail,
  getCharacterDetail,
  getMultipleAnime,
}
export type { CatalogCollection } from "@/lib/anilist"
