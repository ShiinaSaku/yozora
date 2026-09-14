import * as React from "react"
import { cn } from "@/lib/utils"

export function BrandLogo({
  className = "size-8",
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex aspect-square shrink-0 items-center justify-center select-none",
        className
      )}
      {...props}
    >
      <img
        src="/logo.png"
        alt="Yozora"
        className="size-full object-contain select-none"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
