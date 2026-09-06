import "zod/compile"
import { createServerFn } from "@tanstack/react-start"
import { notFound } from "@tanstack/react-router"
import { setResponseHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import {
  getAiringSchedule,
  getAnimeCollection,
  getAnimeDetail,
  getCharacterDetail,
  searchAnime,
} from "@/lib/catalog"
import { getAnimeThemes } from "@/lib/themes"

const publicCatalogHeaders = new Headers({
  "Cache-Control":
    "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
  "CDN-Cache-Control": "max-age=7200, stale-while-revalidate=3600",
})

const publicAiringHeaders = new Headers({
  "Cache-Control":
    "public, max-age=600, s-maxage=1800, stale-while-revalidate=7200",
  "CDN-Cache-Control": "max-age=1800, stale-while-revalidate=600",
})

const publicDetailHeaders = new Headers({
  "Cache-Control":
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
  "CDN-Cache-Control": "max-age=604800",
})

const publicSearchHeaders = new Headers({
  "Cache-Control":
    "public, max-age=600, s-maxage=21600, stale-while-revalidate=86400",
})

const idSchema = z.compile(z.number().int().positive())
const searchQuerySchema = z.compile(z.string().trim().max(100))

export const getHomeData = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseHeaders(publicCatalogHeaders)
    const [trending, seasonal, popular] = await Promise.all([
      getAnimeCollection("trending"),
      getAnimeCollection("seasonal"),
      getAnimeCollection("popular"),
    ])
    return { trending, seasonal, popular }
  }
)

export const getHomeAiring = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseHeaders(publicAiringHeaders)
    return getAiringSchedule()
  }
)

export const getSeasonalData = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseHeaders(publicCatalogHeaders)
    return getAnimeCollection("seasonal")
  }
)

export const getSearchPageData = createServerFn({ method: "GET" })
  .validator(searchQuerySchema)
  .handler(async ({ data: query }) => {
    setResponseHeaders(publicSearchHeaders)
    return {
      query,
      items:
        query.length >= 2
          ? await searchAnime(query)
          : await getAnimeCollection("trending"),
    }
  })

export const getAiringData = createServerFn({ method: "GET" }).handler(
  async () => {
    setResponseHeaders(publicAiringHeaders)
    return {
      items: await getAiringSchedule(),
      generatedAt: Math.floor(Date.now() / 1000),
    }
  }
)

export const getAnimePageData = createServerFn({ method: "GET" })
  .validator(idSchema)
  .handler(async ({ data: id }) => {
    setResponseHeaders(publicDetailHeaders)
    try {
      const [detail, themes] = await Promise.all([
        getAnimeDetail(id),
        getAnimeThemes(id).catch(() => ({ animeId: id, themes: [] })),
      ])
      return { detail, themes: themes.themes }
    } catch (error) {
      if (error instanceof Error && error.message === "Anime not found") {
        throw notFound()
      }
      throw error
    }
  })

export const getCharacterPageData = createServerFn({ method: "GET" })
  .validator(idSchema)
  .handler(async ({ data: id }) => {
    setResponseHeaders(publicDetailHeaders)
    try {
      return await getCharacterDetail(id)
    } catch (error) {
      if (error instanceof Error && error.message === "Character not found") {
        throw notFound()
      }
      throw error
    }
  })
