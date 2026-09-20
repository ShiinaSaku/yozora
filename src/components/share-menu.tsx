import * as React from "react"
import { EllipsisIcon, LinkIcon, Share2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface ShareMenuProps {
  /** Title passed to the native share sheet. */
  title: string
  /** URL to share. Relative URLs are resolved against the current origin. */
  url: string
  /** Optional descriptive text passed to the native share sheet / tweet. */
  text?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" | "xs"
  showLabel?: boolean
  label?: string
  align?: "start" | "end" | "center"
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

type IconProps = React.ComponentProps<"svg">

function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        d="m22.991 23-8.533-12.612L22.42 1h-2.77l-6.422 7.575L8.105 1H1.123l8.225 12.158L1 23h2.77l6.81-8.03L16.015 23H23zM7.193 2.769l12.49 18.462h-2.76L4.43 2.769z"
        fill="currentColor"
      />
    </svg>
  )
}

function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        d="M22.274 0H1.728C.692 0 0 .685 0 1.715v20.569C0 23.316.864 24 1.727 24h20.546C23.31 24 24 23.315 24 22.285V1.716C24.001.684 23.31 0 22.274 0M7.08 20.4H3.454V8.915h3.625zM5.352 7.371c-1.209 0-2.07-.856-2.07-2.056s.863-2.059 2.07-2.059c1.21 0 2.073.859 2.073 2.059S6.388 7.37 5.352 7.37M20.548 20.4h-3.626v-5.485c0-1.371 0-3.087-1.9-3.087-1.898 0-2.073 1.372-2.073 2.916V20.4H9.325V8.915h3.454v1.541c.69-1.2 2.073-1.885 3.453-1.885 3.627 0 4.316 2.4 4.316 5.485z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ShareMenu({
  title,
  url,
  text,
  className,
  variant = "outline",
  size = "default",
  showLabel = false,
  label = "Share",
  align = "end",
}: ShareMenuProps) {
  const absoluteUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
      ? new URL(url, window.location.origin).toString()
      : url

  const shareText = text || `Check out ${title} on Yozora`
  const urlEncoded = encodeURIComponent(absoluteUrl)
  const isWebShareAvailable =
    typeof navigator !== "undefined" && "share" in navigator

  const sizeClasses = showLabel
    ? size === "lg"
      ? "h-11 px-4 text-sm font-semibold rounded-xl sm:h-12 sm:px-5 gap-2"
      : size === "sm"
        ? "h-8 px-2.5 text-xs font-medium rounded-lg sm:h-7.5 gap-1.5"
        : size === "xs"
          ? "h-7 px-2 text-xs font-medium rounded-md sm:h-6 gap-1"
          : "h-9 px-3 text-sm font-medium rounded-xl sm:h-8 gap-2"
    : size === "lg"
      ? "size-11 rounded-xl sm:size-12 p-0 aspect-square shrink-0"
      : size === "sm"
        ? "size-8 rounded-lg sm:size-7.5 p-0 aspect-square shrink-0"
        : size === "xs"
          ? "size-7 rounded-md sm:size-6 p-0 aspect-square shrink-0"
          : size === "icon-sm"
            ? "size-8 rounded-lg sm:size-7 p-0 aspect-square shrink-0"
            : size === "icon-lg"
              ? "size-10 rounded-xl sm:size-9 p-0 aspect-square shrink-0"
              : "size-9 rounded-xl sm:size-8 p-0 aspect-square shrink-0"

  const outlineStyles =
    variant === "outline"
      ? "border border-border/80 hover:border-border bg-card/85 hover:bg-card text-foreground shadow-xs hover:shadow-sm before:hidden backdrop-blur-md"
      : ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={variant}
            aria-label={label}
            className={cn(
              "interactive-press transition-all select-none",
              outlineStyles,
              sizeClasses,
              className
            )}
          />
        }
      >
        <Share2Icon className="size-4 shrink-0 opacity-85" />
        {showLabel && <span>{label}</span>}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-48 rounded-2xl border border-border/70 p-1 shadow-2xl backdrop-blur-md"
        align={align}
        alignOffset={0}
        sideOffset={6}
      >
        <DropdownMenuItem
          onClick={() => {
            void copyText(absoluteUrl).then((copied) => {
              if (copied) {
                toast.success("Link copied", {
                  description: "Share URL copied to clipboard.",
                })
              } else {
                toast.error("Could not copy link")
              }
            })
          }}
        >
          <LinkIcon className="size-4" />
          <span>Copy link</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          render={
            <a
              href={`https://x.com/intent/tweet?url=${urlEncoded}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <XIcon className="size-4" />
              <span>Share on X</span>
            </a>
          }
        />

        <DropdownMenuItem
          render={
            <a
              href={`https://www.linkedin.com/sharing/share-offsite?url=${urlEncoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <LinkedInIcon className="size-4" />
              <span>Share on LinkedIn</span>
            </a>
          }
        />

        {isWebShareAvailable && (
          <DropdownMenuItem
            closeOnClick={false}
            onClick={() => {
              void navigator
                .share({ title, text: shareText, url: absoluteUrl })
                .catch(() => {})
            }}
          >
            <EllipsisIcon className="size-4" />
            <span>Other app</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
