import { describe, expect, it } from 'vitest'
import {
  countdownEndIso,
  formatCountdown,
  formatCountdownClock,
  nextCountdownEnd,
} from '@/lib/format'

/**
 * The clock of nodes 1:3453 and 1:3545, "08h : 12m : 36s", and the bare "08:12:36" the mobile card
 * draws.
 *
 * `from` is a parameter precisely so these can be pinned to a fixed instant instead of depending on
 * the clock of whoever runs the suite — the same property that lets the banner format the identical
 * string on the server and on every tick of `useCountdown`.
 */

const NOON = Date.parse('2026-09-09T12:00:00Z')
/** One recurrence of `PERIOD_MS`: the promos roll forward a day at a time, not a week. */
const DAY_MS = 24 * 60 * 60 * 1000

describe('formatCountdown', () => {
  it('writes the Figma format', () => {
    expect(formatCountdown('2026-09-09T20:12:36Z', NOON)).toBe('08h : 12m : 36s')
  })

  it('pads every field to two digits', () => {
    expect(formatCountdown('2026-09-09T13:02:05Z', NOON)).toBe('01h : 02m : 05s')
  })

  it('pads the hours at the top of a period, which is where the design draws two digits', () => {
    // The largest a *rolled* deadline can read under the 24-hour period, and the case the period
    // was shortened for: a day and a second stale, so it rolls twice and lands one second short of
    // a full period out. Two digits, which is the field nodes 1:3453 and 1:3545 draw.
    expect(formatCountdown('2026-09-08T11:59:59Z', NOON)).toBe('23h : 59m : 59s')
  })

  it('counts hours past a day rather than rolling over to days', () => {
    // Kept, and still reachable after the period was shortened: `nextCountdownEnd` only rolls a
    // deadline that has *passed*, so one seeded six days out is left where it is and reads 144h —
    // three digits where the design draws two. Nothing rolled can reach it any more (see the test
    // above, which caps at 23h), but the formatter still has to carry it.
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

  it('rolls a past deadline forward by whole periods, keeping the minute and second', () => {
    // The seeded value: just under a day before `from`, so one period puts it six hours after it,
    // on the 18:12:36 the design drew.
    const rolled = nextCountdownEnd('2026-09-08T18:12:36Z', NOON)

    expect(new Date(rolled).toISOString()).toBe('2026-09-09T18:12:36.000Z')
    expect(rolled - Date.parse('2026-09-08T18:12:36Z')).toBe(DAY_MS)
  })

  it('rolls forward as many periods as it takes, not just one', () => {
    // Three weeks stale, which is twenty-one periods: one would still leave it in the past.
    const rolled = nextCountdownEnd('2026-08-19T18:12:36Z', NOON)

    expect(new Date(rolled).toISOString()).toBe('2026-09-09T18:12:36.000Z')
    expect(rolled - Date.parse('2026-08-19T18:12:36Z')).toBe(21 * DAY_MS)
    expect(rolled).toBeGreaterThan(NOON)
    expect(rolled - NOON).toBeLessThanOrEqual(DAY_MS)
  })

  it('moves a deadline landing exactly on `from` to the next period rather than to zero', () => {
    const onTheDot = new Date(NOON).toISOString()

    expect(nextCountdownEnd(onTheDot, NOON)).toBe(NOON + DAY_MS)
  })

  it('never returns the past, so the clock cannot count backwards', () => {
    for (const seeded of ['2026-09-08T18:12:36Z', '2025-01-01T00:00:00Z', '2026-09-09T11:59:59Z']) {
      expect(nextCountdownEnd(seeded, NOON)).toBeGreaterThan(NOON)
    }
  })
})

/**
 * What the banners put in `<time dateTime>`. It used to be the raw seeded date, which is in the
 * past: the attribute a screen reader and a scraper read disagreed with the text beside it.
 */
describe('countdownEndIso', () => {
  it('publishes the rolled instant, not the date as seeded', () => {
    expect(countdownEndIso('2026-09-08T18:12:36Z', NOON)).toBe('2026-09-09T18:12:36.000Z')
  })

  it('agrees with the clock the banner draws beside it', () => {
    const seeded = '2026-09-08T18:12:36Z'

    // The gap between `from` and the published instant is the gap the visible text counts down.
    expect(Date.parse(countdownEndIso(seeded, NOON)) - NOON).toBe((6 * 3600 + 12 * 60 + 36) * 1000)
    expect(formatCountdown(seeded, NOON)).toBe('06h : 12m : 36s')
  })

  it('is constant across a period, so a per-second tick does not rewrite the attribute', () => {
    const seeded = '2026-09-08T18:12:36Z'

    expect(countdownEndIso(seeded, NOON + 1000)).toBe(countdownEndIso(seeded, NOON))
    expect(countdownEndIso(seeded, NOON + 6 * 3600_000)).toBe(countdownEndIso(seeded, NOON))
  })

  it('never publishes a deadline in the past', () => {
    for (const seeded of ['2026-09-08T18:12:36Z', '2025-01-01T00:00:00Z', '2026-09-09T11:59:59Z']) {
      expect(Date.parse(countdownEndIso(seeded, NOON))).toBeGreaterThan(NOON)
    }
  })

  it('falls back to the string as written rather than throwing on an unparseable date', () => {
    expect(countdownEndIso('not a date', NOON)).toBe('not a date')
  })
})
