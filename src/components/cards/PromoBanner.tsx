import Image from 'next/image'
import Badge from '../primitives/Badge'
import Button from '../primitives/Button'
import { PROMO_BANNERS } from '@/lib/assets'
import type { PromoBannerData, PromoPill } from '@/lib/types'

/**
 * The three 1280x260 promo rows — TournamentBanner (1:3436), LotteryCard (1:3532) and
 * WheelCard (1:3587) — as one component with three variants.
 *
 * They are not three components because they are not three layouts: identical frame, identical
 * border and radius, identical left title block, identical right column ending in the same
 * 180x44 gold button. Only the middle of each column differs, so the variants branch there and
 * nowhere else. Three files would have meant fixing the same padding bug three times.
 *
 * Everything the design draws now lives in `PromoBannerData`, so a page can render a banner from
 * the data file alone. The props below still win when passed — a screen that wants to override one
 * label should not have to clone the whole record.
 */

export type { PromoPill }

/** Label/value rows of the wheel's right column (nodes 1:3594–1:3602). */
export interface PromoStat {
  label: string
  value: string
}

/**
 * "08h : 12m : 36s" — the clock of nodes 1:3453 and 1:3545.
 *
 * A snapshot, not a live timer: this is a server component, and a ticking clock would either force
 * the whole banner to the client or hydrate against a value a second older than the server's.
 * `suppressHydrationWarning` at the call site covers that one-second drift.
 */
export function formatCountdown(endsAt: string, from: number = Date.now()): string {
  const remaining = Math.max(0, new Date(endsAt).getTime() - from)
  const totalSeconds = Math.floor(remaining / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`
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
  // Keyed by variant rather than read from `data.image`. The two now agree file for file, but
  // `src/lib/assets.ts` stays the one place that turns an asset name into a URL — a data file that
  // can name a path is a data file that can name a 404.
  const background = PROMO_BANNERS[data.variant]
  const isWheel = data.variant === 'wheel'

  const bannerEyebrow = eyebrow ?? data.eyebrow
  const bannerPills = pills ?? data.pills
  const clockLabel = timerLabel ?? data.timerLabel
  const clock = timer ?? (data.endsAt ? formatCountdown(data.endsAt) : undefined)

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
        {bannerEyebrow ? (
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-amber">
            <span aria-hidden className="size-2 rounded-full bg-amber" />
            {bannerEyebrow}
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

        {bannerPills && bannerPills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
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
        className={`relative flex flex-col justify-center gap-5 p-8 ${
          isWheel ? 'items-center' : 'items-end'
        }`}
      >
        {stats && stats.length > 0 ? (
          <ul className="flex w-full flex-col gap-2">
            {stats.map((stat) => (
              // Nodes 1:3594–1:3600 sit on the same amber tenth as the warning pills, not on the
              // white tint the rest of the elevated surfaces use.
              <li
                key={stat.label}
                className="flex gap-1.5 rounded-[9px] bg-amber-tint px-3 py-1.5 text-lg"
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
