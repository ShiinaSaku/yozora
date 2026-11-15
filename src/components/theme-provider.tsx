import * as React from "react"

// The blocking pre-hydration theme script is rendered by the Astro layout
// (`is:inline` in BaseLayout.astro) so it also runs on fully prerendered
// pages without any island hydration.

export type Theme = "dark" | "light" | "system"

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export interface ThemeProviderState {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function applyTheme(theme: Theme): "dark" | "light" {
  const root = document.documentElement
  root.classList.remove("light", "dark")

  const resolved: "dark" | "light" =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  root.classList.add(resolved)
  root.style.colorScheme = resolved
  return resolved
}

/**
 * React theme provider for Astro islands.
 * Uses `ScriptOnce` to inject a blocking pre-hydration script, preventing flash of unstyled content (FOUC).
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">(
    "dark"
  )

  React.useEffect(() => {
    const resolved = applyTheme(theme)
    setResolvedTheme(resolved)

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setResolvedTheme(isDark ? "dark" : "light")
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [theme])

  React.useEffect(() => {
    if (theme !== "system") {
      return
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const resolved = applyTheme("system")
      setResolvedTheme(resolved)
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  const handleSetTheme = React.useCallback(
    (next: Theme) => {
      localStorage.setItem(storageKey, next)
      setTheme(next)
    },
    [storageKey]
  )

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: handleSetTheme,
    }),
    [theme, resolvedTheme, handleSetTheme]
  )

  return <ThemeProviderContext value={value}>{children}</ThemeProviderContext>
}

/**
 * Hook to access current theme state and mutate color theme.
 */
export function useTheme() {
  const context = React.use(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
