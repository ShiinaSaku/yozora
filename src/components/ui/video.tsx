import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Backward01Icon,
  Cancel01Icon,
  Forward01Icon,
  FullScreenIcon,
  MinimizeScreenIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  Tv01Icon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from "@hugeicons/core-free-icons"
import { YouTubeIcon } from "@/components/icons/platform-icons"
import Image from "@/components/ui/image"
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
  /**
   * Embedded mode for a parent that owns the chrome (e.g. ThemeVideoPlayer):
   * hides the built-in top header, Picture-in-Picture and fullscreen buttons,
   * and disables the global keyboard shortcuts.
   */
  embedded?: boolean
  /** Class name for the outer container wrapping the video and ambient glow. */
  containerClassName?: string
  /** Class name applied to the outer frame. */
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

function extractYouTubeId(src?: string, explicitId?: string): string | null {
  if (explicitId) return explicitId
  if (!src) return null
  const match = src.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|youtube-nocookie\.com\/embed\/)([\w-]{11})/
  )
  return match ? match[1] : null
}

function formatYouTubeTime(seconds: number): string {
  if (Number.isNaN(seconds) || seconds < 0) return "0:00"
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
 * YouTube Embed Player with Ambient Cinema Halo and tactile preview card.
 */
function YouTubeEmbedPlayer({
  youtubeId,
  poster,
  title,
  ambient = true,
  autoPlay = false,
  containerClassName,
  className,
  onClose,
}: {
  youtubeId: string
  poster?: string
  title?: string
  ambient?: boolean
  autoPlay?: boolean
  containerClassName?: string
  className?: string
  onClose?: () => void
}) {
  const [isPlaying, setIsPlaying] = React.useState(autoPlay)
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
  const thumbnail =
    poster || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`

  return (
    <div
      className={cn(
        "group/yt-video relative aspect-video w-full",
        containerClassName
      )}
    >
      {/* Ambient Cinema Backdrop Glow */}
      {ambient && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-linear-to-tr from-red-600/25 via-primary/20 to-amber-500/25 opacity-40 blur-2xl filter transition-opacity duration-700"
        />
      )}

      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300",
          className
        )}
      >
        {/* Floating Top Bar (Title & Close) */}
        {(title || onClose) && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-linear-to-b from-black/80 via-black/40 to-transparent px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <YouTubeIcon className="size-4 shrink-0 text-red-500" />
              {title && (
                <span className="truncate text-xs font-semibold text-white drop-shadow-sm sm:text-sm">
                  {title}
                </span>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close video"
                className="pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={14}
                  strokeWidth={2.5}
                />
              </button>
            )}
          </div>
        )}

        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={title ? `Play ${title}` : "Play video"}
            className="group relative block size-full cursor-pointer border-0 bg-transparent p-0 text-left select-none"
          >
            <Image
              src={thumbnail}
              alt={title || "Video preview"}
              fill
              quality={90}
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* YouTube Gradient Scrim */}
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/85 via-black/25 to-black/35">
              {/* YouTube Signature Red Play Button with Glow */}
              <div className="flex size-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition-[transform,box-shadow] duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] active:scale-95 sm:size-20">
                <HugeiconsIcon
                  icon={PlayIcon}
                  size={26}
                  strokeWidth={2.5}
                  className="ml-1 fill-current"
                />
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute right-4 bottom-3 left-4 flex items-center justify-between text-xs text-white drop-shadow-md sm:right-6 sm:bottom-4 sm:left-6">
              <span className="font-semibold text-white/90">Click to Play</span>
              <span className="rounded-md border border-white/15 bg-black/60 px-2 py-0.5 font-mono text-[10px] backdrop-blur-md sm:text-xs">
                1080p Cinema
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * YouTube-Grade Direct Video Player.
 * Delivers exact YouTube controls:
 * - Scrubber bar with hover timestamp tooltip
 * - Hover slide-out volume slider
 * - Monospace timestamp display
 * - YouTube keyboard shortcuts (Space, K, J, L, M, F, Arrows)
 * - Centered and side floating ripple feedback icons (+10s, -10s, play/pause)
 * - Fullscreen, PiP, playback speed, ambient glow
 * - Pure Tailwind/CSS with zero heavy WebGL overhead.
 */
function YouTubeStylePlayer(props: VideoProps & { src: string }) {
  const {
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
  } = props

  const internalVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const progressBarRef = React.useRef<HTMLDivElement | null>(null)
  const controlsTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const tapTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapRef = React.useRef(0)
  const isTouchRef = React.useRef(false)

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
  const [hoverTime, setHoverTime] = React.useState<number | null>(null)
  const [hoverXRatio, setHoverXRatio] = React.useState(0)
  const [rippleFeedback, setRippleFeedback] = React.useState<{
    type: "play" | "pause" | "forward" | "backward"
    key: number
  } | null>(null)
  const [hasError, setHasError] = React.useState(false)

  // Sync videoRef
  React.useEffect(() => {
    const video = internalVideoRef.current
    if (!video) return

    if (externalVideoRef) {
      if (typeof externalVideoRef === "function") {
        externalVideoRef(video)
      } else {
        externalVideoRef.current = video
      }
    }

    return () => {
      if (externalVideoRef) {
        if (typeof externalVideoRef === "function") {
          externalVideoRef(null)
        } else {
          externalVideoRef.current = null
        }
      }
    }
  }, [externalVideoRef])

  const triggerRipple = (type: "play" | "pause" | "forward" | "backward") => {
    setRippleFeedback({ type, key: Date.now() })
    setTimeout(() => {
      setRippleFeedback((cur) => (cur?.type === type ? null : cur))
    }, 600)
  }

  // Auto-hide controls after 2.5s of inactivity while playing
  const resetControlsTimer = React.useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }
  }, [isPlaying, isScrubbing])

  React.useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [resetControlsTimer])

  // Play / Pause toggle
  const togglePlay = React.useCallback(() => {
    const video = internalVideoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      void video
        .play()
        .then(() => {
          setIsPlaying(true)
          onPlayingChange?.(true)
          triggerRipple("play")
        })
        .catch(() => {
          setIsPlaying(false)
          onPlayingChange?.(false)
        })
    } else {
      video.pause()
      setIsPlaying(false)
      onPlayingChange?.(false)
      triggerRipple("pause")
    }
  }, [onPlayingChange])

  // Seek helper
  const seekTo = React.useCallback((time: number) => {
    const video = internalVideoRef.current
    if (!video || Number.isNaN(time)) return
    const target = Math.max(0, Math.min(video.duration || 0, time))
    video.currentTime = target
    setCurrentTime(target)
  }, [])

  const seekRelative = React.useCallback((delta: number) => {
    const video = internalVideoRef.current
    if (!video) return
    const target = Math.max(
      0,
      Math.min(video.duration || 0, video.currentTime + delta)
    )
    video.currentTime = target
    setCurrentTime(target)
    triggerRipple(delta > 0 ? "forward" : "backward")
  }, [])

  // Volume helper
  const handleVolumeChange = React.useCallback((newVol: number) => {
    const video = internalVideoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, newVol))
    video.volume = clamped
    video.muted = clamped === 0
    setVolume(clamped)
    setIsMuted(clamped === 0)
  }, [])

  const toggleMute = React.useCallback(() => {
    const video = internalVideoRef.current
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

  // Cycle playback speed
  const cycleSpeed = React.useCallback(() => {
    const video = internalVideoRef.current
    if (!video) return
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const nextSpeed = speeds[nextIdx]
    video.playbackRate = nextSpeed
    setPlaybackRate(nextSpeed)
  }, [playbackRate])

  // PiP toggle
  const togglePiP = React.useCallback(async () => {
    const video = internalVideoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
      }
    } catch (err) {
      console.warn("PiP not available:", err)
    }
  }, [])

  // Fullscreen toggle
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
      // Fallback
      setIsFullscreen((prev) => !prev)
    }
  }, [])

  // Fullscreen change listener
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", handleFsChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  // YouTube Keyboard Shortcuts (disabled when embedded; the parent owns them)
  React.useEffect(() => {
    if (embedded) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault()
        togglePlay()
        resetControlsTimer()
      } else if (e.code === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault()
        seekRelative(-10)
        resetControlsTimer()
      } else if (e.code === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault()
        seekRelative(10)
        resetControlsTimer()
      } else if (e.code === "ArrowUp") {
        e.preventDefault()
        handleVolumeChange(volume + 0.05)
        resetControlsTimer()
      } else if (e.code === "ArrowDown") {
        e.preventDefault()
        handleVolumeChange(volume - 0.05)
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

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    embedded,
    togglePlay,
    seekRelative,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    volume,
    resetControlsTimer,
  ])

  // Scrubber drag / pointer calculation
  const handleScrubberPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = clickX / rect.width
    seekTo(ratio * duration)
  }

  const handleScrubberMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = hoverX / rect.width
    setHoverXRatio(ratio)
    setHoverTime(ratio * duration)
  }

  // Mobile tap = toggle controls, double tap = seek ±10s. Desktop click = play/pause.
  const toggleControls = React.useCallback(() => {
    setShowControls((prev) => {
      const next = !prev
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      if (next && isPlaying && !isScrubbing) {
        controlsTimeoutRef.current = setTimeout(
          () => setShowControls(false),
          2500
        )
      }
      return next
    })
  }, [isPlaying, isScrubbing])

  const handleSurfaceClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isTouchRef.current) {
      togglePlay()
      return
    }
    const now = Date.now()
    if (now - lastTapRef.current < 280) {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current)
        tapTimerRef.current = null
      }
      lastTapRef.current = 0
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      if (ratio < 0.4) {
        seekRelative(-10)
      } else if (ratio > 0.6) {
        seekRelative(10)
      } else {
        togglePlay()
      }
      resetControlsTimer()
      return
    }
    lastTapRef.current = now
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null
      toggleControls()
    }, 280)
  }

  React.useEffect(
    () => () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    },
    []
  )

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "group/player relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300 select-none",
        isFullscreen
          ? "h-screen max-h-screen w-screen rounded-none border-0"
          : "",
        containerClassName,
        className
      )}
    >
      {/* Ambient Cinema Backdrop Glow */}
      {ambient && !hasError && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-linear-to-tr from-red-600/30 via-primary/20 to-sky-500/30 opacity-40 blur-3xl filter transition-opacity duration-1000",
            isPlaying ? "opacity-50" : "opacity-25"
          )}
        />
      )}

      {/* HTML5 Video Element */}
      <video
        ref={internalVideoRef}
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
        onTouchStart={() => {
          isTouchRef.current = true
        }}
        onClick={handleSurfaceClick}
        className="size-full cursor-pointer bg-black object-contain"
      />

      {/* Floating Header Bar (Title, YouTube Link, Close) — hidden when embedded */}
      {!embedded && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-linear-to-b from-black/85 via-black/40 to-transparent p-4 transition-opacity duration-200",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-500">
              <YouTubeIcon className="size-4 fill-current" />
            </div>
            {title && (
              <span className="truncate text-xs font-bold text-white drop-shadow-md sm:text-sm">
                {title}
              </span>
            )}
          </div>

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
                className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
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

      {/* Centered / Side YouTube Ripple Icon Feedback */}
      {rippleFeedback && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          {rippleFeedback.type === "play" && (
            <div className="flex size-18 animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] items-center justify-center rounded-full bg-black/75 text-white shadow-2xl backdrop-blur-md">
              <HugeiconsIcon
                icon={PlayIcon}
                size={32}
                className="ml-1 fill-current"
              />
            </div>
          )}
          {rippleFeedback.type === "pause" && (
            <div className="flex size-18 animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1] items-center justify-center rounded-full bg-black/75 text-white shadow-2xl backdrop-blur-md">
              <HugeiconsIcon
                icon={PauseIcon}
                size={32}
                className="fill-current"
              />
            </div>
          )}
          {rippleFeedback.type === "backward" && (
            <div className="absolute left-10 flex animate-pulse flex-col items-center gap-1 rounded-full bg-black/75 px-5 py-4 text-white shadow-2xl backdrop-blur-md">
              <HugeiconsIcon icon={Backward01Icon} size={28} />
              <span className="font-mono text-xs font-bold">10s</span>
            </div>
          )}
          {rippleFeedback.type === "forward" && (
            <div className="absolute right-10 flex animate-pulse flex-col items-center gap-1 rounded-full bg-black/75 px-5 py-4 text-white shadow-2xl backdrop-blur-md">
              <HugeiconsIcon icon={Forward01Icon} size={28} />
              <span className="font-mono text-xs font-bold">10s</span>
            </div>
          )}
        </div>
      )}

      {/* YouTube Bottom Controls Chrome */}
      <div
        className={cn(
          "pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex flex-col bg-linear-to-t from-black/95 via-black/60 to-transparent px-3 pt-6 pb-2.5 transition-opacity duration-200 sm:px-4 sm:pb-3.5",
          showControls || !isPlaying
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        {/* YouTube Scrubber / Progress Bar */}
        <div
          ref={progressBarRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setIsScrubbing(true)
            handleScrubberPointer(e)
          }}
          onPointerMove={(e) => {
            if (isScrubbing) {
              handleScrubberPointer(e)
            }
          }}
          onPointerUp={() => setIsScrubbing(false)}
          onPointerCancel={() => setIsScrubbing(false)}
          onMouseMove={handleScrubberMove}
          onMouseLeave={() => setHoverTime(null)}
          className="group/timeline relative flex h-4 w-full cursor-pointer touch-none items-center py-1.5 select-none"
        >
          {/* Track background */}
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] duration-150 group-hover/timeline:h-1.5">
            {/* Buffered progress */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/40 transition-[width] duration-200"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played progress (YouTube Red) */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.7)] transition-[width] duration-75 ease-out"
              style={{ width: `${playedPercent}%` }}
            />
          </div>

          {/* YouTube Scrubber Thumb Handle */}
          <div
            className="pointer-events-none absolute size-3.5 -translate-x-1/2 scale-0 rounded-full bg-red-600 shadow-md ring-2 ring-white transition-[transform] duration-100 ease-out group-hover/timeline:scale-100"
            style={{ left: `${playedPercent}%` }}
          />

          {/* YouTube Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="pointer-events-none absolute -top-8 z-40 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950/95 px-2 py-0.5 font-mono text-[11px] font-medium text-white shadow-xl backdrop-blur-md"
              style={{
                left: `${Math.min(Math.max(hoverXRatio * 100, 4), 96)}%`,
              }}
            >
              {formatYouTubeTime(hoverTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 text-white select-none">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause (k)" : "Play (k)"}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:text-white active:scale-95"
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
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
              >
                <HugeiconsIcon icon={NextIcon} size={18} strokeWidth={2} />
              </button>
            )}

            <div className="group/vol flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute (m)" : "Mute (m)"}
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
                className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 accent-white opacity-0 transition-all duration-200 group-hover/vol:w-16 group-hover/vol:opacity-100 sm:group-hover/vol:w-20"
              />
            </div>

            <div className="ml-1 font-mono text-xs text-white/90">
              <span>{formatYouTubeTime(currentTime)}</span>
              <span className="mx-1 text-white/50">/</span>
              <span className="text-white/70">
                {formatYouTubeTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={cycleSpeed}
              title="Playback speed"
              className="cursor-pointer rounded-lg bg-white/10 px-2 py-1 font-mono text-xs font-bold text-white/90 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
            >
              {playbackRate}x
            </button>

            {/* PiP and fullscreen are delegated to parent when embedded */}
            {!embedded && (
              <>
                <button
                  type="button"
                  onClick={togglePiP}
                  aria-label="Picture in Picture"
                  title="Picture in Picture"
                  className="hidden size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:text-white sm:flex"
                >
                  <HugeiconsIcon icon={Tv01Icon} size={18} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={
                    isFullscreen ? "Exit fullscreen (f)" : "Full screen (f)"
                  }
                  title={
                    isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"
                  }
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:text-white active:scale-95"
                >
                  <HugeiconsIcon
                    icon={isFullscreen ? MinimizeScreenIcon : FullScreenIcon}
                    size={18}
                    strokeWidth={2}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {hasError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 p-6 text-center backdrop-blur-md">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <HugeiconsIcon icon={Cancel01Icon} size={24} strokeWidth={2} />
          </div>
          <p className="text-sm font-semibold text-white">
            Video Playback Error
          </p>
          <p className="max-w-xs text-xs text-zinc-400">
            The media stream could not be loaded or network was interrupted.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false)
              const v = internalVideoRef.current
              if (v) v.load()
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
 * - Auto-routes YouTube URLs or IDs to the YouTube cinema embed.
 * - Streams direct videos with custom YouTube-grade controls (scrubber, slide-out volume, keyboard shortcuts).
 */
export function Video(props: VideoProps) {
  const { youtubeId: explicitYtId, src, ...rest } = props
  const resolvedYtId = extractYouTubeId(src, explicitYtId)

  if (resolvedYtId) {
    return (
      <YouTubeEmbedPlayer
        youtubeId={resolvedYtId}
        poster={props.poster}
        title={props.title}
        ambient={props.ambient}
        autoPlay={props.autoPlay}
        containerClassName={props.containerClassName}
        className={props.className}
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

  return <YouTubeStylePlayer {...rest} src={src} />
}
