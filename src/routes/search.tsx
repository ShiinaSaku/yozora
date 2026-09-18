import { createFileRoute } from "@tanstack/react-router"
import { Compass, Search } from "lucide-react"
import Link from "@/components/ui/link"
import { AnimeCard } from "@/components/anime/anime-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimeGridSkeleton } from "@/components/ui/page-skeletons"
import { getSearchPageData } from "@/lib/server/catalog"
import { absoluteUrl, canonicalLinks, openGraphImageUrl } from "@/lib/seo/meta"

const QUICK_SEARCHES = [
  "One Piece",
  "Frieren",
  "Solo Leveling",
  "Attack on Titan",
  "Demon Slayer",
  "Jujutsu Kaisen",
]

export const Route = createFileRoute("/search")({
  pendingComponent: AnimeGridSkeleton,
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q.trim().slice(0, 100) : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    return await getSearchPageData({ data: deps.q })
  },
  head: ({ loaderData }) => {
    // Loader/component treat queries shorter than 2 chars as trending; keep
    // the title in sync so a 1-char query doesn't claim "results".
    const query =
      loaderData?.query && loaderData.query.length >= 2 ? loaderData.query : ""
    const title = query
      ? `Search results for “${query}” | Yozora Anime`
      : "Search Anime by Title | Yozora"
    const description = query
      ? `Find anime matching ${query}, including alternate and native titles, on Yozora.`
      : "Search anime by English, romaji, or native title and explore details, characters, recommendations, and themes on Yozora."

    const ogImage = openGraphImageUrl({
      type: "search",
      title: query ? `“${query}”` : "Search Anime & Characters",
      subtitle: query
        ? "Search Results on Yozora"
        : "Directory & Catalog Search",
      tag: query ? "Search Results" : "Catalog Search",
      description,
    })

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl("/search") },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonicalLinks("/search"),
    }
  },
  component: SearchPage,
})

function SearchPage() {
  const { query, items } = Route.useLoaderData()
  const hasQuery = query.length >= 2

  return (
    <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_85%_10%,rgba(167,139,250,.16),transparent_42%),linear-gradient(135deg,rgba(17,25,54,.96),rgba(60,40,84,.92))] px-5 py-8 text-white shadow-xl sm:px-10 sm:py-11">
        <div className="relative z-10 flex max-w-3xl flex-col gap-5">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.18em] text-rose-200 uppercase">
            <Compass className="size-3.5" />
            Yozora anime search
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-[#fff9e9] sm:text-4xl">
              {hasQuery ? `Results for “${query}”` : "Find your next story"}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/65">
              Search English, romaji, and native titles across the AniList
              catalog.
            </p>
          </div>

          <form
            action="/search"
            method="get"
            role="search"
            className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/45" />
              <Input
                type="search"
                name="q"
                defaultValue={query}
                minLength={2}
                maxLength={100}
                required
                autoFocus={!hasQuery}
                autoComplete="off"
                placeholder="Try “Cowboy Bebop” or “Sousou no Frieren”"
                aria-label="Search anime"
                className="h-11 rounded-xl border-white/15 bg-black/20 pl-10 text-sm text-white shadow-none placeholder:text-white/35 focus-visible:border-rose-200/50 focus-visible:ring-rose-200/20"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-xl bg-[#fff0d2] px-5 font-bold text-[#161a35] hover:bg-white"
            >
              Search anime
            </Button>
          </form>
        </div>
      </section>

      {!hasQuery && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold text-muted-foreground">
            Popular searches
          </span>
          {QUICK_SEARCHES.map((item) => (
            <Link
              key={item}
              href={`/search?q=${encodeURIComponent(item)}`}
              className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              {item}
            </Link>
          ))}
        </div>
      )}

      <section
        className="flex flex-col gap-5"
        aria-labelledby="search-results-heading"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="search-results-heading"
              className="text-xl font-black tracking-tight text-foreground sm:text-2xl"
            >
              {hasQuery ? "Anime matches" : "Trending now"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "title" : "titles"}
              {hasQuery ? ` found for ${query}` : " people are discovering"}
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-muted/20 px-6 text-center">
            <Search className="size-8 text-muted-foreground/50" />
            <div>
              <p className="font-bold text-foreground">
                No anime matched that title
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try an alternate title, shorter phrase, or different spelling.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
