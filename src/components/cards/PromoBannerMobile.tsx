'use client'

import Image from 'next/image'
import Link from 'next/link'
import Button from '../primitives/Button'
import { PROMO_BANNERS } from '@/lib/assets'
import { formatCountdownClock } from '@/lib/format'
import { useCountdown } from '@/lib/useCountdown'
import type { PromoBannerData, PromoVariant } from '@/lib/types'

/**
 * The mobile twin of `PromoBanner` — nodes 1:6195 (tournament), 1:6247 (lottery) and 1:6282
 * (wheel) of the `mob main` frames.
 *
 * A separate component rather than a set of `mobile:` overrides on `PromoBanner`, because the two
 * are not the same layout squeezed: the desktop banner is a 1280x260 two-column frame whose right
 * column ends in a 180x44 button, and this is a 358x220 single column with the call to action
 * folded into a pill beside the countdown. Every box, every type size and the reading order
 * differ. One component drawing both would have needed a `mobile:` override on nearly every class
 * — and rendering the desktop one at 390 is what clipped the button off the right edge to begin
 * with.
 *
 * Two layouts live here, not three: tournament and lottery are the same card (1:6250) with
 * different copy, and only the wheel (1:6464) differs — stats at the top, a centred line of copy
 * and a full-width button, and no title at all.
 */

/**
 * A deliberate approximation, and the only value on this card eyeballed against the render rather
 * than read out of Figma.
 *
 * Figma crops each card to its own window — 1:6249 draws the source at 391% and pans it left — but
 * that crop cannot be reproduced, because the frame is fed a different, wider export of the scene:
 * its render is 4:1 where our banner is 1280x260, or 4.92:1. Covering a 358x220 box with ours
 * means scaling to 0.85 and showing 33% of its width, so the character comes out larger than the
 * design draws it, and nothing in `object-position` can shrink it. What the crop can still choose
 * is *which* 33%, and each banner wants a different one. All three are panned so the dark left of
 * the scene lands under the text and the artwork lands to its right — the tournament and lottery
 * under their titles, the wheel under its stat pills, which are the least legible thing on the
 * page over lit artwork. One shared number either buried the title under Zeus or put the wheel
 * behind the pills.
 */
const ARTWORK_POSITION: Record<PromoVariant, string> = {
  tournament: 'object-[40%_50%]',
  lottery: 'object-[36%_50%]',
  wheel: 'object-[44%_50%]',
}

export interface PromoBannerMobileProps {
  data: PromoBannerData
  priority?: boolean
  className?: string
}

export default function PromoBannerMobile({
  data,
  priority = false,
  className,
}: PromoBannerMobileProps) {
  const background = PROMO_BANNERS[data.variant]
  const isWheel = data.variant === 'wheel'

  return (
    <section
      aria-label={data.title}
      className={[
        'relative h-[220px] w-full flex-col justify-end overflow-hidden',
        'rounded-[24px] border border-solid border-medium bg-card',
        // No display class of its own: the caller decides, with `hidden mobile:flex`.
        isWheel ? 'px-5 pb-4 pt-5' : 'p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image
        src={background}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover ${ARTWORK_POSITION[data.variant]}`}
      />

      {/*
       * A scrim, on the two cards that write over the scene and not on the wheel.
       *
       * The text was never painted *under* the artwork — `document.elementFromPoint` at the end
       * of the lottery subtitle's first line returns its `<p>`, not the `<img>` — so this is not
       * a z-order fix and a `z-10` on the text would have changed nothing. It is contrast. The
       * lottery copy is long enough that "now" lands on the lit phone in the middle of the
       * scene, where `text-subtitle` measured 1.68:1 against its own local background at 390.
       * Neither of the other two dials moves: the crop is fixed (see `ARTWORK_POSITION`) and the
       * 190px column cannot narrow without `line-clamp-2` eating "open".
       *
       * An ellipse anchored to the left edge, 400 wide against a 358 card so that the fade is
       * still running when it reaches the right edge and never draws a line of its own. Sitting
       * here, between the image and the body, it needs no z-index at all — it precedes both the
       * text and the join pill in the paint order, which is what a version bounded to the text
       * column could not do: at 106px tall on the lottery card and 140px on the tournament, it
       * either seamed under the subtitle or greyed out the pill.
       *
       * The wheel is excluded by owner decision (node 1:6282, do not touch), and it is the one
       * card that does not need it: its copy is amber on the dark left of its own crop.
       */}
      {isWheel ? null : (
        <div
          aria-hidden
          className={[
            'absolute inset-y-0 left-0 w-[400px]',
            'bg-[radial-gradient(100%_100%_at_0%_50%,var(--bg-card)_45%,transparent_100%)]',
          ].join(' ')}
        />
      )}

      {isWheel ? <WheelBody data={data} /> : <TournamentBody data={data} />}
    </section>
  )
}

/** Nodes 1:6250–1:6260: the title block at the top, the join-and-countdown pill at the bottom. */
function TournamentBody({ data }: { data: PromoBannerData }) {
  // Ticks on the client; see `useCountdown`. Server-rendered once, this card froze at "00:00:00".
  const clock = useCountdown(data.endsAt, formatCountdownClock)

  return (
    // Figma measures this column at 180 outside a border it draws inside the frame; ours is a
    // border-box 220 less two 1px edges and two 20px insets, so it renders 178. The 2px is spent
    // on the hairline the design draws too, not lost.
    <div className="relative flex h-[180px] w-full flex-col justify-between">
      <div className="flex w-[190px] flex-col gap-1.5">
        {/*
         * `leading-[normal]` and not `leading-normal`: Tailwind's named token is 1.5, where Figma's
         * "normal" is the font's own metric, about 1.21 for Inter. Over a 28px title of three lines
         * that difference is 24px, which is what pushed the pill off the bottom of the card.
         */}
        <h3 className="text-[28px] font-bold leading-[normal] tracking-[-0.5px] text-amber">
          {data.title}
        </h3>
        {/*
         * Clamped, and the one place this card refuses the data as given. Figma's subtitle is a
         * single line ("Best Slots, Huge Wins!!"); the tournament's real copy is 51 characters and
         * wraps to three inside the design's 190px column, which puts the pill 9px past the 220 the
         * card is fixed at — the button falling off the bottom, exactly as it fell off the right
         * edge before this component existed. Two lines is what the column has room for once the
         * title has taken three, and the clamp says so on screen with an ellipsis rather than
         * quietly slicing a third line in half.
         */}
        <p className="line-clamp-2 text-[13px] font-medium leading-[normal] text-subtitle">
          {data.subtitle}
        </p>
      </div>

      {/* Node 1:6255. The 2px left inset is what lets the inner button sit flush in the pill. */}
      <div className="flex h-[34px] w-fit items-center gap-2 rounded-[20px] bg-amber-soft pl-0.5 pr-2.5">
        {/*
         * Node 1:6256 is a flat amber fill, where every `Button` variant we own is a gradient or a
         * tint. Reusing `primaryGold` would mean cancelling its gradient, its glow and its hover
         * glow — three fights over `background-image` and `box-shadow` settled by stylesheet order
         * rather than by the class list. A link carrying the design's own five properties is
         * shorter and cannot lose that fight; the focus ring is copied from Button so keyboard
         * users still get the same affordance.
         */}
        <Link
          href={data.ctaHref}
          className={[
            'inline-flex h-[30px] items-center rounded-[20px] bg-amber px-5',
            'whitespace-nowrap text-[13px] font-bold tracking-[-0.26px] text-ink',
            'transition-[filter] duration-150 hover:brightness-110 active:brightness-90',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
          ].join(' ')}
        >
          {/* Figma writes "Join Now"; the data file's caps label is what both viewports render. */}
          {data.ctaLabel}
        </Link>

        {clock ? (
          <>
            {/*
             * Node 1:6257: a 16px rule in the same ink at 15%. The theme stores finished colours
             * rather than RGB channels (see Button.tsx), so the alpha is an opacity on the rule
             * itself — one class, against a fourth colour token used exactly once.
             */}
            <span aria-hidden className="h-4 w-px bg-ink opacity-15" />
            <span className="flex items-center gap-1 whitespace-nowrap">
              {/* Figma labels both cards "Time left". `data.timerLabel` carries the longer desktop
                  wording ("Draw ends in:") that a 34px pill has no room for. */}
              <span className="text-[10px] leading-[normal] text-ink opacity-80">Time left</span>
              {/* Figma writes four groups, "08:12:36:35"; `formatCountdownClock` gives the three
                  the rest of the site counts in — hours, minutes, seconds. */}
              <time
                dateTime={data.endsAt}
                suppressHydrationWarning
                className="text-[11px] font-extrabold leading-[normal] text-ink"
              >
                {clock}
              </time>
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}

/** Nodes 1:6464–1:6479: the stat pills, the centred line of copy and the full-width button. */
function WheelBody({ data }: { data: PromoBannerData }) {
  const stats = data.stats ?? []

  return (
    // The 16px bottom inset is Figma's own, drawn there as a stray 16px hairline below the button
    // (node 1:6480, zero wide and so invisible) that reserves the space in the frame. A padding
    // says the same thing without shipping a rule nobody can see.
    <div className="relative flex h-[178px] w-full flex-col justify-between">
      <ul className="flex flex-col items-start gap-1.5">
        {stats.map((stat) => (
          // Node 1:6467: the same amber tenth the desktop banner's stat rows sit on, in mobile's
          // smaller box — 8/4 of padding around a 12px line, not the desktop 12/6 around 22px.
          <li
            key={stat.label}
            className="flex gap-1 rounded-md bg-amber-tint px-2 py-1 text-xs leading-[normal]"
          >
            <span className="font-medium text-label">{stat.label}</span>
            <span className="font-bold text-amber">{stat.value}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        {/* Node 1:6478, which is also the whole of this card's copy: the mobile wheel drops the
            "2000 FREE SPINS" title the desktop banner leads with. Figma's own text reads
            "EVERY DAT"; the data file's "everyday" is what ships. */}
        <p className="w-full text-center text-[18px] font-bold uppercase leading-[normal] tracking-[-0.5px] text-amber">
          {data.subtitle}
        </p>

        {/* Node 1:6479 is the gold gradient under its 0 4px 6px gold/25% shadow — `primaryGold`
            exactly, at 34 tall and full width instead of the desktop 44 by 180. */}
        <Button
          href={data.ctaHref}
          variant="primaryGold"
          className="h-[34px] w-full py-0 text-[13px] font-bold tracking-[-0.26px]"
        >
          {data.ctaLabel}
        </Button>
      </div>
    </div>
  )
}
