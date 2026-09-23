import Link from "@/components/ui/link"

/**
 * Global 404 fallback page displayed when a route or resource is not found.
 */
export function NotFound() {
  return (
    <div
      id="not-found-page-container"
      className="container mx-auto flex min-h-120 max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-3xl font-black">Page Not Found</h1>
      <p className="text-sm text-muted-foreground">
        The page you requested does not exist or has moved.
      </p>
      <Link id="not-found-home-link" href="/" variant="button">
        Back to Yozora
      </Link>
    </div>
  )
}
