import * as React from "react"

export function useThemeHotkey() {
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
        const isDark = document.documentElement.classList.contains("dark")
        document.documentElement.classList[isDark ? "remove" : "add"]("dark")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}

export function ThemeHotkey() {
  useThemeHotkey()
  return null
}

export default ThemeHotkey
