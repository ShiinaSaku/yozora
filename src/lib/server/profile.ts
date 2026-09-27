import "zod/compile"
import { createServerFn } from "@tanstack/react-start"
import { notFound } from "@tanstack/react-router"
import { setResponseHeaders } from "@tanstack/react-start/server"
import { and, desc, eq, or, sql } from "drizzle-orm"
import { z } from "zod"
import { db, isUniqueViolation } from "@/lib/db"
import { animeEntries, collections, userProfiles } from "@/lib/db/schema"
import { getMultipleAnime } from "@/lib/catalog"
import { authMiddleware } from "@/lib/server/auth"

const handleSchema = z.compile(z.string().trim().min(1).max(50))

const publicProfileHeaders = new Headers({
  "Cache-Control":
    "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
})

export const getPublicProfilePageData = createServerFn({ method: "GET" })
  .validator(handleSchema)
  .handler(async ({ data: handle }) => {
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
      throw notFound()
    }

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

    const anime =
      entries.length > 0
        ? await getMultipleAnime(entries.map((entry) => entry.anilistId))
        : []

    const totalEps = Number(stats.totalEpisodes || 0)
    const meanScoreNum = Number(stats.meanScore || 0)

    setResponseHeaders(publicProfileHeaders)

    return {
      profile,
      stats: {
        totalEntries: Number(stats.totalEntries || 0),
        totalEpisodes: totalEps,
        meanScore: meanScoreNum ? Number((meanScoreNum / 10).toFixed(1)) : null,
        daysWatched: Number(((totalEps * 24) / (60 * 24)).toFixed(1)),
        completedCount: Number(stats.completedCount || 0),
        watchingCount: Number(stats.watchingCount || 0),
      },
      entries,
      anime,
    }
  })

const updateProfileSchema = z.compile(
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
    avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
    bannerUrl: z.string().url().optional().nullable().or(z.literal("")),
    bio: z.string().max(2000).optional().nullable(),
    isPublic: z.boolean().optional(),
    anilistUsername: z.string().max(50).optional().nullable(),
    malUsername: z.string().max(50).optional().nullable(),
    pinnedAnimeIds: z.array(z.number().int()).max(6).optional().nullable(),
    favoriteGenres: z.array(z.string()).max(10).optional().nullable(),
  })
)

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/**
 * Fetch the authenticated user's private profile.
 */
export const getMyProfileFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const [profile] = (await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, context.userId))
      .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

    return profile ?? null
  })

/**
 * Update or initialize the authenticated user's profile.
 */
export const updateProfileFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateProfileSchema)
  .handler(async ({ data, context }) => {
    let handle = data.handle?.trim().toLowerCase()
    if (!handle) {
      const [current] = (await db
        .select({ handle: userProfiles.handle })
        .from(userProfiles)
        .where(eq(userProfiles.userId, context.userId))
        .limit(1)) as ({ handle: string } | undefined)[]
      handle = current?.handle || context.userId.slice(-8)
    } else if (handle === "me") {
      throw new Error("Handle is reserved")
    } else {
      const [existingHandle] = (await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.handle, handle))
        .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

      if (existingHandle && existingHandle.userId !== context.userId) {
        throw new Error("Handle already taken")
      }
    }

    const cleanAvatar = data.avatarUrl || null
    const cleanBanner = data.bannerUrl || null

    try {
      const [updated] = await db
        .insert(userProfiles)
        .values({
          userId: context.userId,
          handle,
          displayName: data.displayName || "User",
          avatarUrl: cleanAvatar,
          bannerUrl: cleanBanner,
          bio: data.bio || null,
          isPublic: data.isPublic ?? true,
          anilistUsername: data.anilistUsername || null,
          malUsername: data.malUsername || null,
          pinnedAnimeIds: data.pinnedAnimeIds ?? [],
          favoriteGenres: data.favoriteGenres ?? [],
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            handle,
            displayName: data.displayName || "User",
            avatarUrl: cleanAvatar,
            bannerUrl: cleanBanner,
            bio: data.bio || null,
            isPublic: data.isPublic ?? true,
            anilistUsername: data.anilistUsername || null,
            malUsername: data.malUsername || null,
            pinnedAnimeIds: data.pinnedAnimeIds ?? [],
            favoriteGenres: data.favoriteGenres ?? [],
            updatedAt: new Date(),
          },
        })
        .returning()

      return updated
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new Error("Handle already taken")
      }
      throw error
    }
  })

/**
 * Permanently delete all account data: library entries, collections, and profile.
 */
export const deleteUserDataFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const deletedEntries = await db
      .delete(animeEntries)
      .where(eq(animeEntries.userId, context.userId))
      .returning({ id: animeEntries.id })

    const deletedCollections = await db
      .delete(collections)
      .where(eq(collections.userId, context.userId))
      .returning({ id: collections.id })

    await db.delete(userProfiles).where(eq(userProfiles.userId, context.userId))

    return {
      deletedEntries: deletedEntries.length,
      deletedCollections: deletedCollections.length,
    }
  })
