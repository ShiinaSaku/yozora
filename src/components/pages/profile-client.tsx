import * as React from "react"
import Image from "@/components/ui/image"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Check,
  CheckCircle2,
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
import type { Anime } from "@/lib/types/anime"
import type { AnimeEntry, UserProfile } from "@/lib/db/schema"
import { getAnimeUrl } from "@/lib/utils/slug"

export interface UserStats {
  totalEntries: number
  totalEpisodes: number
  meanScore: number | null
  daysWatched: number
  completedCount: number
  watchingCount: number
}

interface ProfilePageData {
  profile: UserProfile
  stats: UserStats
  entries: AnimeEntry[]
  anime: Anime[]
}

interface ProfileClientProps {
  handle: string
  initialData: ProfilePageData
}

function ProfileHeader({ profile }: { profile: UserProfile }) {
  const [copied, setCopied] = React.useState(false)

  const copyProfileLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(setCopied, 2000, false)
      toast.success("Link Copied", {
        description: `@${profile.handle}'s profile URL copied to clipboard.`,
      })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-xl max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-64 md:h-72">
        {profile.bannerUrl ? (
          <Image
            src={profile.bannerUrl}
            alt={`${profile.displayName}'s banner`}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-linear-to-br from-primary/25 via-accent/15 to-secondary/30" />
        )}
        <div
          className="bg-grid absolute inset-0 opacity-5"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent" />
      </div>

      <div className="relative z-10 -mt-16 flex flex-col justify-between gap-6 px-6 pt-0 pb-6 sm:-mt-20 sm:flex-row sm:items-end sm:px-10">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
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

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {profile.displayName}
              </h1>
              <Badge variant="subtle">PRO Curator</Badge>
            </div>

            <p className="mt-0.5 font-mono text-sm text-muted-foreground">
              @{profile.handle}
            </p>

            {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                {profile.favoriteGenres.map((genre: string) => (
                  <span
                    key={genre}
                    className="rounded-md border border-border/60 bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground"
                  >
                    #{genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
          {profile.anilistUsername && (
            <a
              href={`https://anilist.co/user/${profile.anilistUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-anilist/20 bg-anilist/10 px-3 py-1.5 text-xs font-semibold text-anilist shadow-2xs transition-all hover:bg-anilist/20 active:scale-95"
              title={`AniList: ${profile.anilistUsername}`}
            >
              <AniListIcon className="size-3.5 shrink-0" />
              <span>AniList</span>
              <ExternalLink className="size-3 opacity-60" />
            </a>
          )}

          {profile.malUsername && (
            <a
              href={`https://myanimelist.net/profile/${profile.malUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-mal/20 bg-mal/10 px-3 py-1.5 text-xs font-semibold text-mal shadow-2xs transition-all hover:bg-mal/20 active:scale-95 dark:text-mal-light"
              title={`MyAnimeList: ${profile.malUsername}`}
            >
              <MyAnimeListIcon className="size-3.5 shrink-0" />
              <span>MAL</span>
              <ExternalLink className="size-3 opacity-60" />
            </a>
          )}

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
  const total = Number(stats?.totalEntries || entries.length || 0)
  const completed = Number(
    stats?.completedCount ||
      entries.filter((e) => e.status === "completed").length ||
      0
  )
  const watching = Number(
    stats?.watchingCount ||
      entries.filter(
        (e) => e.status === "watching" || e.status === "rewatching"
      ).length ||
      0
  )
  const planning = entries.filter((e) => e.status === "planning").length
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card variant="stat" size="stat">
          <div className="mb-1 flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-4" />
          </div>
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {total}
          </p>
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Total Anime
          </p>
        </Card>

        <Card variant="stat" size="stat">
          <div className="mb-1 flex size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <CheckCircle2 className="size-4" />
          </div>
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {completed}
          </p>
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Completed
          </p>
        </Card>

        <Card variant="stat" size="stat">
          <div className="mb-1 flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Clock className="size-4" />
          </div>
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {stats?.daysWatched || 0}
            <span className="ml-1 font-sans text-xs text-muted-foreground">
              d
            </span>
          </p>
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Days Watched
          </p>
        </Card>

        <Card variant="stat" size="stat">
          <div className="mb-1 flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Star className="size-4" />
          </div>
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {stats?.meanScore ? stats.meanScore.toFixed(1) : "—"}
          </p>
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Mean Score
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-xs sm:p-5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Completion Rate</span>
            <Badge variant="tag">{completedPercent}%</Badge>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
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

/**
 * Hikari-specific: showcase of anime the user hand-pinned in their settings.
 * Rendered as large horizontal feature cards above the library shelf.
 */
function PinnedShowcase({
  handle,
  pinnedIds,
}: {
  handle: string
  pinnedIds: number[]
}) {
  const { data: pinnedAnime, isLoading } = useQuery({
    queryKey: ["pinned-anime", pinnedIds],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/batch?ids=${pinnedIds.join(",")}`)
      if (!res.ok) return []
      const json: { data: Anime[] } = await res.json()
      // Preserve the user's chosen pin order
      return pinnedIds
        .map((id) => json.data.find((a) => a.id === id))
        .filter((a): a is Anime => Boolean(a))
    },
    enabled: pinnedIds.length > 0,
  })

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
        <div className="flex items-baseline gap-2">
          <h2
            id="pinned-showcase-heading"
            className="text-xl font-black tracking-tight text-foreground"
          >
            Pinned Anime
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            Hand-picked by @{handle} — their top anime recommendations
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
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

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="w-full max-w-3xl">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredAndSortedEntries.length})
          </TabsTrigger>
          <TabsTrigger value="watching">
            Watching ({watchingEntries.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedEntries.length})
          </TabsTrigger>
          <TabsTrigger value="planning">
            Plan to Watch ({planningEntries.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({pausedEntries.length})
          </TabsTrigger>
          <TabsTrigger value="dropped">
            Dropped ({droppedEntries.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all">
        <div className="pt-6">
          <ProfileAnimeShelf
            items={filteredAndSortedEntries}
            animeMap={animeMap}
            emptyMessage="No anime found in library."
            onSave={onSave}
          />
        </div>
      </TabsContent>

      <TabsContent value="watching">
        <div className="pt-6">
          <ProfileAnimeShelf
            items={watchingEntries}
            animeMap={animeMap}
            emptyMessage="No anime currently being watched."
            onSave={onSave}
          />
        </div>
      </TabsContent>

      <TabsContent value="completed">
        <div className="pt-6">
          <ProfileAnimeShelf
            items={completedEntries}
            animeMap={animeMap}
            emptyMessage="No completed anime recorded yet."
            onSave={onSave}
          />
        </div>
      </TabsContent>

      <TabsContent value="planning">
        <div className="pt-6">
          <ProfileAnimeShelf
            items={planningEntries}
            animeMap={animeMap}
            emptyMessage="No anime planned to watch."
            onSave={onSave}
          />
        </div>
      </TabsContent>

      <TabsContent value="paused">
        <div className="pt-6">
          <ProfileAnimeShelf
            items={pausedEntries}
            animeMap={animeMap}
            emptyMessage="No paused anime."
            onSave={onSave}
          />
        </div>
      </TabsContent>

      <TabsContent value="dropped">
        <div className="pt-6">
          <ProfileAnimeShelf
            items={droppedEntries}
            animeMap={animeMap}
            emptyMessage="No dropped anime."
            onSave={onSave}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}

export function UserProfileClient({ handle, initialData }: ProfileClientProps) {
  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [searchFilter, setSearchFilter] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"recent" | "score" | "title">(
    "recent"
  )

  const { data: profileData } = useQuery({
    queryKey: ["profile", handle],
    queryFn: async () => {
      const res = await fetch(`/api/user/profile/${handle}`)
      if (!res.ok) throw new Error("User not found")
      const json: {
        data: {
          profile: UserProfile
          stats: UserStats
        }
      } = await res.json()
      return json.data
    },
    initialData: {
      profile: initialData.profile,
      stats: initialData.stats,
    },
  })

  const { data: userEntriesData } = useQuery({
    queryKey: ["user-entries", handle],
    queryFn: async () => {
      const res = await fetch(`/api/entries/user/${handle}?include=anime`)
      if (!res.ok) return { entries: [], anime: [] }
      const json: {
        data?: AnimeEntry[]
        anime?: Anime[]
      } = await res.json()
      return {
        entries: json.data || [],
        anime: json.anime || [],
      }
    },
    initialData: {
      entries: initialData.entries,
      anime: initialData.anime,
    },
  })

  const entries = userEntriesData.entries
  const animeList = userEntriesData.anime

  const animeMap = React.useMemo(() => {
    const map = new Map<number, Anime>()
    animeList.forEach((a: Anime) => map.set(a.id, a))
    return map
  }, [animeList])

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

  const { profile, stats } = profileData

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
        <PinnedShowcase
          handle={profile.handle}
          pinnedIds={profile.pinnedAnimeIds}
        />
      )}

      <div className="flex flex-col gap-6 pt-2">
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
      />
    </div>
  )
}
