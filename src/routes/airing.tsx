import { createFileRoute } from "@tanstack/react-router"
import { AiringClient } from "@/components/pages/airing-client"
import { AiringPageSkeleton } from "@/components/ui/page-skeletons"
import {
  generateAiringScheduleJsonLd,
  generateBreadcrumbsJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/json-ld"
import { getAiringData } from "@/lib/server/catalog"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

/**
 * Route definition for live anime broadcasting schedule and episode countdown radar.
 */
export const Route = createFileRoute("/airing")({
  pendingComponent: AiringPageSkeleton,
  loader: async () => {
    return await getAiringData()
  },
  head: ({ loaderData }) => {
    const ogImage = openGraphImageUrl({
      type: "airing",
      title: "Weekly Anime Airing Schedule",
      subtitle: "Synchronized with Tokyo MX, BS11 & AT-X",
      tag: "Live Broadcast Radar",
      description:
        "Real-time episode countdowns, weekly broadcast timetables across Japanese TV networks, and live airing radar on Yozora.",
    })

    return {
      meta: [
        {
          title:
            "Anime Airing Schedule & Live Broadcast Countdown | Yozora (夜空)",
        },
        {
          name: "description",
          content:
            "Follow television broadcast schedules across Japanese networks with real-time countdowns to upcoming anime episode premieres.",
        },
        {
          name: "keywords",
          content:
            "anime schedule, airing anime, anime countdown, next episode airing, anime timetable, upcoming anime episodes, broadcast schedule, 放送スケジュール, アニメ放送予定, 新番时间表, 追番, Yozora",
        },
        {
          property: "og:title",
          content: "Anime Airing Schedule & Live Countdown | Yozora (夜空)",
        },
        {
          property: "og:description",
          content:
            "Follow television broadcast schedules across Japanese networks with real-time countdowns to upcoming anime episode premieres.",
        },
        { property: "og:url", content: absoluteUrl("/airing") },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Anime Airing Schedule & Live Countdown | Yozora",
        },
        {
          name: "twitter:description",
          content:
            "Real-time anime episode countdowns, weekly broadcast timetables, and live airing radar on Yozora.",
        },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/airing"),
      scripts: [
        {
          type: "application/ld+json",
          children: stringifyJsonLd(
            generateBreadcrumbsJsonLd([
              { name: "Home", url: "/" },
              { name: "Airing Schedule", url: "/airing" },
            ])
          ),
        },
        ...(loaderData?.items.length
          ? [
              {
                type: "application/ld+json",
                children: stringifyJsonLd(
                  generateAiringScheduleJsonLd(loaderData.items)
                ),
              },
            ]
          : []),
      ],
    }
  },
  component: AiringPage,
})

function AiringPage() {
  const { items, generatedAt } = Route.useLoaderData()
  return <AiringClient items={items} initialNow={generatedAt} />
}
