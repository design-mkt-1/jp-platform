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

/**
 * Seconds left on a countdown, clamped at zero so a stale data file counts down to "00" rather
 * than up through negative numbers.
 */
function remainingSeconds(endsAt: string, from: number): number {
  return Math.floor(Math.max(0, new Date(endsAt).getTime() - from) / 1000)
}

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * "08h : 12m : 36s" — the clock of nodes 1:3453 and 1:3545.
 *
 * A snapshot, not a live timer: the banner is a server component, and a ticking clock would either
 * force it to the client or hydrate against a value a second older than the server's.
 * `suppressHydrationWarning` at the call site covers that one-second drift.
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
