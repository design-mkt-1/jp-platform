import type { CSSProperties } from 'react'
import GameCard from '../cards/GameCard'
import type { Game } from '@/lib/types'

/**
 * The GridContainer of Figma node 1:2601: 1280 wide, six 203px cards on a 215px pitch — so a
 * 12px gutter.
 *
 * On mobile it stays a grid. Node 1:5882 draws the same section at 390px as two rows of three
 * 114x148 cards — an 8px column gutter inside a 16px page inset, 12px between the rows — not the
 * horizontal rail an earlier pass assumed. `src/lib/sections.ts` already limits every mobile games
 * row to six for exactly this shape.
 *
 * The column count is a runtime value, so it travels as a custom property rather than as an inline
 * `grid-template-columns`: an inline style beats every class, which would make the mobile override
 * below impossible to express in Tailwind.
 */

export interface GameGridProps {
  games: Game[]
  /** Desktop column count. Six is the design; the search results use fewer. */
  columns?: number
  /** `Provider.id` → display name, resolved by the caller from providers.json. */
  providerNames?: Record<string, string>
  /** Builds the per-card link. Omit to render non-interactive cards. */
  hrefForGame?: (game: Game) => string
  /** Marks the first row's images as high priority — set it only on the topmost grid. */
  priority?: boolean
  className?: string
}

/** Mobile always shows three across, whatever the desktop count is (node 1:5887). */
const MOBILE_COLUMNS = 3

export default function GameGrid({
  games,
  columns = 6,
  providerNames,
  hrefForGame,
  priority = false,
  className,
}: GameGridProps) {
  return (
    <div
      className={[
        'grid grid-cols-[repeat(var(--game-grid-columns),minmax(0,1fr))] gap-3',
        'mobile:grid-cols-3 mobile:gap-x-2 mobile:gap-y-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--game-grid-columns': columns } as CSSProperties}
    >
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          providerName={providerNames?.[game.provider]}
          {...(hrefForGame ? { href: hrefForGame(game) } : {})}
          // The first visible row differs per viewport; priming the wider of the two costs three
          // extra eager images on mobile and avoids a lazy first row on desktop.
          priority={priority && index < Math.max(columns, MOBILE_COLUMNS)}
        />
      ))}
    </div>
  )
}
