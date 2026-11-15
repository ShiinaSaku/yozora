import "zod/compile"
import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { animeEntries } from "@/lib/db/schema"

// Plain async library-entry operations. Auth is enforced by callers: Astro
// pages pass a `requireUserId`-resolved id, Actions resolve it from
// `context.locals.auth()` before invoking these functions.

const anilistIdSchema = z.compile(z.number().int().positive())

const upsertEntrySchema = z.compile(
  z.object({
    anilistId: z.number().int().positive(),
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
    score: z.number().int().min(0).max(100).optional().nullable(),
    favorite: z.boolean().default(false),
    private: z.boolean().default(false),
    notes: z.string().max(1000).optional().nullable(),
  })
)

export type UpsertEntryInput = z.infer<typeof upsertEntrySchema>

/**
 * Fetch a single anime entry for a user.
 */
export async function getMyEntry(userId: string, rawAnilistId: number) {
  const anilistId = anilistIdSchema.parse(rawAnilistId)
  const [entry] = (await db
    .select()
    .from(animeEntries)
    .where(
      and(eq(animeEntries.userId, userId), eq(animeEntries.anilistId, anilistId))
    )
    .limit(1)) as (typeof animeEntries.$inferSelect | undefined)[]

  return entry ?? null
}

/**
 * Upsert an anime entry in the user's library.
 */
export async function upsertEntry(userId: string, data: UpsertEntryInput) {
  const [saved] = await db
    .insert(animeEntries)
    .values({
      userId,
      anilistId: data.anilistId,
      status: data.status,
      progress: data.progress,
      totalEpisodes: data.totalEpisodes,
      score: data.score,
      favorite: data.favorite,
      private: data.private,
      notes: data.notes,
      startedAt: data.status === "watching" ? new Date() : undefined,
      completedAt: data.status === "completed" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [animeEntries.userId, animeEntries.anilistId],
      set: {
        status: data.status,
        progress: data.progress,
        totalEpisodes: data.totalEpisodes,
        score: data.score,
        favorite: data.favorite,
        private: data.private,
        notes: data.notes,
        startedAt:
          data.status === "watching" || data.status === "rewatching"
            ? sql`coalesce(${animeEntries.startedAt}, now())`
            : undefined,
        completedAt: data.status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      },
    })
    .returning()

  return saved
}

/**
 * Atomic progress increment for an anime entry.
 */
export async function incrementProgress(userId: string, rawAnilistId: number) {
  const anilistId = anilistIdSchema.parse(rawAnilistId)
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

  return saved
}

/**
 * Remove an anime entry from the user's library.
 */
export async function deleteEntry(userId: string, rawAnilistId: number) {
  const anilistId = anilistIdSchema.parse(rawAnilistId)
  await db
    .delete(animeEntries)
    .where(
      and(eq(animeEntries.userId, userId), eq(animeEntries.anilistId, anilistId))
    )

  return { success: true }
}
