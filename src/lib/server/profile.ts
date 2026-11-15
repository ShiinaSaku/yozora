import "zod/compile"
import { and, desc, eq, or, sql } from "drizzle-orm"
import { z } from "zod"
import { db, isUniqueViolation } from "@/lib/db"
import { animeEntries, collections, userProfiles } from "@/lib/db/schema"
import { getMultipleAnime } from "@/lib/catalog"

// Plain async profile operations. Auth is enforced by callers: Astro pages
// pass a `requireUserId`-resolved id, Actions resolve it from
// `context.locals.auth()` before invoking these functions.

const handleSchema = z.compile(z.string().trim().min(1).max(50))

/**
 * Public profile page data: profile, aggregate stats, entries and anime.
 * Returns null when the handle is unknown or the profile is private
 * (page renders 404).
 */
export async function getPublicProfilePageData(rawHandle: string) {
  const handle = handleSchema.parse(rawHandle)
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
    return null
  }

  const [stats] = await db
    .select({
      totalEntries: sql<number>`count(*)`,
      totalEpisodes: sql<number>`coalesce(sum(${animeEntries.progress}), 0)`,
      meanScore: sql<number>`coalesce(avg(case when ${animeEntries.score} > 0 then ${animeEntries.score} end), 0)`,
      completedCount: sql<number>`count(case when ${animeEntries.status} = 'completed' then 1 end)`,
      watchingCount: sql<number>`count(case when ${animeEntries.status} in ('watching', 'rewatching') then 1 end)`,
    })
    .from(animeEntries)
    .where(
      and(eq(animeEntries.userId, profile.userId), eq(animeEntries.private, false))
    )

  const entries = await db
    .select()
    .from(animeEntries)
    .where(
      and(eq(animeEntries.userId, profile.userId), eq(animeEntries.private, false))
    )
    .orderBy(desc(animeEntries.updatedAt))

  const anime =
    entries.length > 0
      ? await getMultipleAnime(entries.map((entry) => entry.anilistId))
      : []

  const totalEps = Number(stats.totalEpisodes || 0)
  const meanScoreNum = Number(stats.meanScore || 0)

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
}

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
    avatarUrl: z.url().optional().nullable().or(z.literal("")),
    bannerUrl: z.url().optional().nullable().or(z.literal("")),
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
 * Fetch a user's private profile.
 */
export async function getMyProfile(userId: string) {
  const [profile] = (await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

  return profile ?? null
}

/**
 * Update or initialize a user's profile.
 */
export async function updateProfile(
  userId: string,
  rawData: unknown
): Promise<typeof userProfiles.$inferSelect> {
  const data = updateProfileSchema.parse(rawData)

  let handle = data.handle?.trim().toLowerCase()
  if (!handle) {
    const [current] = (await db
      .select({ handle: userProfiles.handle })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)) as ({ handle: string } | undefined)[]
    handle = current?.handle || userId.slice(-8)
  } else if (handle === "me") {
    throw new Error("Handle is reserved")
  } else {
    const [existingHandle] = (await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.handle, handle))
      .limit(1)) as (typeof userProfiles.$inferSelect | undefined)[]

    if (existingHandle && existingHandle.userId !== userId) {
      throw new Error("Handle already taken")
    }
  }

  const cleanAvatar = data.avatarUrl || null
  const cleanBanner = data.bannerUrl || null

  try {
    const [updated] = await db
      .insert(userProfiles)
      .values({
        userId,
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
}

/**
 * Permanently delete all account data: library entries, collections, and profile.
 */
export async function deleteUserData(userId: string) {
  const deletedEntries = await db
    .delete(animeEntries)
    .where(eq(animeEntries.userId, userId))
    .returning({ id: animeEntries.id })

  const deletedCollections = await db
    .delete(collections)
    .where(eq(collections.userId, userId))
    .returning({ id: collections.id })

  await db.delete(userProfiles).where(eq(userProfiles.userId, userId))

  return {
    deletedEntries: deletedEntries.length,
    deletedCollections: deletedCollections.length,
  }
}
