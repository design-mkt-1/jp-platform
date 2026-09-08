import { Fragment } from 'react'
import RecentWinItem from '../cards/RecentWinItem'
import recentWinsData from '@/data/recentWins.json'
import type { RecentWin } from '@/lib/types'

/**
 * The wins strip of Figma node 1:2438: an 80px card inside the page inset, holding 216px entries
 * separated by a 40px hairline (nodes 1:2440 … 1:2492).
 *
 * The design overflows past the right edge — the sixth entry is cut mid-word — which is the whole
 * point of a ticker: there is always more than fits. That is reproduced as a horizontal scroll rail
 * rather than a marquee: unlike the providers row, this strip carries names and amounts, and moving
 * text that cannot be paused is unreadable.
 *
 * The rail is focusable on purpose: a scroll container that only responds to a pointer strands
 * keyboard users in front of content they can see is there.
 *
 * The rules between entries are drawn here rather than by `RecentWinItem`, whose own `withDivider`
 * hairline is `border-strong` (white 10%). Node 1:2433 is white 15% — `border-emphasis`. Rendering
 * them as siblings inside the same `gap-3.5` flex puts them at the identical spacing.
 */

const ALL_WINS = recentWinsData as RecentWin[]

export interface RecentWinsTickerProps {
  wins?: RecentWin[]
  /** Trim the rail — the mobile frame shows fewer entries than the desktop one. */
  limit?: number
  className?: string
}

export default function RecentWinsTicker({
  wins = ALL_WINS,
  limit,
  className,
}: RecentWinsTickerProps) {
  const items = typeof limit === 'number' ? wins.slice(0, limit) : wins

  if (items.length === 0) return null

  return (
    <section
      aria-label="Recent wins"
      className={['w-full px-page-x py-3 mobile:px-4', className].filter(Boolean).join(' ')}
    >
      <div
        className={[
          'mx-auto flex h-20 max-w-content items-center overflow-hidden rounded-xl px-6',
          'border border-solid border-card bg-card',
        ].join(' ')}
      >
        <div
          tabIndex={0}
          className={[
            'no-scrollbar flex min-w-0 flex-1 items-center gap-3.5 overflow-x-auto',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue',
          ].join(' ')}
        >
          {items.map((win, index) => (
            <Fragment key={win.id}>
              <RecentWinItem win={win} index={index} />
              {/* The last entry has no trailing rule; in Figma the final groups drop theirs too. */}
              {index < items.length - 1 ? (
                <span aria-hidden className="h-10 w-px shrink-0 border-l border-emphasis" />
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
