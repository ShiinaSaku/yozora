import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { Anime } from "@/lib/types/anime"

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = React.useState(initialQuery)
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [status, setStatus] = React.useState("")
  const cache = React.useRef(new Map<string, string[]>())

  React.useEffect(() => {
    const search = query.trim()
    if (search.length < 3 || search === initialQuery) {
      setSuggestions([])
      setStatus("")
      return
    }

    const cached = cache.current.get(search)
    if (cached) {
      setSuggestions(cached)
      setStatus(cached.length ? `${cached.length} suggestions available.` : "")
      return
    }

    const controller = new AbortController()
    let active = true
    setSuggestions([])
    setStatus("")
    const timer = window.setTimeout(async () => {
      setStatus("Loading suggestions.")
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(search)}`,
          {
            signal: controller.signal,
          }
        )
        if (!response.ok) throw new Error("Suggestions unavailable")
        const items = (await response.json()) as Anime[]
        const titles = [...new Set(items.map((item) => item.title))].slice(0, 8)
        if (!active) return
        cache.current.set(search, titles)
        setSuggestions(titles)
        setStatus(
          titles.length ? `${titles.length} suggestions available.` : ""
        )
      } catch {
        if (active) setStatus("")
      }
    }, 400)

    return () => {
      active = false
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, initialQuery])

  return (
    <form
      action="/search"
      method="get"
      role="search"
      className="w-full max-w-2xl"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="anime-search" className="sr-only">
            Search anime by title
          </FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row">
            <InputGroup className="h-12 flex-1 sm:h-14">
              <InputGroupInput
                id="anime-search"
                name="q"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                autoComplete="off"
                list="anime-search-suggestions"
                aria-describedby="anime-search-help"
                placeholder="Search by anime title"
              />
              <InputGroupAddon>
                <HugeiconsIcon
                  icon={Search01Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </InputGroupAddon>
            </InputGroup>
            <Button type="submit" size="hero">
              Search anime
            </Button>
          </div>
          <datalist id="anime-search-suggestions">
            {suggestions.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
          <FieldDescription id="anime-search-help">
            Search in English, romaji, or Japanese.
          </FieldDescription>
          <span className="sr-only" role="status">
            {status}
          </span>
        </Field>
      </FieldGroup>
    </form>
  )
}
