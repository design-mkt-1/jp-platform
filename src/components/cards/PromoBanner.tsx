import Image from 'next/image'
import Badge from '../primitives/Badge'
import Button from '../primitives/Button'
import { PROMO_BANNERS } from '@/lib/assets'
import type { PromoBannerData } from '@/lib/types'

/**
 * The three 1280x260 promo rows — TournamentBanner (1:3436), LotteryCard (1:3532) and
 * WheelCard (1:3587) — as one component with three variants.
 *
 * They are not three components because they are not three layouts: identical frame, identical
 * border and radius, identical left title block, identical right column ending in the same
 * 180x44 gold button. Only the middle of each column differs, so the variants branch there and
 * nowhere else. Three files would have meant fixing the same padding bug three times.
 */

export interface PromoPill {
  label: string
  tone?: 'amber' | 'neutral'
}

/** Label/value rows of the wheel's right column (nodes 1:3594–1:3602). */
export interface PromoStat {
  label: string
  value: string
}

export interface PromoBannerProps {
  data: PromoBannerData
  /** Tournament only: the amber dot plus caption above the title (node 1:3441). */
  eyebrow?: string
  /** Tournament and lottery: the pills under the subtitle. */
  pills?: PromoPill[]
  /** "Time left to join" / "Draw ends in:". Omit to hide the timer entirely. */
  timerLabel?: string
  /** Pre-formatted countdown, e.g. "08h : 12m : 36s". */
  timer?: string
  /** Wheel only: the stacked ticket/winner/spin rows. */
  stats?: PromoStat[]
  priority?: boolean
  className?: string
}

export default function PromoBanner({
  data,
  eyebrow,
  pills,
  timerLabel,
  timer,
  stats,
  priority = false,
  className,
}: PromoBannerProps) {
  // Keyed by variant rather than read from `data.image`: the JSON still points at
  // /images/promos/, a directory that was never exported. See the report's change request.
  const background = PROMO_BANNERS[data.variant]
  const isWheel = data.variant === 'wheel'

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
      <div className="relative flex flex-col justify-center gap-4 p-8">
        {eyebrow ? (
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-amber">
            <span aria-hidden className="size-2 rounded-full bg-amber" />
            {eyebrow}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <h2 className="text-[32px] font-black leading-none text-primary">{data.title}</h2>
          <p
            className={`max-w-[420px] text-sm text-muted ${
              // The tournament subtitle is sentence case in Figma; lottery and wheel are caps.
              data.variant === 'tournament' ? '' : 'uppercase'
            }`}
          >
            {data.subtitle}
          </p>
        </div>

        {pills && pills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {pills.map((pill) => (
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
        className={`relative flex flex-col justify-center gap-5 p-8 ${
          isWheel ? 'items-center' : 'items-end'
        }`}
      >
        {stats && stats.length > 0 ? (
          <ul className="flex w-full flex-col gap-2">
            {stats.map((stat) => (
              <li
                key={stat.label}
                className="flex gap-1.5 rounded-[9px] bg-elevated px-3 py-1.5 text-lg"
              >
                <span className="font-medium text-label">{stat.label}</span>
                <span className="font-bold text-amber">{stat.value}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {timerLabel && timer ? (
          <div
            className={
              // Lottery puts label and clock on one line (node 1:3543); the tournament stacks them.
              data.variant === 'lottery'
                ? 'flex items-center gap-2'
                : 'flex flex-col items-end gap-1'
            }
          >
            <span className="text-xs text-muted">{timerLabel}</span>
            <time
              className={`font-extrabold text-primary ${
                data.variant === 'lottery' ? 'text-base' : 'text-2xl'
              }`}
            >
              {timer}
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
