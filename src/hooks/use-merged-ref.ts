import * as React from "react"

/**
 * Merges several refs (callback or object) into one stable ref callback.
 * Every setter runs, in order, and each may return its own cleanup.
 */
export function useMergedRef<T>(
  ...refs: Array<React.Ref<T> | undefined | null>
): (node: T | null) => () => void {
  return React.useCallback(
    (node: T | null) => {
      const cleanups: Array<() => void> = []
      for (const ref of refs) {
        if (!ref) continue
        if (typeof ref === "function") {
          const cleanup = ref(node)
          if (typeof cleanup === "function") cleanups.push(cleanup)
        } else {
          ref.current = node
          cleanups.push(() => {
            ref.current = null
          })
        }
      }
      return () => {
        for (const cleanup of cleanups) cleanup()
      }
    },
    [refs]
  )
}
