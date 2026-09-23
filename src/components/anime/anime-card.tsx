import Image from "@/components/ui/image"
import Link from "@/components/ui/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, StarIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAnimeUrl } from "@/lib/utils/slug"
import type { Anime } from "@/lib/types/anime"

interface AnimeCardProps {
  anime: Anime
  onSaveClick?: (anime: Anime) => void
  showProgress?: boolean
  progress?: number
  totalEpisodes?: number
}

function getCoverSrcSet(anime: Anime) {
  const candidates = [
    anime.coverMedium && `${anime.coverMedium} 100w`,
    anime.coverLarge && `${anime.coverLarge} 230w`,
    anime.coverExtraLarge && `${anime.coverExtraLarge} 460w`,
  ].filter(Boolean)

  return candidates.length > 1 ? candidates.join(", ") : undefined
}

export function AnimeCard({
  anime,
  onSaveClick,
  showProgress,
  progress = 0,
  totalEpisodes,
}: AnimeCardProps) {
  const animeHref = getAnimeUrl(anime)

  return (
    <Card id={`anime-card-${anime.id}`} variant="interactive" size="none">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
        <Link
          href={animeHref}
          aria-label={anime.title}
          className="absolute inset-0 block size-full"
        >
          <Image
            variant="zoom"
            src={anime.coverLarge || anime.cover}
            srcSet={getCoverSrcSet(anime)}
            alt={anime.title}
            width={230}
            height={345}
            fill
            quality={85}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />

          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        </Link>

        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
          {anime.format && <Badge variant="overlay">{anime.format}</Badge>}
        </div>

        {anime.score > 0 && (
          <div className="pointer-events-none absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs font-bold text-amber-500 backdrop-blur-md">
            <HugeiconsIcon
              icon={StarIcon}
              size={12}
              strokeWidth={2.5}
              className="fill-amber-500 text-amber-500"
            />
            <span>{anime.score.toFixed(1)}</span>
          </div>
        )}

        {onSaveClick && (
          <div className="absolute right-2.5 bottom-2.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              size="icon-sm"
              variant="overlay"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSaveClick(anime)
              }}
              aria-label={`Add to Watchlist: ${anime.title}`}
            >
              <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2.5} />
            </Button>
          </div>
        )}

        {showProgress && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round(((progress || 0) / (totalEpisodes || anime.episodes || 1)) * 100))}%`,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <Link href={animeHref}>
            <h3 className="line-clamp-2 text-sm leading-tight font-semibold text-foreground transition-colors group-hover:text-primary">
              {anime.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {anime.year} {anime.episodes ? `· ${anime.episodes} eps` : ""}
          </p>
        </div>

        {anime.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {anime.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold text-foreground/85 transition-colors group-hover:text-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export function AnimeCardSkeleton() {
  return (
    <Card variant="shimmer" size="none">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted/60" />
      <div className="flex flex-1 flex-col justify-between gap-2.5 p-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-4/5 rounded-md bg-muted/80" />
          <div className="h-3 w-1/2 rounded-md bg-muted/50" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <div className="h-3 w-12 rounded-md bg-muted/40" />
          <div className="h-3 w-10 rounded-md bg-muted/40" />
        </div>
      </div>
    </Card>
  )
}
