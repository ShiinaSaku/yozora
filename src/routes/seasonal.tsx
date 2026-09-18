import { createFileRoute } from "@tanstack/react-router"
import { SeasonalClient } from "@/components/pages/seasonal-client"
import { CatalogPageSkeleton } from "@/components/ui/page-skeletons"
import { generateBreadcrumbsJsonLd, stringifyJsonLd } from "@/lib/seo/json-ld"
import { getSeasonalData } from "@/lib/server/catalog"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

/**
 * Route definition for current seasonal anime releases, charts, and broadcasting lineup.
 */

export const Route = createFileRoute("/seasonal")({
  pendingComponent: CatalogPageSkeleton,
  loader: async () => {
    return await getSeasonalData()
  },
  head: ({ loaderData }) => {
    const seasonalYear = new Date().getFullYear()
    const topAnime = Array.isArray(loaderData) ? loaderData[0] : undefined
    const ogImage = openGraphImageUrl({
      type: "seasonal",
      title: `Seasonal Anime Chart ${seasonalYear}`,
      subtitle: "Television Premieres & Broadcast Schedules",
      tag: `Seasonal Lineup • ${seasonalYear}`,
      description: `Follow television premieres, broadcasting timetables, and theme releases for the ${seasonalYear} anime seasons on Yozora.`,
      image:
        topAnime?.coverExtraLarge ||
        topAnime?.coverLarge ||
        topAnime?.cover ||
        undefined,
    })

    return {
      meta: [
        {
          title: `Seasonal Anime Chart ${seasonalYear} — Lineups & Broadcast Schedules | Yozora`,
        },
        {
          name: "description",
          content: `Follow television premieres, broadcasting timetables, and theme releases for the ${seasonalYear} anime seasons on Yozora.`,
        },
        {
          name: "keywords",
          content: `seasonal anime, seasonal anime chart, winter anime ${seasonalYear}, spring anime ${seasonalYear}, summer anime ${seasonalYear}, fall anime ${seasonalYear}, top anime season, anime schedule, 今期アニメ, 新作アニメ, 新番, 追番, 放送予定, Yozora anime`,
        },
        {
          property: "og:title",
          content: `Seasonal Anime Chart ${seasonalYear} | Yozora`,
        },
        {
          property: "og:description",
          content: `Follow television premieres, broadcasting timetables, and theme releases for the ${seasonalYear} anime seasons on Yozora.`,
        },
        { property: "og:url", content: absoluteUrl("/seasonal") },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: `Seasonal Anime Chart ${seasonalYear} | Yozora`,
        },
        {
          name: "twitter:description",
          content:
            "Browse top-rated and trending anime for the current broadcasting season with streaming links, countdowns, and OST themes on Yozora.",
        },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/seasonal"),
      scripts: [
        {
          type: "application/ld+json",
          children: stringifyJsonLd(
            generateBreadcrumbsJsonLd([
              { name: "Home", url: "/" },
              { name: "Seasonal Anime", url: "/seasonal" },
            ])
          ),
        },
      ],
    }
  },
  component: SeasonalPage,
})

function SeasonalPage() {
  const items = Route.useLoaderData()
  return <SeasonalClient items={items} />
}
