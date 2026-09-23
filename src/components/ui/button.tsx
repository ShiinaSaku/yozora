"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border text-base font-medium whitespace-nowrap transition-shadow outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 data-loading:text-transparent data-loading:select-none sm:text-sm pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-3 sm:h-8",
        icon: "size-9 sm:size-8",
        "icon-lg": "size-10 sm:size-9",
        "icon-sm": "size-8 sm:size-7",
        "icon-xl":
          "size-11 sm:size-10 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        "icon-xs":
          "size-7 rounded-md before:rounded-md sm:size-6 not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-4 sm:not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-3.5 sm:h-9",
        sm: "h-8 gap-1.5 px-2.5 sm:h-7",
        xl: "h-11 px-4 text-lg sm:h-10 sm:text-base [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1 rounded-md px-2 text-sm before:rounded-md sm:h-6 sm:text-xs [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
        play: "relative size-16 p-0 md:size-20",
        hero: "h-11 rounded-xl px-5 text-sm font-bold sm:h-12 sm:px-6",
        "nav-search": "h-9 w-9 p-0 sm:w-60 sm:justify-between sm:px-3 md:w-64",
      },
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/24 not-disabled:inset-shadow-xs hover:bg-primary/90 data-pressed:bg-primary/90 *:data-[slot=button-loading-indicator]:text-primary-foreground [:active,[data-pressed]]:inset-shadow-xs [:disabled,:active,[data-pressed]]:shadow-none",
        destructive:
          "border-destructive bg-destructive text-white shadow-xs shadow-destructive/24 not-disabled:inset-shadow-xs hover:bg-destructive/90 data-pressed:bg-destructive/90 *:data-[slot=button-loading-indicator]:text-white [:active,[data-pressed]]:inset-shadow-xs [:disabled,:active,[data-pressed]]:shadow-none",
        "destructive-outline":
          "border-input bg-popover text-destructive-foreground shadow-xs/5 not-dark:bg-clip-padding not-disabled:not-active:not-data-pressed:before:shadow-xs hover:border-destructive/32 hover:bg-destructive/4 data-pressed:border-destructive/32 data-pressed:bg-destructive/4 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:not-disabled:before:shadow-none dark:not-disabled:not-active:not-data-pressed:before:shadow-none [:disabled,:active,[data-pressed]]:shadow-none",
        ghost:
          "border-transparent text-foreground hover:bg-accent data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        link: "border-transparent text-foreground underline-offset-4 hover:underline data-pressed:underline *:data-[slot=button-loading-indicator]:text-foreground",
        outline:
          "border-input bg-popover text-foreground shadow-xs/5 not-dark:bg-clip-padding not-disabled:not-active:not-data-pressed:before:shadow-xs hover:bg-accent/50 data-pressed:bg-accent/50 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:not-disabled:before:shadow-none dark:not-disabled:not-active:not-data-pressed:before:shadow-none dark:hover:bg-input/64 dark:data-pressed:bg-input/64 [:disabled,:active,[data-pressed]]:shadow-none",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90 *:data-[slot=button-loading-indicator]:text-secondary-foreground [:active,[data-pressed]]:bg-secondary/80",
        glass:
          "rounded-full border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
        "glass-dark":
          "rounded-full border border-white/10 bg-black/30 text-zinc-200 backdrop-blur-md hover:bg-white/15 hover:text-white",
        pill: "rounded-full",
        cream: "rounded-xl bg-cream px-5 font-bold text-navy hover:bg-white",
        rose: "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
        play: "rounded-full border border-white/20 bg-background/80 text-foreground shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95",
        overlay:
          "border-transparent bg-background/90 text-foreground shadow-xs backdrop-blur-md hover:bg-primary hover:text-primary-foreground",
        "hero-outline":
          "rounded-xl border border-border/80 bg-card/85 text-foreground shadow-xs backdrop-blur-md before:hidden hover:bg-card hover:shadow-sm",
        "nav-search":
          "rounded-xl border border-border/70 bg-background/50 text-muted-foreground hover:bg-accent/40 hover:text-foreground",
      },
    },
  }
)

export interface ButtonProps extends useRender.ComponentProps<"button"> {
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = Boolean(loading || disabledProp)
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button"

  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  })
}
