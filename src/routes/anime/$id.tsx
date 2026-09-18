import { createFileRoute, notFound } from "@tanstack/react-router"
import { AnimeDetailClient } from "@/components/pages/anime-detail-client"
import {
  generateAnimeFaqJsonLd,
  generateAnimeJsonLd,
  generateBreadcrumbsJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/json-ld"
import { getAnimePageData } from "@/lib/server/catalog"
import { DetailPageSkeleton } from "@/components/ui/page-skeletons"
import { parseAnimeId } from "@/lib/utils/slug"
import { absoluteUrl, canonicalLinks } from "@/lib/seo/meta"

/**
 * Route definition for anime detail pages, relations, voice actors, and soundtrack player.
 */
export const Route = createFileRoute("/anime/$id")({
  pendingComponent: DetailPageSkeleton,
  loader: async ({ params }) => {
    const id = parseAnimeId(params.id)
    if (!id) {
      throw notFound()
    }

    return await getAnimePageData({ data: id })
  },
  head: ({ loaderData }) => {
    if (!loaderData?.detail) {
      return { meta: [{ title: "Anime Detail | Yozora" }] }
    }
    const { anime, characters } = loaderData.detail
    const themes = loaderData.themes
    const altTitle =
      anime.titles?.romaji &&
      anime.titles.romaji.toLowerCase() !== anime.title.toLowerCase()
        ? anime.titles.romaji
        : anime.titles?.native || ""
    const title = `${anime.title}${altTitle ? ` (${altTitle})` : ""}${anime.year ? ` · ${anime.year}` : ""} — Airing Schedule, Episodes & Themes | Yozora`
    const cleanDesc = (
      anime.description ||
      `Explore episodes, characters, themes, and soundtracks for ${anime.title} on Yozora.`
    )
      .replace(/<[^>]*>/g, "")
      .trim()
    const description =
      cleanDesc.length > 200 ? `${cleanDesc.slice(0, 197)}...` : cleanDesc

    const nativeTitles = [
      anime.titles?.english,
      anime.titles?.romaji,
      anime.titles?.native,
    ].filter(Boolean)
    const genres = anime.tags.slice(0, 5).join(", ")
    const keywords = [
      anime.title,
      ...nativeTitles,
      anime.subtitle,
      anime.year ? `${anime.year} anime` : "",
      anime.format ? `${anime.format} anime` : "",
      genres,
      ...(anime.studios || []).map((s) => `${s} anime`),
      ...characters.slice(0, 6).map((c) => c.name),
      ...characters
        .slice(0, 6)
        .filter((c) => c.voiceActor?.name)
        .map((c) => c.voiceActor!.name),
      ...themes.slice(0, 4).map((t) => t.title),
      `${anime.title} watch`,
      `${anime.title} episodes`,
      `${anime.title} countdown`,
      `${anime.title} broadcast`,
      `${anime.title} voice actors`,
      `${anime.title} seiyuu`,
      `${anime.title} opening song`,
      `${anime.title} ending song`,
      "anime soundtracks",
      "anime themes",
      "voice actors",
      "seiyuu",
      "声優",
      "主題歌",
      "放送スケジュール",
      "Yozora anime",
    ]
      .filter(Boolean)
      .join(", ")

    const ogParams = new URLSearchParams({
      type: "anime",
      title: anime.title,
      subtitle: anime.titles?.romaji || anime.subtitle || "",
      native: anime.titles?.native || "",
      description: cleanDesc.slice(0, 170),
      image:
        anime.coverExtraLarge ||
        anime.coverLarge ||
        anime.coverMedium ||
        anime.cover ||
        "",
      accent: anime.accent || "#93c5fd",
      score: anime.score && anime.score > 0 ? anime.score.toFixed(1) : "",
      year: anime.year ? String(anime.year) : "",
      format: anime.format || "TV",
      tag: anime.tags[0] || "Anime Showcase",
      genres: anime.tags.slice(0, 3).join(", "),
      episodes: anime.episodes ? String(anime.episodes) : "",
    })
    const ogImage = absoluteUrl(`/og-image?${ogParams.toString()}`)
    const canonicalPath = `/anime/${anime.id}`

    const animeJsonLd = generateAnimeJsonLd(anime, themes, characters)
    const breadcrumbs = generateBreadcrumbsJsonLd([
      { name: "Home", url: "/" },
      { name: "Seasonal", url: "/seasonal" },
      { name: anime.title, url: `/anime/${anime.id}` },
    ])
    const animeFaqJsonLd = generateAnimeFaqJsonLd(anime, themes, characters)

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(canonicalPath) },
        { property: "og:site_name", content: "Yozora" },
        { property: "og:locale", content: "en_US" },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        {
          property: "og:image:alt",
          content: `${anime.title} anime details on Yozora`,
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:type",
          content: anime.format === "MOVIE" ? "video.movie" : "video.tv_show",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        {
          name: "twitter:image:alt",
          content: `${anime.title} anime details on Yozora`,
        },
      ],
      links: canonicalLinks(canonicalPath),
      scripts: [
        {
          type: "application/ld+json",
          children: stringifyJsonLd(animeJsonLd),
        },
        {
          type: "application/ld+json",
          children: stringifyJsonLd(breadcrumbs),
        },
        {
          type: "application/ld+json",
          children: stringifyJsonLd(animeFaqJsonLd),
        },
      ],
    }
  },
  component: AnimeDetailPage,
})

function AnimeDetailPage() {
  const { detail, themes } = Route.useLoaderData()
  return <AnimeDetailClient detail={detail} themes={themes} />
}
