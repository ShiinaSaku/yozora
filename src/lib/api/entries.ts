import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { animeEntries, userProfiles } from "@/lib/db/schema"
import { getMultipleAnime } from "@/lib/catalog"
import { requireAuth } from "./middleware/auth"
import type { AuthContext } from "./middleware/auth"

const includeAnimeQuerySchema = z.compile(
  z.object({
    include: z.enum(["anime"]).optional(),
  })
)

const userHandleParamSchema = z.compile(
  z.object({
    handle: z.string().min(1),
  })
)

const anilistIdParamSchema = z.compile(
  z.object({
    anilistId: z.coerce.number().int().positive(),
  })
)

const upsertEntrySchema = z.compile(
  z.object({
    anilistId: z.number().int().positive().optional(),
    anilist_id: z.number().int().positive().optional(),
    status: z.enum([
      "watching",
      "completed",
      "planning",
      "paused",
      "dropped",
      "rewatching",
    ]),
    progress: z.number().int().min(0).default(0),
    totalEpisodes: z.number().int().min(0).optional().nullable(),
    total_episodes: z.number().int().min(0).optional().nullable(),
    score: z.number().int().min(0).max(100).optional().nullable(),
    favorite: z.boolean().default(false),
    private: z.boolean().default(false),
    notes: z.string().max(1000).optional().nullable(),
  })
)

export const entriesRouter = new Hono<AuthContext>()
  // Get current user's library entries (supports ?include=anime to eliminate client waterfall)
  .get(
    "/my",
    requireAuth,
    zValidator("query", includeAnimeQuerySchema),
    async (c) => {
      const userId = c.get("userId")
      const { include } = c.req.valid("query")
      const entries = await db
        .select()
        .from(animeEntries)
        .where(eq(animeEntries.userId, userId))
        .orderBy(desc(animeEntries.updatedAt))

      if (include === "anime" && entries.length > 0) {
        const animeIds = entries.map((e) => e.anilistId)
        const anime = await getMultipleAnime(animeIds)
        return c.json({ data: entries, anime })
      }

      return c.json({ data: entries, anime: [] })
    }
  )

  // Get user's public library entries by handle (supports ?include=anime)
  .get(
    "/user/:handle",
    zValidator("param", userHandleParamSchema),
    zValidator("query", includeAnimeQuerySchema),

    async (c) => {
      const { handle } = c.req.valid("param")
      const { include } = c.req.valid("query")
      const [profile] = (await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.handle, handle.toLowerCase()))
        .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

      if (!profile || !profile.isPublic) {
        return c.json({ error: "Library not found or private" }, 404)
      }

      const entries = await db
        .select()
        .from(animeEntries)
        .where(
          and(
            eq(animeEntries.userId, profile.userId),
            eq(animeEntries.private, false)
          )
        )
        .orderBy(desc(animeEntries.updatedAt))

      c.header(
        "Cache-Control",
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600"
      )

      if (include === "anime" && entries.length > 0) {
        const animeIds = entries.map((e) => e.anilistId)
        const anime = await getMultipleAnime(animeIds)
        return c.json({ data: entries, anime })
      }

      return c.json({ data: entries, anime: [] })
    }
  )

  // Get specific anime entry for user
  .get(
    "/:anilistId",
    requireAuth,
    zValidator("param", anilistIdParamSchema),
    async (c) => {
      const userId = c.get("userId")
      const { anilistId } = c.req.valid("param")

      const [entry] = (await db
        .select()
        .from(animeEntries)
        .where(
          and(
            eq(animeEntries.userId, userId),
            eq(animeEntries.anilistId, anilistId)
          )
        )
        .limit(1)) as (typeof animeEntries.$inferSelect | undefined)[]

      return c.json({ data: entry ?? null })
    }
  )

  // Upsert anime entry
  .post("/", requireAuth, zValidator("json", upsertEntrySchema), async (c) => {
    const userId = c.get("userId")
    const body = c.req.valid("json")
    const targetAnilistId = body.anilist_id ?? body.anilistId
    if (!targetAnilistId) {
      return c.json({ error: "anilist_id or anilistId is required" }, 400)
    }
    const targetTotalEpisodes = body.total_episodes ?? body.totalEpisodes

    const [saved] = await db
      .insert(animeEntries)
      .values({
        userId,
        anilistId: targetAnilistId,
        status: body.status,
        progress: body.progress,
        totalEpisodes: targetTotalEpisodes,
        score: body.score,
        favorite: body.favorite,
        private: body.private,
        notes: body.notes,
        startedAt: body.status === "watching" ? new Date() : undefined,
        completedAt: body.status === "completed" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [animeEntries.userId, animeEntries.anilistId],
        set: {
          status: body.status,
          progress: body.progress,
          totalEpisodes: targetTotalEpisodes,
          score: body.score,
          favorite: body.favorite,
          private: body.private,
          notes: body.notes,
          startedAt:
            body.status === "watching" || body.status === "rewatching"
              ? sql`coalesce(${animeEntries.startedAt}, now())`
              : undefined,
          completedAt: body.status === "completed" ? new Date() : null,
          updatedAt: new Date(),
        },
      })
      .returning()

    return c.json({ data: saved })
  })

  // Quick progress increment
  .post(
    "/:anilistId/increment",
    requireAuth,
    zValidator("param", anilistIdParamSchema),
    async (c) => {
      const userId = c.get("userId")
      const { anilistId } = c.req.valid("param")

      // Atomic read-modify-write: compute new progress inside the upsert so
      // concurrent increments never lose one.
      const [saved] = await db
        .insert(animeEntries)
        .values({
          userId,
          anilistId,
          status: "watching",
          progress: 1,
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [animeEntries.userId, animeEntries.anilistId],
          set: {
            progress: sql`${animeEntries.progress} + 1`,
            status: sql`case when ${animeEntries.totalEpisodes} is not null and ${animeEntries.progress} + 1 >= ${animeEntries.totalEpisodes} then 'completed'::library_status else 'watching'::library_status end`,
            completedAt: sql`case when ${animeEntries.totalEpisodes} is not null and ${animeEntries.progress} + 1 >= ${animeEntries.totalEpisodes} then coalesce(${animeEntries.completedAt}, now()) else null end`,
            updatedAt: new Date(),
          },
        })
        .returning()

      return c.json({ data: saved })
    }
  )

  // Delete anime entry
  .delete(
    "/:anilistId",
    requireAuth,
    zValidator("param", anilistIdParamSchema),
    async (c) => {
      const userId = c.get("userId")
      const { anilistId } = c.req.valid("param")

      await db
        .delete(animeEntries)
        .where(
          and(
            eq(animeEntries.userId, userId),
            eq(animeEntries.anilistId, anilistId)
          )
        )

      return c.json({ success: true })
    }
  )
