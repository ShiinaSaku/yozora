import * as React from "react"
import { ScriptOnce } from "@tanstack/react-router"

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

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey)
  const fallback = JSON.stringify(defaultTheme)

  return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`
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
 * Native TanStack Start theme provider.
 * Uses `ScriptOnce` to inject a blocking pre-hydration script, preventing flash of unstyled content (FOUC).
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark",
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

  return (
    <ThemeProviderContext value={value}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeProviderContext>
  )
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
