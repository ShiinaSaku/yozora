import { Buffer } from "node:buffer"

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function isAllowedImageHost(hostname: string): boolean {
  return (
    hostname === "anilist.co" ||
    hostname.endsWith(".anilist.co") ||
    hostname === "cdn.myanimelist.net" ||
    hostname.endsWith(".myanimelist.net") ||
    hostname === "img.clerk.com" ||
    hostname.endsWith(".clerk.com") ||
    hostname === "animethemes.moe" ||
    hostname.endsWith(".animethemes.moe")
  )
}

export async function fetchSafeImageDataUri(
  url: string | null,
  fetchImage: typeof fetch = fetch
): Promise<string> {
  if (!url) return ""

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" || parsed.port || !isAllowedImageHost(parsed.hostname)) {
      return ""
    }

    const res = await fetchImage(parsed.toString(), {
      redirect: "manual",
      headers: { "user-agent": "Mozilla/5.0 (compatible; YozoraBot/1.0)" },
      signal: AbortSignal.timeout(3500),
    })
    if (!res.ok) return ""

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase()
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(contentType)) return ""
    if (Number(res.headers.get("content-length")) > MAX_IMAGE_BYTES || !res.body) return ""

    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_IMAGE_BYTES) {
        await reader.cancel()
        return ""
      }
      chunks.push(value)
    }
    return `data:${contentType};base64,${Buffer.concat(chunks).toString("base64")}`
  } catch {
    return ""
  }
}
