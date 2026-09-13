import * as React from "react"
import { Video } from "@/components/ui/video"
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
  // Close on Escape key
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!open || !trailer || !trailer.id) {
    return null
  }

  const fallbackThumbnail =
    trailer.thumbnail ||
    `https://img.youtube.com/vi/${trailer.id}/maxresdefault.jpg`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
      <button
        type="button"
        aria-label="Close trailer backdrop"
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 cursor-pointer border-none bg-black/85 backdrop-blur-xl transition-opacity duration-200"
      />

      <div className="relative z-10 w-full max-w-4xl">
        <Video
          youtubeId={trailer.id}
          poster={fallbackThumbnail}
          title={title}
          ambient={true}
          autoPlay={true}
          onClose={() => onOpenChange(false)}
        />
      </div>
    </div>
  )
}
