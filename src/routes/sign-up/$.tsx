import { Suspense } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { SignUp } from "@clerk/tanstack-react-start"
import { canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

/**
 * Route definition for Clerk user authentication sign-up flow.
 */
export const Route = createFileRoute("/sign-up/$")({
  head: () => {
    const ogImage = openGraphImageUrl({
      type: "generic",
      title: "Create Your Yozora Account",
      subtitle: "Anime Discovery & Watchlist Tracking",
      tag: "Authentication",
      description:
        "Create your Yozora account to track anime, watchlists, live broadcast countdowns, and custom shelves.",
    })

    return {
      meta: [
        { title: "Sign Up | Yozora" },
        {
          name: "description",
          content:
            "Create your Yozora account to track anime, watchlists, and custom shelves.",
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: "Sign Up | Yozora" },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Sign Up | Yozora" },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/sign-up"),
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="h-96 w-80 animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        <SignUp />
      </Suspense>
    </div>
  )
}
