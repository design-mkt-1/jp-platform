import { create } from 'zustand'
import { defaultRecentSearches } from '@/lib/search'
import type { AuthMode, CategoryId } from '@/lib/types'

/**
 * The only mutable state in the demo: which account state we are pretending to be in, what is in
 * the search boxes, and which overlay is open.
 *
 * Deliberately provider-less. The pages are server components; wrapping them in a context provider
 * would push the whole tree client-side. Client islands import this hook directly instead.
 */

export type PanelId = 'balance' | 'personalInfo' | 'jackpotMenu'

interface SearchState {
  query: string
  open: boolean
  recent: string[]
  /**
   * The term the player actually committed — by pressing Enter, or by picking a suggestion.
   *
   * Distinct from `query`, which is whatever is in the field right now. Until 2026-09-09 there was
   * no such thing: Enter did nothing, and picking a suggestion only closed the panel, so the whole
   * search funnel ended in an empty gesture. This is what the page reads to show results.
   */
  committed: string | null
}

interface AppState {
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void

  search: SearchState
  openSearch: () => void
  closeSearch: () => void
  setQuery: (query: string) => void
  /** Commit a term: remember it, close the panel, and put the results on the page. */
  commitSearch: (term: string) => void
  clearCommitted: () => void
  pushRecent: (term: string) => void
  removeRecent: (term: string) => void

  panel: PanelId | null
  openPanel: (panel: PanelId) => void
  closePanel: () => void

  /**
   * Which tab of the category bar is selected.
   *
   * `popular` is the homepage itself — the house curation, which is what the fifteen rows are —
   * so it is the default and it is what the other three switch back to. The rest replace those
   * rows with one grid of the category. The bar's pills carried `aria-pressed` and no handler
   * until 2026-09-09, so they announced themselves as a toggle group and did nothing; this is
   * the state that was missing behind them.
   */
  activeCategory: CategoryId
  setCategory: (category: CategoryId) => void

  /**
   * The Leading Providers filter — `null` when the field is closed, a string (possibly empty)
   * while it is open. A second `SearchState` would be three fields of which this one uses one:
   * the providers field has no recent list and no suggestions, only a query, and "closed" and
   * "open on an empty query" are exactly what `null` and `''` say.
   */
  providerQuery: string | null
  openProviderSearch: () => void
  closeProviderSearch: () => void
  setProviderQuery: (query: string) => void
}

/** The recent list in the design holds four rows; older terms fall off the end. */
const RECENT_LIMIT = 4

export const useAppStore = create<AppState>((set) => ({
  authMode: 'postlogin',
  setAuthMode: (mode) =>
    // Switching account state closes any open overlay: the balance popover of a logged-in player
    // has no meaning once we are pre-login, and leaving it up shows stale numbers.
    set({ authMode: mode, panel: null }),

  search: { query: '', open: false, recent: defaultRecentSearches, committed: null },
  openSearch: () =>
    set((state) => ({ search: { ...state.search, open: true }, panel: null, providerQuery: null })),
  closeSearch: () => set((state) => ({ search: { ...state.search, open: false, query: '' } })),
  setQuery: (query) => set((state) => ({ search: { ...state.search, query, open: true } })),

  // Enter, or picking a suggestion. The panel closes because the answer is now on the page behind
  // it, and the field keeps the term so the player can see what produced what they are looking at.
  commitSearch: (term) =>
    set((state) => {
      const trimmed = term.trim()
      if (!trimmed) return state

      const deduped = state.search.recent.filter(
        (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
      )

      return {
        search: {
          ...state.search,
          query: trimmed,
          committed: trimmed,
          open: false,
          recent: [trimmed, ...deduped].slice(0, RECENT_LIMIT),
        },
        panel: null,
      }
    }),

  clearCommitted: () =>
    set((state) => ({ search: { ...state.search, committed: null, query: '' } })),

  pushRecent: (term) =>
    set((state) => {
      const trimmed = term.trim()
      if (!trimmed) return state

      const deduped = state.search.recent.filter(
        (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
      )

      return {
        search: { ...state.search, recent: [trimmed, ...deduped].slice(0, RECENT_LIMIT) },
      }
    }),

  removeRecent: (term) =>
    set((state) => ({
      search: {
        ...state.search,
        recent: state.search.recent.filter((entry) => entry !== term),
      },
    })),

  panel: null,
  // Opening a panel closes the search dropdown; the two overlays occupy the same corner.
  openPanel: (panel) =>
    set((state) => ({ panel, search: { ...state.search, open: false }, providerQuery: null })),
  closePanel: () => set({ panel: null }),

  activeCategory: 'popular',
  // Switching tab closes whatever overlay is up: the page underneath is about to become a
  // different page, and a popover anchored to the old one reads as a leftover.
  setCategory: (category) =>
    set((state) => ({
      activeCategory: category,
      panel: null,
      providerQuery: null,
      // Committed results are dropped too: a tab and a search are two answers to "what am I
      // looking at", and leaving both up means the page cannot say which one it is showing.
      search: { ...state.search, open: false, query: '', committed: null },
    })),

  providerQuery: null,
  // Same rule as openPanel, from the other side: the providers field is a third overlay, and the
  // page never shows two of them at once.
  openProviderSearch: () =>
    set((state) => ({ providerQuery: '', search: { ...state.search, open: false }, panel: null })),
  closeProviderSearch: () => set({ providerQuery: null }),
  setProviderQuery: (query) => set({ providerQuery: query }),
}))
