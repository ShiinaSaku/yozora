import * as React from "react"
import { SpotlightHero } from "@/components/anime/spotlight-hero"
import { SaveDialog } from "@/components/anime/save-dialog"
import type { SaveableAnime } from "@/components/anime/save-dialog"
import type { Anime } from "@/lib/types/anime"

export function HomeInteractions({
  trending,
  catalog,
}: {
  trending: Anime[]
  catalog: SaveableAnime[]
}) {
  const [selectedAnime, setSelectedAnime] = React.useState<SaveableAnime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest<HTMLButtonElement>("[data-save-anime]")
      if (!button) return
      const anime = catalog.find((item) => item.id === Number(button.dataset.saveAnime))
      if (anime) {
        setSelectedAnime(anime)
        setSaveOpen(true)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [catalog])

  return (
    <>
      {trending.length > 0 && (
        <SpotlightHero
          items={trending}
          onSaveClick={(anime) => {
            setSelectedAnime(anime)
            setSaveOpen(true)
          }}
        />
      )}
      <SaveDialog anime={selectedAnime} open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  )
}
