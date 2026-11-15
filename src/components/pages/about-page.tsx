import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  CpuIcon,
  FlashIcon,
  HeartIcon,
  Layers01Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
import { GithubIcon } from "@/components/icons/platform-icons"
import { Check, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BrandLogo } from "@/components/layout/brand-logo"
import Link from "@/components/ui/link"

export const ABOUT_FAQS = [
  {
    question: "What is Yozora?",
    answer:
      "Yozora (夜空) is a modern anime catalog, live broadcast radar, and soundtrack theme vault built for anime enthusiasts tracking seasonal television schedules and music archives.",
  },
  {
    question: "How does the Airing Radar track releases?",
    answer:
      "Airing times come from AniList and are shown as countdowns in Japan Standard Time (UTC+9).",
  },
  {
    question: "How does Yozora stay fast and reliable?",
    answer:
      "Catalog data comes from the AniList GraphQL API with automatic retries on rate limits, backed by a three-layer cache: per-isolate memory with single-flight deduplication, Cloudflare Workers edge caching, and CDN cache rules. Fail-open design means third-party downtime never interrupts the viewer.",
  },
  {
    question: "How are opening and ending themes sourced?",
    answer:
      "Themes and video sequences are provided through integration with the open AnimeThemes GraphQL archive, pairing creditless 1080p visual sequences with original artist credits and lossless audio playback.",
  },
  {
    question: "How does Yozora cache data for speed?",
    answer:
      "Yozora employs a two-tier caching architecture: L1 per-isolate in-memory LRU maps with single-flight deduplication to prevent stampedes, and L2 the Cloudflare Workers Cache API at the edge. All caching fails open so third-party downtime never interrupts the viewer.",
  },
  {
    question: "Is Yozora open source?",
    answer:
      "Yes. Yozora is open source and licensed under the MIT License. You can inspect the source code, contribute features, or deploy your own instance via GitHub.",
  },
  {
    question: "How does Yozora compare to AniList, MyAnimeList, and LiveChart?",
    answer:
      "Yozora combines Japanese broadcast countdowns, creditless opening and ending playback from AnimeThemes, and a personal watchlist in one ad-free site. Catalog data comes from AniList.",
  },
  {
    question: "Is Yozora completely free to use?",
    answer:
      "Yes. Yozora is 100% free and open-source under the MIT License with zero advertising, zero subscription paywalls, and no account requirements for exploring schedules and themes. See our pricing specification at /pricing.md.",
  },
  {
    question: "How can AI agents and researchers access Yozora data?",
    answer:
      "Yozora provides comprehensive machine-readable endpoints including quick LLM guidance at /llms.txt, full architectural schemas at /llms-full.txt, structured pricing at /pricing.md, and Google Open Knowledge Format bundles at /okf/index.md.",
  },
]

export function AboutPage() {
  return (
    <div className="container mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12 sm:px-6">
      <section className="flex flex-col items-center gap-6 text-center">
        <BrandLogo className="size-16" />
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-md">
            <span>Discover · Track · Listen</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            Anime Catalog &amp; Airing Radar
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-base">
            Yozora (夜空) was designed from the ground up for anime fans who
            value speed, precision broadcast timing, and beautiful presentation.
            Track seasonal broadcasts, countdown live Tokyo releases, and stream
            creditless 1080p themes in one unified place.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/airing" variant="button">
            <span>Explore Airing Radar</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
          </Link>
          <Link href="/seasonal" variant="button-outline">
            View Seasonal Chart
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: "Catalog Engine", value: "AniList" },
          { label: "Theme Sequences", value: "AnimeThemes" },
          { label: "Schedule Sync", value: "Tokyo JST" },
          { label: "Licensing", value: "MIT Open Source" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-2xl border border-border/50 bg-card/60 p-4 text-center sm:p-5"
          >
            <span className="font-mono text-lg font-black tracking-tight text-foreground sm:text-2xl">
              {stat.value}
            </span>
            <span className="text-xs font-medium text-muted-foreground sm:text-xs">
              {stat.label}
            </span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Core Features
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Everything you need to follow the season and enjoy anime media.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={FlashIcon}
            color="text-amber-500 bg-amber-500/10"
            title="Live Airing Radar"
            description="Episode countdowns synchronized with Japanese television broadcast schedules. Never miss an episode premiere."
          />
          <FeatureCard
            icon={Video02Icon}
            color="text-rose-500 bg-rose-500/10"
            title="1080p Theme Player"
            description="Creditless anime openings and endings with audio visualizer, playback rate controls, and picture-in-picture mode."
          />
          <FeatureCard
            icon={Layers01Icon}
            color="text-blue-500 bg-blue-500/10"
            title="Seasonal Catalog"
            description="Browse the anime currently airing this season, with genre, score, and format details on each title."
          />
          <FeatureCard
            icon={HeartIcon}
            color="text-emerald-500 bg-emerald-500/10"
            title="Personal Library"
            description="Organize watchlists into Watching, Completed, Planning, and Paused shelves with score ratings and rewatch counts."
          />
          <FeatureCard
            icon={CpuIcon}
            color="text-violet-500 bg-violet-500/10"
            title="Edge Caching"
            description="In-memory and Cloudflare Workers edge caching, so repeat visits don't wait on AniList."
          />
          <FeatureCard
            icon={Layers01Icon}
            color="text-indigo-500 bg-indigo-500/10"
            title="Command Palette"
            description="Keyboard-first navigation with Cmd + K to instantly search anime, jump to seasons, and toggle dark mode."
          />
        </div>
      </section>

      <section
        id="comparison"
        className="flex flex-col gap-6"
        aria-labelledby="comparison-heading"
      >
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
            Platform Matrix
          </span>
          <h2
            id="comparison-heading"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            How Yozora Compares
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Objective feature breakdown against established anime platforms.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/60">
          <table className="w-full min-w-160 text-left text-xs sm:text-sm">
            <caption className="sr-only">
              Feature comparison between Yozora, AniList, MyAnimeList, and
              LiveChart
            </caption>
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground">
                <th
                  scope="col"
                  className="p-4 font-semibold text-foreground sm:px-6"
                >
                  Feature
                </th>
                <th scope="col" className="p-4 font-bold text-primary sm:px-6">
                  Yozora (夜空)
                </th>
                <th scope="col" className="p-4 font-semibold sm:px-6">
                  AniList / MAL
                </th>
                <th scope="col" className="p-4 font-semibold sm:px-6">
                  LiveChart
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr>
                <th
                  scope="row"
                  className="p-4 font-medium text-foreground sm:px-6"
                >
                  Real-Time Airing Countdown
                </th>
                <td className="p-4 font-semibold text-foreground sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>Live Radar with Tokyo JST Sync</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground sm:px-6">
                  Static next-episode date only
                </td>
                <td className="p-4 sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>Countdown timer</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-4 font-medium text-foreground sm:px-6"
                >
                  1080p Creditless Theme Songs
                </th>
                <td className="p-4 font-semibold text-foreground sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>Integrated AnimeThemes Player</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground sm:px-6">
                  <div className="flex items-center gap-1.5">
                    <Minus className="size-4 shrink-0" aria-hidden="true" />
                    <span>Text title credits only</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground sm:px-6">
                  <div className="flex items-center gap-1.5">
                    <Minus className="size-4 shrink-0" aria-hidden="true" />
                    <span>YouTube links when available</span>
                  </div>
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-4 font-medium text-foreground sm:px-6"
                >
                  High Availability &amp; Resilience
                </th>
                <td className="p-4 font-semibold text-foreground sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>3-Layer Cache + Fail-Open Design</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground sm:px-6">
                  Single provider; frequent 429/maintenance
                </td>
                <td className="p-4 text-muted-foreground sm:px-6">
                  Single provider
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-4 font-medium text-foreground sm:px-6"
                >
                  Advertising &amp; Tracking
                </th>
                <td className="p-4 font-semibold text-foreground sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>Zero Ads · Zero Trackers</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground sm:px-6">
                  Commercial ads &amp; trackers
                </td>
                <td className="p-4 sm:px-6">
                  Banner ads &amp; affiliate trackers
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-4 font-medium text-foreground sm:px-6"
                >
                  Licensing &amp; Open Access
                </th>
                <td className="p-4 font-semibold text-foreground sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>100% Free · MIT License</span>
                  </div>
                </td>
                <td className="p-4 sm:px-6">Proprietary / Closed</td>
                <td className="p-4 sm:px-6">Proprietary / Closed</td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="p-4 font-medium text-foreground sm:px-6"
                >
                  Watchlist &amp; Profile Synchronization
                </th>
                <td className="p-4 font-semibold text-foreground sm:px-6">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                    <span>Clerk auth + PostgreSQL</span>
                  </div>
                </td>
                <td className="p-4 sm:px-6">Native platform account only</td>
                <td className="p-4 sm:px-6">Proprietary account only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="rounded-xl border border-border/40 bg-background/50 p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <strong className="text-foreground">Bottom line:</strong> Yozora
          uniquely unifies real-time Japanese television broadcast countdowns,
          lossless 1080p creditless theme streaming, and resilient catalog
          caching into a single responsive, ad-free web platform licensed under
          the MIT License.
        </p>
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

        <Accordion defaultValue={["faq-0"]}>
          {ABOUT_FAQS.map((faq, idx) => (
            <AccordionItem key={faq.question} value={`faq-${idx}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border/50 bg-card/60 p-6 sm:flex-row sm:p-8">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3 className="text-base font-bold text-foreground sm:text-lg">
            Open Source &amp; Community Driven
          </h3>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Built with Astro, Cloudflare Workers, Vite, Tailwind CSS v4, Base
            UI, Drizzle ORM, and Neon PostgreSQL. Contributor pull requests and
            feedback are welcome.
          </p>
        </div>

        <a
          href="https://github.com/shiinasaku/yozora"
          target="_blank"
          rel="noopener noreferrer"
          className="interactive-press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background shadow-xs transition-opacity hover:opacity-90"
        >
          <GithubIcon className="size-4 shrink-0" />
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
    <Card variant="large" size="lg">
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
