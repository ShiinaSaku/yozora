import * as React from "react"
import { Await, createFileRoute, defer } from "@tanstack/react-router"
import {
  HomePageClient,
  AiringRadarSection,
} from "@/components/pages/home-client"
import { CatalogPageSkeleton } from "@/components/ui/page-skeletons"
import { getHomeAiring, getHomeData } from "@/lib/server/catalog"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

/**
 * Root index route displaying trending spotlights, seasonal releases, and live airing radar.
 * Airing data is deferred and streamed so it never blocks the critical home content.
 */
export const Route = createFileRoute("/")({
  pendingComponent: CatalogPageSkeleton,
  loader: async () => {
    const home = await getHomeData()
    return {
      ...home,
      airing: defer(getHomeAiring()),
    }
  },
  head: () => ({
    meta: [
      {
        title:
          "Yozora (夜空) — Free Anime Catalog, Live Airing Schedule & 1080p Themes",
      },
      {
        name: "description",
        content:
          "Explore seasonal anime releases, live Tokyo broadcast countdowns, 1080p creditless anime openings and endings, and synchronize your watchlist on Yozora (夜空).",
      },
      {
        name: "keywords",
        content:
          "Yozora, Yozora anime, yozora.moe, anime, anime catalog, seasonal anime 2026, anime schedule, anime countdown, anime airing countdown, anime themes, opening songs, ending songs, seiyuu, voice actors, 夜空, アニメ, 放送予定, 今期アニメ, 新番, 追番, 主題歌",
      },
      {
        property: "og:title",
        content:
          "Yozora (夜空) — Free Anime Catalog, Live Airing Schedule & 1080p Themes",
      },
      {
        property: "og:description",
        content:
          "Explore seasonal anime releases, live Tokyo broadcast countdowns, 1080p creditless anime openings and endings, and synchronize your watchlist on Yozora (夜空).",
      },
      { property: "og:url", content: absoluteUrl("/") },
      {
        property: "og:image",
        content: openGraphImageUrl({
          type: "home",
          title: "Track broadcasts, discover seasons & play lossless themes.",
          subtitle: "The Modern Anime Discovery Platform",
          tag: "Live Anime Radar",
          description:
            "Real-time countdowns across Japanese networks, lossless opening and ending themes, AniList sync, and zero ads.",
        }),
      },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content:
          "Yozora (夜空) — Seasonal Anime Catalog, Airing Radar & Themes",
      },
      {
        name: "twitter:description",
        content:
          "Explore current broadcast seasons, countdown upcoming episode releases across Japanese TV networks, and stream creditless opening and ending theme songs.",
      },
      {
        name: "twitter:image",
        content: openGraphImageUrl({
          type: "home",
          title: "Track broadcasts, discover seasons & play lossless themes.",
          subtitle: "The Modern Anime Discovery Platform",
          tag: "Live Anime Radar",
          description:
            "Real-time countdowns across Japanese networks, lossless opening and ending themes, AniList sync, and zero ads.",
        }),
      },
    ],
    links: canonicalLinks("/"),
  }),
  component: HomePage,
})

function HomePage() {
  const { trending, seasonal, popular, airing } = Route.useLoaderData()
  return (
    <HomePageClient
      trending={trending}
      seasonal={seasonal}
      popular={popular}
      airingSlot={
        <React.Suspense fallback={null}>
          <Await promise={airing} fallback={null}>
            {(items) => <AiringRadarSection items={items} />}
          </Await>
        </React.Suspense>
      }
    />
  )
}
