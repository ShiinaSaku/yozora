import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { SignInButton, useUser } from "@clerk/tanstack-react-start"
import { toast } from "sonner"
import {
  Bookmark,
  Heart,
  Loader2,
  Minus,
  Plus,
  Star,
  Trash2,
  Check,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Anime } from "@/lib/types/anime"
import type { AnimeEntry } from "@/lib/db/schema"

interface SaveDialogProps {
  anime: Anime | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LibraryStatus =
  "watching" | "completed" | "planning" | "paused" | "dropped" | "rewatching"

interface FormState {
  status: LibraryStatus
  progress: number
  score: number | ""
  notes: string
  favorite: boolean
}

const statusOptions: Array<{
  value: LibraryStatus
  label: string
  dotClass: string
  activeClass: string
}> = [
  {
    value: "watching",
    label: "Watching",
    dotClass: "bg-emerald-500",
    activeClass:
      "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "completed",
    label: "Completed",
    dotClass: "bg-blue-500",
    activeClass:
      "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    value: "planning",
    label: "Plan to Watch",
    dotClass: "bg-sky-500",
    activeClass:
      "border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    value: "paused",
    label: "Paused",
    dotClass: "bg-amber-500",
    activeClass:
      "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    value: "dropped",
    label: "Dropped",
    dotClass: "bg-rose-500",
    activeClass:
      "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
]

export function SaveDialog({ anime, open, onOpenChange }: SaveDialogProps) {
  const { isSignedIn } = useUser()

  const { data: existingEntry, isLoading: isEntryLoading } =
    useQuery<AnimeEntry | null>({
      queryKey: ["entry", anime?.id],
      queryFn: async () => {
        if (!anime?.id || !isSignedIn) return null
        const res = await fetch(`/api/entries/${anime.id}`)
        if (!res.ok) return null
        const json: { data?: AnimeEntry } = await res.json()
        return json.data || null
      },
      enabled: !!anime?.id && isSignedIn && open,
    })

  if (!anime) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Track {anime.title} in Library</DialogTitle>
          <DialogDescription>
            Update watching status, score, and notes
          </DialogDescription>
        </DialogHeader>

        {!isSignedIn ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bookmark className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-foreground">
                Sign in to track anime
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Log in to Yozora to save your watchlist, record episode
                progress, and rate titles.
              </p>
            </div>
            <SignInButton mode="modal">
              <div className="interactive-press">
                <Button>Sign In</Button>
              </div>
            </SignInButton>
          </div>
        ) : isEntryLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <SaveForm
            key={existingEntry?.id || anime.id}
            anime={anime}
            existingEntry={existingEntry || null}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SaveHeaderCard({
  anime,
  favorite,
  onToggleFavorite,
}: {
  anime: Anime
  favorite: boolean
  onToggleFavorite: () => void
}) {
  const maxEpisodes = anime.episodes || 0

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
      <div className="flex min-w-0 items-center gap-3.5">
        <img
          src={anime.coverMedium || anime.cover || ""}
          alt={anime.title}
          className="h-18 w-13 shrink-0 rounded-xl border border-border/40 object-cover shadow-md"
        />
        <div className="flex min-w-0 flex-col">
          <h3 className="line-clamp-2 text-base leading-tight font-bold text-foreground">
            {anime.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">
              {anime.format || "Anime"}
            </span>
            {anime.year ? <span>· {anime.year}</span> : null}
            {maxEpisodes > 0 ? <span>· {maxEpisodes} eps</span> : null}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant={favorite ? "rose" : "ghost"}
        size="sm"
        onClick={onToggleFavorite}
      >
        <Heart
          className={cn(
            "size-4 transition-transform",
            favorite && "scale-110 fill-rose-500"
          )}
        />
        <span className="hidden text-xs sm:inline">Favorite</span>
      </Button>
    </div>
  )
}

function SaveDeleteConfirm({
  onCancel,
  onConfirm,
  isPending,
}: {
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
      <div className="flex items-center gap-3 text-destructive">
        <Trash2 className="size-5 shrink-0" />
        <div>
          <p className="text-sm font-bold">Remove from library?</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your progress, rating, and notes for this anime will be deleted.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-destructive/15 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Keep in Library
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          Yes, Remove
        </Button>
      </div>
    </div>
  )
}

function SaveStatusSelector({
  status,
  onChange,
}: {
  status: LibraryStatus
  onChange: (status: LibraryStatus) => void
}) {
  return (
    <Field>
      <FieldLabel variant="subtle">Watch Status</FieldLabel>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {statusOptions.map((opt) => {
          const isSelected = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-start text-xs font-semibold transition-colors select-none",
                isSelected
                  ? cn("shadow-xs ring-1 ring-primary/30", opt.activeClass)
                  : "border-input bg-card/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              )}
            >
              <span
                className={cn("size-2 shrink-0 rounded-full", opt.dotClass)}
              />
              <span className="flex-1 truncate">{opt.label}</span>
              {isSelected ? (
                <Check className="size-3.5 shrink-0 opacity-80" />
              ) : null}
            </button>
          )
        })}
      </div>
    </Field>
  )
}

function SaveEpisodeStepper({
  progress,
  maxEpisodes,
  error,
  onChange,
}: {
  progress: number
  maxEpisodes: number
  error?: string
  onChange: (value: number) => void
}) {
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="progress" variant="subtle">
          Episode Progress
        </FieldLabel>
        {maxEpisodes > 0 ? (
          <button
            type="button"
            onClick={() => onChange(maxEpisodes)}
            className="cursor-pointer text-xs font-semibold text-primary hover:underline"
          >
            Set to Max ({maxEpisodes})
          </button>
        ) : null}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(Math.max(0, progress - 1))}
          disabled={progress <= 0}
        >
          <Minus className="size-4" />
        </Button>

        <div className="relative flex-1">
          <Input
            id="progress"
            type="number"
            min="0"
            max={maxEpisodes || 9999}
            value={progress}
            onChange={(e) => onChange(Number(e.target.value))}
            className="text-center"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(progress + 1)}
          disabled={maxEpisodes > 0 && progress >= maxEpisodes}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

function SaveRatingInput({
  score,
  error,
  onChange,
}: {
  score: number | ""
  error?: string
  onChange: (value: number | "") => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor="score" variant="subtle">
        Rating Score (0–10)
      </FieldLabel>
      <div className="relative mt-1.5">
        <Star className="pointer-events-none absolute top-2.5 left-3 size-4 fill-amber-500/30 text-amber-500" />
        <Input
          id="score"
          type="number"
          step="0.1"
          min="0"
          max="10"
          placeholder="e.g. 8.5"
          value={score}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          size="icon"
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

function SaveForm({
  anime,
  existingEntry,
  onClose,
}: {
  anime: Anime
  existingEntry: AnimeEntry | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  )

  const [form, setForm] = React.useState<FormState>(() => ({
    status: existingEntry?.status ?? "planning",
    progress: existingEntry?.progress || 0,
    score: existingEntry?.score ? existingEntry.score / 10 : "",
    notes: existingEntry?.notes || "",
    favorite: existingEntry?.favorite || false,
  }))

  const maxEpisodes = anime.episodes || 0

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (form.progress < 0) {
      errors.progress = "Progress cannot be negative"
    } else if (maxEpisodes > 0 && form.progress > maxEpisodes) {
      errors.progress = `Progress cannot exceed ${maxEpisodes} episodes`
    }

    if (
      form.score !== "" &&
      (Number(form.score) < 0 || Number(form.score) > 10)
    ) {
      errors.score = "Rating must be between 0 and 10"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anilistId: anime.id,
          status: form.status,
          progress: Number(form.progress) || 0,
          totalEpisodes: anime.episodes || null,
          score: form.score !== "" ? Math.round(Number(form.score) * 10) : null,
          notes: form.notes.trim() || null,
          favorite: form.favorite,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const json: { data?: AnimeEntry } = await res.json()
      return json
    },
    onSuccess: () => {
      toast.success(existingEntry ? "Library Updated" : "Added to Library", {
        description: `"${anime.title}" has been saved to your ${form.status} list.`,
      })
      queryClient.invalidateQueries({ queryKey: ["entry", anime.id] })
      queryClient.invalidateQueries({ queryKey: ["my-entries"] })
      onClose()
    },
    onError: () => {
      toast.error("Failed to Save", {
        description: `Could not save "${anime.title}" to your library. Please try again.`,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/entries/${anime.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      const json: { success?: boolean } = await res.json()
      return json
    },
    onSuccess: () => {
      toast.success("Removed from Library", {
        description: `"${anime.title}" was removed from your watchlist.`,
      })
      queryClient.invalidateQueries({ queryKey: ["entry", anime.id] })
      queryClient.invalidateQueries({ queryKey: ["my-entries"] })
      onClose()
    },
    onError: () => {
      toast.error("Failed to Remove", {
        description: `Could not remove "${anime.title}" from your library.`,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    saveMutation.mutate()
  }

  const handleProgressChange = (newProgress: number) => {
    const clamped =
      maxEpisodes > 0
        ? Math.min(maxEpisodes, Math.max(0, newProgress))
        : Math.max(0, newProgress)
    setForm((prev) => ({
      ...prev,
      progress: clamped,
      status:
        maxEpisodes > 0 && clamped === maxEpisodes ? "completed" : prev.status,
    }))
    if (fieldErrors.progress)
      setFieldErrors((prev) => ({ ...prev, progress: "" }))
  }

  return (
    <div className="flex flex-col gap-6">
      <SaveHeaderCard
        anime={anime}
        favorite={form.favorite}
        onToggleFavorite={() =>
          setForm((prev) => ({ ...prev, favorite: !prev.favorite }))
        }
      />

      {showDeleteConfirm ? (
        <SaveDeleteConfirm
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => deleteMutation.mutate()}
          isPending={deleteMutation.isPending}
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <FieldGroup>
            <SaveStatusSelector
              status={form.status}
              onChange={(status) => setForm((prev) => ({ ...prev, status }))}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SaveEpisodeStepper
                progress={form.progress}
                maxEpisodes={maxEpisodes}
                error={fieldErrors.progress}
                onChange={handleProgressChange}
              />

              <SaveRatingInput
                score={form.score}
                error={fieldErrors.score}
                onChange={(score) => {
                  setForm((prev) => ({ ...prev, score }))
                  if (fieldErrors.score)
                    setFieldErrors((prev) => ({ ...prev, score: "" }))
                }}
              />
            </div>

            <Field>
              <FieldLabel htmlFor="notes" variant="subtle">
                Personal Notes & Thoughts
              </FieldLabel>
              <Textarea
                id="notes"
                placeholder="Favorite scenes, soundtrack notes, thoughts..."
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={2}
                className="mt-1.5 resize-none"
              />
            </Field>
          </FieldGroup>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            {existingEntry ? (
              <Button
                type="button"
                variant="destructive-outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saveMutation.isPending}>
                {saveMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                {existingEntry ? "Save Changes" : "Add to Library"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
