import type { ReactNode } from 'react'
import Button from '../primitives/Button'
import Icon from '../primitives/Icon'
import type { IconName } from '@/lib/types'

/**
 * The row heading of Figma node 1:2593: glyph, uppercase title, a rule that eats the remaining
 * width, and the tinted "See All (206)" pill.
 *
 * Figma exports the rule as a raster because it is a gradient stroke. It is redrawn here as a
 * `border-divider` hairline: shipping a bitmap that has to stretch to an unknown width would blur
 * at every viewport except the one it was exported at.
 *
 * Two headers, one component. The games rows stretch the rule to the right edge; Leading Providers
 * (node 1:2650) fixes it at 160px and pushes its search button to the margin instead. The mobile
 * header (node 1:5884) is the elastic one again, at a 14px title.
 */

/** `fill` stretches the rule to meet the action; `fixed` is the 160px line of node 1:2654. */
export type SectionHeaderRule = 'fill' | 'fixed'

export interface SectionHeaderProps {
  title: string
  icon: IconName
  /** The catalogue total shown in the pill, e.g. 206. Omit to hide the action entirely. */
  total?: number
  seeAllHref?: string
  /** Rendered instead of the See All pill — the providers row puts a search button here. */
  action?: ReactNode
  rule?: SectionHeaderRule
  className?: string
}

export default function SectionHeader({
  title,
  icon,
  total,
  seeAllHref,
  action,
  rule = 'fill',
  className,
}: SectionHeaderProps) {
  const seeAllLabel = typeof total === 'number' ? `See All (${total})` : 'See All'

  const actionNode =
    action ??
    (typeof total === 'number' || seeAllHref ? (
      <Button
        variant="seeAll"
        {...(seeAllHref ? { href: seeAllHref } : {})}
        // The pill reads "See All (206)" in the design; on its own that is ambiguous once there
        // are fifteen of them on the page.
        aria-label={`${seeAllLabel} — ${title}`}
      >
        {seeAllLabel}
      </Button>
    ) : null)

  return (
    <div
      className={['flex items-center justify-between gap-3', className].filter(Boolean).join(' ')}
    >
      <div className="flex shrink-0 items-center gap-2.5 mobile:gap-2">
        <Icon name={icon} width={20} height={20} className="size-5 object-contain" />
        {/* 18px on desktop (node 1:2653), 14px on mobile (node I1:5884;1:1483). */}
        <h2 className="text-lg font-extrabold uppercase text-primary mobile:text-sm">{title}</h2>
      </div>

      <span
        aria-hidden
        className={[
          'border-t border-solid border-divider',
          rule === 'fixed' ? 'h-0 w-40 shrink-0' : 'min-w-0 flex-1',
        ].join(' ')}
      />

      {actionNode}
    </div>
  )
}
