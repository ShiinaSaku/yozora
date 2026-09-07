import {
  AniListIcon,
  BilibiliIcon,
  CrunchyrollIcon,
  DiscordIcon,
  DisneyPlusIcon,
  HidiveIcon,
  HuluIcon,
  InstagramIcon,
  MaxIcon,
  MyAnimeListIcon,
  NetflixIcon,
  PrimeVideoIcon,
  SpotifyIcon,
  TikTokIcon,
  XTwitterIcon,
  YouTubeIcon,
} from "./platform-icons"
import { matchPlatform } from "@/lib/platforms"

export function getPlatformInfo(site?: string, url?: string) {
  const platform = matchPlatform(site, url)

  switch (platform) {
    case "Crunchyroll":
      return {
        name: "Crunchyroll",
        color: "#FF5E00",
        bgClass:
          "bg-[#FF5E00]/10 text-[#E65100] dark:bg-[#FF5E00]/20 dark:text-[#FF7A29]",
        icon: CrunchyrollIcon,
      }
    case "Netflix":
      return {
        name: "Netflix",
        color: "#E50914",
        bgClass:
          "bg-[#E50914]/10 text-[#C10712] dark:bg-[#E50914]/20 dark:text-[#FF3842]",
        icon: NetflixIcon,
      }
    case "HIDIVE":
      return {
        name: "HIDIVE",
        color: "#00AEEF",
        bgClass:
          "bg-[#00AEEF]/10 text-[#007EA8] dark:bg-[#00AEEF]/20 dark:text-[#38C6FF]",
        icon: HidiveIcon,
      }
    case "Hulu":
      return {
        name: "Hulu",
        color: "#1CE783",
        bgClass:
          "bg-[#1CE783]/15 text-[#0B964B] dark:bg-[#1CE783]/20 dark:text-[#1CE783]",
        icon: HuluIcon,
      }
    case "Prime Video":
      return {
        name: "Prime Video",
        color: "#00A8E1",
        bgClass:
          "bg-[#00A8E1]/10 text-[#007EA8] dark:bg-[#00A8E1]/20 dark:text-[#33BFFF]",
        icon: PrimeVideoIcon,
      }
    case "Disney+":
      return {
        name: "Disney+",
        color: "#0063E5",
        bgClass:
          "bg-[#0063E5]/10 text-[#004BB0] dark:bg-[#0063E5]/20 dark:text-[#60A5FA]",
        icon: DisneyPlusIcon,
      }
    case "Max":
      return {
        name: "Max",
        color: "#6366F1",
        bgClass:
          "bg-[#6366F1]/10 text-[#4F46E5] dark:bg-[#6366F1]/20 dark:text-[#818CF8]",
        icon: MaxIcon,
      }
    case "YouTube":
      return {
        name: "YouTube",
        color: "#FF0000",
        bgClass:
          "bg-[#FF0000]/10 text-[#CC0000] dark:bg-[#FF0000]/20 dark:text-[#FF4D4D]",
        icon: YouTubeIcon,
      }
    case "Bilibili":
      return {
        name: "Bilibili",
        color: "#00AEEC",
        bgClass:
          "bg-[#00AEEC]/10 text-[#007EAC] dark:bg-[#00AEEC]/20 dark:text-[#38C8FF]",
        icon: BilibiliIcon,
      }
    case "AniList":
      return {
        name: "AniList",
        color: "#02A9FF",
        bgClass:
          "bg-[#02A9FF]/10 text-[#007BBA] dark:bg-[#02A9FF]/20 dark:text-[#38BAFF]",
        icon: AniListIcon,
      }
    case "MyAnimeList":
      return {
        name: "MyAnimeList",
        color: "#2E51A2",
        bgClass:
          "bg-[#2E51A2]/10 text-[#1F3978] dark:bg-[#4A72D9]/20 dark:text-[#7C9DF0]",
        icon: MyAnimeListIcon,
      }
    case "Twitter":
      return {
        name: "X (Twitter)",
        color: "currentColor",
        bgClass:
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        icon: XTwitterIcon,
      }
    case "TikTok":
      return {
        name: "TikTok",
        color: "currentColor",
        bgClass:
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        icon: TikTokIcon,
      }
    case "Instagram":
      return {
        name: "Instagram",
        color: "#E4405F",
        bgClass:
          "bg-[#E4405F]/10 text-[#B82B57] dark:bg-[#E4405F]/20 dark:text-[#FA7298]",
        icon: InstagramIcon,
      }
    case "Spotify":
      return {
        name: "Spotify",
        color: "#1DB954",
        bgClass:
          "bg-[#1DB954]/10 text-[#137333] dark:bg-[#1DB954]/20 dark:text-[#1ED760]",
        icon: SpotifyIcon,
      }
    case "Discord":
      return {
        name: "Discord",
        color: "#5865F2",
        bgClass:
          "bg-[#5865F2]/10 text-[#404EED] dark:bg-[#5865F2]/20 dark:text-[#7983F5]",
        icon: DiscordIcon,
      }
    default:
      return {
        name: site || "Official Link",
        color: undefined,
        bgClass: "bg-muted text-muted-foreground",
        icon: null,
      }
  }
}
