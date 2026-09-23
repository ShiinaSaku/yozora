import { Suspense } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { SignIn } from "@clerk/tanstack-react-start"

import { canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

export const Route = createFileRoute("/sign-in/$")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => {
    const ogImage = openGraphImageUrl({
      type: "generic",
      title: "Sign In to Yozora",
      subtitle: "Anime Discovery & Watchlist Tracking",
      tag: "Authentication",
      description:
        "Sign in to your Yozora account to manage your anime library, track broadcasts, and sync lists.",
    })

    return {
      meta: [
        { title: "Sign In | Yozora" },
        {
          name: "description",
          content:
            "Sign in to your Yozora account to manage your anime library.",
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: "Sign In | Yozora" },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Sign In | Yozora" },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/sign-in"),
    }
  },
  component: SignInPage,
})

function SignInPage() {
  const { redirect: redirectUrl } = Route.useSearch()
  return (
    <div className="flex min-h-140 items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="h-96 w-80 animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        <SignIn
          forceRedirectUrl={redirectUrl}
          fallbackRedirectUrl={redirectUrl || "/"}
        />
      </Suspense>
    </div>
  )
}
