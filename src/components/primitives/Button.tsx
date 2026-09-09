import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * The button types of the Figma design: the three of node 1:4724 (Button / Desktop, specced in UI
 * Kit 1:5587) plus the header's outline button, node 1:4310.
 *
 * Hover and active are CSS states, never props. The Figma component exposes `state` as a variant
 * only because a static design file cannot render `:hover`; carrying that into React would force
 * every caller to track mouse state and would leave keyboard users without the same feedback.
 *
 * The gold hover and active stops in Figma are the base gold gradient lightened and darkened —
 * nothing more. Rather than mint four colour tokens for two interaction states, the
 * `.bg-gradient-gold` utility is filtered, keeping one source of truth for the brand gradient.
 * The blue variant follows the same reasoning.
 *
 * Glows go through `color-mix` because the design tints them with the button's own colour, and the
 * theme stores each token as a finished colour rather than as RGB channels — which is exactly what
 * Tailwind's `/opacity` modifier would need to dilute it.
 *
 * Skin and metrics are two separate maps. Padding and type size are the only things the header
 * needed to change about an existing look, and merging them into the variant string would have
 * meant a second `outlineSmall` variant for every future size — plus two utilities of the same
 * Tailwind family fighting in one class attribute, where the winner is decided by stylesheet
 * order rather than by the order they were written in.
 */

export type ButtonVariant = 'primaryGold' | 'primaryBlue' | 'seeAll' | 'outline' | 'deposit'

/** Named after the design's own scale, not after t-shirt sizes: each maps to one Figma spec. */
export type ButtonSize = 'cta' | 'pill' | 'tinted' | 'header'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /*
   * Node 1:5591. Blur radii and opacities are the designer's, not inferred: the Buttons section of
   * the Desktop UI Kit was filled in after the first build and states every value —
   * 0 4px 12px gold/25%, 0 6px 20px gold/35% on hover, 0 2px 8px gold/20% on active.
   * An earlier pass had guessed roughly half of each radius.
   */
  primaryGold: [
    // Pure black, which is what nodes 1:3547 and 1:3604 fill the label with — `text-page`
    // (#0f121d) was near enough to look right and is not the design's value.
    'bg-gradient-gold rounded-[20px] text-black',
    'shadow-[0_4px_12px_color-mix(in_srgb,var(--gold-dark)_25%,transparent)]',
    'hover:brightness-110 hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--gold-dark)_35%,transparent)]',
    'active:brightness-90 active:shadow-[0_2px_8px_color-mix(in_srgb,var(--gold-dark)_20%,transparent)]',
  ].join(' '),

  /*
   * Node 1:5623: 0 0 20px glow, 0 2px 28px expanded on hover, 0 0 12px at 80% on active.
   * The spec names an opacity only for the active state, so the resting and hover glows keep the
   * values already in place rather than inventing a number the design does not give.
   */
  primaryBlue: [
    'bg-blue rounded-full text-primary',
    'shadow-[0_0_20px_color-mix(in_srgb,var(--blue)_60%,transparent)]',
    'hover:brightness-110 hover:shadow-[0_2px_28px_color-mix(in_srgb,var(--blue)_70%,transparent)]',
    'active:brightness-90 active:shadow-[0_0_12px_color-mix(in_srgb,var(--blue)_80%,transparent)]',
  ].join(' '),

  /*
   * Node 1:5655. Its own three fills rather than a brightness filter over `blue-tint`: the design
   * gives 13 / 22 / 30 percent, and the resting 13% is the Desktop kit's value, which the
   * "mobile kit wins" token decision had replaced with 15% everywhere. See globals.css.
   */
  seeAll: [
    // `leading-4` because node 1:3265 draws "See All (206)" in a 16px line box, which with the
    // size's own 6px padding is the 28px tall pill of node 1:3264. Without it the 13px text
    // inherits the stylesheet's 1.5, the pill stands 31.5px, and every one of the fifteen row
    // headers is 3.5px taller than the design. It sits on the variant rather than on the `tinted`
    // size because that size is shared with the hero's Get pill, which Figma draws differently.
    'bg-see-all rounded-[14px] leading-4 text-blue-text',
    'hover:bg-see-all-hover active:bg-see-all-active',
  ].join(' '),

  // Node 1:4310: transparent fill, 1px white-at-30% hairline, 20px radius. White at 30% is the
  // only border value in the design that no token covers — see docs/tokens.md §2b — so it is
  // written with Tailwind's own `white`, which carries no hex into this file. Node 1:4310 is a
  // static frame with no state variants, so hover and active lift the same hairline rather than
  // invent a second colour.
  outline: [
    'rounded-[20px] border border-solid border-white/30 bg-transparent text-primary',
    'transition-colors hover:border-white/50 hover:bg-elevated active:bg-subtle',
  ].join(' '),

  /*
   * Node 13:2340, the deposit button of the rebuilt jackpot-menu frames: a flat #00B579 in the same
   * 20px radius as the gold CTA, and carrying the gold CTA's own drop shadow — `rgba(198,144,61,
   * 0.25)` at 0 4px 6px, which is `--gold-dark` at 25%. The design really does tint a green button
   * with a gold glow; it is transcribed rather than corrected.
   *
   * The label is where this variant deviates. Figma writes DEPOSIT in white, and white on #00B579
   * measures 2.66:1 — under the 4.5 that `scripts/a11y.mjs` gates CI on, and two of its nine states
   * are this menu. Owner's decision of 2026-09-09: keep the design's green, write the label in
   * `text-page`, which measures 7.01:1. `JackpotMenu` already makes the same trade for its emerald
   * buttons. See docs/tokens.md §2b.
   */
  deposit: [
    'bg-deposit-green rounded-[20px] text-page',
    'shadow-[0_4px_6px_color-mix(in_srgb,var(--gold-dark)_25%,transparent)]',
    'hover:brightness-110 active:brightness-90',
  ].join(' '),
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  /** Primary Gold, node 1:4725: padding 10/24, Inter Extra Bold 16. */
  cta: 'px-6 py-2.5 text-base font-extrabold',
  /** Primary Blue, node 1:4731: padding 8/16, Inter Semi Bold 14. */
  pill: 'px-4 py-2 text-sm font-semibold',
  /** See All Tinted, node 1:4737: padding 6/16, Inter Bold 13. */
  tinted: 'px-4 py-1.5 text-[13px] font-bold',
  /** Header login/register, node 1:4310: fixed 36 tall, padding 8/24, Inter Extra Bold 13, caps. */
  header: 'h-9 px-6 py-2 text-[13px] font-extrabold uppercase',
}

/** Each variant's native size, so existing call sites keep rendering exactly what they did. */
const DEFAULT_SIZE: Record<ButtonVariant, ButtonSize> = {
  primaryGold: 'cta',
  primaryBlue: 'pill',
  seeAll: 'tinted',
  outline: 'header',
  // Node 13:2340 is padded 10/24, which is `cta` exactly; only its 12px type differs, and the one
  // call site already overrides that alongside the 113x38 the node fixes.
  deposit: 'cta',
}

const BASE_CLASSES = [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap',
  // background-color joined the list when See All moved from a brightness filter to three real
  // fills; without it that one variant would snap while every other button eases.
  'transition-[filter,box-shadow,background-color] duration-150',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
  // The link form has no native disabled state, so it is muted through aria-disabled instead.
  'aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:shadow-none',
].join(' ')

interface CommonProps {
  variant?: ButtonVariant
  /** Overrides the variant's native metrics — the header uses `header` on more than `outline`. */
  size?: ButtonSize
  children: ReactNode
  className?: string
}

export type ButtonAsButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }

export type ButtonAsLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    href: string
  }

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

export default function Button({
  variant = 'primaryGold',
  size,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size ?? DEFAULT_SIZE[variant]],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (typeof rest.href === 'string') {
    const { href, ...anchor } = rest
    return (
      // `prefetch={false}` is the default rather than a prop, because this demo has exactly two
      // routes — `/` and `/dev/screens` — and every href a Button has ever been handed is one of
      // the three dead promo links in tournaments.json. Next's default prefetch therefore asks the
      // static export for pages that do not exist, one 404 each. An opt-out every caller has to
      // remember is an opt-out that gets forgotten, which is how the same 404s reached a third
      // place in this codebase after being fixed in `MobileNavBar` and `Header`.
      //
      // Before the spread on purpose: a caller that one day links somewhere real can still pass
      // `prefetch` and win, without widening `ButtonAsLinkProps` — which is typed from
      // `AnchorHTMLAttributes` and has no `prefetch` in it.
      <Link href={href} prefetch={false} className={classes} {...anchor}>
        {children}
      </Link>
    )
  }

  const { href, ...button } = rest
  void href // Always undefined in this branch; pulled out so it never reaches the DOM.
  return (
    // Explicit type: a bare <button> inside a form defaults to `submit` and would navigate.
    <button type="button" className={classes} {...button}>
      {children}
    </button>
  )
}
