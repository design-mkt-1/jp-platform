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
 * Mobile — node 21:2926, a 358x170 card inside the 16px inset, 16px radius. It is a genuinely
 * different layout, not the desktop one reduced: two separate pills instead of one, the amount and
 * the spins on two lines, sentence-case "Get", and the art cropped tall on the right. Here the text
 * is *not* baked into the artwork, so it is real DOM — which is also the only way it can be read at
 * 390px without the desktop headline turning into six illegible pixels.
 *
 * The two compositions have their own exports — node 21:2927 is the mobile card's own artwork, not a
 * crop of the desktop bitmap — and both are always in the DOM, with CSS hiding one. Which one the
 * browser actually downloads is decided by the two media-scoped preloads below rather than by
 * `priority`; see the note there.
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
  /** Mobile-only copy (node 21:2926), where the words differ from the desktop bitmap. */
  mobileEyebrow?: string
  mobileWager?: string
  /** The 26px line, node 21:2937 — `Bonus-Title`, 318x31. */
  mobileAmount?: string
  /** Node 21:2938 (`Bonus-Subtitle`), split so only the second half is white. */
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
      /*
       * `loading="lazy"` on a hero, and the media-scoped preload above, are one decision.
       *
       * Both compositions are always in the DOM and CSS hides one of them. This used to carry
       * `priority`, which emits a `<link rel="preload">` that nothing gates by viewport — so every
       * phone downloaded the 575 KB desktop banner it never shows, and every desktop the 559 KB
       * mobile one. `lazy` is what stops that: the hidden twin has no layout box, never intersects
       * the viewport, and is never fetched. The preload then gives the visible one the head start
       * `priority` used to give it, without also fetching its twin.
       *
       * Measured on the built export at 390 and at 1440: one hero file per viewport, and it is the
       * right one.
       */
      loading="lazy"
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
    // Node 21:2939: 97x32, Inter Semi Bold 13 / 19 at -0.26px tracking, and a *violet* glow —
    // `drop-shadow: 0 0 10px #3030D6`, not a tint of the button's own blue. Written as a
    // box-shadow because that is how every other glow in this codebase is written and the two are
    // indistinguishable on a solid `rounded-full` pill. The fill stays `bg-blue` (#006EE6 rather
    // than Figma's #007AFF) — the owner's contrast decision of 2026-09-08, docs/tokens.md:325.
    <span
      className="inline-flex h-8 w-[97px] items-center justify-center rounded-full bg-blue text-[13px] font-semibold leading-[19px] tracking-[-0.26px] text-primary shadow-[0_0_10px_var(--violet-glow)]"
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
      {/*
        The hero is the largest thing above the fold on both viewports, so it still gets a head
        start — but only the composition that will actually be shown. React hoists these into
        <head> and keeps the `media` attribute; verified in the built export. The 768px boundary is
        the one Tailwind draws: `mobile` is `max-width: 767px` in tailwind.config.ts, so if that
        moves, these two queries move with it.
      */}
      <link rel="preload" as="image" href={HERO_BONUS} media="(min-width: 768px)" />
      <link rel="preload" as="image" href={HERO_BONUS_MOBILE} media="(max-width: 767px)" />

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

      {/* Node 21:2926. The card carries a Get button, so the card itself is not a link — nesting
          the two would give the pill no reachable hit area of its own. */}
      <div className="hidden aspect-[179/85] w-full overflow-hidden rounded-2xl bg-section mobile:block">
        <div className="relative h-full w-full">
          {/*
            Node 21:2927, the mobile card's own artwork — exported at 3x (1074x510 for a 358x170
            box). It is the whole card, not just the figure: the navy ground, Zeus on the right and
            the violet shard at the bottom *right* corner are all painted into it. That is why
            nothing here sets a background or a fade. An earlier pass cropped the desktop bitmap
            instead, which put the desktop's rocks and gold crown behind Zeus and had no shard.

            The corner is named because this comment used to say only "the bottom corner", and that
            sent a reader looking in the wrong place. Sampled with `sharp` on 2026-09-10, in card
            coordinates: the shard occupies x 303-357, y 110-169 — brightest pixel rgb(206,126,240)
            at (316,161) — while the bottom-*left* 60x40 is a flat #050C1C with nothing in it.
          */}
          <Image
            src={HERO_BONUS_MOBILE}
            alt=""
            fill
            /* Lazy for the same reason as the desktop artwork above: on a desktop viewport this
               block is display:none, and only a lazy image stays unfetched inside one. */
            loading="lazy"
            sizes="358px"
            className="pointer-events-none object-cover"
          />

          {/* Node 21:2929 (`Label-Stack`) insets 16, node 21:2930 adds 8 on the left. */}
          <div className="relative flex h-full flex-col justify-between p-4 pl-6">
            <div className="flex flex-col gap-4">
              {/* Node 21:2931 (`Tag-Row`, 158x18) — two pills, where the desktop bitmap paints a
                  single one. Their metrics are `Badge`'s `xs` size, nodes 21:2932 / 21:2934, and
                  the 6px between them is the row's own gap. */}
              <div className="flex gap-1.5">
                <Badge size="xs" tone="blue">
                  {mobileEyebrow}
                </Badge>
                <Badge size="xs" tone="wager">
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
