import Link from 'next/link'
import type { ReactNode } from 'react'
import Icon from './Icon'
import type { IconName } from '@/lib/types'

/**
 * One tab of the category bar (Figma node 1:2500).
 *
 * The active tab carries the only cyan outline in the whole design, which is what makes the
 * selection readable at a glance — so the ring and its glow are kept even though the design's cyan
 * is a shade greener than the `cyan` token; see the report's deviations.
 *
 * Renders an anchor when given `href` and a button otherwise: the bar is a set of filters, and
 * whether a tab navigates or only changes in-page state is the caller's decision.
 */

const BASE_CLASSES = [
  'inline-flex h-[54px] shrink-0 items-center gap-2 rounded-full px-[22px] py-3',
  'font-display text-sm uppercase tracking-[0.6px] transition-colors',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  // Mobile is its own chip, not the desktop one scaled: node 1:5799 draws 32px tall, 14px inset,
  // 6px gap, 12px label. At the desktop size four of these need 573px of a 374px row, so only one
  // and a half were ever reachable without a swipe nothing signalled.
  'mobile:h-8 mobile:gap-1.5 mobile:px-[14px] mobile:py-2 mobile:text-xs',
].join(' ')

/** 20px on desktop, 16px in the mobile chip — node 1:5799 again. */
const ICON_CLASSES = 'size-5 shrink-0 mobile:size-4'

const ACTIVE_CLASSES = [
  'bg-elevated font-bold text-primary',
  'border-[1.5px] border-solid border-cyan',
  'shadow-[0_0_16px_color-mix(in_srgb,var(--cyan)_20%,transparent)]',
].join(' ')

const INACTIVE_CLASSES = [
  'bg-subtle font-medium text-muted backdrop-blur-[4px]',
  'border border-solid border-divider',
  'hover:text-primary',
].join(' ')

export interface CategoryPillProps {
  label: string
  icon?: IconName
  active?: boolean
  href?: string
  /** Rendered after the label — the design shows no count, but the search chips reuse this slot. */
  trailing?: ReactNode
  className?: string
}

export default function CategoryPill({
  label,
  icon,
  active = false,
  href,
  trailing,
  className,
}: CategoryPillProps) {
  const classes = [BASE_CLASSES, active ? ACTIVE_CLASSES : INACTIVE_CLASSES, className]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon ? <Icon name={icon} width={20} height={20} className={ICON_CLASSES} /> : null}
      <span>{label}</span>
      {trailing}
    </>
  )

  if (href) {
    return (
      // `aria-current` and not just the ring: the cyan outline is the only visual cue, and colour
      // alone never reaches a screen reader.
      <Link href={href} className={classes} aria-current={active ? 'page' : undefined}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} aria-pressed={active}>
      {content}
    </button>
  )
}
