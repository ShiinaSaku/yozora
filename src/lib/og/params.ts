/**
 * Single source of truth for the OpenGraph card contract.
 *
 * The same schema builds the URLs callers embed and parses the ones the
 * `/og-image` handler receives — no duplicated param lists.
 */

const OG_PATH = "/og-image"

export const ogCardTypes = [
  "generic",
  "home",
  "seasonal",
  "airing",
  "library",
  "user",
  "about",
  "anime",
  "character",
] as const

export type OgCardType = (typeof ogCardTypes)[number]

export interface OgParams {
  type: OgCardType
  title: string
  subtitle: string
  native: string
  description: string
  image: string
  accent: string
  score: string
  year: string
  format: string
  episodes: string
  tag: string
  genres: string[]
}

export const OG_DEFAULT_DESCRIPTION =
  "Discover anime, follow live airing schedules, explore characters, and play lossless opening and ending themes."

const LIMITS = {
  title: 140,
  subtitle: 120,
  native: 100,
  description: 280,
  tag: 60,
} as const

const DEFAULT_ACCENT = "#8b7cb8"

export function sanitizeAccent(value: string | null | undefined): string {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? (value as string) : DEFAULT_ACCENT
}

function clamp(value: string | null, max: number): string {
  return (value?.trim() || "").slice(0, max)
}

/** Parses and validates `URLSearchParams` into card parameters. */
export function parseOgParams(searchParams: URLSearchParams): OgParams {
  const rawType = searchParams.get("type") as OgCardType | null
  return {
    type: ogCardTypes.includes(rawType as OgCardType) ? (rawType as OgCardType) : "generic",
    title: clamp(searchParams.get("title"), LIMITS.title) || "Yozora",
    subtitle: clamp(searchParams.get("subtitle"), LIMITS.subtitle),
    native: clamp(searchParams.get("native"), LIMITS.native),
    description:
      clamp(searchParams.get("description"), LIMITS.description) ||
      OG_DEFAULT_DESCRIPTION,
    image: searchParams.get("image")?.trim() || "",
    accent: sanitizeAccent(searchParams.get("accent")),
    score: clamp(searchParams.get("score"), 16),
    year: clamp(searchParams.get("year"), 16),
    format: clamp(searchParams.get("format"), 24),
    episodes: clamp(searchParams.get("episodes"), 16),
    tag: clamp(searchParams.get("tag"), LIMITS.tag),
    genres: (searchParams.get("genres") || "")
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean)
      .slice(0, 3),
  }
}

/** Builds the canonical (relative) `/og-image` URL for the given parameters. */
export function ogImageUrl(
  params: Partial<Omit<OgParams, "genres">> & { genres?: string[] }
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    const serialized = Array.isArray(value)
      ? value.join(", ")
      : String(value)
    if (serialized) search.set(key, serialized)
  }
  const query = search.toString()
  return `${OG_PATH}${query ? `?${query}` : ""}`
}
