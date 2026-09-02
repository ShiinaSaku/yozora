import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import {
  AniListUpstreamError,
  catalogCollections,
  getAiringSchedule,
  getAnimeCollection,
  getAnimeDetail,
  getCharacterDetail,
  getMultipleAnime,
  searchAnime,
} from "@/lib/catalog"
import { getAnimeThemes } from "@/lib/themes"
import { rateLimit } from "./middleware/rate-limit"

const collectionParamSchema = z.compile(
  z.object({
    collection: z.enum(catalogCollections),
  })
)

const searchQuerySchema = z.compile(
  z.object({
    q: z.string().min(1),
  })
)

const positiveIdParamSchema = z.compile(
  z.object({
    id: z.coerce.number().int().positive(),
  })
)

const batchQuerySchema = z.compile(
  z.object({
    ids: z.string().min(1),
  })
)

const batchJsonSchema = z.compile(
  z.object({
    ids: z.array(z.number().int().positive()).max(100),
  })
)

export const catalogRouter = new Hono()
  // Collection (trending, popular, seasonal, upcoming, top)
  .get(
    "/collection/:collection",
    zValidator("param", collectionParamSchema),
    async (c) => {
      const { collection } = c.req.valid("param")
      const anime = await getAnimeCollection(collection)
      c.header(
        "Cache-Control",
        "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400"
      )
      c.header("CDN-Cache-Control", "max-age=7200")
      return c.json({ data: anime })
    }
  )

  // Search anime
  .get(
    "/search",
    zValidator("query", searchQuerySchema),
    rateLimit(30, 60),
    async (c) => {
      const { q } = c.req.valid("query")
      const results = await searchAnime(q)
      c.header(
        "Cache-Control",
        "public, max-age=600, s-maxage=21600, stale-while-revalidate=86400"
      )
      return c.json({ data: results })
    }
  )

  // Airing schedule
  .get("/airing", async (c) => {
    const airing = await getAiringSchedule()
    c.header(
      "Cache-Control",
      "public, max-age=600, s-maxage=1800, stale-while-revalidate=7200"
    )
    c.header("CDN-Cache-Control", "max-age=1800")
    return c.json({ data: airing })
  })

  // Anime detail
  .get("/detail/:id", zValidator("param", positiveIdParamSchema), async (c) => {
    const { id } = c.req.valid("param")
    try {
      const detail = await getAnimeDetail(id)
      c.header(
        "Cache-Control",
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000"
      )
      c.header("CDN-Cache-Control", "max-age=604800")
      return c.json({ data: detail })
    } catch (error) {
      if (error instanceof AniListUpstreamError) throw error
      const message = error instanceof Error ? error.message : "Anime not found"
      return c.json({ error: message }, 404)
    }
  })

  // Character detail
  .get(
    "/character/:id",
    zValidator("param", positiveIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param")
      try {
        const detail = await getCharacterDetail(id)
        c.header(
          "Cache-Control",
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000"
        )
        c.header("CDN-Cache-Control", "max-age=604800")
        return c.json({ data: detail })
      } catch (error) {
        if (error instanceof AniListUpstreamError) throw error
        const message =
          error instanceof Error ? error.message : "Character not found"
        return c.json({ error: message }, 404)
      }
    }
  )

  // Anime soundtracks / themes
  .get("/themes/:id", zValidator("param", positiveIdParamSchema), async (c) => {
    const { id } = c.req.valid("param")
    const themes = await getAnimeThemes(id)
    c.header(
      "Cache-Control",
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000"
    )
    c.header("CDN-Cache-Control", "max-age=604800")
    return c.json({ data: themes })
  })

  // Batch anime lookup (GET & POST)
  .get("/batch", zValidator("query", batchQuerySchema), async (c) => {
    const { ids } = c.req.valid("query")
    const parsedIds = ids
      .split(",")
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 100)
    const anime = await getMultipleAnime(parsedIds)
    c.header(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
    )
    return c.json({ data: anime })
  })
  .post(
    "/batch",
    zValidator("json", batchJsonSchema),
    rateLimit(30, 60),
    async (c) => {
      const { ids } = c.req.valid("json")
      const anime = await getMultipleAnime(ids)
      return c.json({ data: anime })
    }
  )
