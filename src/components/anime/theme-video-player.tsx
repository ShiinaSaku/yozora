"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  HeadphonesIcon,
  NextIcon,
  PreviousIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import {
  useVideoPlayer,
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControls,
  VideoPlayerFullscreenButton,
  VideoPlayerPictureInPictureButton,
  VideoPlayerPlayButton,
  VideoPlayerPlaybackRate,
  VideoPlayerSeekBar,
  VideoPlayerSeekButton,
  VideoPlayerSpacer,
  VideoPlayerTime,
  VideoPlayerVolume,
} from "@/components/ui/video-player"
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

/** Bridges player store state to callbacks (playing status, auto-advance). */
function PlayerStateSync({
  onPlayingChange,
  onEnded,
}: {
  onPlayingChange: (isPlaying: boolean) => void
  onEnded?: () => void
}) {
  const callbacks = React.useRef({ onPlayingChange, onEnded })
  React.useInsertionEffect(() => {
    callbacks.current = { onPlayingChange, onEnded }
  })

  const paused = useVideoPlayer((api) => api.paused)
  const ended = useVideoPlayer((api) => api.ended)
  const error = useVideoPlayer((api) => api.error)
  const playing = !paused && !ended && !error

  React.useEffect(() => {
    callbacks.current.onPlayingChange(playing)
  }, [playing])
  React.useEffect(() => {
    if (ended) {
      callbacks.current.onEnded?.()
    }
  }, [ended])

  return null
}

/**
 * Audio-only visualizer. The video element stays mounted (hidden) so the
 * stream keeps playing while the vinyl cover spins.
 */
function AudioVisualizer({
  cover,
  title,
  artist,
}: {
  cover: string
  title: string
  artist: string
}) {
  const paused = useVideoPlayer((api) => api.paused)
  const togglePaused = useVideoPlayer((api) => api.togglePaused)

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-8 overflow-hidden bg-radial from-zinc-900/90 via-zinc-950 to-black px-6 py-14 select-none sm:px-12 sm:py-20"
      data-slot="theme-player-audio-mode"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scale-150 opacity-20 blur-3xl saturate-150 filter"
      >
        <Image src={cover} alt="" fill unoptimized className="object-cover" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <button
          type="button"
          onClick={togglePaused}
          aria-label={paused ? "Play vinyl" : "Pause vinyl"}
          className="relative size-44 cursor-pointer rounded-full border border-white/20 bg-zinc-950 p-2.5 shadow-2xl ring-2 ring-white/10 transition-transform active:scale-95 sm:size-52"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle, rgba(255,255,255,0.06) 0px, rgba(0,0,0,0.95) 2px, rgba(255,255,255,0.03) 3px, rgba(0,0,0,0.98) 4px)",
          }}
        >
          <span
            className={cn(
              "flex size-full items-center justify-center rounded-full transition-transform duration-500",
              !paused && "animate-spin-slow"
            )}
          >
            <span className="relative size-20 overflow-hidden rounded-full border-2 border-zinc-900 shadow-2xl ring-1 ring-white/20 sm:size-24">
              <Image src={cover} alt="" fill unoptimized className="object-cover" />
              <span className="absolute inset-0 m-auto size-3 rounded-full border border-white/40 bg-zinc-950 shadow-inner" />
            </span>
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-tr from-transparent via-white/10 to-transparent"
          />
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <span className="max-w-xs truncate text-base font-bold tracking-tight text-white drop-shadow-sm sm:max-w-md sm:text-lg">
            {title}
          </span>
          <span className="text-xs font-medium text-zinc-400">{artist}</span>
        </div>
      </div>
    </div>
  )
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
  const isAudioMode = mode === "audio"

  const title = activeTheme.title || `${activeTheme.type} ${activeTheme.sequence || 1}`
  const artist =
    activeTheme.artists.length > 0 ? activeTheme.artists.join(", ") : animeTitle
  const tag = `${activeTheme.type}${activeTheme.sequence || 1}`

  const handleEnded = React.useCallback(() => {
    if (onPlayNext) {
      onPlayNext()
    }
  }, [onPlayNext])

  const handlePlayingChange = React.useCallback(
    (playing: boolean) => {
      onPlayingChange?.(playing)
    },
    [onPlayingChange]
  )

  // High-fidelity video stream is used for both video and audio playback.
  const mediaSrc = activeVideoUrl || activeAudioUrl || ""

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl ring-1 ring-white/5 transition-all duration-300 select-none"
      data-slot="theme-video-player"
    >
      {/* Ambient cinema backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-tr from-primary/30 via-sky-500/20 to-primary/30 opacity-40 blur-3xl filter"
      />

      {/* Header: track identity + playlist navigation */}
      <div className="relative z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-md ring-1 ring-black/40">
            <Image
              src={animeCover}
              alt={title}
              fill
              unoptimized
              sizes="40px"
              variant="thumb"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="max-w-44 truncate text-sm font-bold tracking-tight text-white drop-shadow-xs sm:max-w-md">
                {title}
              </span>
              <Badge variant="tag">{tag}</Badge>
            </div>
            <span className="max-w-44 truncate text-xs font-medium text-zinc-400 sm:max-w-md">
              {artist}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onPlayPrev && (
            <Button
              variant="glass-dark"
              size="icon-sm"
              onClick={onPlayPrev}
              disabled={!hasPrev}
              aria-label="Previous theme"
            >
              <HugeiconsIcon icon={PreviousIcon} size={16} strokeWidth={2} />
            </Button>
          )}
          {onPlayNext && (
            <Button
              variant="glass-dark"
              size="icon-sm"
              onClick={onPlayNext}
              disabled={!hasNext}
              aria-label="Next theme"
            >
              <HugeiconsIcon icon={NextIcon} size={16} strokeWidth={2} />
            </Button>
          )}

          <Button
            variant={isAudioMode ? "secondary" : "glass-dark"}
            size="sm"
            onClick={() => setMode((m) => (m === "video" ? "audio" : "video"))}
            aria-label={
              isAudioMode ? "Switch to video mode" : "Switch to audio only"
            }
            title={isAudioMode ? "Switch to Video Mode" : "Switch to Audio Only"}
          >
            <HugeiconsIcon
              icon={isAudioMode ? Video01Icon : HeadphonesIcon}
              size={14}
              strokeWidth={2.2}
            />
            <span className="hidden sm:inline">
              {isAudioMode ? "Video Mode" : "Audio Only"}
            </span>
          </Button>

          <Button
            variant="glass-dark"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close theme player"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.2} />
          </Button>
        </div>
      </div>

      <VideoPlayer
        variant="overlay"
        errorMessage="Theme stream unavailable from the mirror."
      >
        <div
          className={cn(
            "relative col-start-1 row-start-1",
            isAudioMode && "pointer-events-none opacity-0"
          )}
        >
          <VideoPlayerContent
            key={mediaSrc}
            src={mediaSrc}
            autoPlay
            preload="auto"
          />
        </div>
        <PlayerStateSync
          onPlayingChange={handlePlayingChange}
          onEnded={handleEnded}
        />
        {isAudioMode && (
          <AudioVisualizer cover={animeCover} title={title} artist={artist} />
        )}

        <VideoPlayerControls>
          <VideoPlayerSeekBar />
          <VideoPlayerPlayButton />
          <VideoPlayerSeekButton offset={-10} />
          <VideoPlayerSeekButton offset={10} />
          <VideoPlayerVolume />
          <VideoPlayerTime />
          <VideoPlayerSpacer />
          <VideoPlayerPlaybackRate />
          <VideoPlayerPictureInPictureButton />
          <VideoPlayerFullscreenButton />
        </VideoPlayerControls>
      </VideoPlayer>
    </div>
  )
}
