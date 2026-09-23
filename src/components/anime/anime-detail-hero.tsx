import Image from "@/components/ui/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, StarIcon, Video02Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/ui/share-button"
import { getAnimeUrl } from "@/lib/utils/slug"
import type { Anime } from "@/lib/types/anime"

interface AnimeDetailHeroProps {
  anime: Anime
  onSaveClick: () => void
  onTrailerClick?: () => void
}

export function AnimeDetailHero({
  anime,
  onSaveClick,
  onTrailerClick,
}: AnimeDetailHeroProps) {
  return (
    <div className="relative w-full overflow-hidden border-b border-border/50 bg-background">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {anime.banner ? (
          <>
            <Image
              src={anime.banner}
              alt={anime.title}
              fill
              quality={90}
              priority
              sizes="100vw"
              variant="heroBanner"
            />
            <div className="absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-background/90 via-background/40 to-transparent" />
            <div className="absolute inset-0 z-10 hidden bg-linear-to-r from-background via-background/55 to-transparent md:block" />
            <div className="absolute inset-0 z-10 bg-linear-to-t from-background via-background/55 to-transparent dark:via-background/70" />
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-20 mix-blend-multiply dark:opacity-35 dark:mix-blend-screen"
              style={{
                background: `radial-gradient(circle 800px at 70% 20%, ${anime.accent}45, transparent 70%)`,
              }}
            />
          </>
        ) : (
          <>
            <Image
              src={anime.coverExtraLarge || anime.coverLarge || anime.cover}
              alt=""
              fill
              quality={85}
              priority
              sizes="100vw"
              variant="heroBlur"
            />
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-multiply dark:opacity-45 dark:mix-blend-color-dodge"
              style={{
                background: `radial-gradient(ellipse 90% 70% at 50% 20%, ${anime.accent}50, transparent 80%)`,
              }}
            />
            <div className="absolute inset-0 z-10 bg-linear-to-t from-background via-background/80 to-background/30" />
            <div className="absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-background/90 via-background/50 to-transparent" />
          </>
        )}
      </div>

      <div className="relative z-10 container mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 pt-8 pb-8 text-center sm:gap-8 sm:px-6 sm:pt-14 sm:pb-12 md:flex-row md:items-start md:text-left lg:gap-10">
        <div
          className="relative h-64 w-44 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-muted shadow-2xl transition-transform duration-300 hover:scale-105 sm:h-84 sm:w-60 dark:border-white/15"
          style={{
            boxShadow: `0 25px 50px -12px ${anime.accent}40, 0 0 0 1px rgba(255,255,255,0.12)`,
          }}
        >
          <Image
            src={anime.coverLarge || anime.cover}
            alt={anime.title}
            fill
            quality={90}
            sizes="(max-width: 640px) 176px, 240px"
            className="object-cover"
          />
          {anime.score > 0 && (
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/75 px-2.5 py-1 text-xs font-black text-amber-400 shadow-xs backdrop-blur-md sm:text-sm">
              <HugeiconsIcon
                icon={StarIcon}
                size={14}
                strokeWidth={2.5}
                className="fill-amber-400 text-amber-400"
              />
              <span>{anime.score.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex max-w-3xl flex-1 flex-col items-center gap-3 sm:gap-4 md:items-start">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Badge variant="hero">{anime.format || "TV"}</Badge>
            {anime.status && (
              <Badge variant="secondary">
                {anime.status.charAt(0).toUpperCase() +
                  anime.status.slice(1).toLowerCase().replace("_", " ")}
              </Badge>
            )}
            <span className="font-mono text-xs font-semibold text-muted-foreground/90">
              {anime.year}
              {anime.episodes ? ` · ${anime.episodes} eps` : ""}
              {anime.duration ? ` · ${anime.duration}m` : ""}
            </span>
          </div>

          <h1 className="text-2xl leading-tight font-black tracking-tight text-balance text-foreground sm:text-4xl md:text-5xl">
            {anime.title}
          </h1>

          {(anime.subtitle || anime.titles?.native) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted-foreground/90 sm:text-base md:justify-start">
              {anime.subtitle && (
                <span className="line-clamp-1">{anime.subtitle}</span>
              )}
              {anime.subtitle && anime.titles?.native && (
                <span className="opacity-40">·</span>
              )}
              {anime.titles?.native && (
                <span className="font-japanese text-xs tracking-wide text-muted-foreground/75 sm:text-sm">
                  {anime.titles.native}
                </span>
              )}
            </div>
          )}

          {anime.studios && anime.studios.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/90">
              <HugeiconsIcon
                icon={Video02Icon}
                size={15}
                strokeWidth={2}
                className="text-primary"
              />
              <span>
                Studio:{" "}
                <strong className="font-semibold text-foreground">
                  {anime.studios.join(", ")}
                </strong>
              </span>
            </div>
          )}

          <div className="flex w-full flex-col items-stretch gap-2.5 pt-3 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:pt-4">
            <div className="interactive-press">
              <Button size="hero" onClick={onSaveClick}>
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={17}
                  strokeWidth={2.5}
                  data-icon="inline-start"
                />
                Track in Watchlist
              </Button>
            </div>

            {anime.trailer && onTrailerClick && (
              <div className="interactive-press">
                <Button
                  variant="hero-outline"
                  size="hero"
                  onClick={onTrailerClick}
                >
                  <HugeiconsIcon
                    icon={Video02Icon}
                    size={17}
                    strokeWidth={2}
                    data-icon="inline-start"
                    className="text-primary"
                  />
                  Watch Trailer
                </Button>
              </div>
            )}

            <ShareButton
              title={anime.title}
              text={`Discover ${anime.title} on Yozora!`}
              url={getAnimeUrl(anime)}
              size="lg"
              variant="outline"
              showLabel
            />
          </div>
        </div>
      </div>
    </div>
  )
}
