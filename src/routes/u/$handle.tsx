import { createFileRoute } from "@tanstack/react-router"
import { UserProfileClient } from "@/components/pages/profile-client"
import { getPublicProfilePageData } from "@/lib/server/profile"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

export const Route = createFileRoute("/u/$handle")({
  loader: async ({ params, context }) => {
    const data = await getPublicProfilePageData({ data: params.handle })
    context.queryClient.setQueryData(["profile", params.handle], {
      profile: data.profile,
      stats: data.stats,
    })
    context.queryClient.setQueryData(["user-entries", params.handle], {
      entries: data.entries,
      anime: data.anime,
    })
    return data
  },
  head: ({ params, loaderData }) => {
    const handle = loaderData?.profile.handle || params.handle
    const encodedHandle = encodeURIComponent(handle)
    const title = `@${handle}'s Anime Profile | Yozora`
    const description = `Explore @${handle}'s anime profile, watchlist shelves, ratings, and stats on Yozora.`
    const canonicalPath = `/u/${encodedHandle}`
    const ogImage = openGraphImageUrl({
      type: "user",
      title: `@${handle}`,
      subtitle: "Anime Watchlist & Personal Ratings",
      tag: "Anime Profile",
      description,
      image: loaderData?.profile.avatarUrl || undefined,
    })

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${handle}, anime profile, anime list, anime watchlist, user profile, anime tracker, Yozora`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(canonicalPath) },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks(canonicalPath),
    }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { handle } = Route.useParams()
  const initialData = Route.useLoaderData()
  return <UserProfileClient handle={handle} initialData={initialData} />
}
