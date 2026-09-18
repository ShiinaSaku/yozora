import { createFileRoute, notFound } from "@tanstack/react-router"
import { Heart } from "lucide-react"
import { Image } from "@/components/ui/image"
import { Badge } from "@/components/ui/badge"
import { AnimeCard } from "@/components/anime/anime-card"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { ShareButton } from "@/components/ui/share-button"
import {
  generateBreadcrumbsJsonLd,
  generateCharacterFaqJsonLd,
  generateCharacterJsonLd,
  stringifyJsonLd,
} from "@/lib/seo/json-ld"
import { getCharacterPageData } from "@/lib/server/catalog"
import { DetailPageSkeleton } from "@/components/ui/page-skeletons"
import { parseAnimeId } from "@/lib/utils/slug"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

/**
 * Route definition for anime character detail pages, voice actors, and anime appearances.
 */
export const Route = createFileRoute("/character/$id")({
  pendingComponent: DetailPageSkeleton,
  loader: async ({ params }) => {
    const id = parseAnimeId(params.id)
    if (!id) {
      throw notFound()
    }

    return {
      character: await getCharacterPageData({ data: id }),
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.character) {
      return { meta: [{ title: "Character Profile | Yozora" }] }
    }
    const char = loaderData.character
    const title = `${char.name.full}${char.name.native ? ` (${char.name.native})` : ""} — Voice Actors, Roles & Bio | Yozora`
    const description =
      char.description?.slice(0, 160) ||
      `Explore voice actors, character lore, and featured anime roles for ${char.name.full} on Yozora.`
    const canonicalPath = `/character/${char.id}`
    const og = openGraphImageUrl({
      type: "character",
      title: char.name.full,
      native: char.name.native || "",
      tag: "Character Dossier",
      description: description.slice(0, 170),
      image: char.image || "",
    })

    const keywords = [
      char.name.full,
      char.name.native,
      ...(char.name.alternative || []),
      ...char.media.slice(0, 5).map((m) => m.title),
      "anime character",
      "voice actors",
      "seiyuu",
      "anime roles",
      "声優",
      "キャラクター",
      "Yozora",
    ]
      .filter(Boolean)
      .join(", ")

    const characterJsonLd = generateCharacterJsonLd(char)
    const breadcrumbs = generateBreadcrumbsJsonLd([
      { name: "Home", url: "/" },
      { name: char.name.full, url: `/character/${char.id}` },
    ])
    const characterFaqJsonLd = generateCharacterFaqJsonLd(char)

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(canonicalPath) },
        { property: "og:image", content: og },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: og },
      ],
      links: canonicalLinks(canonicalPath),
      scripts: [
        {
          type: "application/ld+json",
          children: stringifyJsonLd(characterJsonLd),
        },
        {
          type: "application/ld+json",
          children: stringifyJsonLd(breadcrumbs),
        },
        {
          type: "application/ld+json",
          children: stringifyJsonLd(characterFaqJsonLd),
        },
      ],
    }
  },
  component: CharacterPage,
})

function CharacterPage() {
  const { character: char } = Route.useLoaderData()

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
              {char.gender && (
                <Badge variant="secondary" className="font-bold">
                  {char.gender}
                </Badge>
              )}
              {char.age && <Badge variant="outline">Age: {char.age}</Badge>}
              {char.favourites && (
                <Badge variant="secondary" className="font-bold text-rose-500">
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

      {/* Featured Anime Roles */}
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
    </div>
  )
}
