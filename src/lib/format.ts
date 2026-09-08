/**
 * Money and identity formatting.
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
 * "leonardo_bet" -> "le****et". Mirrors the masking already applied in the Figma ticker; it is a
 * display convenience only — the data files never carry an unmasked username.
 */
export function maskUsername(username: string): string {
  if (username.length <= 4) return `${username.slice(0, 1)}****`
  return `${username.slice(0, 2)}****${username.slice(-2)}`
}
