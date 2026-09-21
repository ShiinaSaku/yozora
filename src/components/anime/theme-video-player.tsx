"use client"

import * as React from "react"
import Image from "@/components/ui/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  HeadphonesIcon,
  NextIcon,
  PreviousIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import type { AnimeTheme } from "@/lib/types/anime"
import { cn } from "@/lib/utils"

export interface ThemeVideoPlayerProps {
  activeTheme: AnimeTheme
  activeVideoUrl: string
  activeAudioUrl?: string | null
  animeCover: string
  animeTitle: string
  onClose: () => void
  onPlayNext?: () => void
  onPlayPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  onPlayingChange?: (isPlaying: boolean) => void
}

export function ThemeVideoPlayer({
  activeTheme,
  activeVideoUrl,
  activeAudioUrl,
  animeCover,
  animeTitle,
  onClose,
  onPlayNext,
  onPlayPrev,
  hasNext,
  hasPrev,
  onPlayingChange,
}: ThemeVideoPlayerProps) {
  const [mode, setMode] = React.useState<"video" | "audio">("video")
  const [isPlaying, setIsPlaying] = React.useState(true)

  // Use the video URL directly because it contains both video and audio in standard WebM format.
  const mediaSrc = activeVideoUrl || activeAudioUrl || ""

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl transition-all duration-300 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent">
      {/* Ambient Cinema Backdrop Glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-linear-to-r from-primary/30 via-sky-500/20 to-primary/30 blur-3xl filter transition-opacity duration-700",
          isPlaying ? "opacity-60" : "opacity-25"
        )}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-linear-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 px-3.5 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-md ring-1 ring-black/40 sm:size-10">
            <Image
              src={animeCover}
              alt={activeTheme.title || animeTitle}
              fill
              unoptimized
              sizes="40px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="max-w-44 truncate text-xs font-semibold tracking-tight text-white drop-shadow-xs sm:max-w-sm sm:text-sm">
                {activeTheme.title ||
                  `${activeTheme.type} ${activeTheme.sequence || 1}`}
              </span>
              <Badge className="shrink-0 rounded-full border-primary/40 bg-primary/15 px-2 py-0 font-mono text-[9px] font-bold tracking-wider text-primary shadow-xs">
                {activeTheme.type}
                {activeTheme.sequence || 1}
              </Badge>
            </div>
            <span className="max-w-44 truncate text-[11px] font-medium text-zinc-400 sm:max-w-sm sm:text-xs">
              {activeTheme.artists.length > 0
                ? activeTheme.artists.join(", ")
                : animeTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous Track Button */}
          {onPlayPrev && (
            <button
              type="button"
              onClick={onPlayPrev}
              disabled={!hasPrev}
              title="Previous theme"
              aria-label="Previous theme"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5 sm:size-8.5"
            >
              <HugeiconsIcon icon={PreviousIcon} size={15} strokeWidth={2} />
            </button>
          )}

          {/* Next Track Button */}
          {onPlayNext && (
            <button
              type="button"
              onClick={onPlayNext}
              disabled={!hasNext}
              title="Next theme"
              aria-label="Next theme"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5 sm:size-8.5"
            >
              <HugeiconsIcon icon={NextIcon} size={15} strokeWidth={2} />
            </button>
          )}

          {/* Audio vs Video Mode Toggle */}
          <button
            type="button"
            onClick={() => setMode((m) => (m === "video" ? "audio" : "video"))}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md transition-all active:scale-95 sm:px-3 sm:text-xs",
              mode === "audio"
                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 shadow-xs hover:bg-emerald-500/25"
                : "border border-white/10 bg-white/5 text-zinc-200 hover:border-white/20 hover:bg-white/15 hover:text-white"
            )}
            title={
              mode === "video" ? "Switch to Audio Mode" : "Switch to Video Mode"
            }
          >
            <HugeiconsIcon
              icon={mode === "video" ? HeadphonesIcon : Video01Icon}
              size={13}
              strokeWidth={2.2}
            />
            <span className="xs:inline hidden">
              {mode === "video" ? "Audio Only" : "Video"}
            </span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme player"
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95 sm:size-8.5"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Player Area with Browser Native Controls */}
      {mode === "video" ? (
        <div className="relative flex w-full items-center justify-center overflow-hidden bg-black/95 shadow-inner">
          <video
            key={mediaSrc}
            controls
            playsInline
            autoPlay
            preload="auto"
            src={mediaSrc}
            onPlay={() => {
              setIsPlaying(true)
              onPlayingChange?.(true)
            }}
            onPause={() => {
              setIsPlaying(false)
              onPlayingChange?.(false)
            }}
            onEnded={() => {
              setIsPlaying(false)
              onPlayingChange?.(false)
              onPlayNext?.()
            }}
            className="block h-auto max-h-[72vh] w-full max-w-full bg-black object-contain outline-none"
          />
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center gap-7 overflow-hidden bg-radial from-zinc-900/90 via-zinc-950 to-black px-6 py-10 select-none sm:px-10 sm:py-14">
          {/* Ambient Blurred Artwork */}
          <div className="pointer-events-none absolute inset-0 scale-150 opacity-20 blur-3xl saturate-150 filter">
            <Image
              src={animeCover}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Vinyl Record Visualizer */}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <div className="relative size-32 rounded-full border border-white/15 bg-zinc-950 p-2 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/10 sm:size-40">
              <div
                className={cn(
                  "flex size-full items-center justify-center rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-900 shadow-inner",
                  isPlaying ? "animate-[spin_12s_linear_infinite]" : ""
                )}
              >
                <div className="relative size-16 overflow-hidden rounded-full border-2 border-zinc-900 shadow-lg sm:size-20">
                  <Image
                    src={animeCover}
                    alt={activeTheme.title || animeTitle}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 m-auto size-2.5 rounded-full border border-white/30 bg-zinc-950 shadow-inner" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Badge className="rounded-full border-primary/40 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary shadow-xs">
                  {activeTheme.type}
                  {activeTheme.sequence || 1}
                </Badge>
                <span className="max-w-60 truncate text-sm font-semibold tracking-tight text-white drop-shadow-xs sm:max-w-sm sm:text-base">
                  {activeTheme.title ||
                    `${activeTheme.type} ${activeTheme.sequence || 1}`}
                </span>
              </div>
              <span className="text-xs font-medium text-zinc-400">
                {activeTheme.artists.length > 0
                  ? activeTheme.artists.join(", ")
                  : animeTitle}
              </span>
            </div>
          </div>

          {/* Glass Audio Player Pod */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/80 p-2.5 shadow-xl ring-1 ring-white/5 backdrop-blur-xl">
            <audio
              key={mediaSrc}
              controls
              autoPlay
              preload="auto"
              src={mediaSrc}
              onPlay={() => {
                setIsPlaying(true)
                onPlayingChange?.(true)
              }}
              onPause={() => {
                setIsPlaying(false)
                onPlayingChange?.(false)
              }}
              onEnded={() => {
                setIsPlaying(false)
                onPlayingChange?.(false)
                onPlayNext?.()
              }}
              className="w-full accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  )
}
