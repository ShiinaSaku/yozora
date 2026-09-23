import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export const inputVariants = cva(
  "w-full min-w-0 transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-4xl border border-input bg-input/30 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        glass:
          "rounded-xl border border-white/15 bg-black/20 text-white shadow-none placeholder:text-white/35 focus-visible:border-rose-200/50 focus-visible:ring-2 focus-visible:ring-rose-200/20",
        unstyled:
          "rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
      },
      size: {
        default: "h-9 px-3 py-1 text-base md:text-sm",
        lg: "h-11 px-4 py-2 text-sm",
        search: "h-11 pr-4 pl-10 text-sm",
        icon: "h-9 pr-3 pl-9 text-sm",
        sm: "h-8 px-2.5 py-0.5 text-xs",
        none: "h-auto p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>

function Input({ className, type, variant, size, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Input }
