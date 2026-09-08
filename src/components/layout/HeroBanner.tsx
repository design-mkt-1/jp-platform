import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/primitives/Badge'
import Button from '@/components/primitives/Button'
import { HERO_BONUS, HERO_BONUS_MOBILE } from '@/lib/assets'

/**
 * The welcome-bonus banner. Two different compositions, not one that scales.
 *
 * Desktop — node 1:2436, 1280x340 inside the 80px page inset, 24px radius. Its child node 1:2437 is
 * a single bitmap with no text children: the "WELCOME CASINO BONUS" badge, the "£5500 UP TO 250 FS"
 * headline, the wager line and the blue GET button are all painted into the export. Re-typing them
 * as DOM on top of the image would show every word twice, so the copy is carried as `sr-only` text
 * instead — otherwise the whole offer would be invisible to a screen reader and to anything that
 * reads the page as text. The 3.76:1 aspect ratio is locked rather than the 340px height: below
 * 1280 the frame has to shrink with the artwork, and a fixed height would letterbox or crop Zeus.
 *
 * Mobile — node 1:5750, a 358x170 card inside the 16px inset, 16px radius. It is a genuinely
 * different layout, not the desktop one reduced: two separate pills instead of one, the amount and
 * the spins on two lines, sentence-case "Get", and the art cropped tall on the right. Here the text
 * is *not* baked into the artwork, so it is real DOM — which is also the only way it can be read at
 * 390px without the desktop headline turning into six illegible pixels.
 *
 * Both branches share one bitmap. `public/` is owned elsewhere and there is no mobile export of the
 * art, so the mobile crop is taken out of the desktop file with object-fit: at `object-cover` in a
 * box 62% of the card wide, the 1280x340 source renders 640x170 and `object-[68%_50%]` lands the
 * visible window on source x≈570–1010 — Zeus, his staff and the first rocks, and none of the
 * desktop lettering, which all sits left of x≈430.
 */

/** Stable because the page renders exactly one hero; a hook-generated id would force a client component. */
const HEADING_ID = 'hero-welcome-bonus'

export interface HeroBannerProps {
  /** Small pill above the headline (baked into the desktop artwork). */
  eyebrow?: string
  headline?: string
  /** The "ULTRA LOW WAGER X10" line under the headline. */
  terms?: string
  ctaLabel?: string
  /** Omit to render the banner as a static image — the demo has no promotions route. */
  ctaHref?: string
  className?: string
  /** Mobile-only copy (node 1:5750), where the words differ from the desktop bitmap. */
  mobileEyebrow?: string
  mobileWager?: string
  /** The 26px line, node 1:5761. */
  mobileAmount?: string
  /** Node 1:5762, split so only the second half is white. */
  mobileSpinsPrefix?: string
  mobileSpins?: string
}

export default function HeroBanner({
  eyebrow = 'Welcome casino bonus',
  headline = '£5500 up to 250 FS',
  terms = 'Ultra low wager x10',
  ctaLabel = 'Get',
  ctaHref,
  className,
  mobileEyebrow = 'Welcome',
  mobileWager = '20x wager',
  mobileAmount = '£5,500',
  mobileSpinsPrefix = 'Up to ',
  mobileSpins = '250 free spins',
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
      sizes="1280px"
      className="object-cover"
    />
  )

  const getButton = ctaHref ? (
    <Button variant="primaryBlue" size="tinted" href={ctaHref} className="w-[97px]">
      {ctaLabel}
    </Button>
  ) : (
    // No promotions route in the demo: the pill is drawn, but it must not announce itself as a
    // control that goes nowhere.
    <span
      className="inline-flex h-8 w-[97px] items-center justify-center rounded-full bg-blue text-[13px] font-bold text-primary shadow-[0_0_10px_color-mix(in_srgb,var(--blue)_60%,transparent)]"
      aria-hidden="true"
    >
      {ctaLabel}
    </span>
  )

  return (
    <section
      aria-labelledby={HEADING_ID}
      className={['w-full px-page-x mobile:px-4', className].filter(Boolean).join(' ')}
    >
      <h2 id={HEADING_ID} className="sr-only">
        {eyebrow}: {headline}. {terms}
      </h2>

      <div className="mx-auto max-w-content mobile:hidden">
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

      {/* Node 1:5750. The card carries a Get button, so the card itself is not a link — nesting the
          two would give the pill no reachable hit area of its own. */}
      <div className="hidden aspect-[179/85] w-full overflow-hidden rounded-2xl bg-section mobile:block">
        <div className="relative h-full w-full">
          {/*
            Node 1:5751, the mobile card's own artwork — exported at 3x (1074x510 for a 358x170 box).
            It is the whole card, not just the figure: the navy gradient, Zeus on the right and the
            violet shard at the bottom corner are all painted into it. That is why nothing here sets
            a background or a fade. An earlier pass cropped the desktop bitmap instead, which put the
            desktop's rocks and gold crown behind Zeus and had no shard at all.
          */}
          <Image
            src={HERO_BONUS_MOBILE}
            alt=""
            fill
            priority
            sizes="358px"
            className="pointer-events-none object-cover"
          />

          {/* Node 1:5752 padding 16, node 1:5753 adding 8 on the left. */}
          <div className="relative flex h-full flex-col justify-between p-4 pl-6">
            <div className="flex flex-col gap-4">
              {/* Node 1:5755 — two pills, where the desktop bitmap paints a single one. Their
                  metrics are `Badge`'s `xs` size, nodes 1:5756 / 1:5758. */}
              <div className="flex gap-1.5">
                <Badge size="xs" tone="blue">
                  {mobileEyebrow}
                </Badge>
                <Badge size="xs" tone="amber">
                  {mobileWager}
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.26px] text-primary">
                  {mobileAmount}
                </p>
                <p className="text-[13px] font-medium uppercase leading-4 text-caption">
                  {mobileSpinsPrefix}
                  <span className="font-bold text-primary">{mobileSpins}</span>
                </p>
              </div>
            </div>

            {getButton}
          </div>
        </div>
      </div>
    </section>
  )
}
