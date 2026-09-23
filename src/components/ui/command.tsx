"use client"

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog"
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { SearchIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

export const CommandDialog: typeof CommandDialogPrimitive.Root =
  CommandDialogPrimitive.Root

export const CommandDialogPortal: typeof CommandDialogPrimitive.Portal =
  CommandDialogPrimitive.Portal

export const CommandCreateHandle: typeof CommandDialogPrimitive.createHandle =
  CommandDialogPrimitive.createHandle

export function CommandDialogTrigger(
  props: CommandDialogPrimitive.Trigger.Props
): React.ReactElement {
  return (
    <CommandDialogPrimitive.Trigger
      data-slot="command-dialog-trigger"
      {...props}
    />
  )
}

export function CommandDialogBackdrop({
  className,
  ...props
}: CommandDialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <CommandDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      data-slot="command-dialog-backdrop"
      {...props}
    />
  )
}

export function CommandDialogPopup({
  className,
  children,
  portalProps,
  ...props
}: CommandDialogPrimitive.Popup.Props & {
  portalProps?: CommandDialogPrimitive.Portal.Props
}): React.ReactElement {
  return (
    <CommandDialogPortal {...portalProps}>
      <CommandDialogBackdrop />
      <CommandDialogPrimitive.Popup
        className={cn(
          "fixed top-16 left-1/2 z-50 flex max-h-128 min-h-0 w-11/12 max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl transition-all duration-200 ease-out outline-none data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 sm:top-24 sm:w-full",
          className
        )}
        data-slot="command-dialog-popup"
        {...props}
      >
        {children}
      </CommandDialogPrimitive.Popup>
    </CommandDialogPortal>
  )
}

export function Command({
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.Root
>): React.ReactElement {
  return (
    <AutocompletePrimitive.Root
      autoHighlight={autoHighlight}
      inline
      keepHighlight={keepHighlight}
      open
      {...props}
    />
  )
}

export function CommandInput({
  className,
  placeholder,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.Input
>): React.ReactElement {
  return (
    <div className="relative flex items-center border-b border-border/40 px-4">
      <SearchIcon className="mr-3 size-4.5 shrink-0 text-muted-foreground/70" />
      <AutocompletePrimitive.Input
        autoFocus
        placeholder={placeholder}
        data-slot="command-input"
        className={cn(
          "h-13 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground/50 sm:h-14 sm:text-base",
          className
        )}
        {...props}
      />
    </div>
  )
}

export function CommandList({
  className,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.List
>): React.ReactElement {
  return (
    <AutocompletePrimitive.List
      className={cn(
        "max-h-96 min-h-0 flex-1 overflow-y-auto overscroll-contain p-2",
        className
      )}
      data-slot="command-list"
      {...props}
    />
  )
}

export function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.Empty
>): React.ReactElement {
  return (
    <AutocompletePrimitive.Empty
      className={cn("py-12 text-center", className)}
      data-slot="command-empty"
      {...props}
    />
  )
}

export function CommandPanel({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("relative min-h-0 min-w-0", className)}
      data-slot="command-panel"
      {...props}
    />
  )
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.Group
>): React.ReactElement {
  return (
    <AutocompletePrimitive.Group
      className={className}
      data-slot="command-group"
      {...props}
    />
  )
}

export function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.GroupLabel
>): React.ReactElement {
  return (
    <AutocompletePrimitive.GroupLabel
      className={cn(
        "px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground/80",
        className
      )}
      data-slot="command-group-label"
      {...props}
    />
  )
}

export const CommandCollection = AutocompletePrimitive.Collection

export function CommandItem({
  className,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.Item
>): React.ReactElement {
  return (
    <AutocompletePrimitive.Item
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-foreground/90 transition-colors duration-100 outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground",
        className
      )}
      data-slot="command-item"
      {...props}
    />
  )
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<
  typeof AutocompletePrimitive.Separator
>): React.ReactElement {
  return (
    <AutocompletePrimitive.Separator
      className={cn("mx-2 my-1 h-px bg-border last:hidden", className)}
      data-slot="command-separator"
      {...props}
    />
  )
}

export function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"kbd">): React.ReactElement {
  return (
    <kbd
      className={cn(
        "ms-auto font-mono text-xs tracking-widest text-muted-foreground/72",
        className
      )}
      data-slot="command-shortcut"
      {...props}
    />
  )
}

export function CommandFooter({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 border-t border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground",
        className
      )}
      data-slot="command-footer"
      {...props}
    />
  )
}

export { CommandDialogPrimitive }
