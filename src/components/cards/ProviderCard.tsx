import Image from 'next/image'
import Link from 'next/link'
import { providerLogoOrNull } from '@/lib/assets'
import type { Provider } from '@/lib/types'

/**
 * The circular provider badge of Figma node 1:2660 (140x140 frame, 112px circle, 14px inset).
 *
 * Only five of the twelve providers have a logo — the Figma slider names exactly Pragmatic,
 * 3 Oaks, BGaming, Nolimit and Spribe. The other seven fall back to their name set in the same
 * circle, which keeps the row's rhythm intact instead of leaving holes in it.
 */

export interface ProviderCardProps {
  provider: Provider
  href?: string
  className?: string
}

const CIRCLE_CLASSES = [
  'flex size-28 items-center justify-center rounded-full',
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
          className="size-[69px] object-contain"
        />
      ) : (
        <span className="px-3 text-center text-[11px] font-bold uppercase leading-tight tracking-[0.6px] text-label">
          {provider.name}
        </span>
      )}
    </span>
  )

  const classes = [
    'inline-flex size-[140px] shrink-0 items-center justify-center p-[14px]',
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

  return <div className={classes}>{circle}</div>
}
