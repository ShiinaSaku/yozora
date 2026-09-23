import { HugeiconsIcon } from "@hugeicons/react"
import { Video02Icon } from "@hugeicons/core-free-icons"
import { Card } from "@/components/ui/card"
import { YouTubeIcon } from "@/components/icons/platform-icons"
import { YouTubePlayer } from "@/components/ui/youtube-video-player"
import type { AnimeTrailer } from "@/lib/types/anime"

interface AnimeDetailTrailerProps {
  trailer?: AnimeTrailer | null
  title: string
  onOpenCinema?: () => void
}

export function AnimeDetailTrailer({
  trailer,
  title,
}: AnimeDetailTrailerProps) {
  if (!trailer || !trailer.id) {
    return null
  }

  const fallbackThumbnail =
    trailer.thumbnail ||
    `https://img.youtube.com/vi/${trailer.id}/maxresdefault.jpg`

  return (
    <Card
      id="trailer"
      variant="large"
      size="none"
      className="relative scroll-mt-20"
    >
      <div className="flex flex-row items-center justify-between border-b border-border/40 px-6 pt-6 pb-4">
        <h3 className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <div className="flex size-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
            <HugeiconsIcon icon={Video02Icon} size={18} strokeWidth={2} />
          </div>
          <span>Official Promotional Trailer</span>
        </h3>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <YouTubeIcon className="size-4 text-red-500" />
          <span>YouTube Stream</span>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        <YouTubePlayer
          videoId={trailer.id}
          title={`${title} - Official Trailer`}
          customThumbnail={fallbackThumbnail}
          className="w-full"
        />
      </div>
    </Card>
  )
}
