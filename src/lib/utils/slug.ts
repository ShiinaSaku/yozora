/**
 * Utility functions for generating and parsing SEO-optimized hybrid anime URL slugs.
 * Format: `/anime/{id}-{slug}` (e.g. `/anime/113415-jujutsu-kaisen`)
 */

export function slugify(text?: string): string {
  if (!text) return ""

  return text
    .toLowerCase()
    .normalize("NFKD") // Normalize unicode characters
    .replace(/[\u0300-\u036F]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove punctuation/symbols (quotes, colons, etc.)
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .slice(0, 60) // Keep slug concise
}

/**
 * Returns a human-readable SEO hybrid URL for an anime.
 */
export function getAnimeUrl(anime: { id: number; title?: string }): string {
  const slug = slugify(anime.title)
  return slug ? `/anime/${anime.id}-${slug}` : `/anime/${anime.id}`
}

/**
 * Safely extracts the numeric AniList integer ID from a route parameter string.
 * Handles both `/anime/113415` and `/anime/113415-jujutsu-kaisen`.
 */
export function parseAnimeId(param: string): number {
  const parsed = Number.parseInt(param, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Returns a human-readable SEO hybrid URL for a character.
 */
export function getCharacterUrl(char: {
  id: number
  name?: { full?: string }
}): string {
  const slug = slugify(char.name?.full)
  return slug ? `/character/${char.id}-${slug}` : `/character/${char.id}`
}
