import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { animeEntries } from "@/lib/db/schema"
import { getMultipleAnime } from "@/lib/catalog"
import { authMiddleware } from "@/lib/server/auth"

export const getMyLibraryData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const entries = await db
      .select()
      .from(animeEntries)
      .where(eq(animeEntries.userId, context.userId))
      .orderBy(desc(animeEntries.updatedAt))

    const anime =
      entries.length > 0
        ? await getMultipleAnime(entries.map((entry) => entry.anilistId))
        : []

    return { entries, anime }
  })
