import { queryOptions } from "@tanstack/react-query"
import {
  getAiringData,
  getAnimePageData,
  getBatchAnimeData,
  getCharacterPageData,
  getHomeData,
  getSeasonalData,
  searchCatalogFn,
} from "@/lib/server/catalog"

/**
 * Shared query options for root home page catalog data.
 */
export const homeDataQueryOptions = () =>
  queryOptions({
    queryKey: ["home-catalog"],
    queryFn: () => getHomeData(),
    staleTime: 1000 * 60 * 30, // 30 mins
  })

/**
 * Shared query options for live airing schedule and broadcast count down.
 */
export const airingDataQueryOptions = () =>
  queryOptions({
    queryKey: ["airing-schedule"],
    queryFn: () => getAiringData(),
    staleTime: 1000 * 60 * 5, // 5 mins
  })

/**
 * Shared query options for seasonal catalog releases.
 */
export const seasonalDataQueryOptions = () =>
  queryOptions({
    queryKey: ["seasonal-catalog"],
    queryFn: () => getSeasonalData(),
    staleTime: 1000 * 60 * 30, // 30 mins
  })

/**
 * Shared query options for anime detail page.
 */
export const animeDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["anime-detail", id],
    queryFn: () => getAnimePageData({ data: id }),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

/**
 * Shared query options for voice actor and character detail page.
 */
export const characterDetailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["character-detail", id],
    queryFn: () => getCharacterPageData({ data: id }),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

/**
 * Shared query options for batch anime catalog lookups (e.g. pinned anime cards).
 */
export const batchAnimeQueryOptions = (ids: number[]) =>
  queryOptions({
    queryKey: ["batch-anime", ids],
    queryFn: () => getBatchAnimeData({ data: ids }),
    enabled: ids.length > 0,
  })

/**
 * Shared query options for anime search queries.
 */
export const searchCatalogQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ["catalog-search", query],
    queryFn: () => searchCatalogFn({ data: query }),
    enabled: query.trim().length >= 2,
  })
