import * as React from "react"
import { Link as RouterLink } from "@tanstack/react-router"
import type { LinkProps as TanStackLinkProps } from "@tanstack/react-router"

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
} & Partial<Omit<TanStackLinkProps, "to" | "href">>

/** A compatibility link that routes same-origin paths through TanStack Router. */
export function Link({ href, children, className, ...props }: LinkProps) {
  if (href.startsWith("/")) {
    return (
      <RouterLink
        to={href as TanStackLinkProps["to"]}
        className={className}
        {...props}
      >
        {children}
      </RouterLink>
    )
  }

  return (
    <a {...props} href={href} className={className}>
      {children}
    </a>
  )
}

export default Link
