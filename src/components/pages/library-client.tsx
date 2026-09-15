import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@clerk/tanstack-react-start"
import { toast } from "sonner"
import { Loader2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimeCard, AnimeCardSkeleton } from "@/components/anime/anime-card"
import { SaveDialog } from "@/components/anime/save-dialog"
import type { Anime } from "@/lib/types/anime"
import type { AnimeEntry } from "@/lib/db/schema"

export function LibraryClient({
  initialData,
}: {
  initialData?: {
    entries: AnimeEntry[]
    anime: Anime[]
  }
}) {
  const { isSignedIn, isLoaded } = useUser()
  const queryClient = useQueryClient()
  const [filterQuery, setFilterQuery] = React.useState("")
  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)

  const { data: libraryData, isLoading: isEntriesLoading } = useQuery<{
    entries: AnimeEntry[]
    anime: Anime[]
  }>({
    queryKey: ["my-entries"],
    queryFn: async () => {
      const res = await fetch("/api/entries/my?include=anime")
      if (!res.ok) {
        return { entries: [], anime: [] }
      }
      const json = await res.json<{
        data?: AnimeEntry[]
        anime?: Anime[]
      }>()
      return {
        entries: json.data || [],
        anime: json.anime || [],
      }
    },
    initialData,
    enabled: !!isSignedIn,
  })

  const entries = libraryData?.entries || []
  const animeList = libraryData?.anime

  const animeMap = React.useMemo(() => {
    const map = new Map<number, Anime>()
    if (animeList) {
      animeList.forEach((a) => map.set(a.id, a))
    }
    return map
  }, [animeList])

  // Quick increment mutation
  const incrementMutation = useMutation({
    mutationFn: async (anilistId: number) => {
      const res = await fetch(`/api/entries/${anilistId}/increment`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error("Failed to increment")
      }
      return await res.json<{ data?: AnimeEntry }>()
    },
    onSuccess: (data) => {
      const entry = data.data
      toast.success("Episode Watched", {
        description: entry?.progress
          ? `Updated progress to Episode ${entry.progress}.`
          : "Recorded episode progress in your library.",
      })
      queryClient.invalidateQueries({ queryKey: ["my-entries"] })
    },
    onError: () => {
      toast.error("Failed to Update Progress", {
        description: "Could not record episode progress. Please try again.",
      })
    },
  })

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

          const isCurrentPending =
            incrementMutation.isPending &&
            incrementMutation.variables === anime.id

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
                  disabled={incrementMutation.isPending}
                  onClick={() => incrementMutation.mutate(anime.id)}
                  className="mt-2 w-full text-xs font-bold"
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
        {incrementMutation.isPending ? "Updating library entry..." : ""}
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
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="watching" className="w-full">
        <TabsList className="flex w-full max-w-2xl flex-wrap justify-start gap-1 bg-muted/40 p-1">
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

        <TabsContent value="watching" className="pt-6">
          {renderShelfGrid(
            watching,
            "No anime currently in watching status",
            true
          )}
        </TabsContent>

        <TabsContent value="completed" className="pt-6">
          {renderShelfGrid(completed, "No completed anime in library")}
        </TabsContent>

        <TabsContent value="planning" className="pt-6">
          {renderShelfGrid(planning, "No anime in plan to watch")}
        </TabsContent>

        <TabsContent value="paused" className="pt-6">
          {renderShelfGrid(paused, "No paused anime")}
        </TabsContent>

        <TabsContent value="dropped" className="pt-6">
          {renderShelfGrid(dropped, "No dropped anime")}
        </TabsContent>
      </Tabs>

      <SaveDialog
        anime={selectedAnime}
        open={saveOpen}
        onOpenChange={setSaveOpen}
      />
    </div>
  )
}
