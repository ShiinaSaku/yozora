const rawSiteUrl = import.meta.env.VITE_APP_URL || "https://yozora.moe"
const sanitizedSiteUrl = rawSiteUrl.includes("hikari.shiina.xyz")
  ? "https://yozora.moe"
  : rawSiteUrl

export const SITE_URL = sanitizedSiteUrl.replace(/\/$/, "")

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function canonicalLinks(path: string) {
  return [{ rel: "canonical", href: absoluteUrl(path) }]
}

export function openGraphImageUrl(
  params: Record<string, string | number | undefined>
) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value))
    }
  }
  return absoluteUrl(`/og-image?${search.toString()}`)
}
