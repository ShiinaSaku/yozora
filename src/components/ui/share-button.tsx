import type { ShareMenuProps } from "@/components/share-menu"
import { ShareMenu } from "@/components/share-menu"

export interface ShareButtonProps extends ShareMenuProps {
  text?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "xs"
  showLabel?: boolean
  label?: string
}

/**
 * Drop-in share button delegating to the unified ShareMenu dropdown component.
 */
export function ShareButton({
  title,
  url,
  text,
  className,
  variant,
  size,
  showLabel,
  label,
  align,
}: ShareButtonProps) {
  return (
    <ShareMenu
      title={title}
      url={url}
      text={text}
      className={className}
      variant={variant}
      size={size}
      showLabel={showLabel}
      label={label}
      align={align}
    />
  )
}
