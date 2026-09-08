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

export type ButtonVariant = 'primaryGold' | 'primaryBlue' | 'seeAll' | 'outline'

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
    'bg-gradient-gold rounded-[20px] text-page',
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
    'bg-see-all rounded-[14px] text-blue',
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
      <Link href={href} className={classes} {...anchor}>
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
