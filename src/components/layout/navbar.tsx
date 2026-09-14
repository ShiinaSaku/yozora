import * as React from "react"
import Link from "@/components/ui/link"
import { usePathname } from "@/lib/navigation"
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/tanstack-react-start"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Compass01Icon,
  Layers01Icon,
  RadioIcon,
  Search01Icon,
  UserIcon,
  Video02Icon,
} from "@hugeicons/core-free-icons"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  buttonVariants,
  navigationMenuTriggerStyle,
} from "@/components/ui/button-variants"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SearchDialog } from "./search-dialog"
import { ThemeToggle } from "./theme-toggle"
import { BrandLogo } from "./brand-logo"
import { cn } from "@/lib/utils"

const navLinks = [
  {
    href: "/",
    label: "Explore",
    icon: Compass01Icon,
    description: "Spotlight anime, top community favorites & editors picks",
  },
  {
    href: "/seasonal",
    label: "Seasonal",
    icon: Calendar03Icon,
    description: "Seasonal lineups, release charts & upcoming premieres",
  },
  {
    href: "/airing",
    label: "Airing",
    icon: RadioIcon,
    description: "Live episode countdown timers and airing schedule",
  },
  {
    href: "/library",
    label: "Library",
    icon: Layers01Icon,
    auth: true,
    description: "Personal watchlist tracker, episode progress and ratings",
  },
]

function NavbarMobileSheet({
  open,
  onOpenChange,
  pathname,
  isSignedIn,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
  isSignedIn: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className="interactive-press flex size-9 cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden"
      >
        <Menu data-icon="inline-start" className="size-5" />
        <span className="sr-only">Open navigation menu</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-6 p-6 sm:w-80"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-3">
            <BrandLogo className="size-8" />
            <span className="text-base leading-none font-black tracking-tight text-foreground">
              Yozora
            </span>
          </div>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate through Yozora anime showcase, charts, soundtracks, and
            personal library.
          </SheetDescription>
        </SheetHeader>

        <nav
          aria-label="Sidebar mobile navigation"
          className="flex flex-col gap-2"
        >
          <div className="px-2 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase">
            Discover
          </div>
          {navLinks.map((link) => {
            if (link.auth && !isSignedIn) return null
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "h-10 justify-start gap-3 rounded-xl px-3 font-semibold",
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={link.icon}
                  size={18}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                <span>{link.label}</span>
              </Link>
            )
          })}

          <div className="px-2 pt-3 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase">
            Platform
          </div>
          <Link
            href="/about"
            onClick={() => onOpenChange(false)}
            className={cn(
              buttonVariants({
                variant: pathname === "/about" ? "secondary" : "ghost",
                size: "sm",
              }),
              "h-10 justify-start gap-3 rounded-xl px-3 font-semibold",
              pathname === "/about"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon
              icon={Video02Icon}
              size={18}
              strokeWidth={2}
              data-icon="inline-start"
            />
            <span>About Yozora</span>
          </Link>

          {isSignedIn && (
            <Link
              href="/settings/profile"
              onClick={() => onOpenChange(false)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-10 justify-start gap-3 rounded-xl px-3 font-semibold text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={UserIcon}
                size={18}
                strokeWidth={2}
                data-icon="inline-start"
              />
              <span>Profile Settings</span>
            </Link>
          )}

          {!isSignedIn && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Sign in to track your watchlist, rate anime, and build custom
                collections.
              </p>
              <SignInButton mode="modal">
                <Button size="sm" className="w-full rounded-xl font-semibold">
                  Sign In / Sign Up
                </Button>
              </SignInButton>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function NavbarDesktopMenu({
  isDiscoverActive,
  isSignedIn,
  pathname,
}: {
  isDiscoverActive: boolean
  isSignedIn: boolean
  pathname: string
}) {
  return (
    <nav aria-label="Main navigation" className="hidden items-center md:flex">
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                "h-9 gap-1.5 rounded-xl px-3 text-xs font-semibold sm:text-sm",
                isDiscoverActive
                  ? "bg-secondary/70 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={Compass01Icon}
                size={15}
                strokeWidth={2}
                data-icon="inline-start"
              />
              <span>Discover</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="grid w-105 grid-cols-2 gap-2 rounded-2xl border-border/50 bg-card p-3 shadow-2xl">
              <NavigationMenuLink
                render={<Link href="/" aria-label="Explore Showcase" />}
                className="group flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted/70"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                  <HugeiconsIcon
                    icon={Compass01Icon}
                    size={15}
                    strokeWidth={2}
                    className="text-primary"
                  />
                  <span>Showcase</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Top spotlight anime & editor picks.
                </p>
              </NavigationMenuLink>

              <NavigationMenuLink
                render={
                  <Link href="/seasonal" aria-label="Seasonal Anime Charts" />
                }
                className="group flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted/70"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    size={15}
                    strokeWidth={2}
                    className="text-amber-500"
                  />
                  <span>Seasonal Charts</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Seasonal release schedules.
                </p>
              </NavigationMenuLink>

              <NavigationMenuLink
                render={<Link href="/airing" aria-label="Airing Anime Today" />}
                className="group flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted/70"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                  <HugeiconsIcon
                    icon={RadioIcon}
                    size={15}
                    strokeWidth={2}
                    className="text-rose-500"
                  />
                  <span>Airing Today</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Live episode countdown timers.
                </p>
              </NavigationMenuLink>

              <NavigationMenuLink
                render={
                  <Link
                    href="/about"
                    aria-label="About Yozora Soundtracks & Info"
                  />
                }
                className="group flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-muted/70"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                  <HugeiconsIcon
                    icon={Video02Icon}
                    size={15}
                    strokeWidth={2}
                    className="text-sky-500"
                  />
                  <span>Soundtracks & Info</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  OP/ED themes and anime OSTs.
                </p>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {isSignedIn && (
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link href="/library" aria-label="My Library & Watchlist" />
                }
                className={cn(
                  navigationMenuTriggerStyle(),
                  "h-9 cursor-pointer gap-2 rounded-xl px-3 text-xs font-semibold sm:text-sm",
                  pathname === "/library"
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={Layers01Icon}
                  size={15}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                <span>Library</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  )
}

function NavbarAuthControls({
  isSignedIn,
  userProfileUrl,
}: {
  isSignedIn: boolean
  userProfileUrl: string
}) {
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={userProfileUrl}
          className="hidden items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-all duration-150 hover:border-border/80 hover:bg-muted hover:text-foreground sm:inline-flex"
          aria-label="My Profile"
          title="My Profile"
        >
          <HugeiconsIcon
            icon={UserIcon}
            size={14}
            strokeWidth={2.2}
            className="text-primary"
          />
          <span>My Profile</span>
        </Link>
        <UserButton
          userProfileMode="navigation"
          userProfileUrl="/settings/profile?tab=account"
          appearance={{
            elements: {
              userButtonAvatarBox: "size-8 rounded-xl",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="My Profile"
              href={userProfileUrl}
              labelIcon={
                <HugeiconsIcon icon={UserIcon} size={15} strokeWidth={2} />
              }
            />
            <UserButton.Link
              label="Settings & Profile"
              href="/settings/profile"
              labelIcon={
                <HugeiconsIcon icon={UserIcon} size={15} strokeWidth={2} />
              }
            />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <SignInButton mode="modal">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign in"
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground sm:hidden"
        >
          <HugeiconsIcon icon={UserIcon} size={17} strokeWidth={2} />
        </Button>
      </SignInButton>
      <SignInButton mode="modal">
        <Button
          variant="ghost"
          size="sm"
          className="hidden rounded-xl px-2.5 text-xs sm:inline-flex sm:px-3 sm:text-sm"
        >
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button
          size="sm"
          className="hidden rounded-xl px-3 text-xs font-semibold sm:inline-flex sm:px-4 sm:text-sm"
        >
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  )
}

function NavbarMobileBottomBar({
  isVisible,
  pathname,
  isSignedIn,
  onOpenSearch,
}: {
  isVisible: boolean
  pathname: string
  isSignedIn: boolean
  onOpenSearch: () => void
}) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "pb-safe fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/40 bg-background/80 px-2 py-1 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform md:hidden",
        !isVisible && "translate-y-full"
      )}
    >
      {navLinks.map((link) => {
        if (link.auth && !isSignedIn) return null
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className="interactive-press flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 transition-colors"
          >
            <div
              className={`flex size-7 items-center justify-center rounded-lg ${isActive ? "text-primary" : ""}`}
            >
              <HugeiconsIcon
                icon={link.icon}
                size={19}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-primary" : ""}
              />
            </div>
            <span
              className={cn(
                "mt-0.5 text-[10px] leading-none",
                isActive ? "font-bold text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </span>
          </Link>
        )
      })}

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search anime"
        className="interactive-press flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-0.5 py-1 text-muted-foreground hover:text-foreground"
      >
        <div className="flex size-7 items-center justify-center rounded-lg">
          <HugeiconsIcon icon={Search01Icon} size={19} strokeWidth={2} />
        </div>
        <span className="mt-0.5 text-[10px] leading-none">Search</span>
      </button>

      {isSignedIn && (
        <Link
          href="/settings/profile"
          className="interactive-press flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 transition-colors"
        >
          <div
            className={`flex size-7 items-center justify-center rounded-lg ${pathname === "/settings/profile" ? "text-primary" : ""}`}
          >
            <HugeiconsIcon
              icon={UserIcon}
              size={19}
              strokeWidth={pathname === "/settings/profile" ? 2.5 : 2}
              className={pathname === "/settings/profile" ? "text-primary" : ""}
            />
          </div>
          <span
            className={cn(
              "mt-0.5 text-[10px] leading-none",
              pathname === "/settings/profile"
                ? "font-bold text-primary"
                : "text-muted-foreground"
            )}
          >
            Profile
          </span>
        </Link>
      )}
    </nav>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { user, isSignedIn } = useUser()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(true)
  const lastScrollYRef = React.useRef(0)

  const userProfileUrl = user?.username
    ? `/u/${user.username}`
    : "/settings/profile"

  // Smart autohide navbar on scroll down, reveal on scroll up
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY <= 60) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollYRef.current + 8) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollYRef.current - 8) {
        setIsVisible(true)
      }
      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Keyboard shortcut ⌘K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const isDiscoverActive =
    pathname === "/" || pathname === "/seasonal" || pathname === "/airing"

  return (
    <>
      <header
        className={cn(
          "glass-surface sticky top-0 z-40 w-full border-b border-border/40 transition-transform duration-300 ease-out will-change-transform",
          !isVisible && "-translate-y-full shadow-none"
        )}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6 lg:gap-8">
            <NavbarMobileSheet
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              pathname={pathname}
              isSignedIn={Boolean(isSignedIn)}
            />

            <Link
              href="/"
              className="group interactive-press flex shrink-0 items-center gap-2.5 sm:gap-3"
            >
              <BrandLogo className="size-9 transition-transform duration-200 group-hover:scale-105" />
              <span className="hidden text-lg leading-none font-black tracking-tight text-foreground sm:inline-block">
                Yozora
              </span>
            </Link>

            <NavbarDesktopMenu
              isDiscoverActive={isDiscoverActive}
              isSignedIn={Boolean(isSignedIn)}
              pathname={pathname}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="interactive-press flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-border/70 bg-background/50 p-0 text-muted-foreground hover:bg-accent/40 hover:text-foreground sm:h-9 sm:w-60 sm:justify-between sm:px-3 md:w-64"
              aria-label="Search anime and characters (Press Command K)"
            >
              <div className="flex min-w-0 items-center gap-2 sm:pr-2">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={16}
                  strokeWidth={2}
                  className="shrink-0"
                />
                <span className="hidden max-w-32.5 truncate text-xs font-normal sm:inline-block md:max-w-38.75">
                  Search anime, titles...
                </span>
              </div>
              <kbd className="pointer-events-none hidden h-5 shrink-0 items-center gap-0.5 rounded border border-border/80 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-90 select-none sm:flex">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </Button>

            <ThemeToggle />

            <NavbarAuthControls
              isSignedIn={Boolean(isSignedIn)}
              userProfileUrl={userProfileUrl}
            />
          </div>
        </div>
      </header>

      <NavbarMobileBottomBar
        isVisible={isVisible}
        pathname={pathname}
        isSignedIn={Boolean(isSignedIn)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
