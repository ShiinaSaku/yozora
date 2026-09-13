import * as React from "react"
import Image from "@/components/ui/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Backward01Icon,
  Cancel01Icon,
  Forward01Icon,
  FullScreenIcon,
  HeadphonesIcon,
  MinimizeScreenIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  Tv01Icon,
  Video01Icon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Video } from "@/components/ui/video"
import type { AnimeTheme } from "@/lib/types/anime"
import { cn } from "@/lib/utils"

export interface ThemeVideoPlayerProps {
  containerRef?: React.RefObject<HTMLDivElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  audioRef: React.RefObject<HTMLAudioElement | null>
  activeTheme: AnimeTheme
  activeVideoUrl: string
  activeAudioUrl?: string | null
  mode: "video" | "audio"
  isCinema: boolean
  animeCover: string
  animeTitle: string
  isPlaying: boolean
  currentTime: number
  duration: number
  buffered: number
  volume: number
  isMuted: boolean
  isLooping: boolean
  playbackRate: number
  onClose: () => void
  onTogglePlay: () => void
  onToggleMode: () => void
  onToggleCinema: () => void
  onSeek: (time: number) => void
  onVolumeChange: (vol: number) => void
  onToggleMute: () => void
  onCycleSpeed: () => void
  onToggleLoop: () => void
  onTimeUpdate: () => void
  onLoadedMetadata: () => void
  onPlayNext: () => void
  setIsPlaying: (playing: boolean) => void
}

function formatTime(seconds: number): string {
  if (Number.isNaN(seconds) || seconds < 0) {
    return "00:00"
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function ThemeVideoHeader({
  activeTheme,
  animeCover,
  animeTitle,
  showControls,
  mode,
  isCinema,
  onToggleMode,
  onToggleCinema,
  onTogglePiP,
  onClose,
}: {
  activeTheme: AnimeTheme
  animeCover: string
  animeTitle: string
  showControls: boolean
  mode: "video" | "audio"
  isCinema: boolean
  onToggleMode: () => void
  onToggleCinema: () => void
  onTogglePiP: () => void
  onClose: () => void
}) {
  return (
    <div
      style={{
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
      }}
      className={cn(
        "pointer-events-auto absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-linear-to-b from-black/90 via-black/50 to-transparent p-3 transition-opacity duration-300 sm:p-5 landscape:px-4 landscape:py-1.5",
        showControls ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="mr-2 flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="relative size-8 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-md sm:size-10 landscape:size-7">
          <Image
            src={animeCover}
            alt={activeTheme.title}
            fill
            unoptimized
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="xs:max-w-[200px] max-w-35 truncate text-xs font-bold text-white drop-shadow-sm sm:max-w-xs sm:text-sm landscape:text-xs">
              {activeTheme.title ||
                `${activeTheme.type} ${activeTheme.sequence || 1}`}
            </span>
            <Badge className="shrink-0 border-white/10 bg-white/15 px-1.5 py-0 font-mono text-[9px] font-bold text-white backdrop-blur-md sm:text-[10px]">
              {activeTheme.type}
              {activeTheme.sequence || 1}
            </Badge>
          </div>
          <span className="xs:max-w-[200px] max-w-35 truncate text-[10px] text-zinc-400 drop-shadow-sm sm:max-w-xs sm:text-xs">
            {activeTheme.artists.length > 0
              ? activeTheme.artists.join(", ")
              : animeTitle}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleMode}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md transition-all select-none active:scale-95 sm:text-xs",
            mode === "audio"
              ? "border border-emerald-500/40 bg-emerald-500/25 text-emerald-300 shadow-xs"
              : "border border-white/15 bg-white/10 text-white hover:bg-white/20"
          )}
          title={
            mode === "video"
              ? "Switch to Background Audio"
              : "Switch to 1080p Video"
          }
          aria-label={
            mode === "video"
              ? "Switch to Background Audio mode"
              : "Switch to Video mode"
          }
        >
          <HugeiconsIcon
            icon={mode === "video" ? HeadphonesIcon : Video01Icon}
            size={14}
            strokeWidth={2.2}
          />
          <span className="xs:inline hidden">
            {mode === "video" ? "Audio / BG" : "Video"}
          </span>
        </button>

        {mode === "video" && (
          <button
            type="button"
            onClick={onTogglePiP}
            className="interactive-press hidden size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white sm:flex sm:size-9"
            title="Picture in Picture (P)"
            aria-label="Picture in Picture"
          >
            <HugeiconsIcon icon={Tv01Icon} size={15} strokeWidth={2} />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleCinema}
          className="interactive-press flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white sm:size-9"
          title={isCinema ? "Exit Cinema (Esc)" : "Expand to Cinema (F)"}
          aria-label={isCinema ? "Exit cinema mode" : "Enter cinema mode"}
        >
          <HugeiconsIcon
            icon={isCinema ? MinimizeScreenIcon : FullScreenIcon}
            size={15}
            strokeWidth={2}
          />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="interactive-press flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white sm:size-9"
          title="Close theme player (Esc)"
          aria-label="Close theme player"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

function ThemeVideoTimeline({
  duration,
  currentTime,
  buffered,
  isScrubbing,
  setIsScrubbing,
  onSeek,
}: {
  duration: number
  currentTime: number
  buffered: number
  isScrubbing: boolean
  setIsScrubbing: (scrubbing: boolean) => void
  onSeek: (time: number) => void
}) {
  const progressBarRef = React.useRef<HTMLDivElement | null>(null)
  const [scrubPreviewTime, setScrubPreviewTime] = React.useState<number | null>(
    null
  )

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  const handleScrubberPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) {
      return
    }
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = clickX / rect.width
    onSeek(ratio * duration)
  }

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) {
      return
    }
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const ratio = clickX / rect.width
    setScrubPreviewTime(ratio * duration)
  }

  return (
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
      onMouseMove={handleScrubberHover}
      onMouseLeave={() => setScrubPreviewTime(null)}
      className="group/timeline relative flex h-4 w-full cursor-pointer touch-none items-center py-1.5"
    >
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-[height] duration-200 group-hover/timeline:h-2">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-white/30 transition-[width] duration-300"
          style={{ width: `${bufferedPercent}%` }}
        />
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-primary shadow-sm transition-[width] duration-75 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        className="pointer-events-none absolute size-3.5 -translate-x-1/2 scale-75 rounded-full bg-white opacity-0 shadow-md ring-2 ring-primary/80 transition-[transform,opacity] group-hover/timeline:scale-100 group-hover/timeline:opacity-100"
        style={{ left: `${progressPercent}%` }}
      />

      {scrubPreviewTime !== null && (
        <div
          className="pointer-events-none absolute -top-7 z-30 -translate-x-1/2 rounded-md border border-white/15 bg-zinc-900/95 px-1.5 py-0.5 font-mono text-[10px] text-white shadow-lg backdrop-blur-md"
          style={{
            left: `${progressBarRef.current ? Math.min(Math.max((scrubPreviewTime / duration) * 100, 5), 95) : 0}%`,
          }}
        >
          {formatTime(scrubPreviewTime)}
        </div>
      )}
    </div>
  )
}

function ThemeVideoControlsRow({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isLooping,
  playbackRate,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onCycleSpeed,
  onToggleLoop,
}: {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isLooping: boolean
  playbackRate: number
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onVolumeChange: (vol: number) => void
  onToggleMute: () => void
  onCycleSpeed: () => void
  onToggleLoop: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-1.5 pt-0.5 text-white select-none sm:gap-4 landscape:pt-0">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-950 shadow-md transition-transform hover:bg-zinc-200 active:scale-95 sm:size-10 landscape:size-8"
          aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          <HugeiconsIcon
            icon={isPlaying ? PauseIcon : PlayIcon}
            size={16}
            strokeWidth={2.5}
            className={!isPlaying ? "ml-0.5 fill-current" : "fill-current"}
          />
        </button>

        <button
          type="button"
          onClick={() => onSeek(Math.max(0, currentTime - 5))}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white sm:size-8 landscape:size-7"
          title="Seek back 5 seconds (Left Arrow)"
          aria-label="Seek back 5 seconds"
        >
          <HugeiconsIcon icon={Backward01Icon} size={15} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => onSeek(Math.min(duration, currentTime + 5))}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white sm:size-8 landscape:size-7"
          title="Seek forward 5 seconds (Right Arrow)"
          aria-label="Seek forward 5 seconds"
        >
          <HugeiconsIcon icon={Forward01Icon} size={15} strokeWidth={2} />
        </button>

        <div className="group/vol ml-1 hidden shrink-0 items-center gap-1.5 sm:flex landscape:hidden md:landscape:flex">
          <button
            type="button"
            onClick={onToggleMute}
            className="cursor-pointer p-1 text-zinc-400 transition-colors hover:text-white"
            aria-label={isMuted ? "Unmute (M)" : "Mute (M)"}
          >
            <HugeiconsIcon
              icon={
                isMuted || volume === 0
                  ? VolumeOffIcon
                  : volume < 0.5
                    ? VolumeLowIcon
                    : VolumeHighIcon
              }
              size={17}
              strokeWidth={2}
            />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number.parseFloat(e.target.value))}
            className="h-1 w-12 cursor-pointer appearance-none rounded-full bg-white/25 accent-white transition-[height] hover:h-1.5 sm:w-16"
            aria-label="Volume slider"
          />
        </div>

        <span className="ml-0.5 truncate font-mono text-[10px] text-zinc-400 sm:ml-2 sm:text-xs">
          {formatTime(currentTime)} <span className="text-zinc-600">/</span>{" "}
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onCycleSpeed}
          className="cursor-pointer rounded-lg bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/20 sm:px-2 sm:py-1 sm:text-xs"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        <button
          type="button"
          onClick={onToggleLoop}
          className={cn(
            "flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors sm:size-8 landscape:size-7",
            isLooping
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          )}
          title={isLooping ? "Looping enabled" : "Loop disabled"}
          aria-label="Toggle loop"
        >
          <HugeiconsIcon icon={RepeatIcon} size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

/**
 * Audio Mode Visualizer: Plays seamlessly with screen off / in background on mobile.
 */
function ThemeAudioVisualizer({
  animeCover,
  animeTitle,
  activeTheme,
  isPlaying,
  onTogglePlay,
  onToggleMode,
}: {
  animeCover: string
  animeTitle: string
  activeTheme: AnimeTheme
  isPlaying: boolean
  onTogglePlay: () => void
  onToggleMode: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTogglePlay}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          onTogglePlay()
        }
      }}
      className="relative flex aspect-video max-h-[70vh] w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-radial from-zinc-900 via-black to-zinc-950 p-4 outline-none select-none sm:p-8 landscape:max-h-[calc(100dvh-2.5rem)]"
    >
      <div className="pointer-events-none absolute inset-0 scale-125 overflow-hidden opacity-25 blur-3xl filter">
        <Image
          src={animeCover}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center gap-2.5 text-center sm:gap-4">
        <div className="relative size-20 rounded-full border border-white/10 bg-zinc-950 p-1.5 shadow-2xl ring-1 ring-white/15 sm:size-32 landscape:size-16">
          <div
            className={cn(
              "flex size-full items-center justify-center rounded-full bg-linear-to-tr from-zinc-900 via-zinc-800 to-zinc-900 p-1 transition-transform",
              isPlaying ? "animate-[spin_12s_linear_infinite]" : ""
            )}
          >
            <div className="flex size-full items-center justify-center rounded-full border-2 border-zinc-700/40 p-1.5">
              <div className="relative size-10 overflow-hidden rounded-full border border-white/20 shadow-inner sm:size-16 landscape:size-8">
                <Image
                  src={animeCover}
                  alt={activeTheme.title}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
                <div className="absolute inset-0 m-auto size-2 rounded-full border border-white/40 bg-zinc-950" />
              </div>
            </div>
          </div>

          <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md sm:size-7">
            <HugeiconsIcon icon={HeadphonesIcon} size={13} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            <Badge className="border-primary/30 bg-primary/20 font-mono text-[9px] font-bold text-primary sm:text-[10px]">
              {activeTheme.type}
              {activeTheme.sequence || 1}
            </Badge>
            <h3 className="max-w-50 truncate text-xs font-bold text-white sm:max-w-xs sm:text-sm landscape:text-xs">
              {activeTheme.title ||
                `${activeTheme.type} ${activeTheme.sequence || 1}`}
            </h3>
          </div>
          <p className="max-w-60 truncate text-[10px] text-zinc-400 sm:max-w-md sm:text-xs">
            {activeTheme.artists.length > 0
              ? activeTheme.artists.join(", ")
              : animeTitle}
          </p>
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300 sm:text-xs">
            <span
              className={cn(
                "size-1.5 rounded-full bg-emerald-400",
                isPlaying ? "animate-ping" : ""
              )}
            />
            <span>Background Play Active</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleMode()
            }}
            className="cursor-pointer rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-white/20 sm:text-xs"
          >
            Watch Video
          </button>
        </div>
      </div>
    </div>
  )
}

export function ThemeVideoPlayer({
  containerRef: externalContainerRef,
  videoRef,
  audioRef,
  activeTheme,
  activeVideoUrl,
  activeAudioUrl,
  mode,
  isCinema,
  animeCover,
  animeTitle,
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  isLooping,
  playbackRate,
  onClose,
  onTogglePlay,
  onToggleMode,
  onToggleCinema,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onCycleSpeed,
  onToggleLoop,
  onTimeUpdate,
  onLoadedMetadata,
  onPlayNext,
  setIsPlaying,
}: ThemeVideoPlayerProps) {
  const [showControls, setShowControls] = React.useState(true)
  const [isScrubbing, setIsScrubbing] = React.useState(false)
  const controlsTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const localContainerRef = React.useRef<HTMLDivElement | null>(null)
  const containerRef = externalContainerRef || localContainerRef

  const callbacksRef = React.useRef({
    onTogglePlay,
    onSeek,
    onToggleMute,
    onToggleCinema,
    onToggleMode,
    onVolumeChange,
    onClose,
    isPlaying,
    currentTime,
    duration,
    volume,
  })

  React.useEffect(() => {
    callbacksRef.current = {
      onTogglePlay,
      onSeek,
      onToggleMute,
      onToggleCinema,
      onToggleMode,
      onVolumeChange,
      onClose,
      isPlaying,
      currentTime,
      duration,
      volume,
    }
  })

  const resetControlsTimer = React.useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return
      }
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const {
        onTogglePlay: cbTogglePlay,
        onSeek: cbSeek,
        onToggleMute: cbToggleMute,
        onToggleCinema: cbToggleCinema,
        onToggleMode: cbToggleMode,
        onVolumeChange: cbVolumeChange,
        onClose: cbClose,
        currentTime: cbCurrentTime,
        duration: cbDuration,
        volume: cbVolume,
      } = callbacksRef.current

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault()
        cbTogglePlay()
      } else if (e.code === "ArrowLeft" || e.key === "j" || e.key === "J") {
        e.preventDefault()
        cbSeek(Math.max(0, cbCurrentTime - 5))
      } else if (e.code === "ArrowRight" || e.key === "l" || e.key === "L") {
        e.preventDefault()
        cbSeek(Math.min(cbDuration, cbCurrentTime + 5))
      } else if (e.code === "ArrowUp") {
        e.preventDefault()
        cbVolumeChange(Math.min(1, cbVolume + 0.05))
      } else if (e.code === "ArrowDown") {
        e.preventDefault()
        cbVolumeChange(Math.max(0, cbVolume - 0.05))
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        cbToggleMute()
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault()
        cbToggleCinema()
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault()
        cbToggleMode()
      } else if (e.key === "Escape") {
        e.preventDefault()
        cbClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const togglePiP = async () => {
    if (!videoRef.current) {
      return
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (err) {
      console.warn("PiP not available", err)
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "group/cinema relative flex flex-col overflow-hidden border border-white/15 bg-black shadow-2xl transition-all duration-200 select-none",
        isCinema
          ? "fixed inset-0 z-50 h-dvh max-h-dvh w-screen rounded-none border-0"
          : "max-h-[85vh] rounded-2xl sm:rounded-3xl landscape:max-h-[calc(100dvh-1.5rem)]"
      )}
    >
      <div
        className="pointer-events-none absolute -inset-4 -z-10 bg-linear-to-r from-primary/20 via-sky-500/10 to-primary/20 opacity-50 blur-3xl filter"
        aria-hidden="true"
      />

      <ThemeVideoHeader
        activeTheme={activeTheme}
        animeCover={animeCover}
        animeTitle={animeTitle}
        showControls={showControls}
        mode={mode}
        isCinema={isCinema}
        onToggleMode={onToggleMode}
        onToggleCinema={onToggleCinema}
        onTogglePiP={togglePiP}
        onClose={onClose}
      />

      <audio
        ref={audioRef}
        src={mode === "audio" ? activeAudioUrl || activeVideoUrl : undefined}
        preload={mode === "audio" ? "auto" : "none"}
        onTimeUpdate={mode === "audio" ? onTimeUpdate : undefined}
        onLoadedMetadata={mode === "audio" ? onLoadedMetadata : undefined}
        onPlay={() => mode === "audio" && setIsPlaying(true)}
        onPause={() => mode === "audio" && setIsPlaying(false)}
        onEnded={mode === "audio" ? onPlayNext : undefined}
        className="hidden"
      />

      {mode === "audio" ? (
        <ThemeAudioVisualizer
          animeCover={animeCover}
          animeTitle={animeTitle}
          activeTheme={activeTheme}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onToggleMode={onToggleMode}
        />
      ) : (
        <div
          className={cn(
            "relative flex w-full items-center justify-center overflow-hidden bg-black",
            isCinema ? "min-h-0 flex-1" : ""
          )}
        >
          <Video
            src={activeVideoUrl}
            title={`${activeTheme.title || `${activeTheme.type} ${activeTheme.sequence || 1}`} · ${animeTitle}`}
            poster={animeCover}
            ambient={!isCinema}
            autoPlay={true}
            embedded={true}
            videoRef={videoRef}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onPlayNext}
            onNext={onPlayNext}
            onPlayingChange={(playing) => setIsPlaying(playing)}
            className={cn(
              isCinema
                ? "aspect-auto h-full max-h-none w-full rounded-none border-0 shadow-none"
                : "max-h-[calc(100dvh-4rem)] sm:max-h-150 landscape:max-h-[calc(100dvh-2.5rem)]"
            )}
          />
        </div>
      )}

      {mode === "audio" && (
        <div
          style={{
            paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
            paddingRight: "max(0.75rem, env(safe-area-inset-right))",
            paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
          }}
          className={cn(
            "pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1.5 bg-linear-to-t from-black/95 via-black/60 to-transparent p-2.5 transition-opacity duration-300 sm:p-5 landscape:gap-1 landscape:px-4 landscape:py-1.5",
            showControls ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <ThemeVideoTimeline
            duration={duration}
            currentTime={currentTime}
            buffered={buffered}
            isScrubbing={isScrubbing}
            setIsScrubbing={setIsScrubbing}
            onSeek={onSeek}
          />

          <ThemeVideoControlsRow
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            isLooping={isLooping}
            playbackRate={playbackRate}
            onTogglePlay={onTogglePlay}
            onSeek={onSeek}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
            onCycleSpeed={onCycleSpeed}
            onToggleLoop={onToggleLoop}
          />
        </div>
      )}
    </div>
  )
}
