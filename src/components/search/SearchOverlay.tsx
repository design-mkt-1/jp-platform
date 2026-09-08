'use client'

import { createPortal } from 'react-dom'
import { useCallback, useMemo } from 'react'
import SearchInput from '../primitives/SearchInput'
import { useOverlayBehavior } from '../primitives/Panel'
import gamesData from '@/data/games.json'
import providersData from '@/data/providers.json'
import { getSuggestions } from '@/lib/search'
import type { Game, Provider } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'
import SearchNoResults from './SearchNoResults'
import SearchPopularRecent from './SearchPopularRecent'
import SearchSuggestions from './SearchSuggestions'

/**
 * The search dropdown, all three states — Figma nodes 1:4334, 1:4479 and 1:4611.
 *
 * One island, not three. The three frames differ only in what sits under the field, and the state
 * is not a prop but a consequence of the query: empty shows popular and recent (1:4431), a query
 * with matches shows suggestions (1:4579), a query without shows the empty state (1:4711). A
 * caller that could pass the wrong one is a caller that will.
 *
 * Matching is `getSuggestions` from `src/lib/search.ts` and nothing else. It already ranks, already
 * cuts to `SUGGESTION_LIMIT`, and returns nothing for a blank query — so its emptiness is the same
 * question as "did the search find anything", asked once.
 *
 * Dismissal reuses `useOverlayBehavior` from Panel: Escape, outside click, focus trap, focus
 * restored to whatever opened it. The triggers live in three different components (the header, the
 * category bar, the providers row) and none of them can be relied on to still be mounted.
 *
 * Unlike Panel the backdrop is transparent: nodes 1:4334 and 1:4479 leave the category bar above
 * the panel at full brightness, so the page is dimmed by nothing here.
 */

const games = gamesData as Game[]
const providers = providersData as Provider[]

/** Built once at module load — the row list needs the same id → name lookup on every keystroke. */
const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(
  providers.map((provider) => [provider.id, provider.name]),
)

export interface SearchOverlayProps {
  /** Defaults to the full catalogue; a section can scope the dropdown to its own list. */
  games?: Game[]
  className?: string
}

export default function SearchOverlay({ games: catalogue = games, className }: SearchOverlayProps) {
  // Selector form, one slice each: the panel re-renders on the query, not on the auth mode.
  const open = useAppStore((state) => state.search.open)
  const query = useAppStore((state) => state.search.query)
  const recent = useAppStore((state) => state.search.recent)
  const setQuery = useAppStore((state) => state.setQuery)
  const closeSearch = useAppStore((state) => state.closeSearch)
  const pushRecent = useAppStore((state) => state.pushRecent)
  const removeRecent = useAppStore((state) => state.removeRecent)

  const { surfaceRef, mounted, onBackdropMouseDown } = useOverlayBehavior(open, closeSearch)

  const suggestions = useMemo(() => getSuggestions(query, catalogue), [query, catalogue])

  // Selecting a term fills the field rather than navigating: the player gets to see what it matches
  // before committing, which is the whole reason the dropdown exists.
  const selectTerm = useCallback(
    (term: string) => {
      setQuery(term)
      pushRecent(term)
    },
    [setQuery, pushRecent],
  )

  // Picking a game is the end of the search, so the panel closes — `closeSearch` empties the query
  // too, leaving the field clean for the next time it opens.
  const selectGame = useCallback(
    (game: Game) => {
      pushRecent(game.title)
      closeSearch()
    },
    [pushRecent, closeSearch],
  )

  const clearQuery = useCallback(() => setQuery(''), [setQuery])

  if (!mounted || !open) return null

  const hasQuery = query.trim().length > 0

  const body = !hasQuery ? (
    <SearchPopularRecent
      recent={recent}
      onSelect={selectTerm}
      onRemoveRecent={removeRecent}
      // Node 1:4431 insets this state by 24px; the shell already contributes 16 for the field.
      className="px-2 pb-2"
    />
  ) : suggestions.length > 0 ? (
    <SearchSuggestions games={suggestions} providerNames={PROVIDER_NAMES} onSelect={selectGame} />
  ) : (
    <SearchNoResults onClear={clearQuery} />
  )

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto px-page-x pb-8 pt-[88px] mobile:px-4 mobile:pt-4"
      onMouseDown={onBackdropMouseDown}
    >
      {/* The same handler on both layers: it closes only when the press lands on the element it is
          attached to, so the strip beside the 720px panel dismisses just like the rest. */}
      <div
        className="mx-auto flex max-w-content justify-end"
        onMouseDown={onBackdropMouseDown}
      >
        <div
          ref={surfaceRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search games"
          tabIndex={-1}
          className={[
            // Node 1:4431 is 720 wide with a 24px radius; the panel fill sits one step off the page.
            'flex w-full max-w-[720px] flex-col gap-4 rounded-3xl outline-none',
            'border border-solid border-card bg-section p-4',
            'shadow-[0_16px_16px_rgb(0_0_0/0.5)]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/*
            The field lives here and not in the category bar: node 1:4321 draws exactly this stack,
            and the bar's control is a button that hands over to this overlay. Two real inputs for
            one search would put two search boxes in the accessibility tree.
            `useOverlayBehavior` focuses the first control in the surface, which is this one, so it
            needs no autoFocus of its own.
          */}
          <SearchInput value={query} onValueChange={setQuery} />

          {body}
        </div>
      </div>
    </div>,
    document.body,
  )
}
