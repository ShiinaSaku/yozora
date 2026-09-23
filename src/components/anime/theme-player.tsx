"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CdIcon, PauseIcon, PlayIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AnimeTheme } from "@/lib/types/anime"
import { cn } from "@/lib/utils"
import { ThemeVideoPlayer } from "./theme-video-player"

interface ThemePlayerProps {
  themes: AnimeTheme[]
  animeTitle?: string
  animeCover?: string
  animeBanner?: string
}

/**
 * Animated 3-bar audio equalizer for active playing track.
 */
function EqualizerBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex h-3.5 items-end gap-0.5 px-0.5" aria-hidden="true">
      <span
        className={cn(
          "w-0.5 rounded-full bg-current transition-all duration-300",
          isPlaying ? "h-3.5 animate-pulse" : "h-1"
        )}
      />
      <span
        className={cn(
          "w-0.5 rounded-full bg-current transition-all duration-300",
          isPlaying ? "h-2.5 animate-pulse delay-100" : "h-1.5"
        )}
      />
      <span
        className={cn(
          "w-0.5 rounded-full bg-current transition-all duration-300",
          isPlaying ? "h-3 animate-pulse delay-200" : "h-1"
        )}
      />
    </div>
  )
}

/**
 * Theme soundtrack track row.
 */
const ThemeTrackRow = React.memo(
  ({
    theme,
    isCurrent,
    isPlaying,
    onSelect,
  }: {
    theme: AnimeTheme
    isCurrent: boolean
    isPlaying: boolean
    onSelect: (theme: AnimeTheme) => void
  }) => {
    const videoNode = theme.entries[0]?.video || theme.entries[0]?.videos?.[0]
    const hasVideo = Boolean(videoNode?.link)

    return (
      <div
        role="button"
        tabIndex={hasVideo ? 0 : undefined}
        className={cn(
          "group flex items-center justify-between rounded-2xl border p-3 transition-colors duration-200 select-none sm:p-3.5",
          isCurrent
            ? "border-primary/60 bg-primary/10 shadow-sm ring-1 ring-primary/20"
            : hasVideo
              ? "cursor-pointer border-border/40 bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs active:scale-95"
              : "cursor-not-allowed border-border/20 bg-muted/10 opacity-50"
        )}
        onClick={() => hasVideo && onSelect(theme)}
        onKeyDown={(e) => {
          if (hasVideo && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onSelect(theme)
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl font-mono text-xs font-bold transition-all duration-300",
              isCurrent
                ? cn(
                    "scale-105 text-white ring-1 ring-white/25",
                    theme.type === "OP"
                      ? "bg-linear-to-br from-sky-400 via-primary to-fuchsia-500 shadow-md"
                      : "bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-md"
                  )
                : "bg-muted text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground"
            )}
          >
            {isCurrent ? (
              <EqualizerBars isPlaying={isPlaying} />
            ) : (
              `${theme.type}${theme.sequence || 1}`
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                {theme.title || `${theme.type} ${theme.sequence || 1}`}
              </span>
              {theme.entries[0]?.version && theme.entries[0].version > 1 && (
                <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs font-bold text-muted-foreground">
                  v{theme.entries[0].version}
                </span>
              )}
            </div>
            {theme.artists.length > 0 && (
              <span className="truncate text-xs text-muted-foreground">
                {theme.artists.join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasVideo ? (
            <Button
              size="sm"
              variant={isCurrent ? "default" : "secondary"}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(theme)
              }}
            >
              <HugeiconsIcon
                icon={isCurrent && isPlaying ? PauseIcon : PlayIcon}
                size={13}
                strokeWidth={2.5}
                className={!isPlaying ? "ml-0.5" : ""}
              />
              <span className="xs:inline hidden">
                {isCurrent && isPlaying ? "Playing" : "Play"}
              </span>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">No stream</span>
          )}
        </div>
      </div>
    )
  }
)
ThemeTrackRow.displayName = "ThemeTrackRow"

export function ThemePlayer({
  themes,
  animeTitle = "Anime",
  animeCover = "/yozora-icon-512.png",
}: ThemePlayerProps) {
  const [activeTab, setActiveTab] = React.useState<"OP" | "ED">("OP")
  const [activeTheme, setActiveTheme] = React.useState<AnimeTheme | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const openings = React.useMemo(
    () => themes.filter((t) => t.type === "OP"),
    [themes]
  )
  const endings = React.useMemo(
    () => themes.filter((t) => t.type === "ED"),
    [themes]
  )
  const currentList = activeTab === "OP" ? openings : endings

  // Next / Previous navigation within the current tab
  const currentIndex = currentList.findIndex((t) => t.id === activeTheme?.id)
  const hasNext = currentIndex >= 0 && currentIndex < currentList.length - 1
  const hasPrev = currentIndex > 0

  const handlePlayNext = React.useCallback(() => {
    if (hasNext) {
      setActiveTheme(currentList[currentIndex + 1])
    }
  }, [hasNext, currentIndex, currentList])

  const handlePlayPrev = React.useCallback(() => {
    if (hasPrev) {
      setActiveTheme(currentList[currentIndex - 1])
    }
  }, [hasPrev, currentIndex, currentList])

  const handleSelectTheme = (theme: AnimeTheme) => {
    if (activeTheme?.id === theme.id) {
      setIsPlaying((prev) => !prev)
    } else {
      setActiveTheme(theme)
      setIsPlaying(true)
    }
  }

  if (themes.length === 0) {
    return null
  }

  const activeVideoNode =
    activeTheme?.entries[0]?.video || activeTheme?.entries[0]?.videos?.[0]
  const activeVideoUrl = activeVideoNode?.link || ""
  const activeAudioUrl = activeVideoNode?.audio?.link || activeVideoUrl

  return (
    <Card variant="large" size="none">
      <div className="border-b border-border/40 px-6 pt-6 pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={CdIcon} size={18} strokeWidth={2} />
            </div>
            <span>Official Themes & Soundtracks</span>
            <Badge variant="tag">{themes.length} Tracks</Badge>
          </div>

          <div className="flex items-center rounded-xl border border-border/50 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("OP")}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                activeTab === "OP"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Openings ({openings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ED")}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                activeTab === "ED"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Endings ({endings.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Active Theme Video / Audio Player */}
        {activeTheme && activeVideoUrl && (
          <ThemeVideoPlayer
            key={activeTheme.id}
            activeTheme={activeTheme}
            activeVideoUrl={activeVideoUrl}
            activeAudioUrl={activeAudioUrl}
            animeCover={animeCover}
            animeTitle={animeTitle}
            onClose={() => {
              setActiveTheme(null)
              setIsPlaying(false)
            }}
            onPlayNext={hasNext ? handlePlayNext : undefined}
            onPlayPrev={hasPrev ? handlePlayPrev : undefined}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPlayingChange={(playing) => setIsPlaying(playing)}
          />
        )}

        {/* Tracklist */}
        <div className="flex flex-col gap-2">
          {currentList.map((theme) => (
            <ThemeTrackRow
              key={theme.id}
              theme={theme}
              isCurrent={activeTheme?.id === theme.id}
              isPlaying={isPlaying && activeTheme?.id === theme.id}
              onSelect={handleSelectTheme}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
