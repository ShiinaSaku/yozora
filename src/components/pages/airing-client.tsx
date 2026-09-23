import * as React from "react"
import Image from "@/components/ui/image"
import Link from "@/components/ui/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Globe02Icon,
  RadioIcon,
  Time02Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import {
  formatAiringSchedule,
  formatCountdownRemaining,
  useUserTimezone,
} from "@/lib/utils/date"
import type { AiringScheduleItem } from "@/lib/types/anime"
import { getAnimeUrl } from "@/lib/utils/slug"

const EMPTY_AIRING_ITEMS: AiringScheduleItem[] = []

export function AiringClient({
  items = EMPTY_AIRING_ITEMS,
  initialNow,
}: {
  items?: AiringScheduleItem[]
  initialNow: number
}) {
  const [currentTime, setCurrentTime] = React.useState(initialNow)
  const [filterQuery, setFilterQuery] = React.useState("")
  const { timeZone, isClient } = useUserTimezone()

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000))
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  const filteredItems = React.useMemo(() => {
    if (!filterQuery) return items
    return items.filter((item) =>
      item.media.title.toLowerCase().includes(filterQuery.toLowerCase())
    )
  }, [items, filterQuery])

  return (
    <div
      id="airing-radar-container"
      className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-xs">
            <HugeiconsIcon
              icon={RadioIcon}
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1
                id="airing-page-title"
                className="text-2xl font-black tracking-tight text-foreground sm:text-3xl"
              >
                Airing Radar
              </h1>
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {filteredItems.length} broadcasts scheduled
              </p>
              {isClient && (
                <>
                  <span
                    className="hidden text-xs text-border sm:inline"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={Globe02Icon}
                      size={11}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {timeZone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            id="airing-search-input"
            type="search"
            aria-label="Search airing anime"
            autoComplete="off"
            placeholder="Search airing anime..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-foreground backdrop-blur-md placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center text-sm text-muted-foreground">
          <p className="font-semibold">No airing anime matched your search</p>
          <button
            id="clear-airing-filter-btn"
            type="button"
            onClick={() => setFilterQuery("")}
            className="cursor-pointer text-xs text-primary underline underline-offset-4"
          >
            Clear search query
          </button>
        </div>
      ) : (
        <div
          id="airing-schedule-grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.map((item) => {
            const timeUntil = Math.max(0, item.airingAt - currentTime)
            const isLive = timeUntil <= 0
            const countdownText = isLive
              ? "Broadcasting Now"
              : formatCountdownRemaining(timeUntil)

            return (
              <Link
                key={item.id}
                id={`airing-card-${item.id}`}
                href={getAnimeUrl(item.media)}
                aria-label={`${item.media.title} Episode ${item.episode}, ${countdownText}`}
                variant="card"
                className="group relative flex active:scale-95"
              >
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-2xs transition-transform duration-300 group-hover:scale-102">
                  <Image
                    src={item.media.coverLarge || item.media.cover}
                    alt={item.media.title}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <Badge variant="overlay">
                      EP {item.episode}
                    </Badge>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div className="flex flex-col gap-1">
                    <h3 className="line-clamp-2 text-sm leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                      {item.media.title}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span>{item.media.format || "TV"}</span>
                      {item.media.studios && item.media.studios.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="max-w-28 truncate">
                            {item.media.studios[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-border/30 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <HugeiconsIcon
                          icon={Calendar03Icon}
                          size={12}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span suppressHydrationWarning>
                          {isClient ? formatAiringSchedule(item.airingAt) : ""}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-mono text-xs font-bold tracking-tight shadow-2xs ${
                          isLive
                            ? "border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={Time02Icon}
                          size={12}
                          strokeWidth={2.5}
                          className={isLive ? "animate-pulse" : ""}
                          aria-hidden="true"
                        />
                        <span>{countdownText}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
