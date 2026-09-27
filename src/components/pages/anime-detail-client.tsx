import * as React from "react"
import { AnimeCard } from "@/components/anime/anime-card"
import { AnimeDetailCharacters } from "@/components/anime/anime-detail-characters"
import { AnimeDetailHero } from "@/components/anime/anime-detail-hero"
import { AnimeDetailSidebar } from "@/components/anime/anime-detail-sidebar"
import { AnimeDetailTrailer } from "@/components/anime/anime-detail-trailer"
import { SaveDialog } from "@/components/anime/save-dialog"
import { ThemePlayer } from "@/components/anime/theme-player"
import { TrailerDialog } from "@/components/anime/trailer-dialog"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getAnimeFaqItems } from "@/lib/seo/json-ld"
import type { Anime, AnimeDetailResponse, AnimeTheme } from "@/lib/types/anime"

interface AnimeDetailClientProps {
  detail: AnimeDetailResponse
  themes: AnimeTheme[]
}

export function AnimeDetailClient({ detail, themes }: AnimeDetailClientProps) {
  const { anime, characters, relations, recommendations, externalLinks } =
    detail
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [trailerOpen, setTrailerOpen] = React.useState(false)
  const [selectedForSave, setSelectedForSave] = React.useState<Anime | null>(
    null
  )

  const faqs = React.useMemo(
    () => getAnimeFaqItems(anime, themes, characters),
    [anime, themes, characters]
  )

  const handleOpenSave = (target: Anime) => {
    setSelectedForSave(target)
    setSaveOpen(true)
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      <AnimeDetailHero
        anime={anime}
        onSaveClick={() => handleOpenSave(anime)}
        onTrailerClick={anime.trailer ? () => setTrailerOpen(true) : undefined}
      />

      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          {anime.description && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Synopsis
              </h2>
              <MarkdownRenderer content={anime.description} />
            </section>
          )}

          {anime.trailer && (
            <AnimeDetailTrailer
              trailer={anime.trailer}
              title={anime.title}
              onOpenCinema={() => setTrailerOpen(true)}
            />
          )}

          {themes.length > 0 && (
            <ThemePlayer
              themes={themes}
              animeTitle={anime.title}
              animeCover={anime.cover}
              animeBanner={anime.banner}
            />
          )}

          <AnimeDetailCharacters characters={characters} />

          {relations.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Franchise & Relations
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {relations.slice(0, 8).map((rel) => (
                  <AnimeCard
                    key={rel.id}
                    anime={rel}
                    onSaveClick={handleOpenSave}
                  />
                ))}
              </div>
            </section>
          )}

          {recommendations.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Recommended Anime
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {recommendations.slice(0, 8).map((rec) => (
                  <AnimeCard
                    key={rec.id}
                    anime={rec}
                    onSaveClick={handleOpenSave}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Frequently Asked Questions (AEO & GEO Extraction) */}
          {faqs.length > 0 && (
            <section
              id="anime-faq-section"
              aria-labelledby="anime-faq-heading"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2
                  id="anime-faq-heading"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Key details on broadcast schedules, soundtrack themes, and
                  voice actors for {anime.title}.
                </p>
              </div>

              <Accordion defaultValue={["anime-faq-0"]}>
                {faqs.map((faq, idx) => (
                  <AccordionItem key={faq.question} value={`anime-faq-${idx}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
        </div>

        <AnimeDetailSidebar anime={anime} externalLinks={externalLinks} />
      </div>

      <SaveDialog
        anime={selectedForSave}
        open={saveOpen}
        onOpenChange={setSaveOpen}
      />

      <TrailerDialog
        trailer={anime.trailer}
        title={anime.title}
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
      />
    </div>
  )
}
