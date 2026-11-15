import * as React from "react"
import type { Clerk } from "@clerk/shared/types"
import { $authStore, $clerkStore, $isLoadedStore } from "@clerk/astro/client"

// @clerk/astro/react exports control components and `useAuth`, but not
// `useUser` / `useClerk`. Islands that need the full user resource or the
// Clerk instance subscribe to the same nanostores the SDK exposes.

type ClerkUser = NonNullable<ReturnType<typeof $authStore.get>["user"]>

const EMPTY_AUTH = { userId: null, user: null } as ReturnType<
  typeof $authStore.get
>

function useStoreValue<T>(
  store: {
    get: () => T
    listen: (listener: (value: T) => void) => () => void
  },
  serverSnapshot: T
): T {
  const get = store.get.bind(store)
  // The server snapshot must equal the client's FIRST render (clerk-js not
  // yet loaded). Otherwise React hydration sees a different tree — e.g. the
  // navbar SSRs as signed-in but hydrates as signed-out and React rebuilds
  // the whole island.
  return React.useSyncExternalStore(store.listen, get, () => serverSnapshot)
}

/**
 * Current signed-in Clerk user (null when signed out or not yet loaded).
 */
export function useUser(): {
  user: ClerkUser | null
  isSignedIn: boolean
  isLoaded: boolean
} {
  const auth = useStoreValue($authStore, EMPTY_AUTH)
  const isLoaded = useStoreValue($isLoadedStore, false)
  return {
    user: auth.user ?? null,
    isSignedIn: Boolean(auth.userId),
    isLoaded,
  }
}

/**
 * The Clerk browser instance (null until clerk-js has loaded).
 */
export function useClerk(): Clerk | null {
  return useStoreValue($clerkStore, null)
}
