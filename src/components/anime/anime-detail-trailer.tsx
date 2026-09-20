import { HugeiconsIcon } from "@hugeicons/react"
import { Video02Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { YouTubeIcon } from "@/components/icons/platform-icons"
import { Video } from "@/components/ui/video"
import type { AnimeTrailer } from "@/lib/types/anime"

interface AnimeDetailTrailerProps {
  trailer?: AnimeTrailer | null
  title: string
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
      className="relative scroll-mt-20 overflow-hidden rounded-3xl border-border/50 bg-card shadow-lg"
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 px-6 pt-6 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <div className="flex size-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
            <HugeiconsIcon icon={Video02Icon} size={18} strokeWidth={2} />
          </div>
          <span>Official Promotional Trailer</span>
        </CardTitle>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <YouTubeIcon className="size-4 text-red-500" />
          <span>YouTube Stream</span>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6">
        <Video
          youtubeId={trailer.id}
          poster={fallbackThumbnail}
          title={`${title} - Official Trailer`}
          ambient={true}
        />
      </CardContent>
    </Card>
  )
}
