import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { AnimeCard } from "@/components/anime/anime-card"
import { SaveDialog } from "@/components/anime/save-dialog"
import {
  segmentedControlItemVariants,
  segmentedControlRootClassName,
} from "@/lib/segmented-control"
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { Anime } from "@/lib/types/anime"

const segmentedItemClassName = segmentedControlItemVariants({
  size: "sm",
  state: "checked",
})

const EMPTY_SEASONAL_ITEMS: Anime[] = []

export function SeasonalClient({
  items = EMPTY_SEASONAL_ITEMS,
}: {
  items?: Anime[]
}) {
  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [filterQuery, setFilterQuery] = React.useState("")
  const [selectedFormat, setSelectedFormat] = React.useState<
    "ALL" | "TV" | "MOVIE" | "OVA"
  >("ALL")

  const filteredItems = React.useMemo(() => {
    return items.filter((anime) => {
      const matchesQuery =
        !filterQuery ||
        anime.title.toLowerCase().includes(filterQuery.toLowerCase())
      const matchesFormat =
        selectedFormat === "ALL" ||
        (selectedFormat === "TV" &&
          anime.format.toUpperCase().includes("TV")) ||
        (selectedFormat === "MOVIE" &&
          anime.format.toUpperCase().includes("MOVIE")) ||
        (selectedFormat === "OVA" &&
          (anime.format.toUpperCase().includes("OVA") ||
            anime.format.toUpperCase().includes("ONA")))
      return matchesQuery && matchesFormat
    })
  }, [items, filterQuery, selectedFormat])

  return (
    <div
      id="seasonal-charts-container"
      className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-xs">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div>
            <h1
              id="seasonal-page-title"
              className="text-2xl font-black tracking-tight text-foreground sm:text-3xl"
            >
              Seasonal Anime Charts
            </h1>
            <p className="text-xs text-muted-foreground">
              {filteredItems.length} series broadcasting this season
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <RadioGroupPrimitive
            id="seasonal-format-filter-group"
            aria-label="Filter anime by broadcast format"
            value={selectedFormat}
            onValueChange={setSelectedFormat}
            className={segmentedControlRootClassName}
          >
            {(["ALL", "TV", "MOVIE", "OVA"] as const).map((fmt) => (
              <RadioPrimitive.Root
                key={fmt}
                id={`filter-format-${fmt.toLowerCase()}`}
                value={fmt}
                className={cn(
                  segmentedItemClassName,
                  "px-3 py-1 font-semibold"
                )}
              >
                {fmt === "ALL" ? "All" : fmt}
              </RadioPrimitive.Root>
            ))}
          </RadioGroupPrimitive>

          <div className="relative w-full sm:w-56">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={2}
              className="pointer-events-none absolute top-2.5 left-3 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="seasonal-search-input"
              type="text"
              placeholder="Filter charts..."
              aria-label="Filter seasonal anime by title"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-border/50 bg-card/60 py-1.5 pr-3 pl-8.5 text-xs text-foreground backdrop-blur-md placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center text-sm text-muted-foreground">
          <p className="font-semibold">
            No seasonal anime matched your filters
          </p>
          <button
            id="clear-seasonal-filters-btn"
            type="button"
            onClick={() => {
              setFilterQuery("")
              setSelectedFormat("ALL")
            }}
            className="cursor-pointer text-xs text-primary underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          id="seasonal-anime-grid"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {filteredItems.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onSaveClick={(a) => {
                setSelectedAnime(a)
                setSaveOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <SaveDialog
        anime={selectedAnime}
        open={saveOpen}
        onOpenChange={setSaveOpen}
      />
    </div>
  )
}
