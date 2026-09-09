import Image from 'next/image'
import Link from 'next/link'
import { providerLogoOrNull } from '@/lib/assets'
import type { Provider } from '@/lib/types'

/**
 * The circular provider badge of Figma node 1:2660 (140x140 frame, 112px circle, 14px inset).
 *
 * Only five of the twelve providers have a logo — the Figma slider names exactly Pragmatic,
 * 3 Oaks, BGaming, Nolimit and Spribe. The other seven fall back to their initials set in the same
 * circle, which keeps the row's rhythm intact instead of leaving holes in it.
 *
 * Initials rather than the full name: "Hacksaw Gaming" at a size that fits a 112px disc lands
 * around 11px, which reads as a caption dropped into a logo slot. Two large letters read as a
 * mark, which is what the slot is for.
 */

/**
 * "Relax Gaming" → "RG", "NetEnt" → "NE", "Evoplay" → "EV".
 *
 * Word boundaries first; a single-word name has no boundaries to use, so it contributes its first
 * two letters instead. Internal capitals are deliberately not treated as boundaries — "BGaming"
 * would become "BG" either way, and the rule would turn "NetEnt" into something no reader expects.
 */
export function providerInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  return (words[0] ?? '').slice(0, 2).toUpperCase()
}

export interface ProviderCardProps {
  provider: Provider
  href?: string
  className?: string
}

const CIRCLE_CLASSES = [
  'flex size-28 items-center justify-center rounded-full mobile:size-[72px]',
  'border-[1.167px] border-solid border-separator bg-card',
].join(' ')

export default function ProviderCard({ provider, href, className }: ProviderCardProps) {
  const logo = providerLogoOrNull(provider.id)

  const circle = (
    <span className={CIRCLE_CLASSES}>
      {logo ? (
        // 68.83px inner frame in Figma; `object-contain` keeps the wordmarks' own aspect ratios,
        // which differ from each other by more than 2:1.
        <Image
          src={logo}
          alt={provider.name}
          width={69}
          height={69}
          unoptimized
          className="size-[69px] object-contain mobile:size-11"
        />
      ) : (
        // Hidden from assistive tech: "RG" is not the name of anything. The full name reaches a
        // screen reader through the link's aria-label, or the sr-only text of the static branch.
        <span
          aria-hidden
          className="text-[28px] font-extrabold uppercase leading-none tracking-[1px] text-label"
        >
          {providerInitials(provider.name)}
        </span>
      )}
    </span>
  )

  const classes = [
    // Node 21:3118 draws the phone badge 80x96 with a 72px circle 4px in from the sides; the
    // desktop sizes never had a mobile variant, and the two bands cost 280px against Figma's 192.
    'inline-flex size-[140px] shrink-0 items-center justify-center p-[14px] mobile:h-24 mobile:w-20 mobile:p-1',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${provider.name} — ${provider.gameCount} games`}
        className={`${classes} rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue`}
      >
        {circle}
      </Link>
    )
  }

  return (
    <div className={classes}>
      {circle}
      {/* The logo branch names itself through the image's alt; the initials branch cannot. */}
      {logo ? null : <span className="sr-only">{provider.name}</span>}
    </div>
  )
}
