import * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const cardVariants = cva(
  "group group/card relative flex flex-col overflow-hidden text-sm text-card-foreground",
  {
    variants: {
      variant: {
        default: "rounded-2xl border border-border/50 bg-card",
        destructive:
          "rounded-2xl border border-destructive/30 bg-destructive/5",
        subtle: "rounded-2xl border border-border/40 bg-card shadow-2xs",
        shimmer:
          "animate-shimmer rounded-2xl border border-border/40 bg-card shadow-xs",
        success: "rounded-2xl border border-emerald-500/30 bg-emerald-500/5",
        interactive:
          "rounded-2xl border border-border/50 bg-card transition-all duration-250 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl active:scale-95",
        large: "rounded-3xl border border-border/40 bg-card shadow-2xs",
        stat: "rounded-2xl border border-border/50 bg-card shadow-xs transition-colors hover:border-primary/30",
      },
      size: {
        default: "gap-6 py-6",
        sm: "gap-2.5 p-4",
        md: "gap-3 p-5",
        lg: "gap-4 p-6",
        xl: "gap-6 p-6 sm:p-8",
        stat: "items-center justify-center gap-1 p-4 text-center sm:p-5",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Card({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-2 rounded-t-xl px-6 has-data-[slot=card-action]:grid-cols-2 has-data-[slot=card-description]:grid-rows-2 [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-6 [.border-t]:pt-6",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
