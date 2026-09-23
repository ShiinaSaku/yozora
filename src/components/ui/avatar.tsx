import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const avatarVariants = cva(
  "group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:mix-blend-darken dark:after:mix-blend-lighten",
  {
    variants: {
      variant: {
        default:
          "rounded-full after:rounded-full after:border after:border-border",
        profile:
          "rounded-3xl border-4 border-card bg-card shadow-2xl ring-2 ring-primary/20 after:hidden",
      },
      size: {
        default: "size-8",
        sm: "size-6",
        lg: "size-10",
        profile: "size-28 sm:size-32",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const avatarImageVariants = cva("aspect-square size-full object-cover", {
  variants: {
    variant: {
      default: "rounded-full",
      profile: "rounded-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export const avatarFallbackVariants = cva(
  "flex size-full items-center justify-center text-sm",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-muted text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        profile: "rounded-2xl bg-primary/10 text-3xl font-black text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Avatar({
  className,
  variant,
  size,
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  variant,
  ...props
}: AvatarPrimitive.Image.Props & VariantProps<typeof avatarImageVariants>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(avatarImageVariants({ variant }), className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  variant,
  ...props
}: AvatarPrimitive.Fallback.Props &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ variant }), className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
