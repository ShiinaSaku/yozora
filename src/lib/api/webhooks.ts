import { Hono } from "hono"
import { Webhook } from "svix"
import { eq } from "drizzle-orm"
import { db, isUniqueViolation } from "@/lib/db"
import { animeEntries, collections, userProfiles } from "@/lib/db/schema"

interface ClerkUserWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted" | string
  data: {
    id: string
    username?: string | null
    first_name?: string | null
    last_name?: string | null
    image_url?: string | null
  }
}

export const webhooksRouter = new Hono().post("/clerk", async (c) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!signingSecret) {
    return c.json({ error: "Webhook secret not configured" }, 500)
  }

  const svix_id = c.req.header("svix-id")
  const svix_timestamp = c.req.header("svix-timestamp")
  const svix_signature = c.req.header("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return c.json({ error: "Missing svix headers" }, 400)
  }

  const payload = await c.req.text()

  let evt: ClerkUserWebhookEvent
  try {
    const wh = new Webhook(signingSecret)
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as ClerkUserWebhookEvent
  } catch {
    return c.json({ error: "Invalid webhook signature" }, 400)
  }

  const eventType = evt.type
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, username, first_name, last_name, image_url } = evt.data
    const displayName =
      [first_name, last_name].filter(Boolean).join(" ") || username || "User"

    try {
      if (eventType === "user.created") {
        // Claim handle only at account creation; later username changes must not
        // overwrite a handle the user set via POST /api/user/profile.
        const fallbackHandle = (
          username || `user_${id.slice(-8)}`
        ).toLowerCase()
        await db
          .insert(userProfiles)
          .values({
            userId: id,
            handle: fallbackHandle,
            displayName,
            avatarUrl: image_url,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: {
              displayName,
              avatarUrl: image_url,
              updatedAt: new Date(),
            },
          })
      } else {
        await db
          .update(userProfiles)
          .set({ displayName, avatarUrl: image_url, updatedAt: new Date() })
          .where(eq(userProfiles.userId, id))
      }
    } catch (error) {
      // Handle collision (e.g. another profile claimed the Clerk username):
      // retry once with a suffix so Svix does not retry-then-disable the endpoint.
      if (isUniqueViolation(error)) {
        const fallbackHandle = `user_${id.slice(-8)}`
        await db
          .insert(userProfiles)
          .values({
            userId: id,
            handle: fallbackHandle,
            displayName,
            avatarUrl: image_url,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: { displayName, avatarUrl: image_url, updatedAt: new Date() },
          })
      } else {
        throw error
      }
    }
  } else if (eventType === "user.deleted") {
    const { id } = evt.data
    if (id) {
      // userId is plain text (no FK): delete library + collections explicitly;
      // collection_entries cascade via the collections FK.
      await db.delete(animeEntries).where(eq(animeEntries.userId, id))
      await db.delete(collections).where(eq(collections.userId, id))
      await db.delete(userProfiles).where(eq(userProfiles.userId, id))
    }
  }

  return c.json({ success: true })
})
