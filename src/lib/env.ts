import "zod/compile"
import { z } from "zod"

const envSchema = z.compile(
  z.object({
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required for Neon PostgreSQL connection")
      .optional(),
    CLERK_SECRET_KEY: z
      .string()
      .min(1, "CLERK_SECRET_KEY is required for Clerk authentication")
      .optional(),
    VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
    VITE_APP_URL: z.string().min(1).default("http://localhost:3000"),
    ANILIST_API_URL: z.string().min(1).default("https://graphql.anilist.co"),
    ANIMETHEMES_GRAPHQL_URL: z
      .string()
      .min(1)
      .default("https://rs.animethemes.moe/graphql"),
    PORT: z.coerce.number().int().default(3000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  })
)

export type Env = z.infer<typeof envSchema>

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(
      `[Env] Invalid environment: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`
    )
  }
  return parsed.data
}
