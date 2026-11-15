import { strict as assert } from "node:assert"
import { test } from "node:test"
import { fetchSafeImageDataUri } from "./safe-image"

test("accepts images from allowed hosts without following redirects", async () => {
  const fetchImage: typeof fetch = async (_url, options) => {
    assert.equal(options?.redirect, "manual")
    return new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": "image/png" },
    })
  }
  assert.equal(
    await fetchSafeImageDataUri("https://img.clerk.com/avatar", fetchImage),
    "data:image/png;base64,AQID"
  )
})

test("rejects untrusted URLs before fetching", async () => {
  let fetchCount = 0
  const fetchImage: typeof fetch = async () => {
    fetchCount++
    return new Response()
  }
  for (const url of [
    "https://clerk.com.evil.example/avatar",
    "http://img.clerk.com/avatar",
    "https://img.clerk.com:8443/avatar",
    "https://127.0.0.1/avatar",
  ]) {
    assert.equal(await fetchSafeImageDataUri(url, fetchImage), "")
  }
  assert.equal(fetchCount, 0)
})

test("rejects redirects, non-images, and oversized streamed responses", async () => {
  for (const response of [
    new Response(null, { status: 302, headers: { location: "https://example.com" } }),
    new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } }),
    new Response(new Uint8Array(2 * 1024 * 1024 + 1), { headers: { "content-type": "image/png" } }),
  ]) {
    assert.equal(
      await fetchSafeImageDataUri("https://img.clerk.com/avatar", async () => response),
      ""
    )
  }
})
