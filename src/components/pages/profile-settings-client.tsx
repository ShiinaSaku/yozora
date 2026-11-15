import * as React from "react"
import { UserProfile as ClerkUserProfile } from "@clerk/astro/react"
import { useClerk, useUser } from "@/lib/clerk"
import { toast } from "sonner"
import {
  ArrowUpRight,
  ExternalLink,
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
import { Badge } from "@/components/ui/badge"
import { useRouter } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { fetchBatchAnime, fetchMyProfile, searchCatalog } from "@/lib/api"
import { actions } from "astro:actions"
import { AniListIcon, MyAnimeListIcon } from "@/components/icons/platform-icons"
import type { UserProfile } from "@/lib/db/schema"
import type { Anime } from "@/lib/types/anime"

export type SettingsTab =
  "profile" | "account" | "showcase" | "connections" | "preferences" | "danger"

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

/** Fetches the signed-in user's DB profile (null when none exists). */
function useProfileQuery(enabled: boolean) {
  const [data, setData] = React.useState<UserProfile | null>(null)
  React.useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    fetchMyProfile(controller.signal)
      .then(setData)
      .catch(() => {})
    return () => controller.abort()
  }, [enabled])
  return { data }
}

export function ProfileSettingsClient(props: ProfileSettingsClientProps) {
  return <ProfileSettingsClientContent {...props} />
}

function ProfileSettingsClientContent({
  defaultTab = "profile",
}: ProfileSettingsClientProps) {
  const router = useRouter()
  const { user, isSignedIn, isLoaded } = useUser()
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
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const baselineRef = React.useRef<string>("")

  const { data: profile } = useProfileQuery(isSignedIn)

  React.useEffect(() => {
    let payload: Partial<ProfileState> | null = null

    if (profile) {
      payload = {
        handle: profile.handle || "",
        displayName: profile.displayName || "",
        avatarUrl: profile.avatarUrl || "",
        bannerUrl: profile.bannerUrl || "",
        bio: profile.bio || "",
        isPublic: profile.isPublic,
        anilistUsername: profile.anilistUsername || "",
        malUsername: profile.malUsername || "",
        pinnedAnimeIds: profile.pinnedAnimeIds || [],
      }
    } else if (user) {
      const userHandle = (user.username || user.id.slice(-8)).toLowerCase()
      const userDisplayName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "User"
      payload = {
        handle: userHandle,
        displayName: userDisplayName,
        avatarUrl: user.imageUrl || "",
        isPublic: true,
      }
    }

    if (payload) {
      dispatch({ type: "LOAD_PROFILE", payload })
      baselineRef.current = JSON.stringify({
        ...initialProfileState,
        ...payload,
      })
      setHasChanges(false)
    }
  }, [profile, user])

  React.useEffect(() => {
    setHasChanges(
      baselineRef.current !== "" &&
        JSON.stringify(state) !== baselineRef.current
    )
  }, [state])

  const validateForm = () => {
    const result = profileSchema.safeParse({
      displayName: state.displayName.trim(),
      avatarUrl: state.avatarUrl.trim(),
      bannerUrl: state.bannerUrl.trim(),
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      const flattened = z.flattenError(result.error)
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

  const saveProfile = async () => {
    if (!validateForm() || isSaving) return
    setIsSaving(true)
    try {
      const { error } = await actions.profile.update({
        handle: state.handle.trim().toLowerCase(),
        displayName: state.displayName.trim(),
        avatarUrl: state.avatarUrl.trim() || null,
        bannerUrl: state.bannerUrl.trim() || null,
        bio: state.bio.trim() || null,
        isPublic: state.isPublic,
        anilistUsername: state.anilistUsername.trim() || null,
        malUsername: state.malUsername.trim() || null,
        pinnedAnimeIds: state.pinnedAnimeIds,
      })
      if (error) throw new Error(error.message)

      toast.success("Settings Saved", {
        description:
          "Your profile and preferences are synced live across Yozora.",
      })
      baselineRef.current = JSON.stringify(state)
      setHasChanges(false)
    } catch (error) {
      toast.error("Failed to Save Settings", {
        description:
          error instanceof Error ? error.message : "An error occurred.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTabSelect = (tabId: SettingsTab) => {
    setActiveTab(tabId)
    void router.replace(`/settings/profile?tab=${tabId}`)
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto flex max-w-5xl justify-center px-4 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
        <ShieldCheck className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">Sign in required</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage your profile and settings.
        </p>
      </div>
    )
  }

  const dirtyBadge = hasChanges ? (
    <Badge variant="outline">Unsaved changes</Badge>
  ) : null

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Public profile, account security, connected services, and preferences
          — all in one place.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto pb-2 md:sticky md:top-24 md:w-56 md:flex-col md:self-start md:overflow-x-visible md:pb-0 lg:w-60">
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
                <span className="min-w-0">
                  <span className="block whitespace-nowrap">{tab.label}</span>
                  <span
                    className={cn(
                      "hidden truncate text-xs font-normal opacity-70 lg:block",
                      isSelected && "opacity-100"
                    )}
                  >
                    {tab.description}
                  </span>
                </span>
              </button>
            )
          })}
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === "profile" && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void saveProfile()
              }}
              className="flex flex-col gap-6"
            >
              <ProfilePublicInfoCard
                state={state}
                fieldErrors={fieldErrors}
                onChange={(field, value) =>
                  dispatch({ type: "SET_FIELD", field, value })
                }
              />

              <ProfileLivePreview state={state} />

              <ProfileBioCard
                bio={state.bio}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "bio", value })
                }
              />

              <SaveRow
                isSaving={isSaving}
                dirtyBadge={dirtyBadge}
                label="Save Profile"
              />
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
                <ClerkUserProfile
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
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void saveProfile()
              }}
              className="flex flex-col gap-6"
            >
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

              <SaveRow
                isSaving={isSaving}
                dirtyBadge={dirtyBadge}
                label="Save Pinned Anime"
              />
            </form>
          )}

          {activeTab === "connections" && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void saveProfile()
              }}
              className="flex flex-col gap-6"
            >
              <ProfileIntegrationsCard
                state={state}
                onChange={(field, value) =>
                  dispatch({ type: "SET_FIELD", field, value })
                }
              />

              <SaveRow
                isSaving={isSaving}
                dirtyBadge={dirtyBadge}
                label="Save Trackers"
              />
            </form>
          )}

          {activeTab === "preferences" && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void saveProfile()
              }}
              className="flex flex-col gap-6"
            >
              <ProfileAppearanceCard />

              <ProfilePrivacyCard
                handle={state.handle}
                isPublic={state.isPublic}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "isPublic", value })
                }
              />

              <SaveRow
                isSaving={isSaving}
                dirtyBadge={dirtyBadge}
                label="Save Preferences"
              />
            </form>
          )}

          {activeTab === "danger" && <DangerZoneCard />}
        </main>
      </div>
    </div>
  )
}

function SaveRow({
  isSaving,
  dirtyBadge,
  label,
}: {
  isSaving: boolean
  dirtyBadge: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-5">
      <div className="mr-auto">{dirtyBadge}</div>
      <Button type="submit" size="hero" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
        ) : (
          <Save data-icon="inline-start" className="size-4" />
        )}
        {label}
      </Button>
    </div>
  )
}

/** Strips markdown syntax for a plain-text preview line. */
function previewText(markdown: string) {
  return markdown
    .replace(/[#*_`~>[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function ProfileLivePreview({ state }: { state: ProfileState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>
          A quick look at what visitors see on your public profile.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
          <div className="relative h-24 overflow-hidden bg-muted sm:h-32">
            {state.bannerUrl ? (
              <Image
                src={state.bannerUrl}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover object-center"
              />
            ) : (
              <div className="size-full bg-linear-to-br from-primary/30 via-accent/50 to-secondary" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-card via-card/20 to-transparent" />
          </div>

          <div className="-mt-8 flex items-end gap-3 px-4 pb-4 sm:px-5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md">
              {state.avatarUrl ? (
                <Image
                  src={state.avatarUrl}
                  alt={state.displayName || "Avatar preview"}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary/10 text-lg font-black text-primary">
                  {(state.displayName || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="truncate text-lg leading-tight font-bold text-foreground">
                {state.displayName || "Your Display Name"}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                @{state.handle || "handle"}
              </p>
            </div>
          </div>

          {state.bio.trim() && (
            <p className="line-clamp-2 border-t border-border/40 px-4 py-3 text-xs text-muted-foreground sm:px-5">
              {previewText(state.bio)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Public Information</CardTitle>
        <CardDescription>
          Your public handle, display name, and visual branding on Yozora.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="handle">Handle (profile URL)</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="handle"
                  value={state.handle}
                  onChange={(e) =>
                    onChange(
                      "handle",
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                    )
                  }
                  placeholder="e.g. saksham"
                  size="prefixed"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Letters, numbers, dashes and underscores only. Changing this
                breaks existing links to your profile.
              </p>
            </Field>

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
          </div>

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
    <Card>
      <CardHeader>
        <CardTitle>About You (Bio)</CardTitle>
        <CardDescription>
          Share your favorite genres, anime milestones, or a short markdown
          biography.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <MarkdownEditor
          value={bio}
          onChange={onChange}
          placeholder="Write your anime bio in Markdown... (e.g. **Favorite Series**: Steins;Gate)"
          minHeight="140px"
          maxLength={2000}
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
  const trackers = [
    {
      id: "anilistUsername",
      label: "AniList Username",
      icon: AniListIcon,
      username: state.anilistUsername,
      href: `https://anilist.co/user/${state.anilistUsername}`,
      placeholder: "e.g. saksham",
    },
    {
      id: "malUsername",
      label: "MyAnimeList Username",
      icon: MyAnimeListIcon,
      username: state.malUsername,
      href: `https://myanimelist.net/profile/${state.malUsername}`,
      placeholder: "e.g. saksham",
    },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Tracker Accounts</CardTitle>
        <CardDescription>
          Link your AniList and MyAnimeList profiles to display badges on your
          public profile.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trackers.map(
            ({ id, label, icon: Icon, username, href, placeholder }) => (
              <Field key={id}>
                <FieldLabel htmlFor={id}>
                  <span className="flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    {label}
                  </span>
                </FieldLabel>
                <Input
                  id={id}
                  value={username}
                  onChange={(e) => onChange(id, e.target.value)}
                  placeholder={placeholder}
                />
                {username && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View {username}
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </Field>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfilePrivacyCard({
  handle,
  isPublic,
  onChange,
}: {
  handle: string
  isPublic: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy &amp; Visibility</CardTitle>
        <CardDescription>
          Control who can view your profile and anime library shelf.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
            isPublic
              ? "border-primary/30 bg-primary/5"
              : "border-border/50 bg-muted/30"
          )}
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => onChange(e.target.checked)}
              className="mt-0.5 size-4 cursor-pointer rounded accent-primary"
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Public profile
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Anyone can view your anime library, stats and pinned showcase.
              </span>
            </span>
          </label>

          {isPublic && handle && (
            <a
              href={`/u/${encodeURIComponent(handle)}`}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View profile
              <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileAppearanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance &amp; Theme</CardTitle>
        <CardDescription>
          Select your preferred color theme or sync with system preferences.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-foreground">
            Theme Mode
          </span>
          <ThemeSegmentedToggle />
        </div>
      </CardContent>
    </Card>
  )
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

  const [searchResults, setSearchResults] = React.useState<Anime[]>([])
  const [isFetching, setIsFetching] = React.useState(false)

  React.useEffect(() => {
    if (debounced.length < 2) {
      setSearchResults([])
      return
    }
    const controller = new AbortController()
    setIsFetching(true)
    searchCatalog(debounced, controller.signal)
      .then((items) => setSearchResults(items.slice(0, 6)))
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setIsFetching(false)
      })
    return () => controller.abort()
  }, [debounced])

  const [pinnedDetails, setPinnedDetails] = React.useState<Anime[]>([])
  const detailKey = pinnedIds.join(",")

  React.useEffect(() => {
    if (pinnedIds.length === 0) {
      setPinnedDetails([])
      return
    }
    const controller = new AbortController()
    fetchBatchAnime(pinnedIds, controller.signal)
      .then(setPinnedDetails)
      .catch(() => {})
    return () => controller.abort()
  }, [detailKey])

  const addPin = (id: number) => {
    if (pinnedIds.includes(id) || pinnedIds.length >= MAX_PINS) return
    onChange([...pinnedIds, id])
    setSearch("")
  }

  const removePin = (id: number) => onChange(pinnedIds.filter((p) => p !== id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Pin className="size-4 text-primary" />
            Pinned Anime
          </span>
        </CardTitle>
        <CardDescription>
          Feature up to {MAX_PINS} anime at the top of your public profile —
          your all-time favorites, current obsessions, or recommendations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {pinnedIds.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pinnedIds.map((id, index) => {
                const detail = pinnedDetails.find((d: Anime) => d.id === id)
                return (
                  <div
                    key={id}
                    className="relative flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 p-2"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {detail ? (
                        <Image
                          src={detail.coverMedium || detail.cover}
                          alt={detail.title}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center font-mono text-xs font-bold text-muted-foreground">
                          {index + 1}
                        </div>
                      )}
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
              <FieldLabel htmlFor="pinned-search">
                Search anime to pin
              </FieldLabel>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pinned-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Steins;Gate, Frieren…"
                  autoComplete="off"
                  size="icon"
                />
              </div>
            </Field>
          )}

          {debounced.length >= 2 && pinnedIds.length < MAX_PINS && (
            <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/50 bg-background/60">
              {isFetching && searchResults.length === 0 && (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Searching…
                </div>
              )}
              {!isFetching && searchResults.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">
                  No results found.
                </div>
              )}
              {searchResults.map((result) => (
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
        </div>
      </CardContent>
    </Card>
  )
}

function DangerZoneCard() {
  const { isSignedIn } = useUser()
  const clerk = useClerk()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  const deleteAll = async () => {
    setIsDeleting(true)
    try {
      const { data, error } = await actions.profile.deleteData()
      if (error) throw new Error(error.message)
      toast.success("All Data Deleted", {
        description: `${data.deletedEntries} entries and ${data.deletedCollections} collections were permanently removed.`,
      })
      setConfirmOpen(false)
      setConfirmText("")
      void clerk?.signOut()
    } catch (error) {
      toast.error("Deletion Failed", {
        description:
          error instanceof Error ? error.message : "Deletion failed.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isSignedIn) return null

  const canDelete = confirmText.trim().toUpperCase() === "DELETE"

  return (
    <>
      <Card variant="destructive">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4" />
              Danger Zone
            </span>
          </CardTitle>
          <CardDescription>
            Permanently delete your entire Yozora presence: every library entry,
            episode progress, collection, and your public profile. This cannot
            be undone.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            type="button"
            variant="destructive"
            size="hero"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 data-icon="inline-start" className="size-4" />
            Delete All My Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
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
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canDelete || isDeleting}
              onClick={() => void deleteAll()}
            >
              {isDeleting ? (
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
