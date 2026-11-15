import { strict as assert } from "node:assert"
import { test } from "node:test"
import type { Anime } from "@/lib/types/anime"
import { searchWithFallback } from "./fuzzy-search"

function anime(id: number, title: string, popularity = 100): Anime {
  return {
    id, title, popularity, cover: "", accent: "", score: 0,
    year: 2000, format: "TV", tags: [],
  }
}

test("preserves upstream matches without extra requests", async () => {
  const exact = [anime(1, "ONE PIECE")]
  const result = await searchWithFallback("one piece", async () => exact, async () => {
    throw new Error("fallback must not run")
  })
  assert.deepEqual(result, exact)
})

test("ranks typo-tolerant results and removes duplicate candidates", async () => {
  const piece = anime(1, "ONE PIECE", 500)
  const unrelated = anime(2, "One-Punch Man", 1000)
  const requests: Array<string | null> = []
  const result = await searchWithFallback("one peice", async () => [], async (term) => {
    requests.push(term)
    return [unrelated, piece]
  })
  assert.deepEqual(requests, ["peice", "one"])
  assert.deepEqual(result.map((item) => item.title), ["ONE PIECE"])
})

test("matches alternate titles and falls back to popular titles for one word", async () => {
  const naruto = anime(1, "NARUTO")
  const alternate = { ...anime(2, "Shingeki no Kyojin"), titles: { english: "Attack on Titan" } }
  const terms: Array<string | null> = []
  const single = await searchWithFallback("naruo", async () => [], async (term) => {
    terms.push(term)
    return [naruto]
  })
  assert.deepEqual(terms, ["nar", null])
  assert.equal(single[0]?.id, naruto.id)
  const multi = await searchWithFallback("attak on titan", async () => [], async () => [alternate])
  assert.equal(multi[0]?.id, alternate.id)
})

test("does not turn short queries or unrelated candidates into results", async () => {
  assert.deepEqual(await searchWithFallback("ab", async () => [], async () => {
    throw new Error("fallback must not run")
  }), [])
  assert.deepEqual(await searchWithFallback("zzzzz", async () => [], async () => [
    anime(1, "ONE PIECE"),
  ]), [])
})

test("uses a successful fallback if the other fails, but propagates total failure", async () => {
  const piece = anime(1, "ONE PIECE")
  const result = await searchWithFallback("one peice", async () => [], async (term) => {
    if (term === "one") throw new Error("upstream unavailable")
    return [piece]
  })
  assert.equal(result[0]?.id, piece.id)
  await assert.rejects(
    searchWithFallback("one peice", async () => [], async () => {
      throw new Error("upstream unavailable")
    }),
    /upstream unavailable/
  )
})
