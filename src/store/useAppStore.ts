import { create } from 'zustand'
import { defaultRecentSearches } from '@/lib/search'
import type { AuthMode } from '@/lib/types'

/**
 * The only mutable state in the demo: which account state we are pretending to be in, what is in
 * the search box, and which overlay is open.
 *
 * Deliberately provider-less. The pages are server components; wrapping them in a context provider
 * would push the whole tree client-side. Client islands import this hook directly instead.
 */

export type PanelId = 'balance' | 'personalInfo' | 'jackpotMenu'

interface SearchState {
  query: string
  open: boolean
  recent: string[]
}

interface AppState {
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void

  search: SearchState
  openSearch: () => void
  closeSearch: () => void
  setQuery: (query: string) => void
  pushRecent: (term: string) => void
  removeRecent: (term: string) => void

  panel: PanelId | null
  openPanel: (panel: PanelId) => void
  closePanel: () => void
}

/** The recent list in the design holds four rows; older terms fall off the end. */
const RECENT_LIMIT = 4

export const useAppStore = create<AppState>((set) => ({
  authMode: 'postlogin',
  setAuthMode: (mode) =>
    // Switching account state closes any open overlay: the balance popover of a logged-in player
    // has no meaning once we are pre-login, and leaving it up shows stale numbers.
    set({ authMode: mode, panel: null }),

  search: { query: '', open: false, recent: defaultRecentSearches },
  openSearch: () => set((state) => ({ search: { ...state.search, open: true }, panel: null })),
  closeSearch: () => set((state) => ({ search: { ...state.search, open: false, query: '' } })),
  setQuery: (query) => set((state) => ({ search: { ...state.search, query, open: true } })),

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
  openPanel: (panel) => set((state) => ({ panel, search: { ...state.search, open: false } })),
  closePanel: () => set({ panel: null }),
}))
