import * as React from "react"
import { useTheme } from "@/components/theme-provider"

export function useThemeHotkey() {
  const { setTheme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return
      }

      if (
        (event.key.toLowerCase() === "d" &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey) ||
        (event.key.toLowerCase() === "d" &&
          (event.metaKey || event.ctrlKey) &&
          event.shiftKey)
      ) {
        event.preventDefault()
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setTheme, resolvedTheme])
}

export function ThemeHotkey() {
  useThemeHotkey()
  return null
}
