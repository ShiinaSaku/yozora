import Fuse from "fuse.js"
import type { Anime } from "@/lib/types/anime"

const MAX_RESULTS = 16

function fallbackTerms(query: string): Array<string | null> {
  const words = query.match(/[\p{L}\p{N}]+/gu) ?? []
  const candidates = [
    ...new Set(words.filter((word) => word.length >= 3)),
  ].sort((a, b) => b.length - a.length)

  if (candidates.length >= 2) return candidates.slice(0, 2)
  if (candidates.length === 1) {
    const word = candidates[0]
    return [word.slice(0, Math.max(3, word.length - 2)), null]
  }
  return []
}

export async function searchWithFallback(
  query: string,
  search: (term: string) => Promise<Anime[]>,
  candidates: (term: string | null) => Promise<Anime[]>
): Promise<Anime[]> {
  const exact = await search(query)
  if (exact.length > 0 || query.length < 4) return exact

  const terms = fallbackTerms(query)
  if (terms.length === 0) return []

  const responses = await Promise.allSettled(terms.map(candidates))
  const successful = responses.filter(
    (response) => response.status === "fulfilled"
  )
  if (successful.length === 0) {
    const failure = responses[0]
    if (failure.status === "rejected") throw failure.reason
    return []
  }

  const unique = new Map<number, Anime>()
  for (const response of successful) {
    for (const anime of response.value) unique.set(anime.id, anime)
  }
  const pool = [...unique.values()].sort(
    (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
  )

  return new Fuse(pool, {
    keys: ["title", "titles.english", "titles.romaji", "titles.native"],
    threshold: 0.4,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    minMatchCharLength: 2,
  })
    .search(query, { limit: MAX_RESULTS })
    .map((result) => result.item)
}
