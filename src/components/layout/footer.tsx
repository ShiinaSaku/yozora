import { usePathname } from "@/lib/navigation"
import Link from "@/components/ui/link"
import {
  DiscordIcon,
  GithubIcon,
  XTwitterIcon,
  YouTubeIcon,
} from "@/components/icons/platform-icons"
import { BrandLogo } from "./brand-logo"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

const HIDDEN_FOOTER_ROUTES = ["/sign-in", "/sign-up", "/settings"]

function DiscoverColumn() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Discover</h3>
      <ul className="mt-4 grid gap-3 text-sm/relaxed text-muted-foreground">
        <li>
          <Link href="/" variant="underline">
            Trending Lineup
          </Link>
        </li>
        <li>
          <Link href="/seasonal" variant="underline">
            Seasonal Releases
          </Link>
        </li>
        <li>
          <Link href="/airing" variant="underline">
            Airing Countdown
          </Link>
        </li>
        <li>
          <Link href="/search?sort=SCORE_DESC" variant="underline">
            Top Rated All-Time
          </Link>
        </li>
      </ul>
    </div>
  )
}

function SoundtracksColumn() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Soundtracks</h3>
      <ul className="mt-4 grid gap-3 text-sm/relaxed text-muted-foreground">
        <li>
          <Link href="/about" variant="underline">
            Opening Themes (OP)
          </Link>
        </li>
        <li>
          <Link href="/about" variant="underline">
            Ending Themes (ED)
          </Link>
        </li>
        <li>
          <Link
            href="https://animethemes.moe"
            target="_blank"
            rel="noopener noreferrer"
            variant="underline"
          >
            AnimeThemes Vault
          </Link>
        </li>
        <li>
          <Link href="/about" variant="underline">
            Audio Deck
          </Link>
        </li>
      </ul>
    </div>
  )
}

function LibraryColumn() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Library</h3>
      <ul className="mt-4 grid gap-3 text-sm/relaxed text-muted-foreground">
        <li>
          <Link href="/library" variant="underline">
            My Watchlist
          </Link>
        </li>
        <li>
          <Link href="/library" variant="underline">
            Episode Progress
          </Link>
        </li>
        <li>
          <Link href="/library" variant="underline">
            Custom Shelves
          </Link>
        </li>
        <li>
          <Link href="/settings/profile" variant="underline">
            Profile Settings
          </Link>
        </li>
      </ul>
    </div>
  )
}

function CommunityColumn() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Community</h3>
      <ul className="mt-4 grid gap-3 text-sm/relaxed text-muted-foreground">
        <li>
          <a
            href="https://github.com/shiinasaku/yozora"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 transition-colors hover:text-foreground hover:underline"
          >
            <GithubIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span>GitHub</span>
          </a>
        </li>
        <li>
          <a
            href="https://discord.gg/qfdEPJ5hNR"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 transition-colors hover:text-foreground hover:underline"
          >
            <DiscordIcon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-discord" />
            <span>Discord</span>
          </a>
        </li>
        <li>
          <a
            href="https://x.com/yozoramoe"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 transition-colors hover:text-foreground hover:underline"
          >
            <XTwitterIcon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span>X (Twitter)</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.youtube.com/@SakuShiina"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 transition-colors hover:text-foreground hover:underline"
          >
            <YouTubeIcon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-youtube" />
            <span>YouTube</span>
          </a>
        </li>
      </ul>
    </div>
  )
}

export function FooterSitemap({ className }: { className?: string }) {
  return (
    <div className={cn("w-full border-t border-border/40", className)}>
      <div className="flex gap-6 p-6 md:hidden">
        <div className="flex flex-1 flex-col gap-10">
          <DiscoverColumn />
          <LibraryColumn />
        </div>
        <div className="flex flex-1 flex-col gap-10">
          <SoundtracksColumn />
          <CommunityColumn />
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-7xl grid-cols-4 justify-between md:grid">
        <div className="border-x border-border/40 px-6 py-10">
          <DiscoverColumn />
        </div>
        <div className="border-r border-border/40 px-6 py-10">
          <SoundtracksColumn />
        </div>
        <div className="border-r border-border/40 px-6 py-10">
          <LibraryColumn />
        </div>
        <div className="border-r border-border/40 px-6 py-10">
          <CommunityColumn />
        </div>
      </div>
    </div>
  )
}

export function FooterMeta({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear()

  return (
    <div
      className={cn(
        "border-t border-border/40 px-6 py-8 pb-24 md:pb-8",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex items-center gap-3">
          <span className="interactive-press">
            <Link href="/" aria-label="Yozora Home">
              <BrandLogo className="size-6 transition-transform hover:scale-105" />
            </Link>
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>Copyright © {currentYear} Yozora. All rights reserved.</span>
          <span className="hidden sm:inline">&middot;</span>
          <Link href="/privacy" variant="underline">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline">&middot;</span>
          <Link href="/privacy" variant="underline">
            Terms of Service
          </Link>
          <span className="hidden sm:inline">&middot;</span>
          <Link href="/about" variant="underline">
            About
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Footer() {
  const pathname = usePathname()

  // Hide footer on focused flows (authentication and account settings)
  if (HIDDEN_FOOTER_ROUTES.some((route) => pathname.startsWith(route))) {
    return null
  }

  return (
    <footer className="relative mt-20 w-full shrink-0 bg-card/25 text-sm/loose text-foreground backdrop-blur-sm">
      <FooterSitemap />
      <FooterMeta />
    </footer>
  )
}
