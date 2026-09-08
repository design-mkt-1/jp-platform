import type { ReactNode } from 'react'

/**
 * The small information pills of the promo banners (nodes 1:3446, 1:3448, 1:3538, 1:3540, 1:3594)
 * and of the search results.
 *
 * Figma paints the warning pills on `rgba(242,193,70,0.1)` — amber at one tenth. The theme stores
 * amber as a finished colour rather than as RGB channels, so Tailwind's `/opacity` modifier cannot
 * dilute it; `bg-amber-tint` carries that tenth as its own token. The white-tinted sibling pill
 * (nodes 1:3448, 1:3540) stays on `bg-elevated`.
 */

export type BadgeTone = 'amber' | 'neutral' | 'blue' | 'green'

/** `sm` is the lottery pill (12px, radius 6); `md` the tournament pill (13px, radius 8). */
export type BadgeSize = 'sm' | 'md'

const TONE_CLASSES: Record<BadgeTone, string> = {
  amber: 'bg-amber-tint text-amber',
  neutral: 'bg-elevated text-primary',
  blue: 'bg-blue-tint text-blue',
  green: 'bg-elevated text-green',
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'rounded-md px-3 py-1 text-xs',
  md: 'rounded-lg px-4 py-1.5 text-[13px]',
}

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  size?: BadgeSize
  className?: string
}

export default function Badge({ children, tone = 'neutral', size = 'md', className }: BadgeProps) {
  const classes = [
    'inline-flex items-center gap-1.5 whitespace-nowrap font-bold',
    TONE_CLASSES[tone],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{children}</span>
}
