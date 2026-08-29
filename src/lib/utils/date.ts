import * as React from "react"

const tzFormatter =
  typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
    ? new Intl.DateTimeFormat()
    : null

/**
 * Gets the user's local IANA timezone name (e.g. 'America/New_York', 'Asia/Tokyo', 'UTC').
 */
function getUserTimeZone(): string {
  try {
    return tzFormatter?.resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

const timeFormatter =
  typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
    ? new Intl.DateTimeFormat(undefined, { timeStyle: "short" })
    : null

const weekdayFormatter =
  typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
    ? new Intl.DateTimeFormat(undefined, { weekday: "short" })
    : null

const monthDayFormatter =
  typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
    ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })
    : null

/**
 * Formats a future airing timestamp into a human-friendly local string:
 * - 'Today at 8:30 PM'
 * - 'Tomorrow at 1:15 AM'
 * - 'Sunday at 7:00 PM' (within 7 days)
 * - 'Sep 12 at 8:00 PM'
 */
export function formatAiringSchedule(epochSeconds: number): string {
  if (!epochSeconds) {
    return ""
  }
  const targetDate = new Date(epochSeconds * 1000)
  const now = new Date()

  const isToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear()

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow =
    targetDate.getDate() === tomorrow.getDate() &&
    targetDate.getMonth() === tomorrow.getMonth() &&
    targetDate.getFullYear() === tomorrow.getFullYear()

  const timeString =
    timeFormatter?.format(targetDate) || targetDate.toLocaleTimeString()

  if (isToday) {
    return `Today at ${timeString}`
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeString}`
  }

  const diffDays = Math.round(
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffDays >= 0 && diffDays < 7) {
    const weekday =
      weekdayFormatter?.format(targetDate) ||
      targetDate.toLocaleString(undefined, { weekday: "short" })
    return `${weekday} at ${timeString}`
  }

  const dateString =
    monthDayFormatter?.format(targetDate) ||
    targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  return `${dateString} at ${timeString}`
}

/**
 * Formats seconds remaining into clean countdown format:
 * - '2d 14h left'
 * - '3h 45m left'
 * - '18m left'
 */
export function formatCountdownRemaining(secondsRemaining: number): string {
  if (secondsRemaining <= 0) {
    return "Aired"
  }
  const days = Math.floor(secondsRemaining / 86400)
  const hours = Math.floor((secondsRemaining % 86400) / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h left`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`
  }
  return `${Math.max(1, minutes)}m left`
}

const emptySubscribe = () => () => {}

/**
 * React hook that guarantees safe hydration without client/server timezone mismatches.
 */
export function useUserTimezone() {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const timeZone = React.useSyncExternalStore(
    emptySubscribe,
    getUserTimeZone,
    () => "UTC"
  )

  return {
    timeZone,
    isClient,
  }
}
