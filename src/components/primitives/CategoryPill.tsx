import Link from 'next/link'
import type { ReactNode } from 'react'
import Icon from './Icon'
import type { IconName } from '@/lib/types'

/**
 * One tab of the category bar (Figma node 1:2500 on desktop, 21:2978 on mobile).
 *
 * On **desktop** the active tab carries the only cyan outline in the whole design, which is what
 * makes the selection readable at a glance — so the ring and its glow are kept even though the
 * design's cyan is a shade greener than the `cyan` token; see the report's deviations.
 *
 * On **mobile** there is no active outline, because the phone frame does not draw one. All four
 * chips of node 21:2977 are painted identically — `#12162B` fill, 1px `#222A4E` border, white Inter
 * Bold 12 — and the frame Figma *names* `Chip-Active` (21:2978) is pixel-for-pixel the same as
 * 21:2982 / 21:3017 / 21:3022. Owner's decision, 2026-09-10: full Figma parity on the phone. That
 * knowingly contradicts `ui-ux-pro-max`'s Navigation "Active State" rule; the deviation is written
 * down in `docs/tokens.md`. `aria-current` / `aria-pressed` below are what carries the selection
 * to assistive tech, and they were never the ring's job anyway.
 *
 * Renders an anchor when given `href` and a button otherwise: the bar is a set of filters, and
 * whether a tab navigates or only changes in-page state is the caller's decision.
 */

const BASE_CLASSES = [
  'inline-flex h-[54px] shrink-0 items-center gap-2 rounded-full px-[22px] py-3',
  'font-display text-sm uppercase tracking-[0.6px] transition-colors',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  // Mobile is its own chip, not the desktop one scaled: node 21:2978 draws 42px tall (it stretches
  // to its track, 21:2977 — its own vertical padding is only 8), 14px inset, 6px gap, and an Inter
  // Bold 12 label letter-spaced 0.4px rather than the desktop 0.6. At the desktop size four of
  // these need 573px of a 374px row, so only one and a half were ever reachable without a swipe
  // nothing signalled.
  'mobile:h-[42px] mobile:gap-1.5 mobile:px-[14px] mobile:py-2',
  'mobile:font-sans mobile:text-xs mobile:tracking-[0.4px]',
].join(' ')

/**
 * 20px on desktop, 16px *tall* in the mobile chip — node 21:2979 is 16 tall.
 *
 * `h-5 w-5` rather than `size-5`, so each `mobile:` override below faces an unprefixed utility of
 * its own family and the cascade order is defined. See `MOBILE_FIGMA_CLASSES` for why that matters.
 */
const ICON_CLASSES = 'h-5 w-5 shrink-0 mobile:h-4'

/** The three square-boxed glyphs. Their Figma frames are 16x16, so 16 wide is right. */
const ICON_WIDTH_CLASSES = 'mobile:w-4'

/**
 * The flame is the one glyph the design does not put in a square box: node 21:2979 measures
 * 11.226 x 16. `popular.svg` is exported 14 x 20 — the same 0.70 ratio, glyph filling its viewBox,
 * `preserveAspectRatio="none"` — so the file is right and the square CSS box was stretching it
 * 4.8px wide. That is not a cosmetic distortion: it pushed `Popular` 6.79px past Figma and every
 * chip after it along with it, until the clipped `Jackpots` showed 17.4px where the design shows 30.
 *
 * 11.2 = 16 x 14/20, i.e. the file's own ratio at the chip's height; Figma's 11.226 is the leaf's
 * bounding box, 0.026px away. Given explicitly rather than left to `w-auto`, because next/image
 * writes `width`/`height` attributes on the `<img>` and an auto width resolves against those until
 * the SVG has loaded, then jumps to the natural ratio.
 *
 * Scoped to this glyph on purpose. The other three files are not square either — `live-casino.svg`
 * is 16 x 11.3 and `jackpots.svg` 20 x 17.9 — but their Figma frames *are* 16x16, so honouring the
 * file ratio there would widen `Live Casino` by ~6.7px. Their residual widths are under 3px and
 * come from text metrics.
 */
const FLAME_WIDTH_CLASSES = 'mobile:w-[11.2px]'

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

/**
 * The mobile paint, applied to every chip whatever `active` says — this is the whole of the
 * "no active indicator on the phone" decision.
 *
 * It has to override both blocks above, so each of these is the *only* `mobile:` utility of its
 * Tailwind family on the element: two competing ones (`mobile:h-8` beside `mobile:h-10`) have
 * already resolved differently in `next dev` and in the Pages build in this repo, because the
 * winner is stylesheet order and not intent. Against an unprefixed utility the order is defined —
 * Tailwind emits the `mobile` variant after the bare one — and it is verified with
 * `getComputedStyle`, not assumed.
 */
const MOBILE_FIGMA_CLASSES = [
  'mobile:border mobile:border-solid mobile:border-chip mobile:bg-section',
  'mobile:font-bold mobile:text-primary',
  'mobile:shadow-none mobile:backdrop-blur-none',
].join(' ')

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
  const classes = [
    BASE_CLASSES,
    active ? ACTIVE_CLASSES : INACTIVE_CLASSES,
    MOBILE_FIGMA_CLASSES,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon ? (
        <Icon
          name={icon}
          width={20}
          height={20}
          className={`${ICON_CLASSES} ${icon === 'popular' ? FLAME_WIDTH_CLASSES : ICON_WIDTH_CLASSES}`}
        />
      ) : null}
      <span>{label}</span>
      {trailing}
    </>
  )

  if (href) {
    return (
      // `aria-current` and not just the ring: on desktop the cyan outline is the only visual cue
      // and colour alone never reaches a screen reader, and on mobile there is no visual cue at
      // all — this attribute is the entire selection signal there.
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
