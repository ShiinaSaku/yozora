import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  FullScreenIcon,
  MinimizeScreenIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from "@hugeicons/core-free-icons"
import { YouTubeIcon } from "@/components/icons/platform-icons"
import { YouTubePlayer } from "@/components/ui/youtube-video-player"
import { cn } from "@/lib/utils"

export interface VideoProps {
  /** Video source URL (direct MP4/WebM stream, or YouTube watch/embed URL) */
  src?: string
  /** YouTube video ID for embedded YouTube playback */
  youtubeId?: string
  /** Poster / preview image */
  poster?: string
  /** Video title */
  title?: string
  /** Optional YouTube link URL */
  youtubeUrl?: string
  /** Auto play on mount */
  autoPlay?: boolean
  /** Start muted */
  muted?: boolean
  /** Loop playback */
  loop?: boolean
  /** Enables an ambient cinema backdrop halo glow. Defaults to true. */
  ambient?: boolean
  /** Embedded mode: hides the top header bar */
  embedded?: boolean
  /** Class name for the outer container wrapping the video and ambient glow. */
  containerClassName?: string
  /** Class name applied to the video frame. */
  className?: string
  /** Render a shimmer loading skeleton */
  loading?: boolean
  /** Callback fired on close button */
  onClose?: () => void
  /** Callback fired when play/pause state changes */
  onPlayingChange?: (isPlaying: boolean) => void
  /** Callback fired if media fails to load */
  onVideoError?: (event: Event) => void
  /** Ref to the underlying HTML5 video element */
  videoRef?: React.Ref<HTMLVideoElement>
  /** Video event listeners */
  onTimeUpdate?: (event: Event) => void
  onLoadedMetadata?: (event: Event) => void
  onEnded?: (event: Event) => void
  /** Dedicated "next track" action. Shows a Next button in the control row. */
  onNext?: () => void
}

export function extractYouTubeId(
  src?: string,
  explicitId?: string
): string | null {
  if (explicitId) return explicitId
  if (!src) return null
  const match = src.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|youtube-nocookie\.com\/embed\/)([\w-]{11})/
  )
  return match ? match[1] : null
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

/**
 * Direct Stream HTML5 Video Player with rock-solid, focused controls.
 * Zero global keydown hijacking, smooth scrubbing, responsive volume and speed.
 */
function DirectStreamPlayer({
  src,
  poster,
  title,
  youtubeUrl,
  autoPlay = false,
  muted = false,
  loop = false,
  ambient = true,
  embedded = false,
  containerClassName,
  className,
  onClose,
  onPlayingChange,
  onVideoError,
  videoRef: externalVideoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onNext,
}: VideoProps & { src: string }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const progressBarRef = React.useRef<HTMLDivElement | null>(null)
  const controlsTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const [isPlaying, setIsPlaying] = React.useState(autoPlay)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [buffered, setBuffered] = React.useState(0)
  const [volume, setVolume] = React.useState(muted ? 0 : 1)
  const [isMuted, setIsMuted] = React.useState(muted)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [isScrubbing, setIsScrubbing] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  // Attach external ref
  React.useEffect(() => {
    const el = videoRef.current
    if (!el || !externalVideoRef) return
    if (typeof externalVideoRef === "function") {
      externalVideoRef(el)
      return () => {
        externalVideoRef(null)
      }
    }
    externalVideoRef.current = el
    return () => {
      externalVideoRef.current = null
    }
  }, [externalVideoRef])

  // Controls auto-hide
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

  // Toggle Play
  const togglePlay = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      void video
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
      video.pause()
      setIsPlaying(false)
      onPlayingChange?.(false)
    }
  }, [onPlayingChange])

  // Seek
  const seekTo = React.useCallback(
    (time: number) => {
      const video = videoRef.current
      if (!video || !Number.isFinite(time)) return
      const target = Math.max(
        0,
        Math.min(video.duration || duration || 0, time)
      )
      video.currentTime = target
      setCurrentTime(target)
    },
    [duration]
  )

  // Volume
  const handleVolumeChange = React.useCallback((val: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, val))
    video.volume = clamped
    video.muted = clamped === 0
    setVolume(clamped)
    setIsMuted(clamped === 0)
  }, [])

  const toggleMute = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (isMuted || volume === 0) {
      const restored = volume > 0 ? volume : 0.8
      video.muted = false
      video.volume = restored
      setIsMuted(false)
      setVolume(restored)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }, [isMuted, volume])

  // Speed
  const cycleSpeed = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const speeds = [0.75, 1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const next = speeds[nextIdx]
    video.playbackRate = next
    setPlaybackRate(next)
  }, [playbackRate])

  // Fullscreen
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

  // Scrubber handler
  const handleScrubberPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = clickX / rect.width
    seekTo(ratio * duration)
  }

  // Scoped keyboard shortcuts (triggered only when container is focused)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) return

    if (e.code === "Space" || e.key === "k" || e.key === "K") {
      e.preventDefault()
      togglePlay()
      resetControlsTimer()
    } else if (e.code === "ArrowLeft" || e.key === "j" || e.key === "J") {
      e.preventDefault()
      seekTo(currentTime - 10)
      resetControlsTimer()
    } else if (e.code === "ArrowRight" || e.key === "l" || e.key === "L") {
      e.preventDefault()
      seekTo(currentTime + 10)
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
        "group/player relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300 outline-none select-none",
        isFullscreen &&
          "fixed inset-0 z-50 h-screen w-screen rounded-none border-0",
        containerClassName,
        className
      )}
    >
      {/* Ambient Cinema Backdrop Glow */}
      {ambient && !hasError && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-linear-to-tr from-primary/30 via-sky-500/20 to-primary/30 opacity-40 blur-3xl filter transition-opacity duration-700",
            isPlaying ? "opacity-50" : "opacity-25"
          )}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          setCurrentTime(v.currentTime)
          if (v.buffered.length > 0) {
            setBuffered(v.buffered.end(v.buffered.length - 1))
          }
          onTimeUpdate?.(e.nativeEvent)
        }}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          setDuration(v.duration)
          setHasError(false)
          onLoadedMetadata?.(e.nativeEvent)
        }}
        onPlay={() => {
          setIsPlaying(true)
          onPlayingChange?.(true)
        }}
        onPause={() => {
          setIsPlaying(false)
          onPlayingChange?.(false)
        }}
        onEnded={(e) => {
          setIsPlaying(false)
          onPlayingChange?.(false)
          onEnded?.(e.nativeEvent)
        }}
        onError={(e) => {
          setHasError(true)
          onVideoError?.(e.nativeEvent)
        }}
        onClick={togglePlay}
        className="size-full cursor-pointer bg-black object-contain"
      />

      {/* Header Bar */}
      {!embedded && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-linear-to-b from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-200",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {title ? (
            <span className="truncate text-xs font-bold text-white drop-shadow-md sm:text-sm">
              {title}
            </span>
          ) : (
            <div />
          )}

          <div className="pointer-events-auto flex items-center gap-2">
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-black/80 hover:text-white"
              >
                <YouTubeIcon className="size-3.5 text-red-500" />
                <span className="hidden sm:inline">Watch on YouTube</span>
              </a>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close video"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={16}
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div
        className={cn(
          "pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex flex-col bg-linear-to-t from-black/90 via-black/60 to-transparent px-3 pt-6 pb-2.5 transition-opacity duration-200 sm:px-4 sm:pb-3.5",
          showControls || !isPlaying
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {/* Scrubber */}
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
          onPointerUp={() => setIsScrubbing(false)}
          onPointerCancel={() => setIsScrubbing(false)}
          className="group/timeline relative flex h-4 w-full cursor-pointer touch-none items-center py-1.5"
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-all duration-150 group-hover/timeline:h-1.5">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/40"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all duration-75"
              style={{ width: `${playedPercent}%` }}
            />
          </div>

          <div
            className="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-white shadow-md ring-2 ring-primary transition-transform group-hover/timeline:scale-125"
            style={{ left: `${playedPercent}%` }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-1 text-white">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/90 transition-transform hover:text-white active:scale-95 sm:size-9"
            >
              <HugeiconsIcon
                icon={isPlaying ? PauseIcon : PlayIcon}
                size={22}
                strokeWidth={2.2}
                className={!isPlaying ? "ml-0.5 fill-current" : "fill-current"}
              />
            </button>

            {onNext && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Next track"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              >
                <HugeiconsIcon icon={NextIcon} size={18} strokeWidth={2} />
              </button>
            )}

            <div className="group/vol flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              >
                <HugeiconsIcon
                  icon={
                    isMuted || volume === 0
                      ? VolumeOffIcon
                      : volume < 0.5
                        ? VolumeLowIcon
                        : VolumeHighIcon
                  }
                  size={19}
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
                className="h-1 w-12 cursor-pointer appearance-none rounded-full bg-white/30 accent-white sm:w-16"
              />
            </div>

            <div className="ml-1 font-mono text-xs text-white/80">
              <span>{formatDuration(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={cycleSpeed}
              title="Playback speed"
              className="cursor-pointer rounded-lg bg-white/10 px-2 py-0.5 font-mono text-xs font-bold text-white/90 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            >
              {playbackRate}x
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:text-white active:scale-95"
            >
              <HugeiconsIcon
                icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon}
                size={18}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center backdrop-blur-md">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2} />
          </div>
          <p className="text-sm font-semibold text-white">Playback Error</p>
          <p className="max-w-xs text-xs text-zinc-400">
            The media stream could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false)
              videoRef.current?.load()
            }}
            className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            Retry Playback
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Unified Video Player Component.
 * Automatically handles YouTube trailers and direct stream videos.
 */
export { YouTubePlayer }

export function Video(props: VideoProps) {
  const { youtubeId: explicitYtId, src, ...rest } = props
  const resolvedYtId = extractYouTubeId(src, explicitYtId)

  if (resolvedYtId) {
    return (
      <YouTubePlayer
        videoId={resolvedYtId}
        title={props.title}
        customThumbnail={props.poster}
        autoPlay={props.autoPlay}
        className={props.className}
        containerClassName={props.containerClassName}
        onClose={props.onClose}
      />
    )
  }

  if (props.loading || !src) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-2xl border border-border/40 bg-zinc-950/90 shadow-2xl",
          props.containerClassName
        )}
      >
        <div className="size-full animate-pulse bg-muted/40" />
      </div>
    )
  }

  return <DirectStreamPlayer {...rest} src={src} />
}
