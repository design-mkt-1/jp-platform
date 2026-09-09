import { games, providers } from '@/lib/data'
import { selectGames, type GamesSectionSpec } from '@/lib/sections'
import type { Game } from '@/lib/types'
import GameGrid from './GameGrid'
import SectionHeader from './SectionHeader'

/**
 * Every games row of the homepage, driven by a `GamesSectionSpec`.
 *
 * Figma draws these as twelve separate frames — PopularGames (1:2592), NewGames (1:2620),
 * RecommendedGames (1:3180), CrashGames (1:3230) and so on — but the frames differ only in their
 * glyph, their title and how many 6-card grids they stack. Twelve components would mean twelve
 * places to fix the same spacing bug, so the row is one component reading one registry.
 *
 * Geometry from node 1:2592 and 1:3180: a 20px column gap between the header and the first grid
 * and between the two grids of a double row; the 12px gutter inside a grid belongs to GameGrid.
 */

/** Built once at module load: every row needs the same id → name lookup for its cards. */
const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(
  providers.map((provider) => [provider.id, provider.name]),
)

export interface ContentRowProps {
  section: GamesSectionSpec
  /** Defaults to the full catalogue; the spec's `filter` is applied to whatever is passed. */
  games?: Game[]
  columns?: number
  /** Builds the per-card link. Omit to render non-interactive cards. */
  hrefForGame?: (game: Game) => string
  /** Target of the "See All (206)" pill. Omit and the pill renders as a plain button. */
  seeAllHref?: string
  /** Set on the first row of the page so its artwork is not lazy-loaded. */
  priority?: boolean
  className?: string
}

/**
 * Splits the matched games into the row's grids.
 *
 * Chunking by column count rather than by `matched.length / grids` keeps the first grid a full row
 * even when the catalogue is short: a row that matches nine games should read as 6 + 3, not as
 * two ragged rows of 5 and 4. `grids` then caps how many of those chunks the design shows.
 */
function splitIntoGrids(matched: Game[], grids: number, columns: number): Game[][] {
  const chunks: Game[][] = []

  for (let start = 0; start < matched.length && chunks.length < grids; start += columns) {
    chunks.push(matched.slice(start, start + columns))
  }

  return chunks
}

export default function ContentRow({
  section,
  games: catalogue = games,
  columns = 6,
  hrefForGame,
  seeAllHref,
  priority = false,
  className,
}: ContentRowProps) {
  const matched = selectGames(section.filter, catalogue)

  // A row whose filter matches nothing would render as a lone header above a gap, which reads as a
  // broken page rather than as an empty category. Better to drop the row entirely.
  if (matched.length === 0) return null

  const grids = splitIntoGrids(matched, section.grids, columns)

  return (
    <section
      aria-label={section.title}
      // 20 on desktop (node 1:3230: the header ends at 28, the grid starts at 48), 16 on the phone
      // frames (node 1:6175: header ends at 52, grid starts at 68). The mobile value was measured
      // when the frames were inventoried and never reached the code — `PromoRow` next door already
      // carries the same pair. Twelve game rows sit on this one line.
      className={['flex flex-col gap-5 mobile:gap-4', className].filter(Boolean).join(' ')}
    >
      <SectionHeader
        title={section.title}
        icon={section.icon}
        total={section.total}
        {...(seeAllHref ? { seeAllHref } : {})}
      />

      {grids.map((rowGames, index) => (
        <GameGrid
          key={rowGames[0]?.id ?? index}
          games={rowGames}
          columns={columns}
          providerNames={PROVIDER_NAMES}
          {...(hrefForGame ? { hrefForGame } : {})}
          // Only the topmost grid of the topmost row is above the fold.
          priority={priority && index === 0}
        />
      ))}
    </section>
  )
}
