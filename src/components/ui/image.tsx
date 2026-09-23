import * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const imageVariants = cva("size-full object-cover", {
  variants: {
    variant: {
      default: "",
      zoom: "transition-transform duration-500 group-hover:scale-105",
      thumb:
        "object-cover transition-transform duration-200 group-data-highlighted:scale-105",
      heroBackdrop: "opacity-25 blur-2xl saturate-150",
      heroCover: "rounded-2xl shadow-2xl",
      heroBanner:
        "transform-gpu object-cover object-top opacity-85 transition-opacity duration-700 sm:object-center sm:opacity-90 dark:opacity-60 dark:sm:opacity-75",
      heroBlur:
        "scale-125 transform-gpu object-cover object-center opacity-55 blur-3xl dark:opacity-40 dark:sm:opacity-50",
      rounded: "rounded-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type DirectImageProps = React.ImgHTMLAttributes<HTMLImageElement> &
  VariantProps<typeof imageVariants> & {
    fill?: boolean
    priority?: boolean
    quality?: number
    unoptimized?: boolean
  }

/** Direct-origin image delivery. AniList's medium, large, and extraLarge URLs are never proxied. */
export function Image({
  fill,
  priority,
  quality: _quality,
  unoptimized: _unoptimized,
  loading,
  style,
  className,
  variant,
  alt = "",
  onLoad,
  onError,
  ...props
}: DirectImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  return (
    <img
      alt={alt}
      decoding="async"
      draggable={false}
      fetchPriority={priority ? "high" : undefined}
      loading={loading ?? (priority ? "eager" : "lazy")}
      onLoad={(e) => {
        setIsLoaded(true)
        onLoad?.(e)
      }}
      onError={(e) => {
        onError?.(e)
      }}
      className={cn(imageVariants({ variant }), className)}
      data-loaded={isLoaded ? "true" : undefined}
      style={
        fill
          ? {
              inset: 0,
              height: "100%",
              position: "absolute",
              width: "100%",
              ...style,
            }
          : style
      }
      {...props}
    />
  )
}

export default Image
