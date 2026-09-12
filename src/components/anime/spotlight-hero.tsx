import * as React from "react"
import Link from "@/components/ui/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
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
 * Responsive hero artwork. On phones the portrait poster is shown crisp
 * (ultra-wide banners crop badly on tall screens); from `md` up the cinematic
 * banner fills the frame. Uses `<picture>` so only one source is downloaded.
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

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {hasBanner ? (
        <picture>
          <source media="(min-width: 768px)" srcSet={anime.banner} />
          <img
            src={cover}
            alt={anime.title}
            decoding="async"
            draggable={false}
            fetchPriority={index === 0 ? "high" : "low"}
            loading={index < 2 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 size-full transform-gpu object-cover object-center transition-transform duration-700 ease-out",
              isActive ? "scale-100" : "scale-[1.04]"
            )}
          />
        </picture>
      ) : (
        <img
          src={cover}
          alt={anime.title}
          decoding="async"
          draggable={false}
          fetchPriority={index === 0 ? "high" : "low"}
          loading={index < 2 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 size-full scale-110 object-cover object-center opacity-60 blur-2xl",
            isActive ? "scale-110" : "scale-125"
          )}
        />
      )}

      {/* Dynamic accent lighting */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 75% 25%, ${anime.accent || "#6366f1"}55, transparent 70%)`,
        }}
      />
      {/* Readability scrims — stronger on phones where the poster is vertical */}
      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/10" />
      <div className="absolute inset-0 w-full bg-linear-to-r from-zinc-950 via-zinc-950/85 to-transparent md:w-3/4" />
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-zinc-950/80 via-zinc-950/30 to-transparent" />
    </div>
  )
}

/**
 * Desktop-only carousel controls. Rendered through `useCarousel` so the
 * styling is fully controlled (Button's cva output is not tailwind-merged).
 */
function SpotlightArrows() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()

  const base =
    "absolute top-1/2 z-20 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-[background-color,opacity] duration-150 hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none disabled:cursor-default disabled:opacity-35 sm:flex"

  return (
    <>
      <button
        type="button"
        aria-label="Previous slide"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(base, "left-3")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(base, "right-3")}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
      </button>
    </>
  )
}

export function SpotlightHero({ items, onSaveClick }: SpotlightHeroProps) {
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [trailerOpen, setTrailerOpen] = React.useState(false)
  const [selectedTrailerAnime, setSelectedTrailerAnime] =
    React.useState<Anime | null>(null)
  const [isInView, setIsInView] = React.useState(true)
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  const autoplayPlugin = React.useMemo(
    () =>
      Autoplay({
        delay: 6000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    []
  )

  React.useEffect(() => {
    if (!carouselApi) return
    const onSelect = (api: NonNullable<CarouselApi>) =>
      setSelectedIndex(api.selectedScrollSnap())
    onSelect(carouselApi)
    carouselApi.on("select", onSelect)
    carouselApi.on("reInit", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
      carouselApi.off("reInit", onSelect)
    }
  }, [carouselApi])

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefersReducedMotion(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  React.useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const update = () => setIsDocumentHidden(document.hidden)
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  React.useEffect(() => {
    const autoplay = carouselApi?.plugins().autoplay as
      { stop: () => void; play: () => void } | undefined
    if (!autoplay) return

    const shouldPlay =
      !trailerOpen && isInView && !isDocumentHidden && !prefersReducedMotion
    if (shouldPlay) {
      autoplay.play()
    } else {
      autoplay.stop()
    }
  }, [
    carouselApi,
    trailerOpen,
    isInView,
    isDocumentHidden,
    prefersReducedMotion,
  ])

  if (items.length === 0) {
    return null
  }

  const openTrailer = (anime: Anime) => {
    setSelectedTrailerAnime(anime)
    setTrailerOpen(true)
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Spotlight Trending Anime"
      className="relative w-full"
    >
      <Carousel
        setApi={setCarouselApi}
        opts={{ loop: items.length > 1, align: "center", skipSnaps: false }}
        plugins={[autoplayPlugin]}
        className="w-full"
      >
        <div className="relative">
          <CarouselContent className="py-1">
            {items.map((anime, index) => {
              const isActive = index === selectedIndex

              return (
                <CarouselItem
                  key={anime.id}
                  className="basis-[92%] sm:basis-[88%] lg:basis-[82%] xl:basis-[78%]"
                >
                  <div
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${items.length}: ${anime.title}`}
                    onClick={() => !isActive && carouselApi?.scrollTo(index)}
                    className={cn(
                      "relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-3xl border bg-zinc-950 text-white transition-[opacity,border-color] duration-500 sm:aspect-[3/2] lg:aspect-[21/9]",
                      isActive
                        ? "border-border/40 opacity-100"
                        : "border-border/20 opacity-60 hover:opacity-90"
                    )}
                  >
                    <SpotlightArtwork
                      anime={anime}
                      index={index}
                      isActive={isActive}
                    />

                    {anime.score > 0 && (
                      <div className="pointer-events-none relative z-10 flex items-center justify-end p-4 pb-0 sm:p-7 lg:p-10">
                        <span
                          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-xs text-amber-400 backdrop-blur-md"
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

                    <div className="absolute inset-x-0 bottom-0 z-10 flex max-w-2xl flex-col items-start gap-2.5 p-4 sm:gap-3.5 sm:p-7 lg:p-10">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                        <span>{anime.year}</span>
                        {anime.episodes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{anime.episodes} Episodes</span>
                          </>
                        )}
                        {anime.studios && anime.studios.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="max-w-40 truncate text-zinc-200">
                              {anime.studios[0]}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="line-clamp-2 text-2xl leading-tight font-black tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                        {anime.title}
                      </h2>

                      {anime.description && (
                        <p className="line-clamp-2 max-w-xl text-xs leading-relaxed text-zinc-300 drop-shadow-sm sm:text-sm">
                          {anime.description}
                        </p>
                      )}

                      {anime.tags.length > 0 && (
                        <div
                          className="hidden flex-wrap gap-1.5 pt-0.5 sm:flex"
                          aria-label="Genre tags"
                        >
                          {anime.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md border border-white/20 bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white shadow-2xs backdrop-blur-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1.5 sm:gap-3">
                        <Link
                          href={getAnimeUrl(anime)}
                          onClick={(e) => !isActive && e.preventDefault()}
                          tabIndex={isActive ? 0 : -1}
                          aria-label={`Watch overview for ${anime.title}`}
                          className={cn(
                            buttonVariants({ variant: "default", size: "lg" }),
                            "interactive-press h-10 gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-zinc-950 shadow-xl hover:bg-zinc-200 sm:h-11 sm:px-5 sm:text-sm",
                            !isActive && "pointer-events-none opacity-50"
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
                            disabled={!isActive}
                            aria-label={`Add to Watchlist: ${anime.title}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSaveClick(anime)
                            }}
                            className="interactive-press h-10 gap-2 rounded-2xl border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 sm:h-11 sm:px-4 sm:text-sm"
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
                            disabled={!isActive}
                            aria-label={`Trailer: ${anime.title}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              openTrailer(anime)
                            }}
                            className="interactive-press h-10 gap-1.5 rounded-2xl px-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white sm:h-11 sm:px-3.5"
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
                </CarouselItem>
              )
            })}
          </CarouselContent>
          {items.length > 1 && <SpotlightArrows />}
        </div>

        {items.length > 1 && (
          <div
            role="group"
            aria-label="Spotlight slide selection"
            className="mt-4 flex items-center justify-center gap-2"
          >
            {items.map((anime, index) => (
              <button
                key={anime.id}
                type="button"
                aria-current={index === selectedIndex ? "true" : undefined}
                aria-label={`Go to slide ${index + 1} of ${items.length}: ${anime.title}`}
                onClick={() => carouselApi?.scrollTo(index)}
                className="group flex size-7 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === selectedIndex
                      ? "w-7 bg-primary"
                      : "w-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                  )}
                />
              </button>
            ))}
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
