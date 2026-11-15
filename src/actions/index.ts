import { defineAction, ActionError } from "astro:actions"
import type { ActionAPIContext } from "astro:actions"
import { z } from "astro/zod"
import { requireUserId } from "@/lib/server/auth"
import {
  deleteEntry,
  incrementProgress,
  upsertEntry,
} from "@/lib/server/entries"
import { deleteUserData, updateProfile } from "@/lib/server/profile"

// All mutations are auth-gated Astro Actions, called from React islands via
// `import { actions } from "astro:actions"`. Reads never go through here —
// pages fetch in frontmatter and client refetches use JSON API endpoints
// under src/pages/api/.

function requireAuth(context: ActionAPIContext): Promise<string> {
  return requireUserId(context.locals as never)
}

function toActionError(error: unknown): ActionError {
  if (error instanceof ActionError) return error
  const message =
    error instanceof Error ? error.message : "Something went wrong"
  return new ActionError({
    code: message === "Unauthorized" ? "UNAUTHORIZED" : "INTERNAL_SERVER_ERROR",
    message,
  })
}

export const server = {
  library: {
    upsertEntry: defineAction({
      input: z.object({
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
      }),
      handler: async (input, context) => {
        try {
          const userId = await requireAuth(context)
          return await upsertEntry(userId, input)
        } catch (error) {
          throw toActionError(error)
        }
      },
    }),

    incrementProgress: defineAction({
      input: z.object({ anilistId: z.number().int().positive() }),
      handler: async (input, context) => {
        try {
          const userId = await requireAuth(context)
          return await incrementProgress(userId, input.anilistId)
        } catch (error) {
          throw toActionError(error)
        }
      },
    }),

    deleteEntry: defineAction({
      input: z.object({ anilistId: z.number().int().positive() }),
      handler: async (input, context) => {
        try {
          const userId = await requireAuth(context)
          return await deleteEntry(userId, input.anilistId)
        } catch (error) {
          throw toActionError(error)
        }
      },
    }),
  },

  profile: {
    update: defineAction({
      accept: "json",
      input: z.object({
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
      }),
      handler: async (input, context) => {
        try {
          const userId = await requireAuth(context)
          return await updateProfile(userId, input)
        } catch (error) {
          throw toActionError(error)
        }
      },
    }),

    deleteData: defineAction({
      handler: async (_input, context) => {
        try {
          const userId = await requireAuth(context)
          return await deleteUserData(userId)
        } catch (error) {
          throw toActionError(error)
        }
      },
    }),
  },
}
