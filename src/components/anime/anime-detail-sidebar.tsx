import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Globe02Icon,
  LinkSquare01Icon,
  RadioIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getPlatformInfo } from "@/components/icons/platform-badge"
import {
  formatAiringSchedule,
  formatCountdownRemaining,
  useUserTimezone,
} from "@/lib/utils/date"
import type { Anime, AnimeExternalLink } from "@/lib/types/anime"

interface AnimeDetailSidebarProps {
  anime: Anime
  externalLinks?: AnimeExternalLink[]
}

export function AnimeDetailSidebar({
  anime,
  externalLinks,
}: AnimeDetailSidebarProps) {
  const { isClient, timeZone } = useUserTimezone()

  return (
    <div className="flex flex-col gap-6">
      {anime.nextAiring && (
        <Card className="flex flex-col gap-2.5 rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                <HugeiconsIcon icon={RadioIcon} size={15} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Episode {anime.nextAiring.episode} Broadcasting
              </span>
            </div>
            <Badge
              variant="secondary"
              className="border-emerald-500/20 bg-emerald-500/10 font-mono text-[10px] text-emerald-500"
            >
              {formatCountdownRemaining(anime.nextAiring.timeUntilAiring)}
            </Badge>
          </div>
          {isClient && (
            <div className="flex flex-col gap-1 border-t border-emerald-500/15 pt-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={12}
                  strokeWidth={2}
                />
                <span>{formatAiringSchedule(anime.nextAiring.airingAt)}</span>
              </div>
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <HugeiconsIcon icon={Globe02Icon} size={10} strokeWidth={2} />
                Adjusted to {timeZone}
              </span>
            </div>
          )}
        </Card>
      )}

      <Card className="flex flex-col gap-4 rounded-2xl border-border/50 bg-card p-6">
        <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
          Information
        </h3>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between border-b border-border/30 py-1">
            <span className="text-muted-foreground">Format</span>
            <span className="font-semibold text-foreground">
              {anime.format || "TV"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/30 py-1">
            <span className="text-muted-foreground">Episodes</span>
            <span className="font-semibold text-foreground">
              {anime.episodes || "Unknown"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/30 py-1">
            <span className="text-muted-foreground">Episode Duration</span>
            <span className="font-semibold text-foreground">
              {anime.duration ? `${anime.duration} mins` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/30 py-1">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-foreground capitalize">
              {anime.status?.toLowerCase().replace("_", " ") || "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/30 py-1">
            <span className="text-muted-foreground">Release Year</span>
            <span className="font-semibold text-foreground">{anime.year}</span>
          </div>
          {anime.favourites && (
            <div className="flex justify-between border-b border-border/30 py-1">
              <span className="text-muted-foreground">Favorites</span>
              <span className="font-semibold text-rose-500">
                ♥ {anime.favourites.toLocaleString("en-US")}
              </span>
            </div>
          )}
        </div>

        {/* Genres */}
        {anime.tags.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Genres
            </span>
            <div className="flex flex-wrap gap-1.5">
              {anime.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {externalLinks && externalLinks.length > 0 && (
        <Card className="flex flex-col gap-4 rounded-2xl border-border/50 bg-card p-6">
          <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            Official & Streaming Links
          </h3>
          <div className="flex flex-col gap-2">
            {externalLinks.map((link) => {
              const platform = getPlatformInfo(link.site, link.url)
              const IconComp = platform.icon

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-3 text-xs font-semibold transition-[background-color,border-color] hover:border-primary/40 hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${platform.bgClass}`}
                    >
                      {IconComp ? (
                        <IconComp className="size-4 shrink-0" />
                      ) : (
                        <HugeiconsIcon
                          icon={Globe02Icon}
                          size={15}
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <span className="truncate text-foreground transition-colors group-hover:text-primary">
                      {platform.name || link.site}
                    </span>
                  </div>
                  <HugeiconsIcon
                    icon={LinkSquare01Icon}
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                  />
                </a>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
