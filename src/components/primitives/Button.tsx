import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * The three button types of Figma node 1:4724 (Button / Desktop).
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
 */

export type ButtonVariant = 'primaryGold' | 'primaryBlue' | 'seeAll'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primaryGold: [
    'bg-gradient-gold rounded-[20px] px-6 py-2.5 text-base font-extrabold text-page',
    'shadow-[0_4px_6px_color-mix(in_srgb,var(--gold-dark)_25%,transparent)]',
    'hover:brightness-110 hover:shadow-[0_6px_10px_color-mix(in_srgb,var(--gold-dark)_35%,transparent)]',
    'active:brightness-90 active:shadow-[0_2px_4px_color-mix(in_srgb,var(--gold-dark)_20%,transparent)]',
  ].join(' '),

  primaryBlue: [
    'bg-blue rounded-full px-4 py-2 text-sm font-semibold text-primary',
    'shadow-[0_0_10px_color-mix(in_srgb,var(--blue)_60%,transparent)]',
    'hover:brightness-110 hover:shadow-[0_2px_14px_color-mix(in_srgb,var(--blue)_70%,transparent)]',
    'active:brightness-90 active:shadow-[0_0_6px_color-mix(in_srgb,var(--blue)_50%,transparent)]',
  ].join(' '),

  seeAll: [
    'bg-blue-tint rounded-[14px] px-4 py-1.5 text-[13px] font-bold text-blue',
    'hover:brightness-125 active:brightness-90',
  ].join(' '),
}

const BASE_CLASSES = [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap',
  'transition-[filter,box-shadow] duration-150',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
  // The link form has no native disabled state, so it is muted through aria-disabled instead.
  'aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:shadow-none',
].join(' ')

interface CommonProps {
  variant?: ButtonVariant
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
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(' ')

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
