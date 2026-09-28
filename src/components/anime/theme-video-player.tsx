"use client"

import * as React from "react"
import Image from "@/components/ui/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  FullScreenIcon,
  HeadphonesIcon,
  MinimizeScreenIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  RepeatIcon,
  Video01Icon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
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

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
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
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const mediaRef = React.useRef<HTMLVideoElement | null>(null)
  const progressBarRef = React.useRef<HTMLDivElement | null>(null)
  const controlsTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const [mode, setMode] = React.useState<"video" | "audio">("video")
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [buffered, setBuffered] = React.useState(0)
  const [volume, setVolume] = React.useState(0.9)
  const [isMuted, setIsMuted] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [isLooping, setIsLooping] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [isScrubbing, setIsScrubbing] = React.useState(false)
  const [hoverTime, setHoverTime] = React.useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = React.useState<number | null>(null)
  const [hasError, setHasError] = React.useState(false)

  // Use the high-fidelity video stream for both video and audio
  const mediaSrc = activeVideoUrl || activeAudioUrl || ""

  // Controls auto-hide timer (2.5s)
  const resetControlsTimer = React.useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }
  }, [isPlaying, isScrubbing])

  React.useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [resetControlsTimer])

  // Play / Pause Toggle
  const togglePlay = React.useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    if (el.paused || el.ended) {
      void el
        .play()
        .then(() => {
          setIsPlaying(true)
          onPlayingChange?.(true)
        })
        .catch(() => {
          setIsPlaying(false)
          onPlayingChange?.(false)
        })
    } else {
      el.pause()
      setIsPlaying(false)
      onPlayingChange?.(false)
    }
  }, [onPlayingChange])

  // Direct Seek with boundaries
  const seekTo = React.useCallback(
    (time: number) => {
      const el = mediaRef.current
      if (!el || !Number.isFinite(time)) return
      const target = Math.max(0, Math.min(el.duration || duration || 0, time))
      el.currentTime = target
      setCurrentTime(target)
    },
    [duration]
  )

  // Volume & Mute handling
  const handleVolumeChange = React.useCallback((val: number) => {
    const el = mediaRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(1, val))
    el.volume = clamped
    el.muted = clamped === 0
    setVolume(clamped)
    setIsMuted(clamped === 0)
  }, [])

  const toggleMute = React.useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    if (isMuted || volume === 0) {
      const restored = volume > 0 ? volume : 0.85
      el.muted = false
      el.volume = restored
      setIsMuted(false)
      setVolume(restored)
    } else {
      el.muted = true
      setIsMuted(true)
    }
  }, [isMuted, volume])

  // Playback Speed Cycle (0.75x -> 1x -> 1.25x -> 1.5x -> 2x)
  const cycleSpeed = React.useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    const speeds = [0.75, 1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const next = speeds[nextIdx]
    el.playbackRate = next
    setPlaybackRate(next)
  }, [playbackRate])

  // Fullscreen Toggle
  const toggleFullscreen = React.useCallback(async () => {
    const container = containerRef.current
    if (!container) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await container.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch {
      setIsFullscreen((prev) => !prev)
    }
  }, [])

  React.useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", handleFs)
    return () => document.removeEventListener("fullscreenchange", handleFs)
  }, [])

  // Scrubber Pointer Scrub
  const handleScrubberPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = clickX / rect.width
    seekTo(ratio * duration)
  }

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = hoverX / rect.width
    setHoverTime(ratio * duration)
    setHoverPosition(hoverX)
  }

  // Scoped Keyboard Navigation (Space, Left/Right 5s, Up/Down Volume, Mute, Fullscreen, Loop)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) return

    if (e.code === "Space" || e.key === "k" || e.key === "K") {
      e.preventDefault()
      togglePlay()
      resetControlsTimer()
    } else if (e.code === "ArrowLeft" || e.key === "j" || e.key === "J") {
      e.preventDefault()
      seekTo(currentTime - 5)
      resetControlsTimer()
    } else if (e.code === "ArrowRight" || e.key === "l" || e.key === "L") {
      e.preventDefault()
      seekTo(currentTime + 5)
      resetControlsTimer()
    } else if (e.code === "ArrowUp") {
      e.preventDefault()
      handleVolumeChange(volume + 0.1)
      resetControlsTimer()
    } else if (e.code === "ArrowDown") {
      e.preventDefault()
      handleVolumeChange(volume - 0.1)
      resetControlsTimer()
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault()
      toggleMute()
      resetControlsTimer()
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault()
      void toggleFullscreen()
      resetControlsTimer()
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault()
      setIsLooping((prev) => !prev)
      resetControlsTimer()
    }
  }

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={resetControlsTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "group/player relative flex w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl ring-1 ring-white/5 transition-all duration-300 outline-none select-none",
        isFullscreen &&
          "fixed inset-0 z-50 h-screen w-screen rounded-none border-0"
      )}
    >
      {/* Dynamic Ambient Cinema Backdrop Glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-tr from-primary/30 via-sky-500/20 to-primary/30 blur-3xl filter transition-opacity duration-700",
          isPlaying ? "opacity-60" : "opacity-25"
        )}
      />

      {/* Top Header Bar */}
      <div
        className={cn(
          "relative z-20 flex items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur-xl transition-opacity duration-300 sm:px-6 sm:py-3.5",
          mode === "video" && !showControls && isPlaying
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        )}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-md ring-1 ring-black/40">
            <Image
              src={animeCover}
              alt={activeTheme.title || animeTitle}
              fill
              unoptimized
              sizes="40px"
              variant="thumb"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="max-w-44 truncate text-sm font-bold tracking-tight text-white drop-shadow-xs sm:max-w-md">
                {activeTheme.title ||
                  `${activeTheme.type} ${activeTheme.sequence || 1}`}
              </span>
              <Badge variant="tag">
                {activeTheme.type}
                {activeTheme.sequence || 1}
              </Badge>
            </div>
            <span className="max-w-44 truncate text-xs font-medium text-zinc-400 sm:max-w-md">
              {activeTheme.artists.length > 0
                ? activeTheme.artists.join(", ")
                : animeTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Previous Track */}
          {onPlayPrev && (
            <button
              type="button"
              onClick={onPlayPrev}
              disabled={!hasPrev}
              title="Previous theme"
              aria-label="Previous theme"
              className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5"
            >
              <HugeiconsIcon icon={PreviousIcon} size={16} strokeWidth={2} />
            </button>
          )}

          {/* Next Track */}
          {onPlayNext && (
            <button
              type="button"
              onClick={onPlayNext}
              disabled={!hasNext}
              title="Next theme"
              aria-label="Next theme"
              className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5"
            >
              <HugeiconsIcon icon={NextIcon} size={16} strokeWidth={2} />
            </button>
          )}

          {/* Audio vs Video Mode Switcher */}
          <button
            type="button"
            onClick={() => setMode((m) => (m === "video" ? "audio" : "video"))}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all active:scale-95",
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
              size={14}
              strokeWidth={2.2}
            />
            <span className="hidden sm:inline">
              {mode === "video" ? "Audio Only" : "Video Mode"}
            </span>
          </button>

          {/* Close Player */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme player"
            className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Main Player Display (Unified Video Engine) */}
      <div className="relative flex w-full flex-col items-center justify-center bg-black">
        {/* Hidden/Displayed Video Element */}
        <video
          ref={mediaRef}
          key={mediaSrc}
          playsInline
          autoPlay
          preload="auto"
          loop={isLooping}
          src={mediaSrc}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            setCurrentTime(v.currentTime)
            if (v.buffered.length > 0) {
              setBuffered(v.buffered.end(v.buffered.length - 1))
            }
          }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            setDuration(v.duration)
            setHasError(false)
          }}
          onPlay={() => {
            setIsPlaying(true)
            onPlayingChange?.(true)
          }}
          onPause={() => {
            setIsPlaying(false)
            onPlayingChange?.(false)
          }}
          onEnded={() => {
            if (!isLooping) {
              setIsPlaying(false)
              onPlayingChange?.(false)
              onPlayNext?.()
            }
          }}
          onError={() => setHasError(true)}
          onClick={togglePlay}
          className={cn(
            "w-full cursor-pointer bg-black object-contain transition-all duration-500 outline-none",
            mode === "video"
              ? isFullscreen
                ? "h-full max-h-screen"
                : "block h-auto max-h-160"
              : "pointer-events-none absolute inset-0 size-full opacity-0"
          )}
        />

        {/* Audio Mode: Handcrafted Turntable Visualizer */}
        {mode === "audio" && (
          <div className="relative flex w-full flex-col items-center justify-center gap-8 overflow-hidden bg-radial from-zinc-900/90 via-zinc-950 to-black px-6 py-14 select-none sm:px-12 sm:py-20">
            {/* Ambient Blurred Artwork Glow */}
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

            {/* Vinyl Record Visualizer with Concentric Grooves */}
            <div className="relative z-10 flex flex-col items-center gap-5 text-center">
              <div
                onClick={togglePlay}
                role="button"
                tabIndex={0}
                aria-label={isPlaying ? "Pause vinyl" : "Play vinyl"}
                className="relative size-44 cursor-pointer rounded-full border border-white/20 bg-zinc-950 p-2.5 shadow-2xl ring-2 ring-white/10 transition-transform active:scale-95 sm:size-52"
                style={{
                  backgroundImage:
                    "repeating-radial-gradient(circle, rgba(255,255,255,0.06) 0px, rgba(0,0,0,0.95) 2px, rgba(255,255,255,0.03) 3px, rgba(0,0,0,0.98) 4px)",
                }}
              >
                {/* Spinning center label with Cover Art */}
                <div
                  className={cn(
                    "flex size-full items-center justify-center rounded-full transition-transform duration-500",
                    isPlaying ? "animate-spin-slow" : ""
                  )}
                >
                  <div className="relative size-20 overflow-hidden rounded-full border-2 border-zinc-900 shadow-2xl ring-1 ring-white/20 sm:size-24">
                    <Image
                      src={animeCover}
                      alt={activeTheme.title || animeTitle}
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                    />
                    {/* Metallic Center Spindle Hole */}
                    <div className="absolute inset-0 m-auto size-3 rounded-full border border-white/40 bg-zinc-950 shadow-inner" />
                  </div>
                </div>

                {/* Subtle sheen highlight over vinyl */}
                <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-tr from-transparent via-white/10 to-transparent" />
              </div>

              {/* Title & Artist Identity */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="tag">
                    {activeTheme.type}
                    {activeTheme.sequence || 1}
                  </Badge>
                  <span className="max-w-xs truncate text-base font-bold tracking-tight text-white drop-shadow-sm sm:max-w-md sm:text-lg">
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
          </div>
        )}

        {/* Playback Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center backdrop-blur-md">
            <p className="text-sm font-semibold text-white">
              Theme Stream Unavailable
            </p>
            <p className="max-w-xs text-xs text-zinc-400">
              The media could not be streamed directly from the mirror.
            </p>
            <button
              type="button"
              onClick={() => {
                setHasError(false)
                mediaRef.current?.load()
              }}
              className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Handcrafted Bottom Control Bar */}
      <div
        className={cn(
          "relative z-20 flex flex-col border-t border-white/10 bg-zinc-950/90 px-4 pt-3 pb-3 backdrop-blur-xl transition-opacity duration-300 sm:px-6 sm:pb-3.5",
          mode === "video" && !showControls && isPlaying
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        )}
      >
        {/* Scrubber Timeline with Buffer & Time Hover Preview */}
        <div
          ref={progressBarRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setIsScrubbing(true)
            handleScrubberPointer(e)
          }}
          onPointerMove={(e) => {
            if (isScrubbing) handleScrubberPointer(e)
          }}
          onMouseMove={handleScrubberHover}
          onMouseLeave={() => {
            setHoverTime(null)
            setHoverPosition(null)
          }}
          onPointerUp={() => setIsScrubbing(false)}
          onPointerCancel={() => setIsScrubbing(false)}
          className="group/timeline relative flex h-5 w-full cursor-pointer touch-none items-center py-2"
        >
          {/* Track background */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/15 transition-all duration-150 group-hover/timeline:h-2">
            {/* Buffered bar */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/30 transition-all duration-150"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played bar */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all duration-75"
              style={{ width: `${playedPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb */}
          <div
            className="pointer-events-none absolute size-3.5 -translate-x-1/2 rounded-full bg-white shadow-md ring-2 ring-primary transition-transform duration-100 group-hover/timeline:scale-125"
            style={{ left: `${playedPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md border border-white/15 bg-zinc-900/95 px-2 py-0.5 font-mono text-xs font-medium text-white shadow-lg backdrop-blur-md"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatDuration(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons and Settings Row */}
        <div className="flex items-center justify-between gap-3 pt-1 text-white">
          {/* Left: Play/Pause, Next/Prev, Volume & Timers */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            {/* Big Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-950 shadow-md transition-all hover:bg-white/90 active:scale-95 sm:size-10"
            >
              <HugeiconsIcon
                icon={isPlaying ? PauseIcon : PlayIcon}
                size={20}
                strokeWidth={2.4}
                className={!isPlaying ? "ml-0.5" : ""}
              />
            </button>

            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsLooping((l) => !l)}
              aria-label={isLooping ? "Disable loop" : "Enable loop"}
              title={isLooping ? "Repeat: On" : "Repeat: Off"}
              className={cn(
                "hidden size-8 cursor-pointer items-center justify-center rounded-full transition-all active:scale-95 sm:flex",
                isLooping
                  ? "bg-primary/20 text-primary"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <HugeiconsIcon icon={RepeatIcon} size={17} strokeWidth={2} />
            </button>

            {/* Volume Control */}
            <div className="group/vol flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-zinc-300 transition-colors hover:text-white active:scale-95"
              >
                <HugeiconsIcon
                  icon={
                    isMuted || volume === 0
                      ? VolumeOffIcon
                      : volume < 0.5
                        ? VolumeLowIcon
                        : VolumeHighIcon
                  }
                  size={18}
                  strokeWidth={2}
                />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) =>
                  handleVolumeChange(Number.parseFloat(e.target.value))
                }
                aria-label="Volume slider"
                className="h-1.5 w-14 cursor-pointer appearance-none rounded-full bg-white/20 accent-primary sm:w-20"
              />
            </div>

            {/* Monospaced Precision Timecode */}
            <div className="font-mono text-xs font-medium text-zinc-300">
              <span>{formatDuration(currentTime)}</span>
              <span className="mx-1 text-zinc-500">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right: Playback Speed, Fullscreen, Keyboard guide */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Speed Pill */}
            <button
              type="button"
              onClick={cycleSpeed}
              title="Playback speed"
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs font-bold text-zinc-200 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
            >
              {playbackRate}x
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="flex size-8.5 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/15 hover:text-white active:scale-95"
            >
              <HugeiconsIcon
                icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon}
                size={16}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
