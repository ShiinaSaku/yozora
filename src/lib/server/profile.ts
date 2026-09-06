import "zod/compile"
import { createServerFn } from "@tanstack/react-start"
import { notFound } from "@tanstack/react-router"
import { setResponseHeaders } from "@tanstack/react-start/server"
import { and, desc, eq, or, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { animeEntries, userProfiles } from "@/lib/db/schema"
import { getMultipleAnime } from "@/lib/catalog"

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
