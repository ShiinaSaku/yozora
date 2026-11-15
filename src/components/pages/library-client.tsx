import * as React from "react"
import { useUser } from "@/lib/clerk"
import { toast } from "sonner"
import { Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimeCard, AnimeCardSkeleton } from "@/components/anime/anime-card"
import { SaveDialog } from "@/components/anime/save-dialog"
import { fetchMyLibrary } from "@/lib/api"
import type { LibraryData } from "@/lib/api"
import type { Anime } from "@/lib/types/anime"
import type { AnimeEntry } from "@/lib/db/schema"
import { actions } from "astro:actions"

interface LibraryClientProps {
  data?: {
    entries: AnimeEntry[]
    anime: Anime[]
  }
}

export function LibraryClient(props: LibraryClientProps) {
  return <LibraryContent {...props} />
}

function LibraryContent({ data: initialData }: LibraryClientProps) {
  const { isSignedIn, isLoaded } = useUser()
  const [filterQuery, setFilterQuery] = React.useState("")
  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [libraryData, setLibraryData] = React.useState<LibraryData | null>(
    initialData ?? null
  )
  const [isEntriesLoading, setIsEntriesLoading] = React.useState(
    !initialData
  )

  React.useEffect(() => {
    if (!isSignedIn) return
    const controller = new AbortController()
    fetchMyLibrary(controller.signal)
      .then(setLibraryData)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setIsEntriesLoading(false)
      })
    return () => controller.abort()
  }, [isSignedIn])

  const entries = libraryData?.entries || []
  const animeList = libraryData?.anime

  const animeMap = React.useMemo(() => {
    const map = new Map<number, Anime>()
    if (animeList) {
      animeList.forEach((a) => map.set(a.id, a))
    }
    return map
  }, [animeList])

  // Quick "watched next episode" action.
  const [incrementingId, setIncrementingId] = React.useState<number | null>(
    null
  )
  const incrementProgress = async (anilistId: number) => {
    setIncrementingId(anilistId)
    try {
      const { data, error } = await actions.library.incrementProgress({
        anilistId,
      })
      if (error) throw new Error(error.message)
      toast.success("Episode Watched", {
        description: data.progress
          ? `Updated progress to Episode ${data.progress}.`
          : "Recorded episode progress in your library.",
      })
      const refreshed = await fetchMyLibrary()
      setLibraryData(refreshed)
    } catch (err) {
      toast.error("Failed to Update Progress", {
        description:
          err instanceof Error && err.message
            ? err.message
            : "Could not record episode progress. Please try again.",
      })
    } finally {
      setIncrementingId(null)
    }
  }

  if (!libraryData && (!isLoaded || isEntriesLoading)) {
    return (
      <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2">
          <div className="h-9 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-lg bg-muted/60" />
        </div>
        <div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-muted/40" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            "sk1",
            "sk2",
            "sk3",
            "sk4",
            "sk5",
            "sk6",
            "sk7",
            "sk8",
            "sk9",
            "sk10",
            "sk11",
            "sk12",
          ].map((key) => (
            <AnimeCardSkeleton key={key} />
          ))}
        </div>
      </div>
    )
  }

  const filteredEntries = entries.filter((entry) => {
    const anime = animeMap.get(entry.anilistId)
    if (!filterQuery) {
      return true
    }
    if (!anime) {
      return false
    }
    return anime.title.toLowerCase().includes(filterQuery.toLowerCase())
  })

  const watching = filteredEntries.filter(
    (e) => e.status === "watching" || e.status === "rewatching"
  )
  const completed = filteredEntries.filter((e) => e.status === "completed")
  const planning = filteredEntries.filter((e) => e.status === "planning")
  const paused = filteredEntries.filter((e) => e.status === "paused")
  const dropped = filteredEntries.filter((e) => e.status === "dropped")

  const renderShelfGrid = (
    items: AnimeEntry[],
    emptyMessage: string,
    showQuickIncrement = false
  ) => {
    if (items.length === 0) {
      return (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {emptyMessage || "No anime found in library"}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((e) => {
          const anime = animeMap.get(e.anilistId)
          if (!anime) {
            return null
          }

          const isCurrentPending = incrementingId === anime.id

          return (
            <div key={e.id} className="group relative">
              <AnimeCard
                anime={anime}
                showProgress
                progress={e.progress}
                totalEpisodes={e.totalEpisodes ?? undefined}
                onSaveClick={(a) => {
                  setSelectedAnime(a)
                  setSaveOpen(true)
                }}
              />
              {showQuickIncrement && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={incrementingId !== null}
                  onClick={() => void incrementProgress(anime.id)}
                  className="mt-2 w-full"
                >
                  {isCurrentPending ? (
                    <Loader2
                      data-icon="inline-start"
                      className="size-3.5 animate-spin"
                    />
                  ) : (
                    <Plus data-icon="inline-start" className="size-3.5" />
                  )}
                  Watched Ep {e.progress + 1}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div role="status" aria-live="polite" className="sr-only">
        {incrementingId !== null ? "Updating library entry..." : ""}
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            My Library
          </h1>
          <p className="text-xs text-muted-foreground">
            {entries.length} total tracked anime
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            aria-label="Filter library"
            placeholder="Filter library..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            size="icon"
          />
        </div>
      </div>

      <Tabs defaultValue="watching" className="w-full">
        <TabsList className="flex w-full max-w-2xl flex-wrap justify-start">
          <TabsTrigger value="watching">
            Watching ({watching.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="planning">
            Plan to Watch ({planning.length})
          </TabsTrigger>
          <TabsTrigger value="paused">Paused ({paused.length})</TabsTrigger>
          <TabsTrigger value="dropped">Dropped ({dropped.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="watching">
          <div className="pt-6">
            {renderShelfGrid(
              watching,
              "No anime currently in watching status",
              true
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="pt-6">
            {renderShelfGrid(completed, "No completed anime in library")}
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <div className="pt-6">
            {renderShelfGrid(planning, "No anime in plan to watch")}
          </div>
        </TabsContent>

        <TabsContent value="paused">
          <div className="pt-6">
            {renderShelfGrid(paused, "No paused anime")}
          </div>
        </TabsContent>

        <TabsContent value="dropped">
          <div className="pt-6">
            {renderShelfGrid(dropped, "No dropped anime")}
          </div>
        </TabsContent>
      </Tabs>

      <SaveDialog
        anime={selectedAnime}
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onChanged={() => {
          fetchMyLibrary()
            .then(setLibraryData)
            .catch(() => {})
        }}
      />
    </div>
  )
}
