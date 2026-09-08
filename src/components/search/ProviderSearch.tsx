'use client'

import { useCallback } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import Icon from '../primitives/Icon'
import { useOverlayBehavior } from '../primitives/Panel'
import { useDesktopViewport } from './SearchOverlay'
import { useAppStore } from '@/store/useAppStore'

/**
 * The Leading Providers filter — Figma node 1:2220 at 390, node 1:4321 at 1440.
 *
 * The design draws the same field in two places. On mobile it takes the row's full width and sits
 * under the section header (node 1:2221), in place of the magnifier that opened it: node 1:2222
 * has nothing left in that slot while the field is up. On desktop it is a 720px popover hanging
 * under that same magnifier.
 *
 * ## Why this is not `SearchInput`
 *
 * That primitive is node 1:4314, the *games* field: fixed at 48px, `pl-4 pr-3`, and its clear
 * control empties the query and leaves the field open. Nodes 1:2238 and 1:4322 are 44px at 390 with
 * `px-3`, and their close button is the only way out of the mobile field — there is no magnifier
 * behind it to press again. Two size branches and a behaviour flag on a shared primitive, to serve
 * one caller, cost more than the field below.
 *
 * Dismissal on desktop reuses `useOverlayBehavior` from Panel, exactly as `SearchOverlay` does:
 * Escape, outside press, focus trap, focus handed back to the magnifier. The inline form has
 * nothing to trap — it sits in the page flow rather than over it — so it handles Escape itself and
 * leaves focus alone.
 */

/** `inline` is the mobile field of node 1:2221; `popover` the desktop card of node 1:4321. */
export type ProviderSearchVariant = 'inline' | 'popover'

export interface ProviderSearchProps {
  variant: ProviderSearchVariant
  /** Drawn under the field, inside the popover card. The inline form ignores it. */
  children?: ReactNode
  className?: string
}

export default function ProviderSearch({ variant, children, className }: ProviderSearchProps) {
  const query = useAppStore((state) => state.providerQuery)
  const setProviderQuery = useAppStore((state) => state.setProviderQuery)
  const close = useAppStore((state) => state.closeProviderSearch)

  // Both variants are mounted at once and one of them draws: the popover above 767px, the inline
  // field below it. A CSS toggle would leave two fields and two autofocus targets in the document.
  const desktop = useDesktopViewport()
  const shown = query !== null && (variant === 'popover') === desktop

  // A hook, so it runs on both instances; it does nothing while its first argument is false.
  const { surfaceRef, onBackdropMouseDown } = useOverlayBehavior(shown && variant === 'popover', close)

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') close()
    },
    [close],
  )

  if (!shown) return null

  const field = (
    <div
      // Nodes 1:2238 / 1:4322: 44 tall at 390 and 48 above it, both on a 24px radius. `bg-field` is
      // the #1A1D2E of the fill, `border-separator` the #282936 of the stroke.
      className={[
        'flex h-12 w-full items-center gap-3 rounded-3xl border border-solid border-separator',
        'bg-field pl-4 pr-3 focus-within:border-blue',
        'mobile:h-11 mobile:px-3',
      ].join(' ')}
      onKeyDown={variant === 'inline' ? onKeyDown : undefined}
    >
      <Icon name="search" width={20} height={20} className="shrink-0" />

      <input
        type="search"
        value={query ?? ''}
        onChange={(event) => setProviderQuery(event.target.value)}
        placeholder="Search providers..."
        aria-label="Search providers"
        // Opening the field is the whole gesture, so the caret belongs in it. On desktop
        // `useOverlayBehavior` focuses the first focusable in the surface, which is this input.
        autoFocus
        autoComplete="off"
        className={[
          'min-w-0 flex-1 bg-transparent text-sm font-semibold text-primary',
          'placeholder:text-caption focus:outline-none',
          // The browser's own clear affordance on type=search, beside the designed one below.
          '[&::-webkit-search-cancel-button]:appearance-none',
        ].join(' ')}
      />

      {/* Node 1:2242: 28px on a 14px radius, the card colour inside the same separator stroke. It
          dismisses rather than empties — a blank field over the full list is not a state the design
          draws, and at 390 this button is the only way back to the magnifier. */}
      <button
        type="button"
        onClick={close}
        aria-label="Close provider search"
        className={[
          'flex size-7 shrink-0 items-center justify-center rounded-[14px]',
          'border border-solid border-separator bg-card',
          'transition-colors hover:bg-elevated',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue',
        ].join(' ')}
      >
        <Icon name="close" width={16} height={16} className="size-4" />
      </button>
    </div>
  )

  if (variant === 'inline') return <div className={className}>{field}</div>

  return (
    <>
      {/* Not a portal: the card is positioned against the magnifier, and a portalled card would
          have to be told where that button is on every scroll. The backdrop is the card's sibling
          rather than its parent, so a press on the card itself never reaches it. */}
      <div className="fixed inset-0 z-40" onMouseDown={onBackdropMouseDown} />
      <div
        ref={surfaceRef}
        role="dialog"
        aria-label="Search providers"
        tabIndex={-1}
        // Node 1:4321: 720 wide, a 32px inset and a 32px gap, on the page colour rather than the
        // card's — this surface sits over the row, not in it.
        className={[
          'absolute right-0 top-full z-50 mt-3 flex w-[720px] flex-col gap-8',
          'rounded-3xl border border-solid border-card bg-page p-8 outline-none',
          'shadow-[0_16px_16px_rgb(0_0_0/0.5)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {field}
        {children}
      </div>
    </>
  )
}
