import type { ReactNode } from 'react'
import Button from '../primitives/Button'
import Icon from '../primitives/Icon'
import type { IconName } from '@/lib/types'

/**
 * The row heading of Figma node 1:2593: glyph, uppercase title, a rule that eats the remaining
 * width, and the tinted "See All (206)" pill.
 *
 * Figma exports the rule as a 1029x1 raster because it is a gradient stroke. It is redrawn here
 * as a `border-divider` hairline: shipping a bitmap that has to stretch to an unknown width would
 * blur at every viewport except 1280.
 */

export interface SectionHeaderProps {
  title: string
  icon: IconName
  /** The catalogue total shown in the pill, e.g. 206. Omit to hide the action entirely. */
  total?: number
  seeAllHref?: string
  /** Rendered instead of the See All pill — the providers row puts a search button here. */
  action?: ReactNode
  className?: string
}

export default function SectionHeader({
  title,
  icon,
  total,
  seeAllHref,
  action,
  className,
}: SectionHeaderProps) {
  const seeAllLabel = typeof total === 'number' ? `See All (${total})` : 'See All'

  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <div className="flex shrink-0 items-center gap-2.5">
        <Icon name={icon} width={20} height={20} className="size-5 object-contain" />
        <h2 className="text-lg font-extrabold uppercase text-primary">{title}</h2>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span aria-hidden className="min-w-0 flex-1 border-t border-solid border-divider" />
        {action ??
          (typeof total === 'number' || seeAllHref ? (
            <Button
              variant="seeAll"
              {...(seeAllHref ? { href: seeAllHref } : {})}
              // The pill reads "See All (206)" in the design; on its own that is ambiguous once
              // there are fifteen of them on the page.
              aria-label={`${seeAllLabel} — ${title}`}
            >
              {seeAllLabel}
            </Button>
          ) : null)}
      </div>
    </div>
  )
}
