import { createFileRoute } from "@tanstack/react-router"
import { ProfileSettingsClient } from "@/components/pages/profile-settings-client"
import { canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

export type SettingsTab =
  "profile" | "account" | "showcase" | "connections" | "preferences" | "danger"

export const Route = createFileRoute("/_authed/settings/profile")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (typeof search.tab === "string"
      ? search.tab
      : "profile") as SettingsTab,
  }),
  head: () => {
    const ogImage = openGraphImageUrl({
      type: "settings",
      title: "Account & Profile Settings",
      subtitle: "Preferences, Security & Integrations",
      tag: "User Settings",
      description:
        "Customize your public profile, account security, connected anime accounts, and preferences on Yozora.",
    })

    return {
      meta: [
        { title: "Settings | Yozora" },
        {
          name: "description",
          content:
            "Customize your public profile, account security, connected anime accounts, and preferences on Yozora.",
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: "Settings | Yozora" },
        {
          property: "og:description",
          content:
            "Customize your public profile, account security, connected anime accounts, and preferences on Yozora.",
        },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Settings | Yozora" },
        {
          name: "twitter:description",
          content:
            "Customize your public profile, account security, connected anime accounts, and preferences on Yozora.",
        },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/settings/profile"),
    }
  },
  component: ProfileSettingsPage,
})

function ProfileSettingsPage() {
  const { tab } = Route.useSearch()
  return <ProfileSettingsClient defaultTab={tab} />
}
