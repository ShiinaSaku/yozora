import * as React from "react"

/**
 * Global error boundary page displayed when an unhandled runtime error occurs.
 */
export function ErrorPage({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[ErrorPage]", error)
  }, [error])

  return (
    <div
      id="global-error-page-container"
      className="container mx-auto flex min-h-120 max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-3xl font-black">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "Please try again."}
      </p>
      <button
        id="error-reset-btn"
        type="button"
        onClick={reset}
        className="interactive-press cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Try again
      </button>
    </div>
  )
}
