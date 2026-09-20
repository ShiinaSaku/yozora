import * as React from "react"

export interface ViewportState {
  width: number
  height: number
  dpr: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  is2k: boolean
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  orientation: "portrait" | "landscape"
  isTouch: boolean
}

const defaultViewportState: ViewportState = {
  width: 1280,
  height: 800,
  dpr: 1,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isWide: true,
  is2k: false,
  breakpoint: "xl",
  orientation: "landscape",
  isTouch: false,
}

function getSnapshot(): ViewportState {
  if (typeof window === "undefined") {
    return defaultViewportState
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = window.devicePixelRatio || 1
  const isTouch =
    window.matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0

  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024
  const isDesktop = width >= 1024
  const isWide = width >= 1280
  const is2k = width >= 1536

  let breakpoint: ViewportState["breakpoint"] = "xs"
  if (width >= 1536) breakpoint = "2xl"
  else if (width >= 1280) breakpoint = "xl"
  else if (width >= 1024) breakpoint = "lg"
  else if (width >= 768) breakpoint = "md"
  else if (width >= 640) breakpoint = "sm"

  const orientation = width >= height ? "landscape" : "portrait"

  return {
    width,
    height,
    dpr,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    is2k,
    breakpoint,
    orientation,
    isTouch,
  }
}

let cachedSnapshot = defaultViewportState
let isInitialized = false

function getClientSnapshot(): ViewportState {
  if (typeof window === "undefined") return defaultViewportState
  if (!isInitialized) {
    cachedSnapshot = getSnapshot()
    isInitialized = true
  }
  return cachedSnapshot
}

function getServerSnapshot(): ViewportState {
  return defaultViewportState
}

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  if (typeof window === "undefined") return () => {}

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const handleResize = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      const next = getSnapshot()
      if (
        next.width !== cachedSnapshot.width ||
        next.height !== cachedSnapshot.height ||
        next.dpr !== cachedSnapshot.dpr ||
        next.isTouch !== cachedSnapshot.isTouch
      ) {
        cachedSnapshot = next
        listeners.forEach((listener) => listener())
      }
    }, 50)
  }

  window.addEventListener("resize", handleResize, { passive: true })
  window.addEventListener("orientationchange", handleResize, { passive: true })

  return () => {
    listeners.delete(callback)
    window.removeEventListener("resize", handleResize)
    window.removeEventListener("orientationchange", handleResize)
    if (timeoutId) clearTimeout(timeoutId)
    // Last subscriber gone: the window listeners above are gone too, so force
    // a snapshot refresh on the next mount instead of serving stale dimensions.
    if (listeners.size === 0) {
      isInitialized = false
    }
  }
}

/**
 * High-performance, SSR-safe hook providing pixel-perfect viewport dimensions,
 * responsive breakpoints, and device capabilities with zero hydration mismatch.
 */
export function useViewport(): ViewportState {
  return React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )
}
