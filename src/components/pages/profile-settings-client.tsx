import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useUser, useClerk, UserProfile } from "@clerk/tanstack-react-start"
import { toast } from "sonner"
import {
  Link2,
  Loader2,
  Palette,
  Pin,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { ThemeSegmentedToggle } from "@/components/layout/theme-toggle"
import { Image } from "@/components/ui/image"
import { useRouter } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { z } from "zod"
import type { SettingsTab } from "@/routes/_authed/settings/profile"

const profileSchema = z.compile(
  z.object({
    displayName: z.string().min(1, "Display Name is required"),
    avatarUrl: z.string().optional().or(z.literal("")),
    bannerUrl: z.string().optional().or(z.literal("")),
  })
)

interface ProfileState {
  handle: string
  displayName: string
  avatarUrl: string
  bannerUrl: string
  bio: string
  anilistUsername: string
  malUsername: string
  pinnedAnimeIds: number[]
  isPublic: boolean
}

type ProfileAction =
  | {
      type: "SET_FIELD"
      field: keyof ProfileState
      value: ProfileState[keyof ProfileState]
    }
  | { type: "LOAD_PROFILE"; payload: Partial<ProfileState> }

const initialProfileState: ProfileState = {
  handle: "",
  displayName: "",
  avatarUrl: "",
  bannerUrl: "",
  bio: "",
  isPublic: true,
  anilistUsername: "",
  malUsername: "",
  pinnedAnimeIds: [],
}

function profileReducer(
  state: ProfileState,
  action: ProfileAction
): ProfileState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
    case "LOAD_PROFILE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface ProfileSettingsClientProps {
  defaultTab?: SettingsTab
}

const TABS: Array<{
  id: SettingsTab
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: "profile",
    label: "Profile",
    description: "Public identity, handle & bio",
    icon: User,
  },
  {
    id: "account",
    label: "Account & Security",
    description: "Emails, password & authentication",
    icon: ShieldCheck,
  },
  {
    id: "showcase",
    label: "Pinned Anime",
    description: "Feature top anime on your profile",
    icon: Pin,
  },
  {
    id: "connections",
    label: "Trackers & Sync",
    description: "AniList & MyAnimeList integration",
    icon: Link2,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Theme mode & library visibility",
    icon: Palette,
  },
  {
    id: "danger",
    label: "Danger Zone",
    description: "Delete all stored account data",
    icon: Trash2,
  },
]

export function ProfileSettingsClient({
  defaultTab = "profile",
}: ProfileSettingsClientProps) {
  const router = useRouter()
  const { user, isSignedIn, isLoaded } = useUser()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(defaultTab)

  React.useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const [state, dispatch] = React.useReducer(
    profileReducer,
    initialProfileState
  )
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  )

  // Load current user profile from DB
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile/me")
      if (!res.ok) {
        return null
      }
      const json = await res.json<{ data: ProfileState }>()
      return json.data
    },
    enabled: !!isSignedIn,
  })

  React.useEffect(() => {
    if (profile) {
      dispatch({
        type: "LOAD_PROFILE",
        payload: {
          handle: profile.handle || "",
          displayName: profile.displayName || "",
          avatarUrl: profile.avatarUrl || "",
          bannerUrl: profile.bannerUrl || "",
          bio: profile.bio || "",
          isPublic: profile.isPublic,
          anilistUsername: profile.anilistUsername || "",
          malUsername: profile.malUsername || "",
          pinnedAnimeIds: profile.pinnedAnimeIds,
        },
      })
    } else if (user) {
      const userHandle = (user.username || user.id.slice(-8)).toLowerCase()
      const userDisplayName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "User"
      dispatch({
        type: "LOAD_PROFILE",
        payload: {
          handle: userHandle,
          displayName: userDisplayName,
          avatarUrl: user.imageUrl || "",
          isPublic: true,
        },
      })
    }
  }, [profile, user])

  const validateForm = () => {
    const result = profileSchema.safeParse({
      displayName: state.displayName.trim(),
      avatarUrl: state.avatarUrl.trim(),
      bannerUrl: state.bannerUrl.trim(),
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      const flattened = result.error.flatten()
      for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
        if (messages.length > 0) {
          errors[key] = messages[0]!
        }
      }
      setFieldErrors(errors)
      toast.error("Validation Error", {
        description:
          Object.values(errors)[0] || "Please correct the invalid fields.",
      })
      return false
    }

    setFieldErrors({})
    return true
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: state.handle.trim().toLowerCase(),
          displayName: state.displayName.trim(),
          avatarUrl: state.avatarUrl.trim() || null,
          bannerUrl: state.bannerUrl.trim() || null,
          bio: state.bio.trim() || null,
          isPublic: state.isPublic,
          anilistUsername: state.anilistUsername.trim() || null,
          malUsername: state.malUsername.trim() || null,
          pinnedAnimeIds: state.pinnedAnimeIds,
        }),
      })

      const json = await res.json<{
        data: ProfileState
        error?: string
      }>()
      if (!res.ok) {
        throw new Error(json.error || "Failed to update profile")
      }
      return json.data
    },
    onSuccess: (data) => {
      toast.success("Settings Saved", {
        description:
          "Your profile and preferences are synced live across Yozora.",
      })
      queryClient.invalidateQueries({ queryKey: ["my-profile"] })
      queryClient.invalidateQueries({ queryKey: ["profile", data.handle] })
    },
    onError: (err: Error) => {
      toast.error("Failed to Save Settings", {
        description: err.message || "An error occurred while saving.",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    saveMutation.mutate()
  }

  const handleTabSelect = (tabId: SettingsTab) => {
    setActiveTab(tabId)
    void router.replace(`/settings/profile?tab=${tabId}`)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto flex max-w-5xl justify-center px-4 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unified control center for your public anime profile, account
          security, connected services, and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-x-visible md:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            const isDanger = tab.id === "danger"
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={cn(
                  "group flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all",
                  isSelected
                    ? isDanger
                      ? "bg-destructive/15 font-semibold text-destructive"
                      : "bg-muted font-semibold text-foreground shadow-xs"
                    : isDanger
                      ? "text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isSelected
                      ? isDanger
                        ? "text-destructive"
                        : "text-primary"
                      : isDanger
                        ? "text-destructive/70"
                        : "text-muted-foreground"
                  )}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <ProfilePublicInfoCard
                state={state}
                fieldErrors={fieldErrors}
                onChange={(field, value) =>
                  dispatch({ type: "SET_FIELD", field, value })
                }
              />

              <ProfileBioCard
                bio={state.bio}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "bio", value })
                }
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="cursor-pointer rounded-xl px-6 font-bold"
                >
                  {saveMutation.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Save data-icon="inline-start" className="size-4" />
                  )}
                  Save Profile
                </Button>
              </div>
            </form>
          )}

          {activeTab === "account" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Account &amp; Security
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your email addresses, password, two-step verification,
                  and authenticated sessions directly.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/50 bg-card p-2 sm:p-4">
                <UserProfile
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      cardBox:
                        "w-full max-w-full shadow-none border-0 bg-transparent",
                      navbar: "border-r border-border/40",
                      navbarButton:
                        "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    },
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "showcase" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <PinnedAnimeCard
                pinnedIds={state.pinnedAnimeIds}
                onChange={(ids) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "pinnedAnimeIds",
                    value: ids,
                  })
                }
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="cursor-pointer rounded-xl px-6 font-bold"
                >
                  {saveMutation.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Save data-icon="inline-start" className="size-4" />
                  )}
                  Save Pinned Anime
                </Button>
              </div>
            </form>
          )}

          {activeTab === "connections" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <ProfileIntegrationsCard
                state={state}
                onChange={(field, value) =>
                  dispatch({ type: "SET_FIELD", field, value })
                }
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="cursor-pointer rounded-xl px-6 font-bold"
                >
                  {saveMutation.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Save data-icon="inline-start" className="size-4" />
                  )}
                  Save Trackers
                </Button>
              </div>
            </form>
          )}

          {activeTab === "preferences" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <ProfileAppearanceCard />

              <ProfilePrivacyCard
                isPublic={state.isPublic}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "isPublic", value })
                }
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="cursor-pointer rounded-xl px-6 font-bold"
                >
                  {saveMutation.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Save data-icon="inline-start" className="size-4" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </form>
          )}

          {activeTab === "danger" && <DangerZoneCard />}
        </main>
      </div>
    </div>
  )
}

function ProfilePublicInfoCard({
  state,
  fieldErrors,
  onChange,
}: {
  state: ProfileState
  fieldErrors: Record<string, string>
  onChange: <TKey extends keyof ProfileState>(
    field: TKey,
    value: ProfileState[TKey]
  ) => void
}) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Public Information</CardTitle>
        <CardDescription>
          Your public display name, handle, and visual branding on Yozora.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
            <Input
              id="displayName"
              value={state.displayName}
              onChange={(e) => onChange("displayName", e.target.value)}
              placeholder="e.g. Saksham"
              autoComplete="name"
              required
            />
            {fieldErrors.displayName && (
              <FieldError>{fieldErrors.displayName}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
              <Input
                id="avatarUrl"
                type="url"
                value={state.avatarUrl}
                onChange={(e) => onChange("avatarUrl", e.target.value)}
                placeholder="https://..."
                autoComplete="photo"
              />
              {fieldErrors.avatarUrl && (
                <FieldError>{fieldErrors.avatarUrl}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="bannerUrl">Banner URL</FieldLabel>
              <Input
                id="bannerUrl"
                type="url"
                value={state.bannerUrl}
                onChange={(e) => onChange("bannerUrl", e.target.value)}
                placeholder="https://..."
              />
              {fieldErrors.bannerUrl && (
                <FieldError>{fieldErrors.bannerUrl}</FieldError>
              )}
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function ProfileBioCard({
  bio,
  onChange,
}: {
  bio: string
  onChange: (value: string) => void
}) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>About You (Bio)</CardTitle>
        <CardDescription>
          Share your favorite genres, anime milestones, or a short markdown
          biography.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <MarkdownEditor
          value={bio}
          onChange={onChange}
          placeholder="Write your anime bio in Markdown... (e.g. **Favorite Series**: Steins;Gate)"
          minHeight="140px"
        />
      </CardContent>
    </Card>
  )
}

function ProfileIntegrationsCard({
  state,
  onChange,
}: {
  state: ProfileState
  onChange: <TKey extends keyof ProfileState>(
    field: TKey,
    value: ProfileState[TKey]
  ) => void
}) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Connected Tracker Accounts</CardTitle>
        <CardDescription>
          Link your AniList and MyAnimeList profiles to display badges on your
          public profile.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="anilistUsername">AniList Username</FieldLabel>
            <Input
              id="anilistUsername"
              value={state.anilistUsername}
              onChange={(e) => onChange("anilistUsername", e.target.value)}
              placeholder="e.g. saksham"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="malUsername">MyAnimeList Username</FieldLabel>
            <Input
              id="malUsername"
              value={state.malUsername}
              onChange={(e) => onChange("malUsername", e.target.value)}
              placeholder="e.g. saksham"
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfilePrivacyCard({
  isPublic,
  onChange,
}: {
  isPublic: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Privacy &amp; Visibility</CardTitle>
        <CardDescription>
          Control who can view your profile and anime library shelf.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => onChange(e.target.checked)}
            className="size-4 cursor-pointer rounded accent-primary"
          />
          <span className="text-sm font-medium text-foreground select-none">
            Make my anime library and stats public
          </span>
        </label>
      </CardContent>
    </Card>
  )
}

function ProfileAppearanceCard() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Appearance &amp; Theme</CardTitle>
        <CardDescription>
          Select your preferred color theme or sync with system preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col justify-between gap-3 px-0 pb-0 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-foreground">Theme Mode</span>
        <ThemeSegmentedToggle />
      </CardContent>
    </Card>
  )
}

interface PinnedSearchResult {
  id: number
  title: string
  cover: string
  coverMedium?: string
  year?: number
}

function PinnedAnimeCard({
  pinnedIds,
  onChange,
}: {
  pinnedIds: number[]
  onChange: (ids: number[]) => void
}) {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const MAX_PINS = 6

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["pinned-search", debounced],
    queryFn: async () => {
      const res = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(debounced)}`
      )
      if (!res.ok) return []
      const json = await res.json<{ data: PinnedSearchResult[] }>()
      return json.data.slice(0, 6)
    },
    enabled: debounced.length >= 2,
  })

  const { data: pinnedDetails = [] } = useQuery({
    queryKey: ["pinned-details", pinnedIds],
    queryFn: async () => {
      if (pinnedIds.length === 0) return []
      const res = await fetch(`/api/catalog/batch?ids=${pinnedIds.join(",")}`)
      if (!res.ok) return []
      const json = await res.json<{ data: PinnedSearchResult[] }>()
      return json.data
    },
    enabled: pinnedIds.length > 0,
  })

  const addPin = (id: number) => {
    if (pinnedIds.includes(id) || pinnedIds.length >= MAX_PINS) return
    onChange([...pinnedIds, id])
    setSearch("")
  }

  const removePin = (id: number) => onChange(pinnedIds.filter((p) => p !== id))

  return (
    <Card className="rounded-2xl border-border/50 bg-card p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Pin className="size-4 text-primary" />
          Pinned Anime
        </CardTitle>
        <CardDescription>
          Feature up to {MAX_PINS} anime at the top of your public profile —
          your all-time favorites, current obsessions, or recommendations.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0 pb-0">
        {pinnedIds.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pinnedIds.map((id) => {
              const detail = pinnedDetails.find((d) => d.id === id)
              return (
                <div
                  key={id}
                  className="relative flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 p-2"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {detail?.coverMedium || detail?.cover ? (
                      <Image
                        src={detail.coverMedium || detail.cover}
                        alt={detail.title}
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="line-clamp-2 min-w-0 text-xs font-semibold text-foreground">
                    {detail?.title || `Anime #${id}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePin(id)}
                    aria-label={`Remove ${detail?.title || "anime"} from pins`}
                    className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {pinnedIds.length < MAX_PINS && (
          <Field>
            <FieldLabel htmlFor="pinned-search">Search anime to pin</FieldLabel>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pinned-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Steins;Gate, Frieren…"
                autoComplete="off"
                className="pl-9"
              />
            </div>
          </Field>
        )}

        {debounced.length >= 2 && pinnedIds.length < MAX_PINS && (
          <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/50 bg-background/60">
            {isFetching && results.length === 0 && (
              <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Searching…
              </div>
            )}
            {!isFetching && results.length === 0 && (
              <div className="p-3 text-xs text-muted-foreground">
                No results found.
              </div>
            )}
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => addPin(result.id)}
                disabled={pinnedIds.includes(result.id)}
                className="flex w-full cursor-pointer items-center gap-3 p-2 text-left transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {(result.coverMedium || result.cover) && (
                    <Image
                      src={result.coverMedium || result.cover}
                      alt={result.title}
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                  {result.title}
                  {result.year ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({result.year})
                    </span>
                  ) : null}
                </span>
                <Plus className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DangerZoneCard() {
  const { isSignedIn } = useUser()
  const clerk = useClerk()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/data", { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json<{ error?: string }>()
        throw new Error(json.error || "Failed to delete data")
      }
      return await res.json<{
        data: { deletedEntries: number; deletedCollections: number }
      }>()
    },
    onSuccess: ({ data }) => {
      toast.success("All Data Deleted", {
        description: `${data.deletedEntries} entries and ${data.deletedCollections} collections were permanently removed.`,
      })
      setConfirmOpen(false)
      setConfirmText("")
      void clerk.signOut()
    },
    onError: (err: Error) => {
      toast.error("Deletion Failed", { description: err.message })
    },
  })

  if (!isSignedIn) return null

  const canDelete = confirmText.trim().toUpperCase() === "DELETE"

  return (
    <>
      <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your entire Yozora presence: every library entry,
            episode progress, collection, and your public profile. This cannot
            be undone.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            className="cursor-pointer rounded-xl font-bold"
          >
            <Trash2 data-icon="inline-start" className="size-4" />
            Delete All My Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete everything?</DialogTitle>
            <DialogDescription>
              This permanently removes all anime entries, episode progress,
              collections, and your public profile. There is no undo.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="delete-confirm">
              Type{" "}
              <span className="font-mono font-bold text-destructive">
                DELETE
              </span>{" "}
              to confirm
            </FieldLabel>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="cursor-pointer rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canDelete || deleteAllMutation.isPending}
              onClick={() => deleteAllMutation.mutate()}
              className="cursor-pointer rounded-xl font-bold"
            >
              {deleteAllMutation.isPending ? (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <Trash2 data-icon="inline-start" className="size-4" />
              )}
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
