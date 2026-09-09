'use client'

import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import SearchInput from '../primitives/SearchInput'
import { useOverlayBehavior } from '../primitives/Panel'
import Sheet from '../primitives/Sheet'
import { games, providers } from '@/lib/data'
import { getSuggestions } from '@/lib/search'
import type { Game } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'
import SearchNoResults from './SearchNoResults'
import SearchPopularRecent from './SearchPopularRecent'
import SearchSuggestions from './SearchSuggestions'

/**
 * The search dropdown, all three states — Figma nodes 1:4334, 1:4479 and 1:4611.
 *
 * ## Where the dropdown lives
 *
 * In all three frames the panel is anchored to the *category bar*, not to the header: the bar's
 * search control turns into the live field (node 1:4568) and the 720px panel drops 12px under the
 * capsule, right-aligned to the capsule's outer edge. So on desktop the owner of the surface is
 * `CategoryNavBar` — it is the only component that knows where that capsule is — and this file
 * ships it the two pieces it needs: `SearchDropdownBody` (the three states) and
 * `SEARCH_PANEL_CLASSES` (the card chrome).
 *
 * This component is then the fallback: the mobile layout, where the search is a full-screen sheet,
 * and any page that mounts the overlay without a category bar (`/dev/screens`). It renders nothing
 * while a bar is on screen to host the dropdown — `useSearchBarHost` below is how the bar says so
 * — because two panels for one query is exactly the "two search fields at once" this arrangement
 * exists to remove.
 *
 * ## The state is not a prop
 *
 * The three frames differ only in what sits under the field, and which one shows is a consequence
 * of the query: empty shows popular and recent (1:4431), a query with matches shows suggestions
 * (1:4579), a query without shows the empty state (1:4711). A caller that could pass the wrong one
 * is a caller that will.
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

/** Built once at module load — the row list needs the same id → name lookup on every keystroke. */
const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(
  providers.map((provider) => [provider.id, provider.name]),
)

/* -------------------------------------------------------------------------------------------- */
/* Who draws the dropdown                                                                         */
/* -------------------------------------------------------------------------------------------- */

/**
 * A count and not a boolean: `/dev/screens` can hold more than one bar alive at a time, and a flag
 * would be cleared by the first one to unmount while the others are still on screen.
 */
let barHosts = 0
const barHostListeners = new Set<() => void>()

function announceBarHosts(): void {
  barHostListeners.forEach((listener) => listener())
}

function subscribeBarHosts(listener: () => void): () => void {
  barHostListeners.add(listener)
  return () => {
    barHostListeners.delete(listener)
  }
}

function readBarHosts(): boolean {
  return barHosts > 0
}

/** The server renders no bar host, so the overlay is the panel until the client says otherwise. */
function readBarHostsOnServer(): boolean {
  return false
}

/**
 * Claims the dropdown for the caller's own surface for as long as `active` is true.
 *
 * Registration is deliberately tied to "could host it" rather than "is open": both components
 * render in the same commit, and a claim raised only once the query opens would let this overlay
 * paint one frame of a second panel before standing down.
 */
export function useSearchBarHost(active: boolean): void {
  useEffect(() => {
    if (!active) return

    barHosts += 1
    announceBarHosts()

    return () => {
      barHosts -= 1
      announceBarHosts()
    }
  }, [active])
}

const DESKTOP_QUERY = '(min-width: 768px)'

function subscribeDesktop(listener: () => void): () => void {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}

function readDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

/** Hydration has no viewport; the mobile layout is the one that costs least if guessed wrong. */
function readDesktopOnServer(): boolean {
  return false
}

/**
 * True above the `mobile:` breakpoint (max-width 767px), read from the same 768px edge Tailwind
 * uses so the two cannot answer differently. A media query and not a resize listener: the layouts
 * differ by which component owns the field, and that has to be a render-time decision.
 */
export function useDesktopViewport(): boolean {
  return useSyncExternalStore(subscribeDesktop, readDesktop, readDesktopOnServer)
}

/* -------------------------------------------------------------------------------------------- */
/* The panel                                                                                      */
/* -------------------------------------------------------------------------------------------- */

/**
 * The card chrome of node 1:4579 — 24px radius, one step off the page, a 16px inset and the 16/16
 * drop shadow. Width is left to the caller: the bar pins it to 720, the mobile sheet fills the
 * screen.
 */
export const SEARCH_PANEL_CLASSES = [
  'flex flex-col gap-4 rounded-3xl outline-none',
  'border border-solid border-card bg-section p-4',
  'shadow-[0_16px_16px_rgb(0_0_0/0.5)]',
].join(' ')

/**
 * Enter and ArrowDown for whichever field is hosting the search.
 *
 * Both were dead until 2026-09-09. `SearchSuggestions`' own docblock describes the lit first row
 * as "the row Enter would take you to", and Enter was wired nowhere; ArrowDown left focus in the
 * field, so the suggestions were reachable only by Tab.
 *
 * ArrowDown moves real DOM focus to the first suggestion rather than tracking a virtual index.
 * The rows are already `<button>`s inside the panel, so from there the arrow keys and Enter are
 * the browser's, `:focus-visible` lights the row the design already lights on hover, and nothing
 * needs `aria-activedescendant` to stay truthful.
 *
 * `panelRef` is the element holding the rows. Both hosts have one; the sheet passes its own.
 */
export function useSearchFieldKeys(panelRef: RefObject<HTMLElement | null>) {
  const query = useAppStore((state) => state.search.query)
  const commitSearch = useAppStore((state) => state.commitSearch)

  return useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        // A suggestion list with nothing in the field is the popular/recent state, and committing
        // an empty term would put an empty result page behind a panel the player did not dismiss.
        if (!query.trim()) return
        event.preventDefault()
        commitSearch(query)
        return
      }

      if (event.key === 'ArrowDown') {
        const first = panelRef.current?.querySelector<HTMLElement>('button, a[href]')
        if (!first) return
        event.preventDefault()
        first.focus()
      }
    },
    [query, commitSearch, panelRef],
  )
}

export interface SearchDropdownBodyProps {
  /** Defaults to the full catalogue; a section can scope the dropdown to its own list. */
  games?: Game[]
  className?: string
}

/**
 * Everything under the field: the popular/recent lists, the suggestion rows or the empty state.
 *
 * Reads the store directly rather than taking the query as a prop. Exactly one of the two surfaces
 * renders it at a time, so there is no second subscriber to disagree with, and threading six
 * callbacks through `CategoryNavBar` would make the bar a participant in a search it only hosts.
 */
export function SearchDropdownBody({
  games: catalogue = games,
  className,
}: SearchDropdownBodyProps) {
  // Selector form, one slice each: the body re-renders on the query, not on the auth mode.
  const query = useAppStore((state) => state.search.query)
  const recent = useAppStore((state) => state.search.recent)
  const setQuery = useAppStore((state) => state.setQuery)
  const commitSearch = useAppStore((state) => state.commitSearch)
  const pushRecent = useAppStore((state) => state.pushRecent)
  const removeRecent = useAppStore((state) => state.removeRecent)

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

  // Picking a game is the end of the search: it commits the title, which closes the panel and puts
  // the matching games on the page behind it. Until 2026-09-09 this only called `closeSearch()` —
  // so a player typed "swe", clicked Sweet Bonanza, and the panel simply vanished.
  const selectGame = useCallback(
    (game: Game) => {
      commitSearch(game.title)
    },
    [commitSearch],
  )

  const clearQuery = useCallback(() => setQuery(''), [setQuery])

  if (query.trim().length === 0) {
    return (
      <SearchPopularRecent
        recent={recent}
        onSelect={selectTerm}
        onRemoveRecent={removeRecent}
        // Node 1:4431 insets this state by 24px; the panel already contributes 16 of them.
        className={['p-2', className].filter(Boolean).join(' ')}
      />
    )
  }

  if (suggestions.length > 0) {
    return (
      <SearchSuggestions
        games={suggestions}
        providerNames={PROVIDER_NAMES}
        onSelect={selectGame}
        className={className}
      />
    )
  }

  return (
    <SearchNoResults
      onClear={clearQuery}
      // Node 1:4711 is 720x307 with its glyph 48 from the top and no panel inset of its own — the
      // empty state is the one body that owns the whole card. `py-12` inside plus the panel's 16
      // would put it at 64, so the panel's vertical inset is given back here.
      className={['-my-4', className].filter(Boolean).join(' ')}
    />
  )
}

export interface SearchOverlayProps {
  /** Defaults to the full catalogue; a section can scope the dropdown to its own list. */
  games?: Game[]
  className?: string
}

export default function SearchOverlay({ games: catalogue = games, className }: SearchOverlayProps) {
  const open = useAppStore((state) => state.search.open)
  const query = useAppStore((state) => state.search.query)
  const setQuery = useAppStore((state) => state.setQuery)
  const closeSearch = useAppStore((state) => state.closeSearch)

  const barHosted = useSyncExternalStore(subscribeBarHosts, readBarHosts, readBarHostsOnServer)
  const desktop = useDesktopViewport()

  // The sheet and the `/dev/screens` fallback panel each own the rows under their own field, so
  // each hands the key handler its own container to walk into on ArrowDown.
  const sheetPanelRef = useRef<HTMLDivElement | null>(null)
  const onFieldKeyDown = useSearchFieldKeys(sheetPanelRef)

  // Still called unconditionally while a bar hosts the dropdown or the sheet owns the surface — it
  // is a hook, and it does nothing when its first argument is false.
  const { surfaceRef, mounted, onBackdropMouseDown } = useOverlayBehavior(
    open && !barHosted && desktop,
    closeSearch,
  )

  /*
   * Below the `mobile:` breakpoint the search is a sheet anchored at the top of the viewport, the
   * same form the jackpot menu takes: the field first, the results under it, and nothing of the
   * header left showing. Figma has no mobile search frame at all — the three nodes above are all
   * 1440 wide — and the dropdown drawn as a floating card at 390 left a 16px strip of the header
   * above it with the balance pill cut in half. `Sheet` already owns the trap, Escape, the backdrop
   * and focus restoration, through the same `useOverlayBehavior` this file uses, so the mobile
   * layout is a different container and not a second implementation.
   *
   * It stays mounted whether or not the search is open and is told which through the prop: `Sheet`
   * portals nothing until its own first client render, so a copy mounted at the moment the search
   * opens would miss that pass and never move focus into the field.
   */
  if (!desktop) {
    return (
      <Sheet
        open={open && !barHosted}
        onClose={closeSearch}
        title="Search games"
        hideTitle
        anchor="top"
      >
        {/* The sheet's own top inset is 8px; the rest of the app's rhythm at 390 is 16, and this
            field is the first thing under the phone's status bar. */}
        <div className="pt-2">
          <SearchInput value={query} onValueChange={setQuery} onKeyDown={onFieldKeyDown} />
        </div>
        {/* The panel below insets every state by its own `p-4`, and that inset is what the empty
            state's `-my-4` is measured against. The sheet has no inset of its own, so the 16 is
            given here instead — without it the no-results glyph rides up under the field. */}
        <div ref={sheetPanelRef} className={['py-4', className].filter(Boolean).join(' ')}>
          <SearchDropdownBody games={catalogue} />
        </div>
      </Sheet>
    )
  }

  if (!mounted || !open || barHosted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto px-page-x pb-8 pt-[88px]"
      onMouseDown={onBackdropMouseDown}
    >
      {/* The same handler on both layers: it closes only when the press lands on the element it is
          attached to, so the strip beside the 720px panel dismisses just like the rest. */}
      <div className="mx-auto flex max-w-content justify-end" onMouseDown={onBackdropMouseDown}>
        <div
          ref={surfaceRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search games"
          tabIndex={-1}
          className={[
            // Node 1:4431 is 720 wide; the panel fill sits one step off the page.
            'w-full max-w-[720px]',
            SEARCH_PANEL_CLASSES,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/*
            The field is inside the panel here because this is the fallback layout — a desktop
            page with no category bar for the capsule to grow into (`/dev/screens`). Where a bar is
            on screen it draws node 1:4568 itself and this whole component stands down.
            `useOverlayBehavior` focuses the first control in the surface, which is this one, so it
            needs no autoFocus of its own.
          */}
          <SearchInput value={query} onValueChange={setQuery} />

          <SearchDropdownBody games={catalogue} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
