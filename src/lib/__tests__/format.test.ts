import { describe, expect, it } from 'vitest'
import { formatGbp, formatGbpCompact, formatGbpSuffix, maskUsername } from '@/lib/format'

/**
 * The design uses two money formats side by side — "£5,500.00" in the balance widget, "41.04 GBP"
 * in the wins ticker — and swapping them is the kind of change that looks harmless in a diff and
 * obvious on screen. The expected strings below are the ones read off the Figma frames.
 */

describe('formatGbp', () => {
  it('writes the symbol and always two decimals', () => {
    expect(formatGbp(5500)).toBe('£5,500.00')
    expect(formatGbp(41.04)).toBe('£41.04')
    expect(formatGbp(0)).toBe('£0.00')
  })

  it('groups thousands the en-GB way regardless of the machine locale', () => {
    expect(formatGbp(1234567.5)).toBe('£1,234,567.50')
  })
})

describe('formatGbpSuffix', () => {
  it('trims trailing pennies instead of padding them', () => {
    expect(formatGbpSuffix(41.04)).toBe('41.04 GBP')
    expect(formatGbpSuffix(37.5)).toBe('37.5 GBP')
    expect(formatGbpSuffix(20)).toBe('20 GBP')
  })
})

describe('formatGbpCompact', () => {
  it('abbreviates millions and thousands', () => {
    expect(formatGbpCompact(1_250_000)).toBe('£1.25M')
    expect(formatGbpCompact(1_000_000)).toBe('£1M')
    expect(formatGbpCompact(48_600)).toBe('£48.6K')
  })

  it('falls back to the full format below a thousand', () => {
    expect(formatGbpCompact(999)).toBe('£999.00')
  })

  it('keeps the abbreviation for negative pots too', () => {
    // `Math.abs` in the guard means the sign has to survive the division, not the comparison.
    expect(formatGbpCompact(-2_000_000)).toBe('£-2M')
  })
})

describe('maskUsername', () => {
  it('keeps two characters at each end', () => {
    expect(maskUsername('leonardo_bet')).toBe('le****et')
  })

  it('keeps only the first character of a short name', () => {
    expect(maskUsername('abcd')).toBe('a****')
    expect(maskUsername('a')).toBe('a****')
  })
})
