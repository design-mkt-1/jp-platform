/**
 * Money, countdown and identity formatting.
 *
 * The design uses two different money formats and mixing them is immediately visible:
 * the balance widget shows a symbol and fixed pennies ("£5,500.00"), while the recent-wins
 * ticker shows a suffix with the pennies trimmed ("41.04 GBP", "37.5 GBP", "20 GBP").
 * Both live here so no component reaches for `toFixed` on its own.
 */

/**
 * `en-GB` and not the visitor's locale: the design is a fixed English/GBP layout, and a
 * locale-dependent separator would silently change the width of every price on the page.
 */
const LOCALE = 'en-GB'

const symbolFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const suffixFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Balance widget, prize pills, jackpot tiers: "£5,500.00". */
export function formatGbp(amount: number): string {
  return symbolFormatter.format(amount)
}

/** Wins ticker and the promo pills: "41.04 GBP", "37.5 GBP", "20 GBP". */
export function formatGbpSuffix(amount: number): string {
  return `${suffixFormatter.format(amount)} GBP`
}

/**
 * Large pots read better abbreviated than as eight digits: "£1.25M", "£48.6K".
 * Falls back to the full format below a thousand.
 */
export function formatGbpCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `£${trimZeros(amount / 1_000_000)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `£${trimZeros(amount / 1_000)}K`
  }
  return formatGbp(amount)
}

function trimZeros(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

/** The promos are weekly, so a deadline that has passed is next due seven days later. */
const PERIOD_MS = 7 * 24 * 60 * 60 * 1000

/**
 * The next time `endsAt` comes round, as a timestamp strictly after `from` and at most a week
 * later.
 *
 * `tournaments.json` carries the Figma clock (nodes 1:3453 / 1:3545) and that date is now in the
 * past, which is why every banner read "00:00:00". The date stays as written — it is content — and
 * the recurrence is applied here instead, at read time. Rolling forward whole periods keeps the
 * deadline on the wall-clock minute and second the design draws.
 */
export function nextCountdownEnd(endsAt: string, from: number = Date.now()): number {
  const end = new Date(endsAt).getTime()
  if (end > from) return end
  // `+ 1` so a deadline exactly on `from` rolls to the next period rather than staying at zero.
  return end + Math.ceil((from - end + 1) / PERIOD_MS) * PERIOD_MS
}

/**
 * Seconds left on a countdown. Still clamped at zero: `nextCountdownEnd` cannot return the past,
 * but an unparseable date would otherwise count up through negative numbers.
 */
function remainingSeconds(endsAt: string, from: number): number {
  return Math.floor(Math.max(0, nextCountdownEnd(endsAt, from) - from) / 1000)
}

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * "08h : 12m : 36s" — the clock of nodes 1:3453 and 1:3545.
 *
 * Pure in `from`, so it formats the same value on the server, during hydration and on every tick
 * of `useCountdown`. The one-second drift between the server's snapshot and the client's first
 * frame is what `suppressHydrationWarning` at the call site still covers.
 */
export function formatCountdown(endsAt: string, from: number = Date.now()): string {
  const total = remainingSeconds(endsAt, from)
  return `${pad(Math.floor(total / 3600))}h : ${pad(Math.floor((total % 3600) / 60))}m : ${pad(
    total % 60,
  )}s`
}

/** "08:12:36" — the same instant as `formatCountdown`, in the bare form the mobile card draws. */
export function formatCountdownClock(endsAt: string, from: number = Date.now()): string {
  const total = remainingSeconds(endsAt, from)
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(
    total % 60,
  )}`
}

/**
 * "leonardo_bet" -> "le****et". Mirrors the masking already applied in the Figma ticker; it is a
 * display convenience only — the data files never carry an unmasked username.
 */
export function maskUsername(username: string): string {
  if (username.length <= 4) return `${username.slice(0, 1)}****`
  return `${username.slice(0, 2)}****${username.slice(-2)}`
}
