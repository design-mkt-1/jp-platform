'use client'

import Image from 'next/image'
import Badge from '../primitives/Badge'
import Button from '../primitives/Button'
import { PROMO_BANNERS } from '@/lib/assets'
import { formatCountdown } from '@/lib/format'
import { useCountdown } from '@/lib/useCountdown'
import type { PromoBannerData, PromoPill, PromoVariant } from '@/lib/types'

/**
 * The three 1280x260 promo rows — TournamentBanner (1:3436), LotteryCard (1:3532) and
 * WheelCard (1:3587) — as one component with three variants.
 *
 * They are not three components because they are not three layouts: identical frame, identical
 * border and radius, identical left title block, identical right column ending in the same
 * 180x44 gold button. Only the middle of each column differs, so the variants branch there and
 * nowhere else. Three files would have meant fixing the same padding bug three times.
 *
 * Everything the design draws lives in `PromoBannerData` — including the wheel's stat rows — so a
 * page can render a banner from the data file alone. The props below still win when passed: a
 * screen that wants to override one label should not have to clone the whole record.
 *
 * The three variants keep the same skeleton but not the same rhythm; Figma spaces each one
 * differently, so the gaps that differ are class maps keyed by variant rather than branches.
 */

export type { PromoPill }

/** Title to subtitle: 6 in the tournament (1:3442), 12 in lottery (1:3534) and wheel (1:3589). */
const TITLE_GAP: Record<PromoVariant, string> = {
  tournament: 'gap-1.5',
  lottery: 'gap-3',
  wheel: 'gap-3',
}

/** Subtitle to pills: 16 in the tournament (1:3445), 12 in the lottery (1:3537). */
const LEFT_GAP: Record<PromoVariant, string> = {
  tournament: 'gap-4',
  lottery: 'gap-3',
  wheel: 'gap-4',
}

/** Between pills: 12 in the tournament (1:3445), 8 in the lottery (1:3537). */
const PILL_GAP: Record<PromoVariant, string> = {
  tournament: 'gap-3',
  lottery: 'gap-2',
  wheel: 'gap-3',
}

/** Timer or stats to the button: 20 (1:3451), 16 (1:3543), 24 (1:3593). */
const RIGHT_GAP: Record<PromoVariant, string> = {
  tournament: 'gap-5',
  lottery: 'gap-4',
  wheel: 'gap-6',
}

/**
 * The wheel's subtitle wraps to the width of its own title (1:3591 is min-content inside a 280px
 * column), where the other two run wider than theirs — so the min-content rule is not general.
 */
const SUBTITLE_WIDTH: Record<PromoVariant, string> = {
  tournament: 'max-w-[420px]',
  lottery: 'max-w-[420px]',
  wheel: 'w-min min-w-full',
}

export interface PromoBannerProps {
  data: PromoBannerData
  /** Overrides `data.eyebrow`: the amber dot plus caption above the title (node 1:3441). */
  eyebrow?: string
  /** Overrides `data.pills`: the pills under the subtitle. */
  pills?: PromoPill[]
  /** Overrides `data.timerLabel`. Without a label and a clock the timer is not rendered. */
  timerLabel?: string
  /** Pre-formatted countdown. Omit and it is derived from `data.endsAt`. */
  timer?: string
  priority?: boolean
  className?: string
}

export default function PromoBanner({
  data,
  eyebrow,
  pills,
  timerLabel,
  timer,
  priority = false,
  className,
}: PromoBannerProps) {
  // Keyed by variant rather than read from `data.image`. The two now agree file for file, but
  // `src/lib/assets.ts` stays the one place that turns an asset name into a URL — a data file that
  // can name a path is a data file that can name a 404.
  const background = PROMO_BANNERS[data.variant]
  const isWheel = data.variant === 'wheel'

  const bannerEyebrow = eyebrow ?? data.eyebrow
  const bannerPills = pills ?? data.pills
  const stats = data.stats
  const clockLabel = timerLabel ?? data.timerLabel
  // A client component for one reason: the clock. Everything else here is static, but a countdown
  // rendered once on the server is a countdown that reads "00:00:00" the day after the deploy.
  const live = useCountdown(data.endsAt, formatCountdown)
  const clock = timer ?? live

  return (
    <section
      aria-label={data.title}
      className={[
        'relative flex min-h-[260px] w-full items-stretch justify-between overflow-hidden',
        'rounded-3xl border border-solid border-medium bg-card',
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
        sizes="(max-width: 767px) 100vw, 1280px"
        className="object-cover"
      />

      {/* Left column: eyebrow, titles, pills. */}
      <div
        className={`relative flex flex-col items-start justify-center p-8 ${
          LEFT_GAP[data.variant]
        }`}
      >
        {bannerEyebrow ? (
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-amber">
            <span aria-hidden className="size-2 rounded-full bg-amber" />
            {bannerEyebrow}
          </p>
        ) : null}

        <div className={`flex flex-col ${TITLE_GAP[data.variant]}`}>
          {/*
            39px, not `leading-none`. All three titles are 32px text in a 39px box in Figma — nodes
            1:3443, 1:3535 and 1:3590 all measure it — and a 32px box is 7px short. Because the
            column is centred, that shortfall does not shrink the title, it lifts everything under
            it: measured on the lottery banner, the subtitle sat 5.5px and the pills 2.5px above
            where node 1:3532 draws them.
          */}
          <h2 className="text-[32px] font-black leading-[39px] text-primary">{data.title}</h2>
          <p
            className={`text-sm text-muted ${SUBTITLE_WIDTH[data.variant]} ${
              // The tournament subtitle is sentence case in Figma; lottery and wheel are caps.
              data.variant === 'tournament' ? '' : 'uppercase'
            }`}
          >
            {data.subtitle}
          </p>
        </div>

        {bannerPills && bannerPills.length > 0 ? (
          <div className={`flex flex-wrap ${PILL_GAP[data.variant]}`}>
            {bannerPills.map((pill) => (
              <Badge
                key={pill.label}
                tone={pill.tone ?? 'neutral'}
                size={data.variant === 'lottery' ? 'sm' : 'md'}
              >
                {pill.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {/* Right column: timer or stats, then the call to action. */}
      <div
        className={`relative flex flex-col justify-center p-8 ${RIGHT_GAP[data.variant]} ${
          isWheel ? 'items-center' : 'items-end'
        }`}
      >
        {stats && stats.length > 0 ? (
          <ul className="flex w-full flex-col gap-[9px]">
            {stats.map((stat) => (
              // Nodes 1:3594–1:3600 sit on the same amber tenth as the warning pills, not on the
              // white tint the rest of the elevated surfaces use. The row is 34 tall, which is
              // Figma's 22px line box inside 6px of padding — not `text-lg`'s own 28px leading.
              <li
                key={stat.label}
                className={
                  'flex gap-1.5 rounded-[9px] bg-amber-tint px-3 py-1.5 text-lg leading-[22px]'
                }
              >
                <span className="font-medium text-label">{stat.label}</span>
                <span className="font-bold text-amber">{stat.value}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {clockLabel && clock ? (
          <div
            className={
              // Lottery puts label and clock on one line (node 1:3543); the tournament stacks them.
              data.variant === 'lottery'
                ? 'flex items-center gap-2'
                : 'flex flex-col items-end gap-1'
            }
          >
            <span className="text-xs text-muted">{clockLabel}</span>
            {/* Still suppressed, and measured: the server snapshot and the client's first frame
                are a second apart on about one load in three, which React reports as a hydration
                error. `useCountdown` overwrites the text on mount either way. */}
            <time
              {...(data.endsAt ? { dateTime: data.endsAt } : {})}
              suppressHydrationWarning
              className={`font-extrabold text-primary ${
                data.variant === 'lottery' ? 'text-base' : 'text-2xl'
              }`}
            >
              {clock}
            </time>
          </div>
        ) : null}

        <Button href={data.ctaHref} variant="primaryGold" className="h-11 w-[180px] uppercase">
          {data.ctaLabel}
        </Button>
      </div>
    </section>
  )
}
