import type { ReactNode } from 'react'

/**
 * The small information pills of the promo banners (nodes 1:3446, 1:3448, 1:3538, 1:3540, 1:3594)
 * and of the search results.
 *
 * Figma paints the warning pills on `rgba(242,193,70,0.1)` — amber at one tenth. The theme stores
 * amber as a finished colour rather than as RGB channels, so Tailwind's `/opacity` modifier cannot
 * dilute it; `bg-amber-tint` carries that tenth as its own token. The white-tinted sibling pill
 * (nodes 1:3448, 1:3540) stays on `bg-elevated`.
 *
 * The mobile hero's wager badge is a *different* amber — `#FF9500` at a tenth under `#FFAE00`,
 * nodes 21:2934 / 21:2935 — so it gets the `wager` tone instead of borrowing `amber-tint`, which
 * is bound to the desktop pills above.
 */

export type BadgeTone = 'amber' | 'neutral' | 'blue' | 'green' | 'wager'

/**
 * `xs` is the mobile hero's pill (nodes 21:2932 / 21:2934 — 10px, radius 6, 8/3 padding); `sm` the
 * lottery pill (12px, radius 6); `md` the tournament pill (13px, radius 8).
 */
export type BadgeSize = 'xs' | 'sm' | 'md'

const TONE_CLASSES: Record<BadgeTone, string> = {
  amber: 'bg-amber-tint text-amber',
  neutral: 'bg-elevated text-primary',
  blue: 'bg-blue-tint text-blue-text',
  green: 'bg-elevated text-green',
  // The mobile hero's wager badge only, nodes 21:2934 / 21:2935: #FF9500 at a tenth under #FFAE00.
  // A tone rather than a `className` override on the call site — an override would put two `bg-*`
  // and two `text-*` utilities on one element, where the winner is stylesheet order and not the
  // order they were written in. One utility per property.
  wager: 'bg-wager-tint text-wager-amber',
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  // Caps and the 0.5px tracking are part of the spec at this size, not of the copy: nodes 21:2932
  // and 21:2934 both draw Inter Bold 10 in caps, letter-spaced half a pixel.
  //
  // `leading-3` is load-bearing. Tailwind's *arbitrary* `text-[10px]` sets font-size alone and
  // carries no line-height, so without it the pill inherited `line-height: 15px` from `html`
  // (1.5 x 16) and stood 15+3+3 = 21 tall against Figma's 18 — and pushed Bonus-Title and
  // Bonus-Subtitle 3px down the card with it. `leading-3` is 0.75rem = 12px exactly, which is what
  // node 21:2933's text box measures (56x12). Not `leading-[normal]`, which happens to measure the
  // same 12.00px for Inter at 10px but is font-dependent: if Inter fails to load, the fallback's
  // `normal` moves the box and `leading-3` does not.
  xs: 'rounded-md px-2 py-[3px] text-[10px] uppercase leading-3 tracking-[0.5px]',
  sm: 'rounded-md px-3 py-1 text-xs',
  // Node 1:3447's pill is 13px at `line-height: normal`, which is 16px for Inter — the same
  // reasoning as `xs` above, one size up. Without it the pill rendered 31.5 instead of 28.
  md: 'rounded-lg px-4 py-1.5 text-[13px] leading-4',
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
