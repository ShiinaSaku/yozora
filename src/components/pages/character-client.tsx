import { Heart } from "lucide-react"
import { Image } from "@/components/ui/image"
import { Badge } from "@/components/ui/badge"
import { AnimeCard } from "@/components/anime/anime-card"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { ShareButton } from "@/components/ui/share-button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getCharacterFaqItems } from "@/lib/seo/json-ld"
import type { CharacterDetail } from "@/lib/types/anime"

export function CharacterClient({ char }: { char: CharacterDetail }) {
  return <CharacterContent char={char} />
}

function CharacterContent({ char }: { char: CharacterDetail }) {
  return (
    <div className="container mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6">
      <div className="flex flex-col items-start gap-8 rounded-3xl border border-border/50 bg-card p-6 sm:p-8 md:flex-row">
        <div className="relative h-80 w-56 shrink-0 overflow-hidden rounded-2xl border-2 border-border/60 bg-muted shadow-xl">
          <Image
            src={char.image || "https://placehold.co/300x400"}
            alt={char.name.full}
            fill
            sizes="224px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col items-start gap-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {char.gender && <Badge variant="bold">{char.gender}</Badge>}
              {char.age && <Badge variant="outline">Age: {char.age}</Badge>}
              {char.favourites && (
                <Badge variant="rose">
                  <Heart className="size-3 fill-rose-500" />
                  {char.favourites.toLocaleString("en-US")} favorites
                </Badge>
              )}
            </div>
            <ShareButton
              title={`${char.name.full} - Anime Character`}
              text={`Check out ${char.name.full} on Yozora!`}
              url={`/character/${char.id}`}
              variant="outline"
              size="sm"
            />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {char.name.full}
          </h1>

          {char.name.native && (
            <p className="text-lg font-medium text-muted-foreground">
              {char.name.native}
            </p>
          )}

          {char.description && (
            <div className="max-w-3xl pt-2">
              <MarkdownRenderer content={char.description} />
            </div>
          )}
        </div>
      </div>

      {char.media.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Featured Anime Roles ({char.media.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {char.media.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      <section
        id="character-faq-section"
        aria-labelledby="character-faq-heading"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="character-faq-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted-foreground">
            Key details on roles, native names, and appearances for{" "}
            {char.name.full}.
          </p>
        </div>

        <Accordion defaultValue={["char-faq-0"]}>
          {getCharacterFaqItems(char).map((faq, idx) => (
            <AccordionItem key={faq.question} value={`char-faq-${idx}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
