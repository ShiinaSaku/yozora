import * as React from "react"
import Image from "@/components/ui/image"
import { toast } from "sonner"
import {
  Calendar,
  Check,
  CheckCircle2,
  Clapperboard,
  Clock,
  ExternalLink,
  Layers,
  Lock,
  Pin,
  Search,
  Share2,
  Star,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "@/components/ui/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimeCard } from "@/components/anime/anime-card"
import { SaveDialog } from "@/components/anime/save-dialog"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { AniListIcon, MyAnimeListIcon } from "@/components/icons/platform-icons"
import { useUser } from "@/lib/clerk"
import { fetchBatchAnime, fetchPublicProfile } from "@/lib/api"
import type { UserStats, PublicProfileData } from "@/lib/api"
import type { AnimeEntry, UserProfile } from "@/lib/db/schema"
import type { Anime } from "@/lib/types/anime"
import { getAnimeUrl } from "@/lib/utils/slug"

type ProfileClientProps = {
  handle: string
  initialData: PublicProfileData
}

/** Formats a profile creation date deterministically (UTC, fixed locale). */
function formatJoinDate(value: Date | string | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function ProfileHeader({ profile }: { profile: UserProfile }) {
  const [copied, setCopied] = React.useState(false)
  const joined = formatJoinDate(profile.createdAt)

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(setCopied, 2000, false)
      toast.success("Profile link copied")
    } catch {
      toast.error("Couldn't copy the profile link")
    }
  }

  const trackerLinks = [
    profile.anilistUsername
      ? {
          href: `https://anilist.co/user/${profile.anilistUsername}`,
          icon: AniListIcon,
          label: "AniList",
          title: `AniList: ${profile.anilistUsername}`,
        }
      : null,
    profile.malUsername
      ? {
          href: `https://myanimelist.net/profile/${profile.malUsername}`,
          icon: MyAnimeListIcon,
          label: "MAL",
          title: `MyAnimeList: ${profile.malUsername}`,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    title: string
  }>

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="relative h-44 w-full overflow-hidden bg-muted sm:h-60 md:h-72">
        {profile.bannerUrl ? (
          <Image
            src={profile.bannerUrl}
            alt={`${profile.displayName}'s banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="size-full bg-linear-to-br from-primary/30 via-accent/50 to-secondary" />
        )}
        <div
          className="bg-grid absolute inset-0 opacity-5"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-t from-card via-card/30 to-transparent" />
      </div>

      <div className="relative z-10 -mt-12 flex flex-col gap-4 px-5 pb-6 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-7">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-5">
          <Avatar variant="profile" size="profile">
            <AvatarImage
              variant="profile"
              src={profile.avatarUrl ?? undefined}
              alt={profile.displayName}
            />
            <AvatarFallback variant="profile">
              {profile.displayName.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col pb-1">
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {profile.displayName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-xs font-semibold text-primary">
                @{profile.handle}
              </span>
              {joined && (
                <>
                  <span aria-hidden="true" className="hidden sm:inline">
                    ·
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <Calendar className="size-3.5" />
                    Joined {joined}
                  </span>
                </>
              )}
            </div>

            {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {profile.favoriteGenres.map((genre: string) => (
                  <span
                    key={genre}
                    className="rounded-full border border-border/60 bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    #{genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {trackerLinks.map(({ href, icon: Icon, label, title }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
              title={title}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{label}</span>
              <ExternalLink className="size-3 opacity-60" />
            </a>
          ))}

          <Button variant="outline" size="sm" onClick={copyProfileLink}>
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfileStatsGrid({
  stats,
  entries,
}: {
  stats: UserStats | null | undefined
  entries: AnimeEntry[]
}) {
  const total = Number(stats?.totalEntries ?? entries.length)
  const completed = Number(
    stats?.completedCount ??
      entries.filter((e) => e.status === "completed").length
  )
  const watching = Number(
    stats?.watchingCount ??
      entries.filter(
        (e) => e.status === "watching" || e.status === "rewatching"
      ).length
  )
  const planning = entries.filter((e) => e.status === "planning").length
  const episodes =
    Number(stats?.totalEpisodes) ||
    entries.reduce((sum, e) => sum + (e.progress || 0), 0)
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  const statCards = [
    {
      label: "Episodes Watched",
      value: episodes.toLocaleString("en-US"),
      icon: Clapperboard,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Days Watched",
      value: String(stats?.daysWatched || 0),
      icon: Clock,
      iconClass: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Mean Score",
      value: stats?.meanScore ? stats.meanScore.toFixed(1) : "—",
      icon: Star,
      iconClass: "bg-amber-500/10 text-amber-500",
    },
    {
      label: "Completed",
      value: completed.toLocaleString("en-US"),
      icon: CheckCircle2,
      iconClass: "bg-indigo-500/10 text-indigo-500",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {statCards.map(({ label, value, icon: Icon, iconClass }) => (
          <Card key={label} variant="stat" size="stat">
            <div
              className={`mb-1 flex size-8 items-center justify-center rounded-xl ${iconClass}`}
            >
              <Icon className="size-4" />
            </div>
            <p className="font-numeric text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {label}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Completion Rate</span>
            <Badge variant="tag">{completedPercent}%</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              {watching} Watching
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-indigo-500" />
              {completed} Done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              {planning} Plan
            </span>
          </div>
        </div>

        <div className="relative flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
          {total > 0 && (
            <>
              <div
                style={{ width: `${(watching / total) * 100}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`${watching} Watching`}
              />
              <div
                style={{ width: `${(completed / total) * 100}%` }}
                className="h-full bg-indigo-500 transition-all duration-500"
                title={`${completed} Completed`}
              />
              <div
                style={{ width: `${(planning / total) * 100}%` }}
                className="h-full bg-muted-foreground/30 transition-all duration-500"
                title={`${planning} Planning`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PinnedShowcase({ pinnedIds }: { pinnedIds: number[] }) {
  const [pinnedAnime, setPinnedAnime] = React.useState<Anime[] | null>(null)

  React.useEffect(() => {
    if (pinnedIds.length === 0) return
    const controller = new AbortController()
    fetchBatchAnime(pinnedIds, controller.signal)
      .then((items) => {
        const order = new Map(pinnedIds.map((id, i) => [id, i]))
        setPinnedAnime(
          [...items].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        )
      })
      .catch(() => setPinnedAnime([]))
    return () => controller.abort()
  }, [pinnedIds])

  if (pinnedIds.length === 0) return null

  return (
    <section
      aria-labelledby="pinned-showcase-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Pin className="size-4" />
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2
            id="pinned-showcase-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Pinned Anime
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            Hand-picked recommendations
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!pinnedAnime &&
          pinnedIds.map((id, i) => (
            <div
              key={id}
              className="animate-pulse overflow-hidden rounded-2xl border border-border/50 bg-card"
            >
              <div className="h-28 bg-muted" />
              <div className="-mt-8 flex gap-3 p-4">
                <div
                  className="size-16 shrink-0 rounded-xl bg-muted"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
                <div className="flex flex-1 flex-col gap-2 pt-8">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted/60" />
                </div>
              </div>
            </div>
          ))}

        {pinnedAnime?.map((anime, index) => (
          <Link
            key={anime.id}
            href={getAnimeUrl(anime)}
            variant="card"
            className="group relative flex flex-col active:scale-95"
          >
            <div className="relative h-24 overflow-hidden bg-muted sm:h-28">
              {anime.banner ? (
                <Image
                  src={anime.banner}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 400px"
                  variant="zoom"
                />
              ) : (
                <div className="size-full bg-linear-to-r from-primary/20 via-accent/15 to-secondary/25" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-card via-card/30 to-transparent" />
              <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-lg border border-border/50 bg-background/85 font-mono text-xs font-bold text-foreground backdrop-blur-xs">
                {index + 1}
              </span>
              {anime.score > 0 && (
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full border border-border/50 bg-background/85 px-2 py-0.5 font-mono text-xs font-bold text-amber-500 backdrop-blur-xs">
                  <Star className="size-2.5 fill-amber-500" />
                  {anime.score.toFixed(1)}
                </span>
              )}
            </div>

            <div className="relative z-10 -mt-9 flex gap-3 p-3.5">
              <div className="relative size-18 shrink-0 overflow-hidden rounded-xl border-2 border-card bg-muted shadow-md">
                <Image
                  src={anime.coverMedium || anime.cover}
                  alt={anime.title}
                  fill
                  unoptimized
                  sizes="72px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-end pb-0.5">
                <span className="line-clamp-2 text-sm leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
                  {anime.title}
                </span>
                <span className="mt-1 text-xs font-medium text-muted-foreground">
                  {[
                    anime.year,
                    anime.format,
                    anime.episodes ? `${anime.episodes} eps` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProfileBioCard({ bio }: { bio: string }) {
  return (
    <Card variant="large" size="xl">
      <h3 className="mb-4 text-sm font-bold tracking-wider text-muted-foreground uppercase">
        About
      </h3>
      <MarkdownRenderer content={bio} />
    </Card>
  )
}

function ProfileAnimeShelf({
  items,
  animeMap,
  emptyMessage,
  onSave,
}: {
  items: AnimeEntry[]
  animeMap: Map<number, Anime>
  emptyMessage: string
  onSave: (anime: Anime) => void
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/40 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
          <Layers className="size-5 opacity-60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {emptyMessage || "No items found"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((e) => {
        const anime = animeMap.get(e.anilistId)
        if (!anime) return null
        return (
          <AnimeCard
            key={e.id}
            anime={anime}
            showProgress
            progress={e.progress}
            totalEpisodes={e.totalEpisodes ?? undefined}
            onSaveClick={onSave}
          />
        )
      })}
    </div>
  )
}

function ProfileLibraryTabs({
  filteredAndSortedEntries,
  animeMap,
  onSave,
}: {
  filteredAndSortedEntries: AnimeEntry[]
  animeMap: Map<number, Anime>
  onSave: (anime: Anime) => void
}) {
  const watchingEntries = filteredAndSortedEntries.filter(
    (e) => e.status === "watching" || e.status === "rewatching"
  )
  const completedEntries = filteredAndSortedEntries.filter(
    (e) => e.status === "completed"
  )
  const planningEntries = filteredAndSortedEntries.filter(
    (e) => e.status === "planning"
  )
  const pausedEntries = filteredAndSortedEntries.filter(
    (e) => e.status === "paused"
  )
  const droppedEntries = filteredAndSortedEntries.filter(
    (e) => e.status === "dropped"
  )

  const shelves = [
    { value: "all", items: filteredAndSortedEntries, empty: "No anime found in library." },
    { value: "watching", items: watchingEntries, empty: "No anime currently being watched." },
    { value: "completed", items: completedEntries, empty: "No completed anime recorded yet." },
    { value: "planning", items: planningEntries, empty: "No anime planned to watch." },
    { value: "paused", items: pausedEntries, empty: "No paused anime." },
    { value: "dropped", items: droppedEntries, empty: "No dropped anime." },
  ]

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="no-scrollbar w-full overflow-x-auto">
        <TabsList>
          {shelves.map(({ value, items }) => (
            <TabsTrigger key={value} value={value}>
              {value === "all"
                ? `All (${items.length})`
                : value === "planning"
                  ? `Plan to Watch (${items.length})`
                  : `${value[0].toUpperCase()}${value.slice(1)} (${items.length})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {shelves.map(({ value, items, empty }) => (
        <TabsContent key={value} value={value}>
          <div className="pt-6">
            <ProfileAnimeShelf
              items={items}
              animeMap={animeMap}
              emptyMessage={empty}
              onSave={onSave}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

export function UserProfileClient({ handle, initialData }: ProfileClientProps) {
  const { isSignedIn } = useUser()
  const [pageData, setPageData] = React.useState(initialData)
  const [saveChanged, setSaveChanged] = React.useState(false)

  const profile = pageData.profile
  const stats = pageData.stats
  const entries = pageData.entries
  const animeList = pageData.anime

  const refresh = React.useCallback(() => {
    if (!isSignedIn) return
    fetchPublicProfile(handle)
      .then(setPageData)
      .catch(() => {})
  }, [handle, isSignedIn])

  // Refresh live data once auth state settles (SSR renders signed-out state
  // to match the client's first render — see lib/clerk.tsx).
  React.useEffect(() => {
    refresh()
  }, [refresh])

  // Refetch after any library change made through the save dialog.
  React.useEffect(() => {
    if (saveChanged) refresh()
  }, [saveChanged, refresh])

  const animeMap = React.useMemo(() => {
    const map = new Map<number, Anime>()
    animeList.forEach((a: Anime) => map.set(a.id, a))
    return map
  }, [animeList])

  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [searchFilter, setSearchFilter] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"recent" | "score" | "title">(
    "recent"
  )

  const filteredAndSortedEntries = React.useMemo(() => {
    let list = [...entries]

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase()
      list = list.filter((e) => {
        const anime = animeMap.get(e.anilistId)
        if (!anime) return false
        return (
          anime.title.toLowerCase().includes(q) ||
          (anime.subtitle && anime.subtitle.toLowerCase().includes(q))
        )
      })
    }

    if (sortBy === "score") {
      list.sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (sortBy === "title") {
      list.sort((a, b) => {
        const titleA = animeMap.get(a.anilistId)?.title || ""
        const titleB = animeMap.get(b.anilistId)?.title || ""
        return titleA.localeCompare(titleB)
      })
    }

    return list
  }, [entries, animeMap, searchFilter, sortBy])

  if (profile.isPublic === false) {
    return (
      <div className="container mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Lock className="size-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            This Profile is Private
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            @{profile.handle} has chosen to keep their anime library and stats
            private.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
      <ProfileHeader profile={profile} />
      <ProfileStatsGrid stats={stats} entries={entries} />
      {profile.bio && <ProfileBioCard bio={profile.bio} />}
      {profile.pinnedAnimeIds && profile.pinnedAnimeIds.length > 0 && (
        <PinnedShowcase pinnedIds={profile.pinnedAnimeIds} />
      )}

      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold tracking-tight">Anime library</h2>
          <p className="text-sm text-muted-foreground">
            Browse and search @{profile.handle}&apos;s public anime list.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search in this library..."
              aria-label="Search in this library"
              size="icon"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Sort:
            </span>
            <Button
              variant={sortBy === "recent" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setSortBy("recent")}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === "score" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setSortBy("score")}
            >
              Score
            </Button>
            <Button
              variant={sortBy === "title" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setSortBy("title")}
            >
              A–Z
            </Button>
          </div>
        </div>

        <ProfileLibraryTabs
          filteredAndSortedEntries={filteredAndSortedEntries}
          animeMap={animeMap}
          onSave={(a) => {
            setSelectedAnime(a)
            setSaveOpen(true)
          }}
        />
      </div>

      <SaveDialog
        anime={selectedAnime}
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onChanged={() => setSaveChanged((v) => !v)}
      />
    </div>
  )
}
