import { YouTubePlayer } from "@/components/ui/youtube-video-player"
import type { AnimeTrailer } from "@/lib/types/anime"

interface TrailerDialogProps {
  trailer: AnimeTrailer | null | undefined
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrailerDialog({
  trailer,
  title,
  open,
  onOpenChange,
}: TrailerDialogProps) {
  if (!open || !trailer || !trailer.id) {
    return null
  }

  const fallbackThumbnail =
    trailer.thumbnail ||
    `https://img.youtube.com/vi/${trailer.id}/maxresdefault.jpg`

  return (
    <YouTubePlayer
      videoId={trailer.id}
      title={`${title} - Official Trailer`}
      customThumbnail={fallbackThumbnail}
      defaultExpanded={true}
      autoPlay={true}
      onClose={() => onOpenChange(false)}
    />
  )
}
