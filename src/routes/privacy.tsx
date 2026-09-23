import { createFileRoute } from "@tanstack/react-router"
import { ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

/**
 * Route definition for privacy policy and data governance.
 */
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Yozora" },
      {
        name: "description",
        content:
          "Yozora privacy policy, authentication safety, and data governance details.",
      },
      { property: "og:title", content: "Privacy Policy | Yozora" },
      {
        property: "og:description",
        content:
          "Yozora privacy policy, authentication safety, and data governance details.",
      },
      { property: "og:url", content: absoluteUrl("/privacy") },
      {
        property: "og:image",
        content: openGraphImageUrl({
          type: "privacy",
          title: "Privacy & Data Governance",
          subtitle: "Transparency, Security & Private Tracking",
          tag: "Data & Trust",
          description:
            "How Yozora handles authentication, profile data, and anime libraries. Zero ad tracking, zero commercial data sales.",
        }),
      },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy | Yozora" },
      {
        name: "twitter:image",
        content: openGraphImageUrl({
          type: "privacy",
          title: "Privacy & Data Governance",
          subtitle: "Transparency, Security & Private Tracking",
          tag: "Data & Trust",
          description:
            "How Yozora handles authentication, profile data, and anime libraries. Zero ad tracking, zero commercial data sales.",
        }),
      },
    ],
    links: canonicalLinks("/privacy"),
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-base text-muted-foreground">
          How we handle and protect your anime library and profile data on
          Yozora.
        </p>
      </div>

      <Card variant="subtle" size="none">
        <div className="prose dark:prose-invert max-w-none p-8 text-sm leading-relaxed">
          <h2>1. Authentication</h2>
          <p>
            User accounts and authentication are managed securely via Clerk. We
            do not store plain-text passwords or sensitive credentials on our
            servers.
          </p>

          <h2>2. Library & Profile Data</h2>
          <p>
            Your anime watchlist progress, ratings, and custom collections are
            stored in our Postgres database. You can mark your library as
            private or public at any time from your profile settings.
          </p>

          <h2>3. Third-Party Integrations</h2>
          <p>
            Yozora interacts with public APIs including AniList GraphQL and
            AnimeThemes to deliver catalog search and audio streams.
          </p>
        </div>
      </Card>
    </div>
  )
}
