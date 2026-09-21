import * as React from "react"
import Link from "@/components/ui/link"
import {
  AppleCarouselContent,
  AppleCarouselControls,
  AppleCarouselItem,
  AppleCarouselPlayButton,
  AppleCarouselRoot,
  AppleCarouselTab,
  AppleCarouselTabList,
  useAppleCarouselItem,
} from "@/components/apple-carousel"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  PlayIcon,
  StarIcon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { TrailerDialog } from "./trailer-dialog"
import type { Anime } from "@/lib/types/anime"
import { cn } from "@/lib/utils"
import { getAnimeUrl } from "@/lib/utils/slug"

interface SpotlightHeroProps {
  items: Anime[]
  onSaveClick?: (anime: Anime) => void
}

/**
 * Responsive hero artwork with ambient lighting and directional readability scrims.
 * Uses `<picture>` to serve high-res horizontal banners on tablets/desktops and
 * vertical covers on phones.
 */
function SpotlightArtwork({
  anime,
  isActive,
  index,
  isClone,
}: {
  anime: Anime
  isActive: boolean
  index: number
  isClone: boolean
}) {
  const cover = anime.coverExtraLarge || anime.coverLarge || anime.cover
  const hasBanner = Boolean(anime.banner)

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {hasBanner ? (
        <picture>
          <source media="(min-width: 640px)" srcSet={anime.banner} />
          <img
            src={cover}
            alt={anime.title}
            decoding="async"
            draggable={false}
            fetchPriority={!isClone && index === 0 ? "high" : "low"}
            loading={!isClone && index < 2 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 size-full transform-gpu object-cover object-center transition-transform duration-700 ease-out select-none",
              isActive ? "scale-100" : "scale-105"
            )}
          />
        </picture>
      ) : (
        <>
          <img
            src={cover}
            alt={anime.title}
            decoding="async"
            draggable={false}
            fetchPriority={!isClone && index === 0 ? "high" : "low"}
            loading={!isClone && index < 2 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 size-full scale-110 object-cover object-center opacity-40 blur-2xl transition-transform duration-700 ease-out select-none",
              isActive ? "scale-110" : "scale-120"
            )}
          />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center p-8 sm:flex">
            <img
              src={cover}
              alt={anime.title}
              decoding="async"
              draggable={false}
              className="max-h-[85%] rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </>
      )}

      {/* Dynamic accent lighting */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 75% 25%, ${anime.accent || "#6366f1"}55, transparent 70%)`,
        }}
      />

      {/* Readability scrims */}
      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/10" />
      <div className="absolute inset-0 w-full bg-linear-to-r from-zinc-950 via-zinc-950/85 to-transparent md:w-3/4" />
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-zinc-950/80 via-zinc-950/30 to-transparent" />

      {/* Subtle dimming layer for peeking cards */}
      <div
        className={cn(
          "absolute inset-0 bg-black/35 transition-opacity duration-300",
          isActive ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  )
}

/**
 * Slide card content with reactive active/peeking states.
 */
function SpotlightSlideCard({
  anime,
  index,
  onSaveClick,
  onOpenTrailer,
}: {
  anime: Anime
  index: number
  onSaveClick?: (anime: Anime) => void
  onOpenTrailer: (anime: Anime) => void
}) {
  const { isCurrent, isClone } = useAppleCarouselItem()

  return (
    <div className="relative size-full">
      <SpotlightArtwork
        anime={anime}
        index={index}
        isActive={isCurrent}
        isClone={isClone}
      />

      {/* Rating badge */}
      {anime.score > 0 && (
        <div className="pointer-events-none absolute top-4 right-4 z-10 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-xs font-semibold text-amber-400 shadow-sm backdrop-blur-md transition-opacity duration-300",
              isCurrent ? "opacity-100" : "opacity-60"
            )}
            aria-label={`Rating: ${anime.score.toFixed(1)} out of 10`}
          >
            <HugeiconsIcon
              icon={StarIcon}
              size={13}
              strokeWidth={2}
              className="fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            {anime.score.toFixed(1)}
          </span>
        </div>
      )}

      {/* Information overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 flex max-w-2xl flex-col items-start gap-2.5 p-5 sm:gap-3.5 sm:p-8 lg:p-10",
          "transition-opacity duration-300 ease-out",
          isCurrent ? "opacity-100 duration-500" : "opacity-40"
        )}
      >
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
          {anime.year && <span>{anime.year}</span>}
          {anime.episodes && (
            <>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span>{anime.episodes} Episodes</span>
            </>
          )}
          {anime.studios && anime.studios.length > 0 && (
            <>
              <span aria-hidden="true" className="text-zinc-600">
                ·
              </span>
              <span className="max-w-44 truncate text-zinc-200">
                {anime.studios[0]}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="line-clamp-2 text-2xl leading-tight font-black tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
          <Link
            href={getAnimeUrl(anime)}
            tabIndex={isCurrent ? 0 : -1}
            className="rounded-lg transition-colors hover:text-white/90 focus-visible:outline-2 focus-visible:outline-ring"
          >
            {anime.title}
          </Link>
        </h2>

        {/* Description */}
        {anime.description && (
          <p className="line-clamp-2 max-w-xl text-xs leading-relaxed text-pretty text-zinc-300 drop-shadow-sm sm:text-sm">
            {anime.description}
          </p>
        )}

        {/* Genre tags */}
        {anime.tags.length > 0 && (
          <div
            className="hidden flex-wrap gap-1.5 pt-0.5 sm:flex"
            aria-label="Genre tags"
          >
            {anime.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white shadow-2xs backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1.5 sm:gap-3">
          <Link
            href={getAnimeUrl(anime)}
            tabIndex={isCurrent ? 0 : -1}
            aria-label={`Watch overview for ${anime.title}`}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "interactive-press h-10 gap-2 rounded-full bg-white px-5 text-xs font-bold text-zinc-950 shadow-xl transition-transform hover:bg-zinc-200 active:scale-97 sm:h-11 sm:px-6 sm:text-sm",
              !isCurrent && "pointer-events-none"
            )}
          >
            <HugeiconsIcon
              icon={PlayIcon}
              size={16}
              strokeWidth={2.5}
              className="fill-current"
              data-icon="inline-start"
              aria-hidden="true"
            />
            Watch Overview
          </Link>

          {onSaveClick && (
            <Button
              variant="outline"
              size="lg"
              tabIndex={isCurrent ? 0 : -1}
              aria-label={`Add to Watchlist: ${anime.title}`}
              onClick={(e) => {
                e.stopPropagation()
                onSaveClick(anime)
              }}
              className="interactive-press h-10 gap-2 rounded-full border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur-md transition-transform hover:bg-white/20 active:scale-97 sm:h-11 sm:px-5 sm:text-sm"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={16}
                strokeWidth={2}
                data-icon="inline-start"
                aria-hidden="true"
              />
              Add to Watchlist
            </Button>
          )}

          {anime.trailer && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              tabIndex={isCurrent ? 0 : -1}
              aria-label={`Watch trailer: ${anime.title}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenTrailer(anime)
              }}
              className="interactive-press h-10 gap-1.5 rounded-full border border-white/10 bg-black/30 px-3.5 text-xs font-semibold text-zinc-200 backdrop-blur-md transition-transform hover:bg-white/15 hover:text-white active:scale-97 sm:h-11 sm:px-4"
            >
              <HugeiconsIcon
                icon={Video02Icon}
                size={15}
                strokeWidth={2}
                data-icon="inline-start"
                aria-hidden="true"
              />
              Trailer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SpotlightHero({ items, onSaveClick }: SpotlightHeroProps) {
  const [trailerOpen, setTrailerOpen] = React.useState(false)
  const [selectedTrailerAnime, setSelectedTrailerAnime] =
    React.useState<Anime | null>(null)

  if (items.length === 0) {
    return null
  }

  const openTrailer = (anime: Anime) => {
    setSelectedTrailerAnime(anime)
    setTrailerOpen(true)
  }

  return (
    <section aria-label="Spotlight Trending Anime" className="relative w-full">
      <AppleCarouselRoot
        duration={6000}
        paused={trailerOpen}
        className="w-full"
      >
        <AppleCarouselContent>
          {items.map((anime, index) => (
            <AppleCarouselItem
              key={anime.id}
              tabIndex={-1}
              className="dark relative h-[480px] w-(--apple-carousel-item-width) snap-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 text-white shadow-2xl transition-[border-color,box-shadow] duration-500 select-none hover:border-white/20 sm:rounded-4xl lg:h-[540px] xl:h-[580px] @max-3xl:h-[480px] sm:@max-3xl:h-[500px]"
            >
              <SpotlightSlideCard
                anime={anime}
                index={index}
                onSaveClick={onSaveClick}
                onOpenTrailer={openTrailer}
              />
            </AppleCarouselItem>
          ))}
        </AppleCarouselContent>

        {items.length > 1 && (
          <AppleCarouselControls className="pt-6">
            <AppleCarouselTabList
              aria-label="Spotlight featured anime slides"
              className="border border-border/40 shadow-xs backdrop-blur-md"
            >
              {items.map((anime) => (
                <AppleCarouselTab key={anime.id}>
                  {anime.title}
                </AppleCarouselTab>
              ))}
            </AppleCarouselTabList>
            <AppleCarouselPlayButton className="border border-border/40 shadow-xs backdrop-blur-md" />
          </AppleCarouselControls>
        )}
      </AppleCarouselRoot>

      <TrailerDialog
        trailer={selectedTrailerAnime?.trailer}
        title={selectedTrailerAnime?.title ?? ""}
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
      />
    </section>
  )
}
