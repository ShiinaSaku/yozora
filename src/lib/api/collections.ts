import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { animeEntries, collectionEntries, collections } from "@/lib/db/schema"
import { requireAuth } from "./middleware/auth"
import type { AuthContext } from "./middleware/auth"

const createCollectionSchema = z.compile(
  z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(200).optional().nullable(),
    coverColor: z.string().optional().nullable(),
    private: z.boolean().default(false),
  })
)

const collectionIdParamSchema = z.compile(
  z.object({
    collectionId: z.string().min(1),
  })
)

const addEntryJsonSchema = z.compile(
  z.object({
    entryId: z.uuid(),
  })
)

export const collectionsRouter = new Hono<AuthContext>()
  // Get all collections for current user
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId")
    const userCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(desc(collections.updatedAt))

    return c.json({ data: userCollections })
  })

  // Create new collection
  .post(
    "/",
    requireAuth,
    zValidator("json", createCollectionSchema),

    async (c) => {
      const userId = c.get("userId")
      const body = c.req.valid("json")

      const [newCol] = await db
        .insert(collections)
        .values({
          userId,
          name: body.name,
          description: body.description,
          coverColor: body.coverColor,
          private: body.private,
          updatedAt: new Date(),
        })
        .returning()

      return c.json({ data: newCol })
    }
  )

  // Add entry to collection
  .post(
    "/:collectionId/entries",
    requireAuth,
    zValidator("param", collectionIdParamSchema),
    zValidator("json", addEntryJsonSchema),
    async (c) => {
      const userId = c.get("userId")
      const { collectionId } = c.req.valid("param")
      const { entryId } = c.req.valid("json")

      // Verify collection ownership
      const [col] = (await db
        .select()
        .from(collections)
        .where(
          and(eq(collections.id, collectionId), eq(collections.userId, userId))
        )
        .limit(1)) as (typeof collections.$inferSelect | undefined)[]

      if (!col) return c.json({ error: "Collection not found" }, 404)

      // Verify the entry exists and belongs to the caller before attaching it
      const [entry] = (await db
        .select({ id: animeEntries.id })
        .from(animeEntries)
        .where(
          and(eq(animeEntries.id, entryId), eq(animeEntries.userId, userId))
        )
        .limit(1)) as ({ id: string } | undefined)[]

      if (!entry) return c.json({ error: "Entry not found" }, 404)

      const [added] = (await db
        .insert(collectionEntries)
        .values({
          collectionId,
          entryId,
        })
        .onConflictDoNothing()
        .returning()) as (typeof collectionEntries.$inferSelect | undefined)[]

      if (!added) {
        const [existing] = await db
          .select()
          .from(collectionEntries)
          .where(
            and(
              eq(collectionEntries.collectionId, collectionId),
              eq(collectionEntries.entryId, entryId)
            )
          )
          .limit(1)
        return c.json({ data: existing })
      }

      return c.json({ data: added })
    }
  )

  // Delete collection
  .delete(
    "/:collectionId",
    requireAuth,
    zValidator("param", collectionIdParamSchema),
    async (c) => {
      const userId = c.get("userId")
      const { collectionId } = c.req.valid("param")

      const deleted = await db
        .delete(collections)
        .where(
          and(eq(collections.id, collectionId), eq(collections.userId, userId))
        )
        .returning({ id: collections.id })

      if (deleted.length === 0)
        return c.json({ error: "Collection not found" }, 404)

      return c.json({ success: true })
    }
  )
