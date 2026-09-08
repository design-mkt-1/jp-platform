import Image from 'next/image'
import Link from 'next/link'
import { HERO_BONUS } from '@/lib/assets'

/**
 * The welcome-bonus banner of Figma node 1:2436 — 1280x340 inside the 80px page inset, 24px radius.
 *
 * Its child node 1:2437 is a single bitmap with no text children: the "WELCOME CASINO BONUS" badge,
 * the "£5500 UP TO 250 FS" headline, the wager line and the blue GET button are all painted into
 * the export. Re-typing them as DOM on top of the image would show every word twice, so the copy is
 * carried as `sr-only` text instead — otherwise the whole offer would be invisible to a screen
 * reader and to anything that reads the page as text.
 *
 * The 3.76:1 aspect ratio is locked rather than the 340px height: below 1280 the frame has to
 * shrink with the artwork, and a fixed height would letterbox or crop the Zeus figure.
 */

/** Stable because the page renders exactly one hero; a hook-generated id would force a client component. */
const HEADING_ID = 'hero-welcome-bonus'

export interface HeroBannerProps {
  /** Small pill above the headline (baked into the artwork). */
  eyebrow?: string
  headline?: string
  /** The "ULTRA LOW WAGER X10" line under the headline. */
  terms?: string
  ctaLabel?: string
  /** Omit to render the banner as a static image — the demo has no promotions route. */
  ctaHref?: string
  className?: string
}

export default function HeroBanner({
  eyebrow = 'Welcome casino bonus',
  headline = '£5500 up to 250 FS',
  terms = 'Ultra low wager x10',
  ctaLabel = 'Get',
  ctaHref,
  className,
}: HeroBannerProps) {
  const frameClasses = [
    'relative block aspect-[64/17] w-full overflow-hidden rounded-3xl',
    'border border-solid border-card bg-section',
  ].join(' ')

  const artwork = (
    <Image
      src={HERO_BONUS}
      alt=""
      fill
      // The banner is the first paint above the fold; without this it loads after the game rows.
      priority
      sizes="(max-width: 767px) 100vw, 1280px"
      className="object-cover"
    />
  )

  return (
    <section
      aria-labelledby={HEADING_ID}
      className={['w-full px-page-x mobile:px-4', className].filter(Boolean).join(' ')}
    >
      <h2 id={HEADING_ID} className="sr-only">
        {eyebrow}: {headline}. {terms}
      </h2>

      <div className="mx-auto max-w-content">
        {ctaHref ? (
          <Link
            href={ctaHref}
            className={[
              frameClasses,
              'transition-[filter] duration-150 hover:brightness-105',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
            ].join(' ')}
          >
            {artwork}
            {/* The GET button is part of the bitmap, so the link needs its own name. */}
            <span className="sr-only">
              {ctaLabel} — {headline}
            </span>
          </Link>
        ) : (
          <div className={frameClasses}>{artwork}</div>
        )}
      </div>
    </section>
  )
}
