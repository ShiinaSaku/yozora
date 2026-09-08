import * as React from "react"

type DirectImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
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
      className={className}
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
