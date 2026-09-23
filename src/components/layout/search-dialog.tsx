import * as React from "react"
import Image from "@/components/ui/image"
import { usePathname, useRouter } from "@/lib/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  Calendar,
  Layers,
  Link2,
  Loader2,
  Lock,
  Music,
  Palette,
  Pin,
  Radio,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react"
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getAnimeCollection, searchAnime } from "@/lib/catalog"
import { getAnimeUrl } from "@/lib/utils/slug"
import type { Anime } from "@/lib/types/anime"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PageItem {
  id: string
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const PAGES: PageItem[] = [
  {
    id: "seasonal",
    title: "Seasonal Anime",
    href: "/seasonal",
    icon: Calendar,
  },
  {
    id: "airing",
    title: "Airing Schedule",
    href: "/airing",
    icon: Radio,
    badge: "Live",
  },
  { id: "search", title: "Anime Radar", href: "/search", icon: Search },
  {
    id: "about",
    title: "Themes & Soundtracks",
    href: "/about",
    icon: Music,
  },
  { id: "library", title: "My Library", href: "/library", icon: Layers },
]

interface SettingItem {
  id: string
  title: string
  description: string
  href: string
  keywords: string[]
  icon: React.ComponentType<{ className?: string }>
}

const SETTINGS: SettingItem[] = [
  {
    id: "profile-info",
    title: "Profile Settings",
    description: "Display name, avatar, banner & bio",
    href: "/settings/profile?tab=profile",
    keywords: ["profile", "name", "avatar", "bio", "banner", "handle"],
    icon: User,
  },
  {
    id: "account-security",
    title: "Account & Security",
    description: "Email, password, active sessions & authentication",
    href: "/settings/profile?tab=account",
    keywords: ["account", "security", "email", "password", "sessions", "login"],
    icon: ShieldCheck,
  },
  {
    id: "pinned-anime",
    title: "Pinned Anime",
    description: "Feature top anime favorites on profile",
    href: "/settings/profile?tab=showcase",
    keywords: ["pin", "showcase", "favorites", "feature", "top"],
    icon: Pin,
  },
  {
    id: "connected-trackers",
    title: "Connected Trackers",
    description: "Link AniList & MyAnimeList profiles",
    href: "/settings/profile?tab=connections",
    keywords: ["trackers", "anilist", "myanimelist", "mal", "sync", "link"],
    icon: Link2,
  },
  {
    id: "appearance-theme",
    title: "Appearance & Theme",
    description: "Switch light, dark or system color theme",
    href: "/settings/profile?tab=preferences",
    keywords: ["appearance", "theme", "dark", "light", "color", "mode"],
    icon: Palette,
  },
  {
    id: "privacy-visibility",
    title: "Privacy & Visibility",
    description: "Make anime library shelf public or private",
    href: "/settings/profile?tab=preferences",
    keywords: ["privacy", "visibility", "public", "private", "hidden"],
    icon: Lock,
  },
  {
    id: "danger-zone",
    title: "Delete Account Data",
    description: "Permanently erase your anime progress & profile",
    href: "/settings/profile?tab=danger",
    keywords: ["delete", "erase", "danger", "remove", "wipe", "data"],
    icon: Trash2,
  },
]

interface TrendingAnimeItem {
  id: number
  title: string
  cover: string
  format: string
  year: number
  score: number
}

const TRENDING_ANIME_FALLBACK: TrendingAnimeItem[] = [
  {
    id: 182205,
    title: "That Time I Got Reincarnated as a Slime Season 4",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx182205-q2AeO1owuQbO.jpg",
    format: "TV",
    year: 2026,
    score: 8.3,
  },
  {
    id: 21,
    title: "One Piece",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg",
    format: "TV",
    year: 1999,
    score: 8.7,
  },
  {
    id: 189046,
    title: "Re:ZERO -Starting Life in Another World- Season 4",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx189046-yaHWtS5FII46.jpg",
    format: "TV",
    year: 2026,
    score: 9.0,
  },
  {
    id: 269,
    title: "Bleach",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx269-d2GmRkJbMopq.png",
    format: "TV",
    year: 2004,
    score: 7.9,
  },
  {
    id: 196187,
    title: "Smoking Behind the Supermarket with You",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx196187-0dgFi2CPp3xn.jpg",
    format: "TV",
    year: 2026,
    score: 8.2,
  },
  {
    id: 171110,
    title: "Ascendance of a Bookworm: Adopted Daughter",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx171110-7zOdInS6DQNL.jpg",
    format: "TV",
    year: 2026,
    score: 7.6,
  },
  {
    id: 209983,
    title: "HELL MODE Season 2",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx209983-sFOcKyqMufxb.jpg",
    format: "TV",
    year: 2026,
    score: 7.1,
  },
  {
    id: 199748,
    title: "I Became a Legend After My 10 Year-Long Last Stand",
    cover:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx199748-PAFk9pGSUmFL.png",
    format: "ONA",
    year: 2026,
    score: 6.2,
  },
]

type Entry =
  | { value: string; kind: "page"; page: PageItem }
  | { value: string; kind: "setting"; setting: SettingItem }
  | { value: string; kind: "anime"; anime: { id: number; title: string } }
  | { value: string; kind: "trending"; anime: TrendingAnimeItem }
  | { value: string; kind: "view-all" }

interface CommandGroupData {
  value: string
  items: Entry[]
}

function SearchDialogInner({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const previousPathnameRef = React.useRef(pathname)
  const onOpenChangeRef = React.useRef(onOpenChange)

  // Close on page navigation
  React.useEffect(() => {
    if (previousPathnameRef.current === pathname) return
    previousPathnameRef.current = pathname
    if (open) {
      onOpenChangeRef.current(false)
    }
  }, [pathname, open])

  // Reset when the dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setDebouncedQuery("")
    }
  }, [open])

  // Fast debouncing for queries
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150)
    return () => clearTimeout(timer)
  }, [query])

  const isSearching = debouncedQuery.trim().length > 0

  const { data: results = [], isLoading } = useQuery<Anime[]>({
    queryKey: ["search-dialog", debouncedQuery],
    queryFn: () => searchAnime(debouncedQuery),
    enabled: isSearching,
    staleTime: 1000 * 60 * 5,
  })

  const { data: dynamicTrending } = useQuery<Anime[]>({
    queryKey: ["search-dialog-trending"],
    queryFn: () => getAnimeCollection("trending"),
    staleTime: 1000 * 60 * 30,
    enabled: open && !isSearching,
  })

  const trendingAnimeList = React.useMemo(() => {
    if (dynamicTrending && dynamicTrending.length > 0) {
      return dynamicTrending.slice(0, 8).map((a) => ({
        id: a.id,
        title: a.title,
        cover: a.coverLarge || a.coverMedium || a.cover || "",
        format: a.format || "TV",
        year: a.year || 2026,
        score: a.score || 8.0,
      }))
    }
    return TRENDING_ANIME_FALLBACK
  }, [dynamicTrending])

  const groups = React.useMemo<CommandGroupData[]>(() => {
    const q = debouncedQuery.toLowerCase()

    if (!isSearching) {
      return [
        {
          value: "Pages",
          items: PAGES.map((page) => ({
            value: `page:${page.id}`,
            kind: "page",
            page,
          })),
        },
        {
          value: "Trending Anime",
          items: trendingAnimeList.map((anime) => ({
            value: `trending:${anime.id}`,
            kind: "trending",
            anime,
          })),
        },
        {
          value: "Settings",
          items: SETTINGS.slice(0, 4).map((setting) => ({
            value: `setting:${setting.id}`,
            kind: "setting",
            setting,
          })),
        },
      ]
    }

    const nextGroups: CommandGroupData[] = []

    const matchedPages = PAGES.filter((p) => p.title.toLowerCase().includes(q))
    if (matchedPages.length > 0) {
      nextGroups.push({
        value: "Pages",
        items: matchedPages.map((page) => ({
          value: `page:${page.id}`,
          kind: "page",
          page,
        })),
      })
    }

    const matchedSettings = SETTINGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q))
    )
    if (matchedSettings.length > 0) {
      nextGroups.push({
        value: "Settings",
        items: matchedSettings.map((setting) => ({
          value: `setting:${setting.id}`,
          kind: "setting",
          setting,
        })),
      })
    }

    if (results.length > 0) {
      nextGroups.push({
        value: "Anime",
        items: [
          ...results.map((anime) => ({
            value: `anime:${anime.id}`,
            kind: "anime" as const,
            anime: { id: anime.id, title: anime.title },
          })),
          { value: "view-all", kind: "view-all" },
        ],
      })
    }

    return nextGroups
  }, [debouncedQuery, isSearching, results, trendingAnimeList])

  const hasResults = groups.some((group) => group.items.length > 0)

  const handleSelect = React.useCallback(
    (entry: Entry) => {
      onOpenChange(false)
      switch (entry.kind) {
        case "page":
          router.push(entry.page.href)
          break
        case "setting":
          router.push(entry.setting.href)
          break
        case "anime":
        case "trending":
          router.push(getAnimeUrl(entry.anime))
          break
        case "view-all":
          router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`)
          break
      }
    },
    [router, onOpenChange, debouncedQuery]
  )

  const renderEntry = (entry: Entry) => {
    if (entry.kind === "page") {
      const Icon = entry.page.icon
      return (
        <>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors group-data-highlighted:text-foreground">
            <Icon className="size-4" />
          </div>
          <span className="flex-1 text-sm font-medium">{entry.page.title}</span>
          {entry.page.badge && (
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {entry.page.badge}
            </span>
          )}
          <ArrowRight className="size-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-data-highlighted:opacity-100" />
        </>
      )
    }

    if (entry.kind === "setting") {
      const Icon = entry.setting.icon
      return (
        <>
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors group-data-highlighted:text-foreground">
            <Icon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">
              {entry.setting.title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {entry.setting.description}
            </span>
          </div>
          <ArrowRight className="size-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-data-highlighted:opacity-100" />
        </>
      )
    }

    if (entry.kind === "anime") {
      return (
        <>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {entry.anime.title}
            </span>
          </div>
          <ArrowRight className="size-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-data-highlighted:opacity-100" />
        </>
      )
    }

    if (entry.kind === "trending") {
      return (
        <>
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted shadow-2xs">
            <Image
              variant="thumb"
              src={entry.anime.cover}
              alt={entry.anime.title}
              fill
              unoptimized
              sizes="36px"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {entry.anime.title}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span>{entry.anime.format}</span>
              <span>·</span>
              <span>{entry.anime.year}</span>
              <span>·</span>
              <span className="font-semibold text-amber-500">
                ★ {entry.anime.score.toFixed(1)}
              </span>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-data-highlighted:opacity-100" />
        </>
      )
    }

    return (
      <>
        <span className="flex-1 text-center text-xs font-semibold text-primary">
          View all results for &ldquo;{debouncedQuery}&rdquo;
        </span>
        <ArrowRight className="size-3.5 text-primary" />
      </>
    )
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandDialogPopup>
        <Command
          items={groups}
          filter={() => true}
          onValueChange={(value) => setQuery(value)}
        >
          <CommandInput placeholder="Search anime, characters, pages, settings..." />

          {isLoading && results.length === 0 && isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching the catalog…
            </div>
          )}

          {!hasResults && !isLoading && (
            <CommandEmpty>
              <span className="text-sm font-medium text-foreground">
                No results found
                {debouncedQuery ? ` for “${debouncedQuery}”` : ""}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Try searching anime titles, characters, or settings keywords.
              </span>
            </CommandEmpty>
          )}

          <CommandList>
            {(group) => (
              <CommandGroup key={group.value} items={group.items}>
                <CommandGroupLabel>{group.value}</CommandGroupLabel>
                <CommandCollection>
                  {(entry) => (
                    <CommandItem
                      key={entry.value}
                      value={entry.value}
                      onClick={() => handleSelect(entry)}
                    >
                      {renderEntry(entry)}
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>

          {!hasResults && !isSearching && (
            <CommandFooter>
              <span className="font-mono text-xs text-muted-foreground/60">
                Yozora
              </span>
            </CommandFooter>
          )}

          <CommandFooter>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span>Open</span>
                <kbd className="flex h-5 items-center justify-center rounded border border-border/70 bg-muted/80 px-1.5 font-mono text-xs">
                  ↵
                </kbd>
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <span>Navigate</span>
                <kbd className="flex h-5 items-center justify-center rounded border border-border/70 bg-muted/80 px-1 font-mono text-xs">
                  ↑↓
                </kbd>
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <span>Close</span>
                <kbd className="flex h-5 items-center justify-center rounded border border-border/70 bg-muted/80 px-1.5 font-mono text-xs">
                  esc
                </kbd>
              </span>
            </div>
            <span className="font-mono text-xs text-muted-foreground/60">
              Yozora
            </span>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  )
}

export function SearchDialog(props: SearchDialogProps) {
  return (
    <React.Suspense fallback={null}>
      <SearchDialogInner {...props} />
    </React.Suspense>
  )
}
