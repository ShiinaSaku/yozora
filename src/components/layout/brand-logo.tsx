import * as React from "react"
import { cn } from "@/lib/utils"

export function BrandLogo({
  className = "size-8",
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex aspect-square shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/80 select-none",
        className
      )}
      {...props}
    >
      <img
        src="/favicon-192.png"
        alt=""
        width={192}
        height={192}
        className="size-full object-contain select-none"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
