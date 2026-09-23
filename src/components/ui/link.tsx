import * as React from "react"
import { Link as RouterLink } from "@tanstack/react-router"
import type { LinkProps as TanStackLinkProps } from "@tanstack/react-router"

import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const linkVariants = cva("", {
  variants: {
    variant: {
      default: "",
      underline: "transition-colors hover:text-foreground hover:underline",
      muted: "text-muted-foreground transition-colors hover:text-foreground",
      primary: "gap-1 text-xs font-semibold text-primary hover:underline",
      title:
        "rounded-lg transition-colors hover:text-white/90 focus-visible:outline-2 focus-visible:outline-ring",
      pill: "inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-all duration-150 hover:border-border/80 hover:bg-muted hover:text-foreground",
      "pill-primary":
        "rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
      button:
        "interactive-press inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90",
      "button-outline":
        "interactive-press inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/80 px-4 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted/60",
      "button-white":
        "interactive-press inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-bold whitespace-nowrap text-zinc-950 shadow-xl transition-transform hover:bg-zinc-200 sm:px-6 sm:text-sm",
      card: "gap-4 rounded-3xl border border-border/40 bg-card p-4 shadow-xs transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-md",
      "card-sm":
        "gap-3.5 rounded-2xl border border-border/40 bg-card p-3 transition-all duration-150 hover:border-border hover:bg-muted/50",
      "card-character":
        "rounded-xl border border-border/40 bg-card p-2.5 transition-all hover:bg-muted/40",
      "nav-item":
        "group flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted/70",
      "nav-link":
        "inline-flex h-10 items-center justify-start gap-3 rounded-xl px-3 font-semibold text-muted-foreground transition-colors hover:text-foreground",
      "nav-link-active":
        "inline-flex h-10 items-center justify-start gap-3 rounded-xl bg-secondary px-3 font-semibold text-secondary-foreground shadow-xs",
      "nav-icon":
        "flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-muted-foreground transition-colors hover:text-foreground",
      brand:
        "group flex shrink-0 items-center gap-2.5 sm:gap-3",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
} & Partial<Omit<TanStackLinkProps, "to" | "href">> &
  VariantProps<typeof linkVariants>

/** A compatibility link that routes same-origin paths through TanStack Router. */
export function Link({
  href,
  children,
  className,
  variant,
  ...props
}: LinkProps) {
  const finalClass = cn(linkVariants({ variant }), className)
  if (href.startsWith("/")) {
    return (
      <RouterLink
        to={href as TanStackLinkProps["to"]}
        className={finalClass}
        {...props}
      >
        {children}
      </RouterLink>
    )
  }

  return (
    <a {...props} href={href} className={finalClass}>
      {children}
    </a>
  )
}

export default Link
