import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, or, sql } from "drizzle-orm"
import { db, isUniqueViolation } from "@/lib/db"
import { animeEntries, collections, userProfiles } from "@/lib/db/schema"
import { requireAuth } from "./middleware/auth"
import type { AuthContext } from "./middleware/auth"

const profileHandleParamSchema = z.compile(
  z.object({
    handle: z.string().min(1),
  })
)

const upsertProfileSchema = z.compile(
  z.object({
    handle: z
      .string()
      .min(1)
      .max(30)
      .regex(
        /^[\w-]+$/,
        "Handle can only contain letters, numbers, dashes and underscores"
      )
      .optional(),
    displayName: z.string().min(1).max(50).optional(),
    display_name: z.string().min(1).max(50).optional(),
    avatarUrl: z.url().optional().nullable(),
    avatar_url: z.url().optional().nullable(),
    bannerUrl: z.url().optional().nullable(),
    banner_url: z.url().optional().nullable(),
    bio: z.string().max(2000).optional().nullable(),
    isPublic: z.boolean().optional(),
    is_public: z.boolean().optional(),
    anilistUsername: z.string().max(50).optional().nullable(),
    anilist_username: z.string().max(50).optional().nullable(),
    malUsername: z.string().max(50).optional().nullable(),
    mal_username: z.string().max(50).optional().nullable(),
    pinnedAnimeIds: z.array(z.number().int()).max(6).optional().nullable(),
    pinned_anime_ids: z.array(z.number().int()).max(6).optional().nullable(),
    favoriteGenres: z.array(z.string()).max(10).optional().nullable(),
    favorite_genres: z.array(z.string()).max(10).optional().nullable(),
  })
)

export const userRouter = new Hono<AuthContext>()
  // Get current user profile
  .get("/profile/me", requireAuth, async (c) => {
    const userId = c.get("userId")
    const [profile] = (await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

    return c.json({ data: profile ?? null })
  })

  // Get public user profile by handle or Clerk user ID
  .get(
    "/profile/:handle",
    zValidator("param", profileHandleParamSchema),
    async (c) => {
      const { handle } = c.req.valid("param")
      const normalizedHandle = handle.toLowerCase()
      const [profile] = (await db
        .select()
        .from(userProfiles)
        .where(
          or(
            eq(userProfiles.handle, normalizedHandle),
            eq(userProfiles.userId, handle)
          )
        )
        .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

      if (!profile || !profile.isPublic) {
        return c.json({ error: "User not found" }, 404)
      }

      // Compute user stats
      const [stats] = await db
        .select({
          totalEntries: sql<number>`count(*)`,
          totalEpisodes: sql<number>`coalesce(sum(${animeEntries.progress}), 0)`,
          meanScore: sql<number>`coalesce(avg(case when ${animeEntries.score} > 0 then ${animeEntries.score} end), 0)`,
          completedCount: sql<number>`count(case when ${animeEntries.status} = 'completed' then 1 end)`,
          watchingCount: sql<number>`count(case when ${animeEntries.status} = 'watching' then 1 end)`,
        })
        .from(animeEntries)
        .where(eq(animeEntries.userId, profile.userId))

      const totalEps = Number(stats.totalEpisodes || 0)
      const daysWatched = Number(((totalEps * 24) / (60 * 24)).toFixed(1))
      const meanScoreNum = Number(stats.meanScore || 0)

      c.header(
        "Cache-Control",
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600"
      )
      return c.json(
        {
          data: {
            profile,
            stats: {
              totalEntries: Number(stats.totalEntries || 0),
              totalEpisodes: totalEps,
              meanScore: meanScoreNum
                ? Number((meanScoreNum / 10).toFixed(1))
                : null,
              daysWatched,
              completedCount: Number(stats.completedCount || 0),
              watchingCount: Number(stats.watchingCount || 0),
            },
          },
        },
        200
      )
    }
  )

  // Permanently delete ALL owned data: entries (with cascading progress),
  // collections (with cascading collection entries), and the profile itself.
  .delete("/data", requireAuth, async (c) => {
    const userId = c.get("userId")

    const deletedEntries = await db
      .delete(animeEntries)
      .where(eq(animeEntries.userId, userId))
      .returning({ id: animeEntries.id })

    const deletedCollections = await db
      .delete(collections)
      .where(eq(collections.userId, userId))
      .returning({ id: collections.id })

    await db.delete(userProfiles).where(eq(userProfiles.userId, userId))

    return c.json({
      data: {
        deletedEntries: deletedEntries.length,
        deletedCollections: deletedCollections.length,
      },
    })
  })

  // Upsert profile
  .post(
    "/profile",
    requireAuth,
    zValidator("json", upsertProfileSchema),

    async (c) => {
      const userId = c.get("userId")
      const body = c.req.valid("json")

      let handle = body.handle?.trim().toLowerCase()
      if (!handle) {
        const [current] = (await db
          .select({ handle: userProfiles.handle })
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId))
          .limit(1)) as ({ handle: string } | undefined)[]
        handle = current?.handle || userId.slice(-8)
      } else if (handle === "me") {
        return c.json({ error: "Handle is reserved" }, 409)
      } else {
        const [existingHandle] = (await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.handle, handle))
          .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

        if (existingHandle && existingHandle.userId !== userId) {
          return c.json({ error: "Handle already taken" }, 409)
        }
      }

      const displayName = body.display_name ?? body.displayName ?? "User"
      const avatarUrl = body.avatar_url ?? body.avatarUrl
      const bannerUrl = body.banner_url ?? body.bannerUrl
      const isPublic = body.is_public ?? body.isPublic ?? true
      const anilistUsername = body.anilist_username ?? body.anilistUsername
      const malUsername = body.mal_username ?? body.malUsername
      const pinnedAnimeIds = body.pinned_anime_ids ?? body.pinnedAnimeIds ?? []
      const favoriteGenres = body.favorite_genres ?? body.favoriteGenres ?? []

      try {
        const [updated] = await db
          .insert(userProfiles)
          .values({
            userId,
            handle,
            displayName,
            avatarUrl,
            bannerUrl,
            bio: body.bio,
            isPublic,
            anilistUsername,
            malUsername,
            pinnedAnimeIds,
            favoriteGenres,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: {
              handle,
              displayName,
              avatarUrl,
              bannerUrl,
              bio: body.bio,
              isPublic,
              anilistUsername,
              malUsername,
              pinnedAnimeIds,
              favoriteGenres,
              updatedAt: new Date(),
            },
          })
          .returning()

        return c.json({ data: updated })
      } catch (error) {
        if (isUniqueViolation(error)) {
          return c.json({ error: "Handle already taken" }, 409)
        }
        throw error
      }
    }
  )
