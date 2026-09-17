import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  CpuIcon,
  FlashIcon,
  GithubIcon,
  HeartIcon,
  Layers01Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
import { Card } from "@/components/ui/card"
import { BrandLogo } from "@/components/layout/brand-logo"
import Link from "@/components/ui/link"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"
import { generateFaqJsonLd, stringifyJsonLd } from "@/lib/seo/json-ld"

const ABOUT_FAQS = [
  {
    question: "What is Yozora?",
    answer:
      "Yozora (夜空) is a modern anime catalog, live broadcast radar, and soundtrack theme vault built for anime enthusiasts tracking seasonal television schedules and music archives.",
  },
  {
    question: "How does the Airing Radar track releases?",
    answer:
      "The radar synchronizes with official Japanese television broadcast timetables (JST UTC+9), calculating millisecond-precise countdowns to exact airing windows across Tokyo television networks.",
  },
  {
    question: "How does the Dual-Engine Failover work?",
    answer:
      "Yozora uses an intelligent dual-provider catalog combining AniList (GraphQL) and Jikan (MyAnimeList REST v4). If one provider experiences rate limits, IP blocks, or outages, requests transparently fail over to the secondary engine with zero downtime.",
  },
  {
    question: "How are opening and ending themes sourced?",
    answer:
      "Themes and video sequences are provided through integration with the open AnimeThemes archive, pairing creditless 1080p visual sequences with original artist credits and lossless audio playback.",
  },
  {
    question: "How does Yozora cache data for speed?",
    answer:
      "Yozora employs a two-tier caching architecture: L1 per-isolate in-memory LRU maps with single-flight deduplication to prevent stampedes, and L2 distributed Upstash Redis via REST. All caching fails open so third-party downtime never interrupts the viewer.",
  },
  {
    question: "Is Yozora open source?",
    answer:
      "Yes. Yozora is open source and licensed under the MIT License. You can inspect the source code, contribute features, or deploy your own instance via GitHub.",
  },
]

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Yozora (夜空) — Seasonal Anime Catalog & Airing Radar" },
      {
        name: "description",
        content:
          "Learn about Yozora, our seasonal anime broadcast radar, creditless theme player, dual-engine failover, and community watchlist archive.",
      },
      {
        name: "keywords",
        content:
          "about yozora, anime platform, anime catalog, anime soundtrack player, anime tracker, open anime database, Yozora, 夜空, アニメ, 放送予定, 新番",
      },
      {
        property: "og:title",
        content: "About Yozora (夜空) — Seasonal Anime Catalog & Airing Radar",
      },
      {
        property: "og:description",
        content:
          "Learn about Yozora, our seasonal anime broadcast radar, creditless theme player, dual-engine failover, and community watchlist archive.",
      },
      { property: "og:url", content: absoluteUrl("/about") },
      {
        property: "og:image",
        content: openGraphImageUrl({
          type: "about",
          title: "About Yozora (夜空)",
          subtitle: "The Modern Anime Intelligence Engine",
          tag: "Platform & Manifesto",
          description:
            "Built for performance, privacy, and accuracy. Live Japanese broadcast countdowns, lossless themes, and dual-engine failover.",
        }),
      },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "About Yozora (夜空) — Seasonal Anime Catalog & Airing Radar",
      },
      {
        name: "twitter:description",
        content:
          "Learn about Yozora, our seasonal anime broadcast radar, creditless theme player, dual-engine failover, and community watchlist archive.",
      },
      {
        name: "twitter:image",
        content: openGraphImageUrl({
          type: "about",
          title: "About Yozora (夜空)",
          subtitle: "The Modern Anime Intelligence Engine",
          tag: "Platform & Manifesto",
          description:
            "Built for performance, privacy, and accuracy. Live Japanese broadcast countdowns, lossless themes, and dual-engine failover.",
        }),
      },
    ],
    links: canonicalLinks("/about"),
    scripts: [
      {
        type: "application/ld+json",
        children: stringifyJsonLd(generateFaqJsonLd(ABOUT_FAQS)),
      },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
      <section className="flex max-w-3xl flex-col items-start gap-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="size-16 transition-transform hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-2xl leading-none font-black tracking-tight text-foreground sm:text-3xl">
              Yozora
            </span>
            <span className="mt-1 font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              夜空 · Next-Gen Anime Hub
            </span>
          </div>
        </div>

        <h1 className="text-3xl leading-[1.12] font-black tracking-tight text-balance text-foreground sm:text-5xl">
          Seasonal anime discovery, broadcast radar, and soundtrack archives.
        </h1>

        <p className="text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
          Yozora is built for anime viewers who want instantaneous Japanese
          broadcast schedules, master-quality creditless opening and ending
          theme playback, and resilient library tracking that never goes down.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/airing"
            className="interactive-press inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <span>Live Airing Radar</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={2.5}
            />
          </Link>
          <Link
            href="/seasonal"
            className="interactive-press inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-4 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted/60"
          >
            <span>Seasonal Lineup</span>
          </Link>
          <a
            href="https://github.com/shiinasaku/yozora"
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-press inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-4 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted/60"
          >
            <HugeiconsIcon icon={GithubIcon} size={16} strokeWidth={2} />
            <span>Open Source</span>
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Platform Capabilities
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Engineered from first principles for responsiveness, accuracy, and
            zero latency.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <FeatureCard
            icon={CpuIcon}
            color="text-indigo-500 bg-indigo-500/10"
            title="Dual-Engine Catalog Failover"
            description="Combines AniList GraphQL and Jikan v4 (MyAnimeList) with transparent automatic failover. If one API experiences rate-limiting or blocks, the backup provider takes over with zero downtime."
          />
          <FeatureCard
            icon={FlashIcon}
            color="text-amber-500 bg-amber-500/10"
            title="Live Airing Radar"
            description="Millisecond-precise countdown timers synchronized directly with Japanese television broadcast schedules (JST UTC+9), tracking exact weekly premiere windows across Tokyo networks."
          />
          <FeatureCard
            icon={Video02Icon}
            color="text-sky-500 bg-sky-500/10"
            title="Creditless 1080p Themes"
            description="Integrated with the open AnimeThemes archive, featuring 1080p clean opening and ending sequences, artist discography lore, and synced audio deck playback without watermarks."
          />
          <FeatureCard
            icon={HeartIcon}
            color="text-rose-500 bg-rose-500/10"
            title="Private Library & Sync"
            description="Track episode progress, curate custom watchlist shelves, rate series, and share public profile showcases backed by Drizzle ORM and Neon Serverless PostgreSQL."
          />
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-3xl border border-border/50 bg-card/40 p-6 backdrop-blur-md sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Two-Tier Resilient Caching
            </h2>
            <p className="text-xs text-muted-foreground">
              Sub-millisecond response times with fail-open safety.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-foreground">
                Tier 1: In-Memory
              </span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                &lt;1ms
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Per-isolate in-memory Map with single-flight request deduplication
              to prevent stampedes on concurrent hits.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-foreground">
                Tier 2: Upstash Redis
              </span>
              <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-sky-600 dark:text-sky-400">
                Persistent
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Distributed Redis REST cache shared across serverless regions.
              Completely fail-open so Redis outages never block requests.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-foreground">
                Edge CDN Cache
              </span>
              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                SWR
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Public catalog loaders emit{" "}
              <code className="font-mono text-[10px] text-foreground">
                stale-while-revalidate
              </code>{" "}
              headers for global Edge propagation.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Answers to common questions about data sources, accuracy, and
            privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ABOUT_FAQS.map((faq) => (
            <Card
              key={faq.question}
              className="flex flex-col gap-2.5 rounded-2xl border-border/40 bg-card p-5 shadow-2xs"
            >
              <h3 className="text-sm leading-snug font-bold text-foreground">
                {faq.question}
              </h3>
              <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
                {faq.answer}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border/50 bg-card/30 p-6 backdrop-blur-md sm:flex-row sm:p-8">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3 className="text-base font-bold text-foreground sm:text-lg">
            Open Source &amp; Community Driven
          </h3>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Built with TanStack Start, Nitro, Vite, Tailwind CSS v4, Base UI,
            Drizzle ORM, and Neon PostgreSQL. Contributor pull requests and
            feedback are welcome.
          </p>
        </div>

        <a
          href="https://github.com/shiinasaku/yozora"
          target="_blank"
          rel="noopener noreferrer"
          className="interactive-press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background shadow-xs transition-opacity hover:opacity-90"
        >
          <HugeiconsIcon icon={GithubIcon} size={16} strokeWidth={2} />
          <span>Star on GitHub</span>
        </a>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  color: string
  title: string
  description: string
}

function FeatureCard({ icon, color, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col gap-3 rounded-3xl border-border/40 bg-card p-6 shadow-2xs">
      <div
        className={`flex size-10 items-center justify-center rounded-xl ${color}`}
      >
        <HugeiconsIcon icon={icon} size={20} strokeWidth={2} />
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
        {description}
      </p>
    </Card>
  )
}
