import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CdIcon, PauseIcon, PlayIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
          "w-0.5 rounded-full bg-current transition-[height,transform] duration-300",
          isPlaying ? "h-3.5 animate-pulse" : "h-1"
        )}
      />
      <span
        className={cn(
          "w-0.5 rounded-full bg-current transition-[height,transform] duration-300",
          isPlaying ? "h-2.5 animate-pulse delay-100" : "h-1.5"
        )}
      />
      <span
        className={cn(
          "w-0.5 rounded-full bg-current transition-[height,transform] duration-300",
          isPlaying ? "h-3 animate-pulse delay-200" : "h-1"
        )}
      />
    </div>
  )
}

/**
 * Apple Music style theme soundtrack tracklist row.
 */
const ThemeTrackRow = React.memo(
  ({
    theme,
    isCurrent,
    isPlaying,
    currentMode,
    unsupported,
    onPlay,
  }: {
    theme: AnimeTheme
    isCurrent: boolean
    isPlaying: boolean
    currentMode: "video" | "audio"
    unsupported: boolean
    onPlay: (theme: AnimeTheme, mode?: "video" | "audio") => void
  }) => {
    const videoNode = theme.entries[0]?.video || theme.entries[0]?.videos?.[0]
    const hasVideo = Boolean(videoNode?.link)
    const playable = hasVideo && !unsupported
    const videoQuality = videoNode?.resolution || 1080

    return (
      <div
        role="button"
        tabIndex={playable ? 0 : undefined}
        className={cn(
          "group flex items-center justify-between rounded-2xl border p-3 transition-colors duration-200 select-none sm:p-3.5",
          isCurrent
            ? "border-primary/60 bg-primary/10 shadow-sm ring-1 ring-primary/20"
            : playable
              ? "cursor-pointer border-border/40 bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs active:scale-[0.99]"
              : "cursor-not-allowed border-border/20 bg-muted/10 opacity-50"
        )}
        onClick={() => playable && onPlay(theme)}
        onKeyDown={(e) => {
          if (playable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onPlay(theme)
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl font-mono text-xs font-bold transition-[background-color,box-shadow,transform] duration-300",
              isCurrent
                ? cn(
                    "scale-105 text-white ring-1 ring-white/25",
                    theme.type === "OP"
                      ? "bg-linear-to-br from-sky-400 via-primary to-fuchsia-500 shadow-[0_8px_20px_-8px_var(--primary)]"
                      : "bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_8px_20px_-8px_#10b98199]"
                  )
                : "bg-muted text-muted-foreground group-hover:bg-muted/70 group-hover:text-foreground"
            )}
          >
            {isCurrent && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-[shimmer_2.4s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/45 to-transparent"
              />
            )}
            <span className="relative z-10 flex items-center justify-center">
              {isCurrent ? (
                <EqualizerBars isPlaying={isPlaying} />
              ) : (
                `${theme.type}${theme.sequence || 1}`
              )}
            </span>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                {theme.title || `${theme.type} ${theme.sequence || 1}`}
              </span>
              {theme.entries[0]?.version && theme.entries[0].version > 1 && (
                <span className="py-0.2 rounded bg-muted/60 px-1.5 font-mono text-[10px] font-bold text-muted-foreground">
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
          {hasVideo && !unsupported ? (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={isCurrent ? "default" : "secondary"}
                className={cn(
                  "interactive-press gap-1.5 rounded-xl text-xs font-bold shadow-xs",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay(theme, "video")
                }}
              >
                <HugeiconsIcon
                  icon={isCurrent && isPlaying ? PauseIcon : PlayIcon}
                  size={14}
                  strokeWidth={2.5}
                  className={
                    !isPlaying ? "ml-0.5 fill-current" : "fill-current"
                  }
                  data-icon="inline-start"
                />
                <span>{isCurrent && isPlaying ? "Playing" : "Stream"}</span>
                <span className="hidden font-mono text-[10px] opacity-75 sm:inline">
                  {isCurrent && currentMode === "audio"
                    ? "Audio"
                    : `${videoQuality}p`}
                </span>
              </Button>
            </div>
          ) : hasVideo && unsupported ? (
            <span className="px-2 text-[11px] text-muted-foreground italic">
              VP9 WebM unsupported
            </span>
          ) : (
            <span className="px-2 text-[11px] text-muted-foreground italic">
              Audio only
            </span>
          )}
        </div>
      </div>
    )
  }
)

interface PlayerState {
  activeTheme: AnimeTheme | null
  activeVideoUrl: string | null
  activeAudioUrl: string | null
  mode: "video" | "audio"
  isCinema: boolean
  isPlaying: boolean
  playNonce: number
  currentTime: number
  duration: number
  buffered: number
  volume: number
  isMuted: boolean
  isLooping: boolean
  playbackRate: number
  activeTab: "OP" | "ED"
  supportsWebm: boolean
}

type PlayerAction =
  | {
      type: "PLAY_THEME"
      theme: AnimeTheme
      videoUrl: string
      audioUrl?: string
      mode?: "video" | "audio"
    }
  | { type: "STOP" }
  | { type: "SET_PLAYING"; isPlaying: boolean }
  | { type: "SET_TIME"; currentTime: number; buffered?: number }
  | { type: "SET_METADATA"; duration: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_LOOP" }
  | { type: "SET_SPEED"; playbackRate: number }
  | { type: "SET_TAB"; tab: "OP" | "ED" }
  | { type: "SET_SUPPORTS_WEBM"; supported: boolean }
  | { type: "SET_MODE"; mode: "video" | "audio" }
  | { type: "SET_CINEMA"; isCinema: boolean }
  | { type: "TOGGLE_CINEMA" }

const initialPlayerState: PlayerState = {
  activeTheme: null,
  activeVideoUrl: null,
  activeAudioUrl: null,
  mode: "video",
  isCinema: false,
  isPlaying: false,
  playNonce: 0,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 1,
  isMuted: false,
  isLooping: false,
  playbackRate: 1,
  activeTab: "OP",
  supportsWebm: true,
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY_THEME":
      return {
        ...state,
        activeTheme: action.theme,
        activeVideoUrl: action.videoUrl,
        activeAudioUrl: action.audioUrl || action.videoUrl,
        mode: action.mode || state.mode,
        playNonce: state.playNonce + 1,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        isPlaying: true,
      }
    case "STOP":
      return {
        ...state,
        activeTheme: null,
        activeVideoUrl: null,
        activeAudioUrl: null,
        isPlaying: false,
        isCinema: false,
      }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.isPlaying }
    case "SET_TIME":
      return {
        ...state,
        currentTime: action.currentTime,
        buffered:
          action.buffered !== undefined ? action.buffered : state.buffered,
      }
    case "SET_METADATA":
      return { ...state, duration: action.duration }
    case "SET_VOLUME":
      return { ...state, volume: action.volume, isMuted: action.volume === 0 }
    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted }
    case "TOGGLE_LOOP":
      return { ...state, isLooping: !state.isLooping }
    case "SET_SPEED":
      return { ...state, playbackRate: action.playbackRate }
    case "SET_TAB":
      return { ...state, activeTab: action.tab }
    case "SET_SUPPORTS_WEBM":
      return { ...state, supportsWebm: action.supported }
    case "SET_MODE":
      return { ...state, mode: action.mode }
    case "SET_CINEMA":
      return { ...state, isCinema: action.isCinema }
    case "TOGGLE_CINEMA":
      return { ...state, isCinema: !state.isCinema }
    default:
      return state
  }
}

/**
 * Main Theme & Soundtrack Visualizer Player Component.
 * Supports 1080p Video, background audio playback with screen off,
 * and responsive horizontal/landscape mobile layout.
 */
export function ThemePlayer({
  themes,
  animeTitle = "Anime",
  animeCover = "/yozora-icon-512.png",
  animeBanner,
}: ThemePlayerProps) {
  const [state, dispatch] = React.useReducer(playerReducer, initialPlayerState)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Detect WebM VP9 support for iOS Safari compatibility
  React.useEffect(() => {
    const probe = document.createElement("video")
    const supported = Boolean(
      probe.canPlayType('video/webm; codecs="vp9"') ||
      probe.canPlayType("video/webm")
    )
    dispatch({ type: "SET_SUPPORTS_WEBM", supported })
  }, [])

  // Lock body scroll when cinema mode is active
  React.useEffect(() => {
    if (state.isCinema) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [state.isCinema])

  // Escape key exits cinema mode
  React.useEffect(() => {
    if (!state.isCinema) {
      return
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch({ type: "SET_CINEMA", isCinema: false })
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [state.isCinema])

  const openings = React.useMemo(
    () => themes.filter((t) => t.type === "OP"),
    [themes]
  )
  const endings = React.useMemo(
    () => themes.filter((t) => t.type === "ED"),
    [themes]
  )
  const currentList = state.activeTab === "OP" ? openings : endings

  const playTheme = React.useCallback(
    (theme: AnimeTheme, requestedMode?: "video" | "audio") => {
      const videoNode = theme.entries[0]?.video || theme.entries[0]?.videos?.[0]
      if (!videoNode?.link) {
        return
      }
      const videoUrl = videoNode.link
      const audioUrl = videoNode.audio?.link || videoNode.link
      dispatch({
        type: "PLAY_THEME",
        theme,
        videoUrl,
        audioUrl,
        mode: requestedMode || state.mode,
      })
    },
    [state.mode]
  )

  // Auto-play when media src loads or track changes
  React.useEffect(() => {
    if (!state.activeTheme) {
      return
    }
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (!el) {
      return
    }
    el.play().catch(() => dispatch({ type: "SET_PLAYING", isPlaying: false }))
  }, [state.playNonce, state.mode, state.activeTheme])

  const togglePlay = () => {
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (!el) {
      return
    }
    if (state.isPlaying) {
      el.pause()
    } else {
      el.play().catch(() => {})
    }
  }

  // Smooth mode toggle preserving current playback position
  const toggleMode = () => {
    const currentEl =
      state.mode === "video" ? videoRef.current : audioRef.current
    const curTime = currentEl?.currentTime || state.currentTime || 0
    const wasPlaying = state.isPlaying
    const nextMode = state.mode === "video" ? "audio" : "video"

    if (currentEl) {
      currentEl.pause()
    }

    dispatch({ type: "SET_MODE", mode: nextMode })

    setTimeout(() => {
      const nextEl = nextMode === "video" ? videoRef.current : audioRef.current
      if (nextEl) {
        nextEl.currentTime = curTime
        nextEl.playbackRate = state.playbackRate
        nextEl.volume = state.volume
        nextEl.muted = state.isMuted
        nextEl.loop = state.isLooping
        if (wasPlaying) {
          nextEl
            .play()
            .catch(() => dispatch({ type: "SET_PLAYING", isPlaying: false }))
        }
      }
    }, 50)
  }

  const handleTimeUpdate = () => {
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (!el) {
      return
    }
    const current = el.currentTime
    const buf =
      el.buffered.length > 0
        ? el.buffered.end(el.buffered.length - 1)
        : undefined
    dispatch({ type: "SET_TIME", currentTime: current, buffered: buf })
  }

  const handleLoadedMetadata = () => {
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (!el) {
      return
    }
    dispatch({ type: "SET_METADATA", duration: el.duration })
    el.playbackRate = state.playbackRate
    el.volume = state.volume
    el.muted = state.isMuted
    el.loop = state.isLooping
  }

  const handleSeek = React.useCallback(
    (time: number) => {
      dispatch({ type: "SET_TIME", currentTime: time })
      const el = state.mode === "video" ? videoRef.current : audioRef.current
      if (el) {
        el.currentTime = time
      }
    },
    [state.mode]
  )

  const handleVolumeChange = (val: number) => {
    dispatch({ type: "SET_VOLUME", volume: val })
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (el) {
      el.volume = val
      el.muted = val === 0
    }
  }

  const toggleMute = () => {
    dispatch({ type: "TOGGLE_MUTE" })
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (el) {
      el.muted = !state.isMuted
    }
  }

  const toggleLoop = () => {
    dispatch({ type: "TOGGLE_LOOP" })
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (el) {
      el.loop = !state.isLooping
    }
  }

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(state.playbackRate) + 1) % speeds.length
    const nextSpeed = speeds[nextIdx]
    dispatch({ type: "SET_SPEED", playbackRate: nextSpeed })
    const el = state.mode === "video" ? videoRef.current : audioRef.current
    if (el) {
      el.playbackRate = nextSpeed
    }
  }

  const playPrev = React.useCallback(() => {
    if (!state.activeTheme) {
      return
    }
    const currentIndex = currentList.findIndex(
      (t) => t.id === state.activeTheme?.id
    )
    if (currentIndex > 0) {
      playTheme(currentList[currentIndex - 1], state.mode)
    } else if (currentList.length > 0) {
      playTheme(currentList[currentList.length - 1], state.mode)
    }
  }, [state.activeTheme, currentList, playTheme, state.mode])

  const playNext = React.useCallback(() => {
    if (!state.activeTheme) {
      return
    }
    const currentIndex = currentList.findIndex(
      (t) => t.id === state.activeTheme?.id
    )
    if (currentIndex !== -1 && currentIndex + 1 < currentList.length) {
      playTheme(currentList[currentIndex + 1], state.mode)
    } else if (currentList.length > 0) {
      playTheme(currentList[0], state.mode)
    }
  }, [state.activeTheme, currentList, playTheme, state.mode])

  // Complete MediaSession sync for mobile background audio & lock screen controls
  React.useEffect(() => {
    if (!("mediaSession" in navigator) || !state.activeTheme) {
      return
    }

    const typePrefix = `${state.activeTheme.type}${state.activeTheme.sequence || 1}`
    const songTitle = state.activeTheme.title || `${typePrefix} - ${animeTitle}`
    const artistName =
      state.activeTheme.artists.length > 0
        ? state.activeTheme.artists.join(", ")
        : animeTitle

    const artworkList: MediaImage[] = []
    if (animeCover) {
      artworkList.push({
        src: animeCover,
        sizes: "512x512",
        type: "image/jpeg",
      })
    }
    if (animeBanner) {
      artworkList.push({
        src: animeBanner,
        sizes: "1280x720",
        type: "image/jpeg",
      })
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${songTitle} (${typePrefix})`,
      artist: artistName,
      album: animeTitle,
      artwork: artworkList,
    })

    navigator.mediaSession.playbackState = state.isPlaying
      ? "playing"
      : "paused"

    navigator.mediaSession.setActionHandler("play", () => {
      const el = state.mode === "video" ? videoRef.current : audioRef.current
      el?.play().catch(() => {})
      dispatch({ type: "SET_PLAYING", isPlaying: true })
    })

    navigator.mediaSession.setActionHandler("pause", () => {
      const el = state.mode === "video" ? videoRef.current : audioRef.current
      el?.pause()
      dispatch({ type: "SET_PLAYING", isPlaying: false })
    })

    navigator.mediaSession.setActionHandler("previoustrack", playPrev)
    navigator.mediaSession.setActionHandler("nexttrack", playNext)

    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skip = details.seekOffset || 10
      handleSeek(Math.max(0, state.currentTime - skip))
    })

    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skip = details.seekOffset || 10
      handleSeek(Math.min(state.duration, state.currentTime + skip))
    })

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        handleSeek(details.seekTime)
      }
    })

    navigator.mediaSession.setActionHandler("stop", () => {
      dispatch({ type: "STOP" })
    })

    if ("setPositionState" in navigator.mediaSession && state.duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, state.duration),
          playbackRate: state.playbackRate || 1,
          position: Math.min(Math.max(0, state.currentTime), state.duration),
        })
      } catch {
        // Ignore edge-case timestamp errors
      }
    }

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null)
        navigator.mediaSession.setActionHandler("pause", null)
        navigator.mediaSession.setActionHandler("previoustrack", null)
        navigator.mediaSession.setActionHandler("nexttrack", null)
        navigator.mediaSession.setActionHandler("seekbackward", null)
        navigator.mediaSession.setActionHandler("seekforward", null)
        navigator.mediaSession.setActionHandler("seekto", null)
        navigator.mediaSession.setActionHandler("stop", null)
      }
    }
  }, [
    state.activeTheme,
    state.isPlaying,
    state.mode,
    state.currentTime,
    state.duration,
    state.playbackRate,
    animeTitle,
    animeCover,
    animeBanner,
    handleSeek,
    playPrev,
    playNext,
  ])

  if (themes.length === 0) {
    return null
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border/50 bg-card shadow-lg">
      <CardHeader className="border-b border-border/40 px-6 pt-6 pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={CdIcon} size={18} strokeWidth={2} />
            </div>
            <span>Official Themes & Soundtracks</span>
            <Badge variant="secondary" className="font-mono text-xs font-bold">
              {themes.length} Tracks
            </Badge>
          </CardTitle>

          <div className="flex items-center rounded-xl border border-border/50 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_TAB", tab: "OP" })}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                state.activeTab === "OP"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Openings ({openings.length})
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_TAB", tab: "ED" })}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                state.activeTab === "ED"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Endings ({endings.length})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
        {!state.supportsWebm && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-600 sm:text-sm dark:text-amber-400">
            Theme videos are streamed in WebM VP9 format. You can switch to
            Audio mode for universal playback on any mobile browser.
          </div>
        )}

        {state.activeTheme &&
          (state.activeVideoUrl || state.activeAudioUrl) && (
            <ThemeVideoPlayer
              containerRef={containerRef}
              videoRef={videoRef}
              audioRef={audioRef}
              activeTheme={state.activeTheme}
              activeVideoUrl={state.activeVideoUrl || ""}
              activeAudioUrl={state.activeAudioUrl}
              mode={state.mode}
              isCinema={state.isCinema}
              animeCover={animeCover}
              animeTitle={animeTitle}
              isPlaying={state.isPlaying}
              currentTime={state.currentTime}
              duration={state.duration}
              buffered={state.buffered}
              volume={state.volume}
              isMuted={state.isMuted}
              isLooping={state.isLooping}
              playbackRate={state.playbackRate}
              onClose={() => dispatch({ type: "STOP" })}
              onTogglePlay={togglePlay}
              onToggleMode={toggleMode}
              onToggleCinema={() => dispatch({ type: "TOGGLE_CINEMA" })}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
              onCycleSpeed={cycleSpeed}
              onToggleLoop={toggleLoop}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlayNext={playNext}
              setIsPlaying={(p) =>
                dispatch({ type: "SET_PLAYING", isPlaying: p })
              }
            />
          )}

        <div className="flex flex-col gap-2">
          {currentList.map((theme) => (
            <ThemeTrackRow
              key={theme.id}
              theme={theme}
              isCurrent={state.activeTheme?.id === theme.id}
              isPlaying={state.isPlaying}
              currentMode={state.mode}
              unsupported={!state.supportsWebm}
              onPlay={playTheme}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
