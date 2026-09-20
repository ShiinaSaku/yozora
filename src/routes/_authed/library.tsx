import { createFileRoute } from "@tanstack/react-router"
import { LibraryClient } from "@/components/pages/library-client"
import { getMyLibraryData } from "@/lib/server/library"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

export const Route = createFileRoute("/_authed/library")({
  loader: async ({ context }) => {
    const data = await getMyLibraryData()
    context.queryClient.setQueryData(["my-entries"], data)
    return data
  },
  head: () => {
    const title = "My Anime Watchlist & Library Tracker | Yozora"
    const description =
      "Manage and track your anime library, watchlist progress, ratings, and custom collections on Yozora."
    const ogImage = openGraphImageUrl({
      type: "library",
      title: "Anime Library & Watchlists",
      subtitle: "Personal Collection & Episode Progress",
      tag: "Personal Library",
      description:
        "Manage and track your anime library, watchlist progress, ratings, and custom collections on Yozora.",
    })

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content:
            "Manage and track your anime library, watchlist progress, ratings, and custom collections on Yozora.",
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:url", content: absoluteUrl("/library") },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "My Anime Watchlist & Library Tracker | Yozora",
        },
        {
          name: "twitter:description",
          content:
            "Manage and track your anime library, watchlist progress, ratings, and custom collections on Yozora.",
        },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/library"),
    }
  },
  component: LibraryPage,
})

function LibraryPage() {
  const initialData = Route.useLoaderData()
  return <LibraryClient initialData={initialData} />
}
