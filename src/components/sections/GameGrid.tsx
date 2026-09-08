import GameCard from '../cards/GameCard'
import type { Game } from '@/lib/types'

/**
 * The GridContainer of Figma node 1:2601: 1280 wide, six 203px cards on a 215px pitch — so a
 * 12px gutter.
 *
 * On mobile the same games become a horizontal rail. A six-column grid at 390px would give 50px
 * cards; a 3x2 grid would hide half the row behind a scroll the user cannot see. The rail keeps
 * the cards legible and makes it obvious there is more to the right.
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
        'grid gap-3',
        // Below 768px the grid template is ignored and the row scrolls instead.
        'mobile:flex mobile:snap-x mobile:overflow-x-auto mobile:no-scrollbar',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      // Inline because the column count is a runtime value: Tailwind cannot generate a class it
      // never sees in the source.
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          providerName={providerNames?.[game.provider]}
          {...(hrefForGame ? { href: hrefForGame(game) } : {})}
          priority={priority && index < columns}
          className="mobile:w-[148px] mobile:shrink-0 mobile:snap-start"
        />
      ))}
    </div>
  )
}
