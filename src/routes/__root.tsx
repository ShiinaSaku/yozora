import * as React from "react"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import type { RouterContext } from "@/lib/router-context"
import { ClerkProvider } from "@clerk/tanstack-react-start"
import { shadcn } from "@clerk/ui/themes"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeHotkey } from "@/components/theme-hotkey"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { CursorGlow } from "@/components/ui/cursor-glow"
import { NotFound } from "@/components/pages/not-found"
import { ErrorPage } from "@/components/pages/error-page"
import {
  generateDatasetJsonLd,
  generateOrganizationJsonLd,
  generateSoftwareApplicationJsonLd,
  generateWebSiteJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/json-ld"
import { SITE_URL, openGraphImageUrl } from "@/lib/seo/meta"
import appCss from "@/styles/globals.css?url"

const appUrl = SITE_URL
const defaultTitle = "Yozora (夜空) — Free Anime Catalog, Radar & 1080p Themes"
const defaultDescription =
  "Explore seasonal anime, live Tokyo broadcast countdowns, 1080p creditless theme songs, and synced watchlists on Yozora (夜空)."

/**
 * Root route definition with global metadata, SEO JSON-LD schema, stylesheets, and font links.
 */
export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "application-name", content: "Yozora" },
      { name: "apple-mobile-web-app-title", content: "Yozora" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { name: "msapplication-TileColor", content: "#06070b" },
      { name: "msapplication-config", content: "/browserconfig.xml" },
      { name: "theme-color", content: "#06070b" },
      { title: defaultTitle },
      { name: "description", content: defaultDescription },
      {
        name: "keywords",
        content:
          "Yozora, Yozora anime, yozora.moe, anime, anime catalog, seasonal anime 2026, anime schedule, anime countdown, anime airing countdown, creditless OP ED, anime soundtracks, anime openings, anime endings, anime watchlist, seiyuu, voice actors, 夜空, アニメ, 放送スケジュール, 今期アニメ, 新番, 追番, 主題歌, 声優, AniList, MyAnimeList",
      },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1",
      },
      { property: "og:title", content: defaultTitle },
      { property: "og:description", content: defaultDescription },
      { property: "og:url", content: appUrl },
      { property: "og:site_name", content: "Yozora" },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "ja_JP" },
      { property: "og:locale:alternate", content: "zh_CN" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: openGraphImageUrl({
          type: "home",
          title: "Yozora (夜空)",
          tag: "Anime Radar",
          subtitle: "Seasonal Catalog & Broadcast Schedules",
          description: defaultDescription,
        }),
      },
      { property: "og:image:type", content: "image/png" },
      {
        property: "og:image:alt",
        content:
          "Yozora (夜空) — seasonal anime catalog, live countdown radar, and theme song player",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: defaultTitle },
      { name: "twitter:description", content: defaultDescription },
      {
        name: "twitter:image",
        content: openGraphImageUrl({
          type: "home",
          title: "Yozora (夜空)",
          tag: "Anime Radar",
          subtitle: "Seasonal Catalog & Broadcast Schedules",
          description: defaultDescription,
        }),
      },
      {
        name: "twitter:image:alt",
        content:
          "Yozora (夜空) — seasonal anime catalog, live countdown radar, and theme song player",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preload",
        href: "/fonts/capriola-latin-400-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/inter-latin-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      {
        rel: "alternate",
        type: "text/markdown",
        href: "/llms.txt",
        title: "LLM Context (llms.txt)",
      },
      {
        rel: "alternate",
        type: "text/markdown",
        href: "/llms-full.txt",
        title: "Full LLM Context & Schema (llms-full.txt)",
      },
      {
        rel: "alternate",
        type: "text/markdown",
        href: "/pricing.md",
        title: "Pricing & Open Access Specification (pricing.md)",
      },
      {
        rel: "search",
        type: "application/opensearchdescription+xml",
        title: "Search Yozora Anime",
        href: "/opensearch.xml",
      },
      { rel: "preconnect", href: "https://s4.anilist.co" },
      { rel: "preconnect", href: "https://cdn.myanimelist.net" },
      { rel: "preconnect", href: "https://img.youtube.com" },
      { rel: "preconnect", href: "https://v.animethemes.moe" },
      { rel: "dns-prefetch", href: "https://s4.anilist.co" },
      { rel: "dns-prefetch", href: "https://cdn.myanimelist.net" },
      { rel: "dns-prefetch", href: "https://img.youtube.com" },
      { rel: "dns-prefetch", href: "https://v.animethemes.moe" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: stringifyJsonLd(generateOrganizationJsonLd()),
      },
      {
        type: "application/ld+json",
        children: stringifyJsonLd(generateWebSiteJsonLd()),
      },
      {
        type: "application/ld+json",
        children: stringifyJsonLd(generateSoftwareApplicationJsonLd()),
      },
      {
        type: "application/ld+json",
        children: stringifyJsonLd(generateDatasetJsonLd()),
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  errorComponent: ({ error, reset }) => (
    <ErrorPage
      error={error instanceof Error ? error : new Error(String(error))}
      reset={reset}
    />
  ),
})

/**
 * Top-level HTML document wrapper rendering head metadata, fonts, and scripts.
 */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

/**
 * Global layout component providing Clerk authentication, themes, toasts, hotkeys, and navigation.
 */
function RootComponent() {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <ThemeHotkey />
        <CursorGlow />
        <Toaster />
        <Providers>
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </Providers>
      </ThemeProvider>
    </ClerkProvider>
  )
}
