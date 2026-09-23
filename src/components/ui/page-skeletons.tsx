import { Skeleton } from "@/components/ui/skeleton"

/**
 * Anime card skeleton matching the AnimeCard layout exactly:
 * 3:4 poster area + p-3 info block (title, meta, tags) so pending -> content
 * swaps are layout-shift free.
 */
function AnimeCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-0">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-muted" />
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <Skeleton variant="md" className="h-4 w-4/5" />
          <Skeleton variant="md" className="mt-1 h-3 w-2/5" />
        </div>
        <div className="mt-2 flex gap-1">
          <Skeleton variant="md" className="h-3 w-12" />
          <Skeleton variant="md" className="h-3 w-10" />
        </div>
      </div>
    </div>
  )
}

/**
 * Responsive grid of anime card skeletons matching catalog page grids.
 */
export function AnimeGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <AnimeCardSkeleton key={`anime-skeleton-${i}`} />
      ))}
    </div>
  )
}

/**
 * Section header skeleton matching the icon + title + subtitle rows used on
 * home and catalog pages.
 */
function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Skeleton variant="lg" className="size-8" />
        <div className="flex flex-col gap-1.5">
          <Skeleton variant="md" className="h-5 w-36" />
          <Skeleton variant="md" className="h-3 w-56 max-w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Full-page skeleton for the home route, mirroring HomePageClient:
 * spotlight hero (fixed heights) + airing rows + three 12-card grids.
 */
export function HomeSkeleton() {
  return (
    <div
      className="container mx-auto flex max-w-7xl flex-col gap-14 px-4 py-6 sm:px-6"
      aria-hidden="true"
    >
      <section className="relative w-full space-y-4">
        <div className="overflow-hidden py-1">
          <div className="-ml-4 flex sm:-ml-6">
            <div className="flex-none basis-11/12 pl-4 sm:basis-7/8 sm:pl-6 lg:basis-5/6 xl:basis-4/5">
              <Skeleton
                variant="3xl"
                className="h-105 w-full sm:h-120 lg:h-127.5"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 sm:px-4">
          <Skeleton variant="full" className="size-9" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={`spot-dot-${i}`}
                variant="full"
                className="size-2.5"
              />
            ))}
          </div>
          <Skeleton variant="full" className="size-9" />
        </div>
      </section>

      {["trending", "seasonal", "popular"].map((id) => (
        <section key={`home-section-${id}`} className="flex flex-col gap-6">
          <SectionHeaderSkeleton />
          <AnimeGridSkeleton count={12} />
        </section>
      ))}
    </div>
  )
}

/**
 * Full-page skeleton for seasonal chart: page header (icon + title + search)
 * + poster grid, matching SeasonalClient.
 */
export function CatalogPageSkeleton() {
  return (
    <div
      className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton variant="2xl" className="size-11 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton variant="md" className="h-7 w-56 max-w-full" />
            <Skeleton variant="md" className="h-4 w-80 max-w-full" />
          </div>
        </div>
        <Skeleton variant="xl" className="h-9 w-full max-w-xs" />
      </div>
      <AnimeGridSkeleton count={12} />
    </div>
  )
}

/**
 * Skeleton card for the airing schedule grid: horizontal card with a
 * h-28 w-20 poster block and stacked text lines, matching AiringClient rows.
 */
function AiringCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-border/50 bg-card p-3">
      <Skeleton variant="2xl" className="relative h-28 w-20 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton variant="md" className="h-4 w-4/5" />
        <Skeleton variant="md" className="h-3 w-3/5" />
        <Skeleton variant="md" className="h-3 w-2/5" />
        <div className="mt-auto flex gap-1.5 border-t border-border/30 pt-2">
          <Skeleton variant="md" className="h-3 w-16" />
          <Skeleton variant="md" className="h-3 w-10" />
        </div>
      </div>
    </div>
  )
}

/**
 * Full-page skeleton for the airing schedule: page header + 6 airing cards.
 */
export function AiringPageSkeleton() {
  return (
    <div
      className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton variant="2xl" className="size-11 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton variant="md" className="h-7 w-48 max-w-full" />
            <Skeleton variant="md" className="h-4 w-80 max-w-full" />
          </div>
        </div>
        <Skeleton variant="xl" className="h-9 w-full max-w-xs" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <AiringCardSkeleton key={`airing-skeleton-${i}`} />
        ))}
      </div>
    </div>
  )
}

/**
 * Full-page skeleton for detail routes (anime detail, character profile):
 * large poster block + stacked title/description lines.
 */
export function DetailPageSkeleton() {
  return (
    <div
      className="container mx-auto max-w-7xl px-4 py-10 sm:px-6"
      aria-hidden="true"
    >
      <div className="flex flex-col items-start gap-8 md:flex-row">
        <Skeleton
          variant="2xl"
          className="mx-auto h-80 w-56 shrink-0 md:mx-0"
        />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <Skeleton variant="md" className="h-4 w-28" />
          <Skeleton variant="xl" className="h-10 w-full max-w-lg" />
          <Skeleton variant="xl" className="h-10 w-2/3 max-w-sm" />
          <div className="mt-2 flex flex-col gap-2">
            <Skeleton variant="md" className="h-3 w-full" />
            <Skeleton variant="md" className="h-3 w-5/6" />
            <Skeleton variant="md" className="h-3 w-3/4" />
          </div>
          <div className="mt-2 flex gap-3">
            <Skeleton variant="xl" className="h-10 w-36" />
            <Skeleton variant="xl" className="h-10 w-36" />
          </div>
        </div>
      </div>
    </div>
  )
}
