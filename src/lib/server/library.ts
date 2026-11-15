import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { animeEntries } from "@/lib/db/schema"
import { getMultipleAnime } from "@/lib/catalog"

/**
 * Full library page data for a user: entries plus batched AniList anime data.
 */
export async function getMyLibraryData(userId: string) {
  const entries = await db
    .select()
    .from(animeEntries)
    .where(eq(animeEntries.userId, userId))
    .orderBy(desc(animeEntries.updatedAt))

  const anime =
    entries.length > 0
      ? await getMultipleAnime(entries.map((entry) => entry.anilistId))
      : []

  return { entries, anime }
}
