import { Fragment } from 'react'
import RecentWinItem from '../cards/RecentWinItem'
import { recentWins as ALL_WINS } from '@/lib/data'
import type { RecentWin } from '@/lib/types'

/**
 * The wins strip. Two frames, and they are not the same object:
 *
 * - Desktop, node 1:2439 — an 80px card inside the page inset: 1px border, 12px radius, 24px of
 *   padding, holding 216px entries separated by a 40px hairline at white 15% (node 1:2448).
 * - Mobile, node 21:3035 — a bare 66px band, full-bleed across the 390 frame, carrying its own
 *   16px of padding and no card at all. No border, no radius. Its hairline is 44px at white 8%
 *   (node 21:3043).
 *
 * So everything the card contributes is desktop chrome, and it is scoped off the phone here. The
 * strip used to paint all of it at 390: the same unscoped-desktop-frame shape as the cyan chip ring
 * and the rule under the header, both closed in session 10.
 *
 * The design overflows past the right edge in both frames — mobile's third entry ends at 482
 * against a 390 viewport — which is the whole point of a ticker: there is always more than fits.
 * That is reproduced as a horizontal scroll rail rather than a marquee: unlike the providers row,
 * this strip carries names and amounts, and moving text that cannot be paused is unreadable. The
 * overflow has to stay inside the rail — the page itself must never scroll sideways.
 *
 * The rail is focusable on purpose: a scroll container that only responds to a pointer strands
 * keyboard users in front of content they can see is there. Its focus ring pulls in to offset 0 on
 * mobile; offset 4 was sized for the desktop card's 24px padding and lands on the bare band's edge,
 * where `overflow-hidden` clips it.
 *
 * The rules between entries are drawn here rather than by `RecentWinItem`, whose own `withDivider`
 * hairline is `border-strong` (white 10%). Rendering them as siblings inside the same flex puts
 * them at the identical spacing.
 */

export interface RecentWinsTickerProps {
  wins?: RecentWin[]
  className?: string
}

export default function RecentWinsTicker({ wins = ALL_WINS, className }: RecentWinsTickerProps) {
  if (wins.length === 0) return null

  return (
    <section
      aria-label="Recent wins"
      className={['w-full px-page-x py-3 mobile:px-0', className].filter(Boolean).join(' ')}
    >
      <div
        className={[
          'mx-auto flex h-20 max-w-content items-center overflow-hidden rounded-xl px-6',
          'border border-solid border-card bg-card',
          // Node 21:3035: the phone draws the band itself, not a card sitting on one. `border-0`
          // rather than `border-none` so `border-solid` above is never a competing utility.
          'mobile:h-[66px] mobile:rounded-none mobile:border-0 mobile:px-4',
        ].join(' ')}
      >
        <div
          tabIndex={0}
          className={[
            'no-scrollbar flex min-w-0 flex-1 items-center gap-3.5 overflow-x-auto mobile:gap-3',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue',
            'mobile:focus-visible:outline-offset-0',
          ].join(' ')}
        >
          {wins.map((win, index) => (
            <Fragment key={win.id}>
              <RecentWinItem win={win} index={index} />
              {/* The last entry has no trailing rule; in Figma the final groups drop theirs too. */}
              {index < wins.length - 1 ? (
                <span
                  aria-hidden
                  className={[
                    'h-10 w-px shrink-0 border-l border-emphasis',
                    'mobile:h-11 mobile:border-medium',
                  ].join(' ')}
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
