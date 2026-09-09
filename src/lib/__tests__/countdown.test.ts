import { describe, expect, it } from 'vitest'
import { formatCountdown, formatCountdownClock, nextCountdownEnd } from '@/lib/format'

/**
 * The clock of nodes 1:3453 and 1:3545, "08h : 12m : 36s", and the bare "08:12:36" the mobile card
 * draws.
 *
 * `from` is a parameter precisely so these can be pinned to a fixed instant instead of depending on
 * the clock of whoever runs the suite — the same property that lets the banner format the identical
 * string on the server and on every tick of `useCountdown`.
 */

const NOON = Date.parse('2026-09-09T12:00:00Z')
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

describe('formatCountdown', () => {
  it('writes the Figma format', () => {
    expect(formatCountdown('2026-09-09T20:12:36Z', NOON)).toBe('08h : 12m : 36s')
  })

  it('pads every field to two digits', () => {
    expect(formatCountdown('2026-09-09T13:02:05Z', NOON)).toBe('01h : 02m : 05s')
  })

  it('counts hours past a day rather than rolling over to days', () => {
    // Six days out reads as 144h — three digits where the design draws two. Nothing in the demo
    // data reaches that, but the format is what it is.
    expect(formatCountdown('2026-09-15T12:00:00Z', NOON)).toBe('144h : 00m : 00s')
  })

  it('truncates the leftover milliseconds instead of rounding up', () => {
    expect(formatCountdown('2026-09-09T12:00:01.900Z', NOON)).toBe('00h : 00m : 01s')
  })
})

describe('formatCountdownClock', () => {
  it('is the same instant without the unit letters', () => {
    expect(formatCountdownClock('2026-09-09T20:12:36Z', NOON)).toBe('08:12:36')
  })
})

/**
 * The seeded deadlines in `tournaments.json` are the ones Figma drew, and they are in the past.
 * Without the roll-forward every banner reads all zeros, which is what the deployed build showed.
 */
describe('nextCountdownEnd', () => {
  it('leaves a future deadline exactly where it is', () => {
    const future = '2026-09-09T20:12:36Z'

    expect(nextCountdownEnd(future, NOON)).toBe(Date.parse(future))
  })

  it('rolls a past deadline forward by whole weeks, keeping the minute and second', () => {
    // The seeded value: one day before `from`, so it lands six days after it.
    const rolled = nextCountdownEnd('2026-09-08T18:12:36Z', NOON)

    expect(new Date(rolled).toISOString()).toBe('2026-09-15T18:12:36.000Z')
    expect(rolled - Date.parse('2026-09-08T18:12:36Z')).toBe(WEEK_MS)
  })

  it('rolls forward as many weeks as it takes, not just one', () => {
    // Three weeks stale: one period would still leave it in the past.
    const rolled = nextCountdownEnd('2026-08-19T18:12:36Z', NOON)

    expect(rolled).toBeGreaterThan(NOON)
    expect(rolled - NOON).toBeLessThanOrEqual(WEEK_MS)
  })

  it('moves a deadline landing exactly on `from` to the next period rather than to zero', () => {
    const onTheDot = new Date(NOON).toISOString()

    expect(nextCountdownEnd(onTheDot, NOON)).toBe(NOON + WEEK_MS)
  })

  it('never returns the past, so the clock cannot count backwards', () => {
    for (const seeded of ['2026-09-08T18:12:36Z', '2025-01-01T00:00:00Z', '2026-09-09T11:59:59Z']) {
      expect(nextCountdownEnd(seeded, NOON)).toBeGreaterThan(NOON)
    }
  })
})
