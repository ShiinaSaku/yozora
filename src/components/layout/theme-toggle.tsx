import * as React from "react"
import type { Theme } from "@/components/theme-provider"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  segmentedControlItemVariants,
  segmentedControlRootClassName,
} from "@/lib/segmented-control"
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const emptySubscribe = () => () => {}

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

/**
 * Circle-half contrast icon for navbar theme switching.
 */
function ThemeSwitchIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      className={className}
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 3v18" />
      <path d="M12 14l7 -7" />
      <path d="M12 19l8.5 -8.5" />
      <path d="M12 9l4.5 -4.5" />
    </svg>
  )
}

const themeOptions: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

/**
 * 1-click theme switch toggle button with press feedback (no rotation).
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return <div className="size-9 rounded-xl bg-muted/30" />
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark")
    } else if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className="group size-9 cursor-pointer active:scale-95"
      aria-label={`Toggle theme (currently ${theme})`}
      title={`Theme: ${theme}`}
    >
      <ThemeSwitchIcon
        className={`size-4 overflow-visible transition-colors duration-200 ${
          isDark ? "text-primary" : "text-amber-500"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

const itemClassName = segmentedControlItemVariants({
  size: "sm",
  state: "checked",
})

/**
 * Segmented 3-way theme selector (Light / Dark / System) using @coss/segmented-control.
 */
export function ThemeSegmentedToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return <div className="h-7.5 w-44 animate-pulse rounded-lg bg-muted/40" />
  }

  return (
    <RadioGroupPrimitive
      id="theme-mode-segmented-group"
      aria-label="Theme Mode"
      value={theme}
      onValueChange={setTheme}
      className={segmentedControlRootClassName}
    >
      {themeOptions.map(({ value, label }) => (
        <RadioPrimitive.Root
          key={value}
          id={`theme-mode-${value}`}
          value={value}
          className={cn(itemClassName, "px-3 py-1 font-semibold")}
          title={label}
        >
          <span>{label}</span>
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  )
}
