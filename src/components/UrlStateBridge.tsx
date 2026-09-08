'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { PanelId } from '@/store/useAppStore'
import type { AuthMode } from '@/lib/types'

/**
 * Mirrors four pieces of store state into the query string, and reads them back once on mount.
 *
 * The URL is the mirror, never the source. Nothing in the app reads state from here at runtime —
 * the store stays the single owner — but a state that cannot be linked to cannot be reviewed, and
 * the whole design-comparison loop depends on being able to open one exact state directly:
 * `?auth=vip&panel=balance` has to land on the VIP header with the balance panel already open.
 *
 * Written with `replaceState` rather than the router so typing in the search box does not push a
 * history entry per keystroke or trigger a navigation.
 */

const AUTH_MODES: readonly AuthMode[] = ['prelogin', 'postlogin', 'vip']
const PANELS: readonly PanelId[] = ['balance', 'personalInfo', 'jackpotMenu']

function isAuthMode(value: string | null): value is AuthMode {
  return value !== null && (AUTH_MODES as readonly string[]).includes(value)
}

function isPanel(value: string | null): value is PanelId {
  return value !== null && (PANELS as readonly string[]).includes(value)
}

export default function UrlStateBridge() {
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    applied.current = true

    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    const panel = params.get('panel')
    const query = params.get('q')
    const providerQuery = params.get('pq')

    const store = useAppStore.getState()

    // Order matters: setAuthMode clears any open panel, so it has to run before the panel is set,
    // and each of the three overlays closes the other two — so the last one applied is the one
    // the URL leaves open.
    if (isAuthMode(auth)) store.setAuthMode(auth)
    if (query) store.setQuery(query)
    if (isPanel(panel)) store.openPanel(panel)
    if (providerQuery) {
      store.openProviderSearch()
      store.setProviderQuery(providerQuery)
    }
  }, [])

  useEffect(
    () =>
      useAppStore.subscribe((state) => {
        const params = new URLSearchParams(window.location.search)

        const write = (key: string, value: string | null) => {
          if (value) params.set(key, value)
          else params.delete(key)
        }

        write('auth', state.authMode === 'postlogin' ? null : state.authMode)
        write('panel', state.panel)
        write('q', state.search.open && state.search.query ? state.search.query : null)
        write('pq', state.providerQuery)

        const search = params.toString()
        const next = `${window.location.pathname}${search ? `?${search}` : ''}`
        if (next !== `${window.location.pathname}${window.location.search}`) {
          window.history.replaceState(null, '', next)
        }
      }),
    [],
  )

  return null
}
