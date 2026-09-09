'use client'

import { games, providers, categories as ALL_CATEGORIES } from '@/lib/data'
import { searchGames } from '@/lib/search'
import { useAppStore } from '@/store/useAppStore'
import Button from '../primitives/Button'
import GameGrid from './GameGrid'
import SearchNoResults from '../search/SearchNoResults'
import SectionHeader from './SectionHeader'
import type { ReactNode } from 'react'

/**
 * What the four tabs of the category bar switch between.
 *
 * Until 2026-09-09 those tabs were `<button aria-pressed>` with no handler: they announced
 * themselves to a screen reader as a toggle group, lit the selected one with the design's only
 * cyan ring, and swallowed the press. The audit measured it with a real mouse click — nothing
 * moved, not the pressed state, not the URL, not the grid.
 *
 * `popular` is the homepage. That is not a special case bolted on: the fifteen rows *are* the
 * house curation, which is what the Popular tab means, and `games.json` lists `popular` first on
 * the games that carry it for exactly that reason. So this component renders its children — the
 * server-rendered rows — untouched on that tab, and replaces them with a single grid on the other
 * three. Nothing about the default homepage changes, which is what keeps every existing Figma
 * comparison valid.
 *
 * Client, but cheap: `games.json` is already in the client bundle because `SearchOverlay` searches
 * it, so switching here adds no payload. The rows themselves stay server components and arrive as
 * `children` — a client parent does not drag its server children client-side.
 */

/** Six across, the same grid the rows use (node 1:2601), so a category page is not a new layout. */
const COLUMNS = 6

const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(
  providers.map((provider) => [provider.id, provider.name]),
)

/** The `See All` pill's box without its affordance — same height and inset, no press, no tint. */
const COUNT_CLASSES =
  'shrink-0 whitespace-nowrap px-4 text-[13px] font-semibold leading-7 text-muted'

export interface CategoryViewProps {
  /** The fifteen homepage rows, rendered on the server and passed through on the Popular tab. */
  children: ReactNode
}

export default function CategoryView({ children }: CategoryViewProps) {
  const active = useAppStore((state) => state.activeCategory)
  const committed = useAppStore((state) => state.search.committed)
  const clearCommitted = useAppStore((state) => state.clearCommitted)

  // A committed search wins over the tab. It is the more specific answer, and it is the one the
  // player asked for most recently — `setCategory` clears it, so the two can never both be live.
  if (committed) {
    const matched = searchGames(committed, games)

    return (
      <>
        <SectionHeader
          title={`Results for “${committed}”`}
          icon="popular"
          action={
            <div className="flex shrink-0 items-center gap-3">
              <span className={COUNT_CLASSES}>
                {matched.length} {matched.length === 1 ? 'game' : 'games'}
              </span>
              <Button variant="seeAll" onClick={clearCommitted}>
                Back to home
              </Button>
            </div>
          }
        />

        {matched.length > 0 ? (
          <GameGrid
            games={matched}
            columns={COLUMNS}
            providerNames={PROVIDER_NAMES}
            priority
            className="mt-5 mobile:mt-4"
          />
        ) : (
          <SearchNoResults onClear={clearCommitted} className="mt-5 mobile:mt-4" />
        )}
      </>
    )
  }

  if (active === 'popular') return <>{children}</>

  const category = ALL_CATEGORIES.find((entry) => entry.id === active)
  const matched = games.filter((game) => game.categories.includes(active))

  return (
    <>
      {/*
        A count, not a `See All` pill. `SectionHeader` turns a `total` into that pill, and here it
        would have nowhere to go — this view already *is* everything in the category. Shipping a
        second inert pill is the exact defect the audit opened with, so the slot takes plain text.
        The number is the real one, unlike the rows' `See All (206)`, which is a Figma placeholder
        repeated on every header; printing 206 over a grid the player can count would be a number
        contradicting the screen under it.
      */}
      <SectionHeader
        title={category?.label ?? active}
        icon={category?.icon ?? 'popular'}
        action={<span className={COUNT_CLASSES}>{matched.length} games</span>}
      />

      <GameGrid
        games={matched}
        columns={COLUMNS}
        providerNames={PROVIDER_NAMES}
        priority
        className="mt-5 mobile:mt-4"
      />
    </>
  )
}
