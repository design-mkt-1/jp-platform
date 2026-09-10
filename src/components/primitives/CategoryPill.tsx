import Link from 'next/link'
import type { ReactNode } from 'react'
import Icon from './Icon'
import { sectionIcon } from '@/lib/assets'
import type { IconName } from '@/lib/types'

/**
 * One tab of the category bar (Figma node 1:2500 on desktop, 32:1893 on mobile).
 *
 * On **desktop** the active tab carries the only cyan outline in the whole design, which is what
 * makes the selection readable at a glance — so the ring and its glow are kept even though the
 * design's cyan is a shade greener than the `cyan` token; see the report's deviations.
 *
 * On **mobile** the tab is node 32:1895 / 32:1900: a 36px pill with no border, Inter 13 in
 * sentence case. The selected one is a blue tint with a `#36BCFF` label, glyph and 4px dot; the
 * rest are `#151F32` with a `#94A3B8` label and glyph. The frame this replaced, the deleted
 * 21:2977, drew no selected state at all, which is why an earlier build had none on the phone.
 *
 * Renders an anchor when given `href` and a button otherwise: the bar is a set of filters, and
 * whether a tab navigates or only changes in-page state is the caller's decision.
 */

const BASE_CLASSES = [
  'inline-flex h-[54px] shrink-0 items-center gap-2 rounded-full px-[22px] py-3',
  'font-display text-sm uppercase tracking-[0.6px] transition-colors',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  // Node 32:1895: 36 tall, 14px inset, 6px gap, Inter 13 at 0.1px tracking, no capitals.
  'mobile:h-9 mobile:gap-1.5 mobile:px-[14px] mobile:py-2',
  'mobile:font-sans mobile:text-[13px] mobile:normal-case mobile:tracking-[0.1px]',
  'mobile:border-0 mobile:shadow-none mobile:backdrop-blur-none',
].join(' ')

/** Desktop only: the phone draws the glyph through `MobileGlyph` below, in the tab's colour. */
const ICON_CLASSES = 'h-5 w-5 shrink-0 mobile:hidden'

/*
 * Each `mobile:` utility below is the only one of its Tailwind family on the element, facing an
 * unprefixed one: two competing `mobile:` utilities have resolved differently in `next dev` and in
 * the Pages build in this repo, because the winner is stylesheet order and not intent.
 */
const ACTIVE_CLASSES = [
  'bg-elevated font-bold text-primary',
  'border-[1.5px] border-solid border-cyan',
  'shadow-[0_0_16px_color-mix(in_srgb,var(--cyan)_20%,transparent)]',
  'mobile:bg-tab-accent-tint mobile:font-semibold mobile:text-tab-accent',
].join(' ')

const INACTIVE_CLASSES = [
  'bg-subtle font-medium text-muted backdrop-blur-[4px]',
  'border border-solid border-divider',
  'hover:text-primary',
  'mobile:bg-tab mobile:font-medium mobile:text-tab-label',
].join(' ')

/*
 * Each glyph's box on the phone, from its node under 32:1894. The files are exported with
 * `preserveAspectRatio="none"`, so an `<img>` in a box of the wrong shape stretches them: that is
 * what the old square box did to `live-casino.svg` (16 x 11.3, drawn 16 x 16). `box` is the Figma
 * frame and `size` the glyph inside it, where the two differ.
 *
 * One file serves both colours. Each of these four paints a single `#36BCFF` fill (the white in
 * `slots.svg` sits inside its own `<mask>` and never shows), so the file is used as a CSS mask and
 * the tab's token supplies the colour: blue when selected, `#94A3B8` otherwise, with no second
 * set of exports.
 */
const MOBILE_GLYPHS: Partial<Record<IconName, { box: string; size?: string }>> = {
  popular: { box: 'h-4 w-[11.2px]' }, // 32:1896, 11.226 x 16 — the file's own 14:20
  slots: { box: 'size-4' }, // 32:1901
  'live-casino': { box: 'size-4', size: '12.8px 9.04px' }, // 32:1936, glyph 32:1937 centred
  jackpots: { box: 'h-4 w-[17.9px]' }, // 32:1941, 17.885 x 16.004 — the file's own 20:17.9
}

function MobileGlyph({ icon, active }: { icon: IconName; active: boolean }) {
  const { box, size = '100% 100%' } = MOBILE_GLYPHS[icon] ?? { box: 'size-4' }
  const mask = `url(${sectionIcon(icon)}) center / ${size} no-repeat`

  return (
    <span
      aria-hidden
      className={`hidden shrink-0 mobile:block ${box} ${active ? 'bg-tab-accent' : 'bg-tab-label'}`}
      style={{ mask, WebkitMask: mask }}
    />
  )
}

export interface CategoryPillProps {
  label: string
  icon?: IconName
  active?: boolean
  href?: string
  /**
   * What the button form does when pressed. A pill with neither `href` nor `onClick` renders as
   * `aria-pressed` and swallows the press, which is what the category bar shipped until
   * 2026-09-09 — so this is not optional in practice, only in the type.
   */
  onClick?: () => void
  /** Rendered after the label — the design shows no count, but the search chips reuse this slot. */
  trailing?: ReactNode
  className?: string
}

export default function CategoryPill({
  label,
  icon,
  active = false,
  href,
  onClick,
  trailing,
  className,
}: CategoryPillProps) {
  const classes = [BASE_CLASSES, active ? ACTIVE_CLASSES : INACTIVE_CLASSES, className]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon ? (
        <>
          <Icon name={icon} width={20} height={20} className={ICON_CLASSES} />
          <MobileGlyph icon={icon} active={active} />
        </>
      ) : null}
      <span>{label}</span>
      {/* Node 32:1899, the selected tab's 4px dot. */}
      {active ? (
        <span aria-hidden className="hidden size-1 shrink-0 rounded-full bg-tab-accent mobile:block" />
      ) : null}
      {trailing}
    </>
  )

  if (href) {
    return (
      // `aria-current` and not just the ring or the tint: colour alone never reaches a screen
      // reader.
      <Link href={href} className={classes} aria-current={active ? 'page' : undefined}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-pressed={active}>
      {content}
    </button>
  )
}
