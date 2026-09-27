import { createFileRoute } from "@tanstack/react-router"
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

async function handleClerkWebhook({
  request,
}: {
  request: Request
}): Promise<Response> {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!signingSecret) {
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const svix_id = request.headers.get("svix-id")
  const svix_timestamp = request.headers.get("svix-timestamp")
  const svix_signature = request.headers.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: "Missing svix headers" }, { status: 400 })
  }

  const payload = await request.text()

  let evt: ClerkUserWebhookEvent
  try {
    const wh = new Webhook(signingSecret)
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as ClerkUserWebhookEvent
  } catch {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    )
  }

  const eventType = evt.type
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, username, first_name, last_name, image_url } = evt.data
    const displayName =
      [first_name, last_name].filter(Boolean).join(" ") || username || "User"

    try {
      if (eventType === "user.created") {
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
      await db.delete(animeEntries).where(eq(animeEntries.userId, id))
      await db.delete(collections).where(eq(collections.userId, id))
      await db.delete(userProfiles).where(eq(userProfiles.userId, id))
    }
  }

  return Response.json({ success: true })
}

export const Route = createFileRoute("/api/webhooks/clerk")({
  server: {
    handlers: {
      POST: handleClerkWebhook,
    },
  },
})
