'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { withBase } from '@/lib/assets'
import BalancePanel from '@/components/panels/BalancePanel'
import JackpotMenu from '@/components/panels/JackpotMenu'
import PersonalInfoPanel from '@/components/panels/PersonalInfoPanel'
import SearchOverlay from '@/components/search/SearchOverlay'
import { screens } from '@/lib/screens'
import type { ScreenSpec } from '@/lib/screens'
import type { AuthMode } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'
import type { PanelId } from '@/store/useAppStore'

/**
 * The designer review surface.
 *
 * One address that lists every frame in `src/lib/screens.ts` next to its Figma node id and opens
 * the running implementation of it. The list is `screens.map()`: a frame the designer adds to the
 * registry tomorrow shows up here with its label, its viewport, its node and a working link
 * without anyone writing code for it.
 *
 * ## Query parameters
 *
 * - `?screen=<id>`  — promotes one entry and renders the live page beneath it.
 * - `?auth=prelogin|postlogin|vip` — the account state the page is rendered in.
 * - `?panel=balance|personalInfo|jackpotMenu` — opens one of the overlays.
 * - `?search=1&q=<term>` — opens the search overlay, optionally pre-filled. Not in the original
 *   brief, but four of the twelve registry entries are search states and without it they are the
 *   only frames on the list that cannot be opened.
 *
 * The URL is the single source of truth: the toolbar buttons are links that rewrite it, and one
 * effect pushes whatever it says into `useAppStore`. That keeps every state in this harness
 * copy-pasteable into a chat message, which is the entire point of a review surface.
 *
 * ## Why the whole file is a client component
 *
 * The three overlays and the account state live in a client-side store, and a deep link can only
 * reach them from a client effect. The homepage itself stays a Server Component: the live preview
 * below is an `<iframe>` of `/` at the frame width, so the mobile entries really are laid out by
 * the mobile breakpoint instead of being a 390px-wide crop of the desktop page.
 *
 * The consequence, stated plainly: `?auth` and `?panel` apply to *this* document, not to the
 * document inside the iframe. For the panels that is exactly right — they are portalled modals
 * that cover the viewport, which is what frames 1:4116, 1:4153 and 1:8260 show — but the page
 * visible behind a panel is this index, not the homepage.
 */

const FIGMA_FILE_KEY = '2MyylxdZblfGnf05nQacUz'

const AUTH_MODES: readonly AuthMode[] = ['prelogin', 'postlogin', 'vip']
const PANEL_IDS: readonly PanelId[] = ['balance', 'personalInfo', 'jackpotMenu']

interface ScreenState {
  auth?: AuthMode
  panel?: PanelId
  search?: boolean
  q?: string
}

/**
 * The store state each registry entry is meant to be viewed in.
 *
 * `ScreenSpec` has no field for it — the registry is frozen — so the mapping lives here as a
 * lookup with an empty default: an id that is not listed simply opens in the default state, which
 * is what keeps a newly added frame working without a code change. Moving these three lines into
 * an optional `ScreenSpec.state` is filed as a change request.
 */
const SCREEN_STATE: Record<string, ScreenState> = {
  'balance-opened': { auth: 'postlogin', panel: 'balance' },
  'personal-info-opened': { auth: 'postlogin', panel: 'personalInfo' },
  'search-popular-recent': { search: true },
  // Matches "Gates of Olympus 1000" by title, so the dropdown shows the suggestion rows of 1:4479.
  'search-typing': { search: true, q: 'gates' },
  'search-no-results': { search: true, q: 'zzzz' },
  'empty-search': { search: true },
  'jackpot-menu-prelogin': { auth: 'prelogin', panel: 'jackpotMenu' },
  'jackpot-menu-postlogin': { auth: 'postlogin', panel: 'jackpotMenu' },
  'jackpot-menu-vip': { auth: 'vip', panel: 'jackpotMenu' },
}

function isAuthMode(value: string | null): value is AuthMode {
  return value !== null && (AUTH_MODES as readonly string[]).includes(value)
}

function isPanelId(value: string | null): value is PanelId {
  return value !== null && (PANEL_IDS as readonly string[]).includes(value)
}

/** Preserves whatever else is in the URL; a `null` value drops its key. */
function buildHref(current: URLSearchParams, changes: Record<string, string | null>): string {
  const next = new URLSearchParams(current)

  for (const [key, value] of Object.entries(changes)) {
    if (value === null) next.delete(key)
    else next.set(key, value)
  }

  const query = next.toString()
  return query ? `/dev/screens?${query}` : '/dev/screens'
}

/** The Figma deep link wants `1-2431` where the registry stores `1:2431`. */
function figmaHref(nodeId: string): string {
  return `https://www.figma.com/design/${FIGMA_FILE_KEY}?node-id=${nodeId.replace(':', '-')}`
}

/** Reads back as the query string a link would carry — the format the designer will paste. */
function describeState(state: ScreenState): string {
  const parts: string[] = []
  if (state.auth) parts.push(`auth=${state.auth}`)
  if (state.panel) parts.push(`panel=${state.panel}`)
  if (state.search) parts.push(state.q ? `search=1&q=${state.q}` : 'search=1')
  return parts.join(' · ')
}

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const CHIP = 'rounded-full px-3 py-1 text-xs font-semibold transition-colors'
const CHIP_ON = `${CHIP} bg-blue-tint text-primary`
const CHIP_OFF = `${CHIP} bg-elevated text-secondary hover:text-primary`

function Toolbar({ params, auth, panel }: { params: URLSearchParams; auth: AuthMode; panel: PanelId | null }) {
  const searchOpen = params.get('search') === '1'

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-solid border-card bg-card p-4">
      <ControlRow label="Account state">
        {AUTH_MODES.map((mode) => (
          <Link
            key={mode}
            href={buildHref(params, { auth: mode })}
            className={`${mode === auth ? CHIP_ON : CHIP_OFF} ${FOCUS_RING}`}
          >
            {mode}
          </Link>
        ))}
      </ControlRow>

      <ControlRow label="Overlay">
        <Link
          href={buildHref(params, { panel: null, search: null, q: null })}
          className={`${panel === null && !searchOpen ? CHIP_ON : CHIP_OFF} ${FOCUS_RING}`}
        >
          none
        </Link>
        {PANEL_IDS.map((id) => (
          <Link
            key={id}
            href={buildHref(params, { panel: id, search: null, q: null })}
            className={`${id === panel ? CHIP_ON : CHIP_OFF} ${FOCUS_RING}`}
          >
            {id}
          </Link>
        ))}
        <Link
          href={buildHref(params, { search: '1', panel: null })}
          className={`${searchOpen ? CHIP_ON : CHIP_OFF} ${FOCUS_RING}`}
        >
          search
        </Link>
      </ControlRow>
    </div>
  )
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-28 shrink-0 text-xs uppercase tracking-[1px] text-caption">{label}</span>
      {children}
    </div>
  )
}

function ScreenCard({
  screen,
  params,
  selected,
}: {
  screen: ScreenSpec
  params: URLSearchParams
  selected: boolean
}) {
  const state = SCREEN_STATE[screen.id] ?? {}
  const summary = describeState(state)

  // The link carries the frame's own state rather than inheriting whatever the toolbar last set,
  // so every card opens the frame the designer is looking at in the Figma file.
  const href = buildHref(new URLSearchParams(), {
    screen: screen.id,
    auth: state.auth ?? null,
    panel: state.panel ?? null,
    search: state.search ? '1' : null,
    q: state.q ?? null,
  })

  return (
    <li
      className={[
        'flex flex-col gap-3 rounded-2xl border border-solid p-4',
        selected ? 'border-emphasis bg-section' : 'border-card bg-card',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-bold text-primary">{screen.label}</h3>
        <span className="shrink-0 rounded-full bg-elevated px-2.5 py-1 text-xs font-semibold text-label">
          {screen.viewport}px
        </span>
      </div>

      <p className="text-sm leading-relaxed text-secondary">{screen.description}</p>

      <dl className="flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-2">
          <dt className="text-caption">Figma node</dt>
          <dd>
            <a
              href={figmaHref(screen.figmaNodeId)}
              target="_blank"
              rel="noreferrer"
              className={`font-flex font-semibold text-gold underline underline-offset-2 ${FOCUS_RING}`}
            >
              {screen.figmaNodeId}
            </a>
          </dd>
        </div>
        {summary ? (
          <div className="flex items-center gap-2">
            <dt className="text-caption">State</dt>
            <dd className="font-flex text-muted">{summary}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Link
          href={href}
          className={`rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.5px] text-page ${FOCUS_RING}`}
        >
          {selected ? 'Reopen' : 'Open'}
        </Link>
        <Link
          href={buildHref(params, { screen: screen.id })}
          className={`rounded-full border border-solid border-medium px-4 py-1.5 text-xs font-semibold text-secondary transition-colors hover:text-primary ${FOCUS_RING}`}
        >
          Preview only
        </Link>
      </div>
    </li>
  )
}

function Preview({ screen }: { screen: ScreenSpec }) {
  return (
    <section
      aria-label={`Live preview — ${screen.label}`}
      className="flex flex-col gap-3 rounded-2xl border border-solid border-card bg-card p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-primary">{screen.label}</h2>
        <p className="text-xs text-caption">
          Live page at {screen.viewport}px. Overlays open over this document, not inside the frame.
        </p>
      </div>

      {/* The frame is rendered at its true width and allowed to overflow the column rather than
          being scaled: a scaled preview reports the wrong type sizes to a designer measuring it. */}
      <div className="overflow-x-auto">
        <iframe
          key={screen.id}
          // withBase, or the preview frame loads the host's root instead of the deployed app.
          src={withBase('/')}
          title={`Jackpot homepage at ${screen.viewport}px`}
          width={screen.viewport}
          height={820}
          className="h-[820px] max-w-none rounded-xl border border-solid border-medium bg-page"
        />
      </div>
    </section>
  )
}

function ScreensHarness() {
  const searchParams = useSearchParams()

  const params = new URLSearchParams(searchParams.toString())
  const rawAuth = params.get('auth')
  const rawPanel = params.get('panel')

  const auth: AuthMode = isAuthMode(rawAuth) ? rawAuth : 'postlogin'
  const panel: PanelId | null = isPanelId(rawPanel) ? rawPanel : null
  const searchOpen = params.get('search') === '1'
  const query = params.get('q') ?? ''

  const selectedId = params.get('screen')
  const selected = screens.find((screen) => screen.id === selectedId)

  const setAuthMode = useAppStore((state) => state.setAuthMode)
  const openPanel = useAppStore((state) => state.openPanel)
  const closePanel = useAppStore((state) => state.closePanel)
  const setQuery = useAppStore((state) => state.setQuery)
  const closeSearch = useAppStore((state) => state.closeSearch)

  useEffect(() => {
    // Order matters: `setAuthMode` clears any open panel, and `openPanel` closes the search
    // dropdown, so the URL is applied outermost state first.
    setAuthMode(auth)

    if (panel) {
      openPanel(panel)
      return
    }

    closePanel()

    // `setQuery` opens the dropdown as a side effect, which is also what an empty query needs.
    if (searchOpen) setQuery(query)
    else closeSearch()
  }, [auth, panel, searchOpen, query, setAuthMode, openPanel, closePanel, setQuery, closeSearch])

  // Derived from the data, not listed: a registry entry on a third viewport groups itself.
  const viewports = [...new Set(screens.map((screen) => screen.viewport))]

  return (
    <div className="mx-auto flex max-w-content flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[2px] text-gold">Jackpot · review surface</p>
        <h1 className="font-display text-3xl font-bold text-primary">Screens</h1>
        <p className="max-w-prose text-sm leading-relaxed text-secondary">
          Every frame in <code className="font-flex text-muted">src/lib/screens.ts</code>, with the
          Figma node it was built from. Opening a card applies the account state and overlay that
          frame shows, and deep links keep working: add{' '}
          <code className="font-flex text-muted">?screen=</code>,{' '}
          <code className="font-flex text-muted">?auth=</code> or{' '}
          <code className="font-flex text-muted">?panel=</code> to this address by hand.
        </p>
        <p className="text-sm text-secondary">
          <Link href="/" className={`text-blue underline underline-offset-2 ${FOCUS_RING}`}>
            Open the homepage
          </Link>
          {' · '}
          {/*
            A plain anchor, not `Link`: the report is a static file under public/, not a route, so
            the router has nothing to prefetch or match. withBase, because on the deployed build it
            lives under the /jp-platform sub-path.
          */}
          <a
            href={withBase('/review/')}
            className={`text-blue underline underline-offset-2 ${FOCUS_RING}`}
          >
            Design vs implementation
          </a>
          {' · '}
          <Link href="/dev/screens" className={`text-blue underline underline-offset-2 ${FOCUS_RING}`}>
            Reset this page
          </Link>
        </p>
      </header>

      <Toolbar params={params} auth={auth} panel={panel} />

      {selected ? <Preview screen={selected} /> : null}

      {viewports.map((viewport) => (
        <section key={viewport} aria-labelledby={`viewport-${viewport}`} className="flex flex-col gap-4">
          <h2
            id={`viewport-${viewport}`}
            className="font-display text-sm font-bold uppercase tracking-[1px] text-footer-heading"
          >
            {viewport}px frames
          </h2>

          <ul className="grid grid-cols-3 gap-4 mobile:grid-cols-1">
            {screens
              .filter((screen) => screen.viewport === viewport)
              .map((screen) => (
                <ScreenCard
                  key={screen.id}
                  screen={screen}
                  params={params}
                  selected={screen.id === selectedId}
                />
              ))}
          </ul>
        </section>
      ))}

      {/* The same four islands the homepage mounts, so a deep-linked overlay has something to
          render into. They draw nothing while the store says they are closed. */}
      <SearchOverlay />
      <BalancePanel />
      <PersonalInfoPanel />
      <JackpotMenu />
    </div>
  )
}

export default function ScreensPage() {
  return (
    // `useSearchParams` opts the subtree out of static rendering; without this boundary the whole
    // route would have to be dynamic.
    <Suspense fallback={<p className="p-10 text-sm text-secondary">Loading screens…</p>}>
      <ScreensHarness />
    </Suspense>
  )
}
