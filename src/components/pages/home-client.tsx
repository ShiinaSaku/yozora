import * as React from "react"
import Image from "@/components/ui/image"
import Link from "@/components/ui/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Calendar03Icon,
  FireIcon,
  RadioIcon,
  TrophyIcon,
} from "@hugeicons/core-free-icons"
import { AnimeCard } from "@/components/anime/anime-card"
import { SpotlightHero } from "@/components/anime/spotlight-hero"
import { SaveDialog } from "@/components/anime/save-dialog"
import type { AiringScheduleItem, Anime } from "@/lib/types/anime"
import { getAnimeUrl } from "@/lib/utils/slug"

interface HomePageClientProps {
  trending: Anime[]
  seasonal: Anime[]
  popular: Anime[]
  /**
   * Rendered airing radar slot. Streamed via `<Await />` in the route so
   * deferred data can hydrate without blocking the critical sections.
   */
  airingSlot?: React.ReactNode
}

export function HomePageClient({
  trending = [],
  seasonal = [],
  popular = [],
  airingSlot = null,
}: HomePageClientProps) {
  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)

  const handleSave = (anime: Anime) => {
    setSelectedAnime(anime)
    setSaveOpen(true)
  }

  return (
    <div
      id="home-main-container"
      className="container mx-auto flex max-w-7xl flex-col gap-14 px-4 py-6 sm:px-6"
    >
      {trending.length > 0 && (
        <SpotlightHero items={trending.slice(0, 5)} onSaveClick={handleSave} />
      )}

      <section
        id="trending-anime-section"
        aria-labelledby="trending-heading"
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <HugeiconsIcon
                icon={FireIcon}
                size={18}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="trending-heading"
                className="text-xl font-bold tracking-tight text-foreground"
              >
                Trending Now
              </h2>
              <p className="text-xs text-muted-foreground">
                Most popular series in the global anime community this week
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trending.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onSaveClick={handleSave} />
          ))}
        </div>
      </section>

      <section
        id="seasonal-anime-section"
        aria-labelledby="seasonal-heading"
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <HugeiconsIcon
                icon={Calendar03Icon}
                size={18}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="seasonal-heading"
                className="text-xl font-bold tracking-tight text-foreground"
              >
                Current Season
              </h2>
              <p className="text-xs text-muted-foreground">
                Top broadcasting series from the current anime season
              </p>
            </div>
          </div>
          <Link
            id="view-all-seasonal-link"
            href="/seasonal"
            className="group flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View Seasonal Chart</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {seasonal.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onSaveClick={handleSave} />
          ))}
        </div>
      </section>

      {airingSlot}

      <section
        id="popular-anime-section"
        aria-labelledby="popular-heading"
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <HugeiconsIcon
                icon={TrophyIcon}
                size={18}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="popular-heading"
                className="text-xl font-bold tracking-tight text-foreground"
              >
                All-Time Popular
              </h2>
              <p className="text-xs text-muted-foreground">
                Legendary titles with the largest worldwide community followings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {popular.slice(0, 12).map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onSaveClick={handleSave} />
          ))}
        </div>
      </section>

      <SaveDialog
        anime={selectedAnime}
        open={saveOpen}
        onOpenChange={setSaveOpen}
      />
    </div>
  )
}

/**
 * Real-time airing radar section rendered inside the deferred slot on the home page.
 */
export function AiringRadarSection({ items }: { items: AiringScheduleItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      id="airing-radar-section"
      aria-labelledby="airing-radar-heading"
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
            <HugeiconsIcon
              icon={RadioIcon}
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div>
            <h2
              id="airing-radar-heading"
              className="text-xl font-bold tracking-tight text-foreground"
            >
              Airing Radar
            </h2>
            <p className="text-xs text-muted-foreground">
              Live broadcasting countdowns for today and upcoming days
            </p>
          </div>
        </div>
        <Link
          id="view-full-schedule-link"
          href="/airing"
          className="group flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>Full Schedule</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={14}
            strokeWidth={2}
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            id={`airing-radar-item-${item.id}`}
            href={getAnimeUrl(item.media)}
            className="group flex items-center gap-3.5 rounded-2xl border border-border/40 bg-card p-3 transition-[background-color,border-color,transform] duration-150 hover:border-border hover:bg-muted/50 active:scale-98"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
              <Image
                src={item.media.coverMedium || item.media.cover}
                alt={item.media.title}
                fill
                unoptimized
                sizes="56px"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary sm:text-sm">
                {item.media.title}
              </span>
              <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                Episode {item.episode}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
