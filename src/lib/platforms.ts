import type React from "react"

export interface PlatformMeta {
  name: string
  color: string
  bgColor: string
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element
}

function hostnameOf(url?: string): string {
  if (!url) return ""
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ""
  }
}

export function matchPlatform(site?: string, url?: string): string {
  const s = (site || "").toLowerCase()
  const host = hostnameOf(url)
  // Match the domain exactly (or as a subdomain) so e.g. xbox.com never
  // substring-matches "x.com".
  const isHost = (domain: string) =>
    host === domain || host.endsWith(`.${domain}`)
  const hasWord = (word: string) =>
    new RegExp(`(^|[^a-z])${word}([^a-z]|$)`).test(s)

  if (s.includes("crunchyroll") || isHost("crunchyroll.com"))
    return "Crunchyroll"
  if (s.includes("netflix") || isHost("netflix.com")) return "Netflix"
  if (s.includes("hidive") || isHost("hidive.com")) return "HIDIVE"
  if (s.includes("hulu") || isHost("hulu.com")) return "Hulu"
  if (
    s.includes("amazon") ||
    s.includes("prime video") ||
    isHost("amazon.com") ||
    isHost("primevideo.com")
  ) {
    return "Prime Video"
  }
  if (s.includes("disney") || isHost("disneyplus.com")) return "Disney+"
  if (
    s.includes("hbo") ||
    hasWord("max") ||
    isHost("max.com") ||
    isHost("hbomax.com")
  )
    return "Max"
  if (s.includes("youtube") || isHost("youtube.com") || isHost("youtu.be"))
    return "YouTube"
  if (s.includes("bilibili") || isHost("bilibili.com") || isHost("bilibili.tv"))
    return "Bilibili"
  if (s.includes("anilist") || isHost("anilist.co")) return "AniList"
  if (s.includes("myanimelist") || hasWord("mal") || isHost("myanimelist.net"))
    return "MyAnimeList"
  if (s.includes("anime-planet") || isHost("anime-planet.com"))
    return "Anime-Planet"
  if (s.includes("kitsu") || isHost("kitsu.app")) return "Kitsu"
  if (
    s.includes("twitter") ||
    s === "x" ||
    isHost("twitter.com") ||
    isHost("x.com")
  ) {
    return "Twitter"
  }
  if (s.includes("tiktok") || isHost("tiktok.com")) return "TikTok"
  if (s.includes("instagram") || isHost("instagram.com")) return "Instagram"
  if (s.includes("spotify") || isHost("spotify.com")) return "Spotify"
  if (s.includes("discord") || isHost("discord.gg") || isHost("discord.com"))
    return "Discord"
  if (s.includes("animethemes") || isHost("animethemes.moe"))
    return "AnimeThemes"
  if (s.includes("official") || s.includes("site")) return "Official Site"
  return site || "Link"
}
