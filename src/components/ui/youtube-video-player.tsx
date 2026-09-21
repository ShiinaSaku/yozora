"use client"

import * as React from "react"
import { Maximize2, Minimize2, Play } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface YouTubePlayerProps {
  videoId: string
  title?: string
  defaultExpanded?: boolean
  customThumbnail?: string

  // Container & Layout
  className?: string
  containerClassName?: string
  expandedClassName?: string

  // Thumbnail & Media
  thumbnailClassName?: string
  thumbnailImageClassName?: string

  // Play Button
  playButtonClassName?: string
  playIconClassName?: string

  // Title
  titleClassName?: string

  // Controls
  controlsClassName?: string
  expandButtonClassName?: string

  // Backdrop
  backdropClassName?: string

  // Player
  playerClassName?: string

  // Callbacks
  onClose?: () => void
  autoPlay?: boolean
}

// Controls Component
export interface YouTubePlayerControlsProps {
  videoId: string
  expanded: boolean
  playing: boolean
  isHovered: boolean
  onToggleExpand: () => void
  controlsClassName?: string
  expandButtonClassName?: string
}

export function YouTubePlayerControls({
  videoId,
  expanded,
  playing,
  isHovered,
  onToggleExpand,
  controlsClassName,
  expandButtonClassName,
}: YouTubePlayerControlsProps) {
  const shouldShow = !playing || isHovered || expanded

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          layoutId={`youtube-player-controls-${videoId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("absolute top-2 right-2 z-20", controlsClassName)}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="icon"
              onClick={onToggleExpand}
              className={cn(
                "h-8 w-8 rounded-full border border-white/10 bg-background/50 backdrop-blur-md hover:bg-background/80 focus-visible:ring-ring/50 md:h-9 md:w-9",
                expandButtonClassName
              )}
              aria-label={expanded ? "Minimize video" : "Maximize video"}
            >
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function YouTubePlayer({
  videoId,
  title,
  defaultExpanded = false,
  customThumbnail,
  autoPlay = false,
  className,
  containerClassName,
  expandedClassName,
  thumbnailClassName,
  thumbnailImageClassName,
  playButtonClassName,
  playIconClassName,
  titleClassName,
  controlsClassName,
  expandButtonClassName,
  backdropClassName,
  playerClassName,
  onClose,
}: YouTubePlayerProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [playing, setPlaying] = React.useState(autoPlay)
  const [isHovered, setIsHovered] = React.useState(false)

  // Extract video ID from any YouTube URL format or clean ID
  const extractVideoId = (id: string): string => {
    if (!id) return ""
    const match = id.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|youtube-nocookie\.com\/embed\/)([\w-]{11})/
    )
    if (match) return match[1]

    if (id.includes("youtube.com") || id.includes("youtu.be")) {
      try {
        const url = new URL(id)
        if (id.includes("youtube.com")) {
          return url.searchParams.get("v") || ""
        }
        return url.pathname.substring(1)
      } catch {
        return id
      }
    }
    return id
  }

  const actualVideoId = extractVideoId(videoId)

  const handlePlay = () => {
    setPlaying(true)
  }

  const toggleExpand = () => {
    const next = !expanded
    setExpanded(next)
    if (!next && onClose) {
      onClose()
    }
  }

  // Handle Escape key to minimize when expanded
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false)
        onClose?.()
      }
    }
    if (expanded) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [expanded, onClose])

  const getThumbnailUrl = () => {
    if (customThumbnail) return customThumbnail
    return actualVideoId
      ? `https://i.ytimg.com/vi/${actualVideoId}/maxresdefault.jpg`
      : ""
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${actualVideoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`

  return (
    <>
      {/* Main container - in the document flow */}
      <div
        className={cn(
          "relative w-full",
          expanded ? "invisible" : "visible",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          layoutId={`youtube-player-${videoId}`}
          className={cn(
            "overflow-hidden rounded-2xl border border-white/15 bg-card text-card-foreground shadow-xl",
            containerClassName
          )}
        >
          <motion.div
            layoutId={`youtube-player-content-${videoId}`}
            className={cn(
              "relative aspect-video w-full bg-black",
              playerClassName
            )}
          >
            {!playing ? (
              <>
                <motion.div
                  layoutId={`youtube-player-thumbnail-container-${videoId}`}
                  className={cn(
                    "absolute inset-0 overflow-hidden bg-gradient-to-br from-muted to-muted/80",
                    thumbnailClassName
                  )}
                >
                  {getThumbnailUrl() && (
                    <motion.img
                      layoutId={`youtube-player-thumbnail-${videoId}`}
                      src={getThumbnailUrl()}
                      alt={title || "Video thumbnail"}
                      className={cn(
                        "absolute inset-0 size-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-90",
                        thumbnailImageClassName
                      )}
                    />
                  )}
                  {/* Subtle dark gradient scrim for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                </motion.div>

                <motion.div
                  layoutId={`youtube-player-content-overlay-${videoId}`}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className={cn(
                      "relative size-16 rounded-full border border-white/20 bg-background/80 p-0 text-foreground shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95 md:size-20",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                      playButtonClassName
                    )}
                    onClick={handlePlay}
                    aria-label="Play video"
                  >
                    <Play
                      className={cn(
                        "size-6 translate-x-[2px] fill-primary text-primary md:size-8",
                        playIconClassName
                      )}
                    />
                  </Button>

                  {title && (
                    <motion.h3
                      layoutId={`youtube-player-title-${videoId}`}
                      className={cn(
                        "mt-4 line-clamp-2 max-w-md text-xs font-bold text-white drop-shadow-md sm:text-sm md:text-base",
                        titleClassName
                      )}
                    >
                      {title}
                    </motion.h3>
                  )}
                </motion.div>
              </>
            ) : (
              <iframe
                src={embedUrl}
                title={title || "YouTube video player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                className="size-full border-0"
              />
            )}

            {/* Controls Overlay */}
            <YouTubePlayerControls
              videoId={videoId}
              expanded={expanded}
              playing={playing}
              isHovered={isHovered}
              onToggleExpand={toggleExpand}
              controlsClassName={controlsClassName}
              expandButtonClassName={expandButtonClassName}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Expanded state - fixed modal view */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed inset-0 z-50 bg-black/85 backdrop-blur-xl",
                backdropClassName
              )}
              onClick={toggleExpand}
              aria-label="Close expanded video"
            />

            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
              <motion.div
                layoutId={`youtube-player-${videoId}`}
                className={cn(
                  "pointer-events-auto aspect-video max-h-[90vh] w-[95vw] max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-card text-card-foreground shadow-2xl",
                  expandedClassName
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <motion.div
                  layoutId={`youtube-player-content-${videoId}`}
                  className={cn(
                    "relative aspect-video size-full bg-black",
                    playerClassName
                  )}
                >
                  {!playing ? (
                    <>
                      <motion.div
                        layoutId={`youtube-player-thumbnail-container-${videoId}`}
                        className={cn(
                          "absolute inset-0 overflow-hidden bg-gradient-to-br from-muted to-muted/80",
                          thumbnailClassName
                        )}
                      >
                        {getThumbnailUrl() && (
                          <motion.img
                            layoutId={`youtube-player-thumbnail-${videoId}`}
                            src={getThumbnailUrl()}
                            alt={title || "Video thumbnail"}
                            className={cn(
                              "absolute inset-0 size-full object-cover opacity-80",
                              thumbnailImageClassName
                            )}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                      </motion.div>

                      <motion.div
                        layoutId={`youtube-player-content-overlay-${videoId}`}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center"
                      >
                        <Button
                          size="lg"
                          variant="secondary"
                          className={cn(
                            "relative size-16 rounded-full border border-white/20 bg-background/80 p-0 text-foreground shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95 md:size-20",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                            playButtonClassName
                          )}
                          onClick={handlePlay}
                          aria-label="Play video"
                        >
                          <Play
                            className={cn(
                              "size-6 translate-x-[2px] fill-primary text-primary md:size-8",
                              playIconClassName
                            )}
                          />
                        </Button>

                        {title && (
                          <motion.h3
                            layoutId={`youtube-player-title-${videoId}`}
                            className={cn(
                              "mt-4 line-clamp-2 max-w-md text-sm font-bold text-white drop-shadow-md md:text-base",
                              titleClassName
                            )}
                          >
                            {title}
                          </motion.h3>
                        )}
                      </motion.div>
                    </>
                  ) : (
                    <iframe
                      src={embedUrl}
                      title={title || "YouTube video player"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      className="size-full border-0"
                    />
                  )}

                  {/* Controls Overlay */}
                  <YouTubePlayerControls
                    videoId={videoId}
                    expanded={expanded}
                    playing={playing}
                    isHovered={isHovered}
                    onToggleExpand={toggleExpand}
                    controlsClassName={controlsClassName}
                    expandButtonClassName={expandButtonClassName}
                  />
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default YouTubePlayer
