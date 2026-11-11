import * as React from "react"
import Link from "@/components/ui/link"
import {
  Carousel,
  CarouselAutoplayToggle,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import { HugeiconsIcon } from "@hugeicons/react"
import { Play } from "lucide-react"
import { Add01Icon, StarIcon, Video02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { TrailerDialog } from "./trailer-dialog"
import type { Anime } from "@/lib/types/anime"
import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/motion"
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
}: {
  anime: Anime
  isActive: boolean
  index: number
}) {
  const cover = anime.coverExtraLarge || anime.coverLarge || anime.cover
  const hasBanner = Boolean(anime.banner)
  const isFirst = index === 0

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {hasBanner ? (
        <picture>
          <source media="(min-width: 640px)" srcSet={anime.banner} />
          <img
            src={cover}
            alt={anime.title}
            decoding={isFirst ? "sync" : "async"}
            draggable={false}
            fetchPriority={isFirst ? "high" : "low"}
            loading={index < 2 ? "eager" : "lazy"}
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
            decoding={isFirst ? "sync" : "async"}
            draggable={false}
            fetchPriority={isFirst ? "high" : "low"}
            loading={index < 2 ? "eager" : "lazy"}
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
              className="max-h-5/6 rounded-2xl object-cover shadow-2xl"
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
      <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-zinc-950/85 via-zinc-950/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-zinc-950/80 via-zinc-950/30 to-transparent" />

      {/* Consistent uniform dimming layer for peeking cards */}
      <div
        className={cn(
          "absolute inset-0 bg-zinc-950/65 backdrop-blur-xs transition-opacity duration-300",
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
  const { selectedIndex } = useCarousel()
  const isActive = selectedIndex === index

  return (
    <div
      className={cn(
        "relative size-full",
        !isActive && "pointer-events-none"
      )}
      aria-hidden={!isActive || undefined}
    >
      <SpotlightArtwork anime={anime} index={index} isActive={isActive} />

      {/* Rating badge */}
      {anime.score > 0 && (
        <div className="pointer-events-none absolute top-4 right-4 z-10 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-xs font-semibold text-amber-400 shadow-sm backdrop-blur-md transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0"
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
          isActive
            ? "opacity-100 duration-500"
            : "pointer-events-none opacity-0"
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
            tabIndex={isActive ? 0 : -1}
            variant="title"
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
            tabIndex={isActive ? 0 : -1}
            aria-label={`Watch overview for ${anime.title}`}
            variant="button-white"
            className={cn(!isActive && "pointer-events-none")}
          >
            <Play
              className="size-3.5 shrink-0 fill-current"
              stroke="none"
              data-icon="inline-start"
              aria-hidden="true"
            />
            <span>Watch Overview</span>
          </Link>

          {onSaveClick && (
            <div className="interactive-press">
              <Button
                variant="glass"
                size="lg"
                tabIndex={isActive ? 0 : -1}
                aria-label={`Add to Watchlist: ${anime.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSaveClick(anime)
                }}
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
            </div>
          )}

          {anime.trailer && (
            <div className="interactive-press">
              <Button
                type="button"
                variant="glass-dark"
                size="lg"
                tabIndex={isActive ? 0 : -1}
                aria-label={`Watch trailer: ${anime.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenTrailer(anime)
                }}
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
            </div>
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
  const [api, setApi] = React.useState<CarouselApi | null>(null)

  // Hold autoplay while the trailer dialog is up, resume on close.
  React.useEffect(() => {
    if (!api || items.length < 2) {
      return
    }
    if (trailerOpen) {
      api.stop()
    } else if (!prefersReducedMotion()) {
      api.play()
    }
  }, [api, trailerOpen, items.length])

  if (items.length === 0) {
    return null
  }

  const openTrailer = (anime: Anime) => {
    setSelectedTrailerAnime(anime)
    setTrailerOpen(true)
  }

  return (
    <section className="relative w-full">
      <Carousel
        autoplay={{ delay: 6000 }}
        setApi={setApi}
        spacing="lg"
        className="@container w-full"
      >
        <CarouselContent>
          {items.map((anime, index) => (
            <CarouselItem
              key={anime.id}
              className="relative h-120 spotlight-slide-basis snap-center lg:h-135 xl:h-145 @max-3xl:h-120 sm:@max-3xl:h-125"
            >
              <div className="dark relative size-full overflow-hidden rounded-3xl bg-zinc-950 text-white select-none ring-1 ring-black/20 shadow-xl shadow-black/25 transition-all duration-500 hover:ring-white/25 sm:rounded-4xl">
                <SpotlightSlideCard
                  anime={anime}
                  index={index}
                  onSaveClick={onSaveClick}
                  onOpenTrailer={openTrailer}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <div className="flex items-center rounded-full border border-border/40 bg-muted/60 px-4 py-2 shadow-xs backdrop-blur-md">
              <CarouselDots aria-label="Spotlight featured anime slides" />
            </div>
            <CarouselAutoplayToggle variant="outline" size="icon-lg" />
          </div>
        )}
      </Carousel>

      <TrailerDialog
        trailer={selectedTrailerAnime?.trailer}
        title={selectedTrailerAnime?.title ?? ""}
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
      />
    </section>
  )
}
