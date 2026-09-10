'use client'

import { useEffect, useId, useRef } from 'react'
import CategoryPill from '../primitives/CategoryPill'
import Icon from '../primitives/Icon'
import { useOverlayBehavior } from '../primitives/Panel'
import {
  SEARCH_PANEL_CLASSES,
  SearchDropdownBody,
  useDesktopViewport,
  useSearchBarHost,
  useSearchFieldKeys,
} from '../search/SearchOverlay'
import { categories as ALL_CATEGORIES } from '@/lib/data'
import { useAppStore } from '@/store/useAppStore'
import type { Category, CategoryId } from '@/lib/types'

/**
 * The glass capsule of Figma node 1:2500: the category tabs on the left, the search field on the
 * right, and the cyan light ellipse (node 1:2434) bleeding out from under it.
 *
 * ## The bar is where the search happens
 *
 * Nodes 1:4334, 1:4479 and 1:4611 all draw the same move: the tabs stay put, the control on the
 * right grows from the 244px placeholder (node 1:2588) into the 320px live field of node 1:4568 —
 * cyan ring, cyan glow, a clear button — and the 720px suggestions panel drops 12px below the
 * capsule, right-aligned to its outer edge. There is no second field anywhere in those frames.
 *
 * So this component owns the desktop dropdown and `SearchOverlay` stands down while it does, which
 * it learns from `useSearchBarHost`. Below the `mobile:` breakpoint the design has no search
 * control in this bar at all (node 21:2975) — it is the header magnifier's job there — so the claim
 * is dropped, the trigger is hidden and the chip track takes the whole row.
 *
 * ## How the panel is positioned
 *
 * The dialog surface wraps the field and the panel so the focus trap and the outside-click test
 * have one element to ask about — but it is left `static`, which makes the capsule the containing
 * block for the absolutely positioned panel. That is what lets `top-full mt-3` and `right-0` mean
 * "12px under the capsule, flush with its right edge" without this file hard-coding the capsule's
 * own height or padding.
 *
 * The Figma bar shows six pills, three of them duplicate "Jackpots" placeholders. The four real
 * categories come from `categories.json` instead.
 */

/** 22px inset + 16px glyph + 8px gap + 176px label + 22px inset — node 1:2588 is 244 wide. */
const SEARCH_TRIGGER_CLASSES = [
  'flex h-12 w-[244px] shrink-0 items-center gap-2 rounded-full px-[22px]',
  'border border-solid border-divider bg-subtle backdrop-blur-[4px]',
  'text-left text-[13px] font-semibold text-nav',
  'transition-colors hover:border-medium hover:text-primary',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  // Node 21:2975 lays the chips across the whole 390 row and carries no search field: on mobile
  // the search control is the header magnifier, which calls the same `openSearch`.
  // A second trigger here claimed 244px of the row and left the scroller showing one chip.
  'mobile:hidden',
].join(' ')

/**
 * Node 1:4568: 320x48, 24px radius, a 1.5px cyan ring over the darkest fill in the palette and a
 * 6px cyan glow. `bg-page` rather than the field fill — the active field is a hole punched in the
 * capsule, one step *darker* than the bar, which is the opposite of node 1:4314's `bg-field`.
 */
const SEARCH_FIELD_CLASSES = [
  'flex h-12 w-[320px] items-center gap-3 rounded-3xl px-[18px]',
  'border-[1.5px] border-solid border-cyan bg-page',
  'shadow-[0_0_6px_color-mix(in_srgb,var(--cyan)_13%,transparent)]',
].join(' ')

export interface CategoryNavBarProps {
  categories?: Category[]
  /**
   * Forces the outlined tab. Only `/dev/screens` passes it, to capture one tab without driving
   * the store; the page itself leaves it undefined and the bar reads the selection from the store.
   */
  activeCategory?: CategoryId
  searchPlaceholder?: string
  className?: string
}

export default function CategoryNavBar({
  categories = ALL_CATEGORIES,
  activeCategory,
  searchPlaceholder = 'Search games...',
  className,
}: CategoryNavBarProps) {
  // Selector form, not the whole store: the bar re-renders on the query and on nothing else.
  const open = useAppStore((state) => state.search.open)
  const query = useAppStore((state) => state.search.query)
  const openSearch = useAppStore((state) => state.openSearch)
  const closeSearch = useAppStore((state) => state.closeSearch)
  const setQuery = useAppStore((state) => state.setQuery)
  const storeCategory = useAppStore((state) => state.activeCategory)
  const setCategory = useAppStore((state) => state.setCategory)

  const selected = activeCategory ?? storeCategory

  const fieldId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const capsuleRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Enter commits the query and ArrowDown drops focus into the panel below the field; both were
  // dead until 2026-09-09. `panelRef` is already the element holding the suggestion rows.
  const onFieldKeyDown = useSearchFieldKeys(panelRef)

  const desktop = useDesktopViewport()
  useSearchBarHost(desktop)

  const inline = desktop && open

  // Escape, the focus trap and the scroll lock, shared with the header panels. Its outside-click
  // helper is for a full-screen backdrop, which an anchored dropdown does not have — the document
  // listener below takes that job instead.
  const { surfaceRef } = useOverlayBehavior(inline, closeSearch)

  // The panel hangs off this bar, but `openSearch` also fires from the providers row two thirds of
  // the way down the page. Opening from there used to raise a `fixed` overlay; now it would drop a
  // panel nobody can see, and `useOverlayBehavior` has already locked scrolling by the time this
  // runs, so the player could not go looking for it either.
  useEffect(() => {
    if (!inline) return

    const capsule = capsuleRef.current
    const panel = panelRef.current
    if (!capsule || !panel) return

    // The panel and not the capsule decides: focusing the field has already pulled the bar into
    // view by this point, which says nothing about whether the results under it are on screen.
    const box = panel.getBoundingClientRect()
    if (box.top >= 0 && box.bottom <= window.innerHeight) return

    capsule.scrollIntoView({ block: 'start' })
  }, [inline])

  useEffect(() => {
    if (!inline) return

    const onMouseDown = (event: MouseEvent) => {
      const surface = surfaceRef.current
      if (surface && !surface.contains(event.target as Node)) closeSearch()
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [inline, closeSearch, surfaceRef])

  // `useOverlayBehavior` restores focus to whatever was focused when the dropdown opened — but here
  // that is the trigger button, and opening unmounts it, so its `focus()` lands on a detached node.
  // The replacement button exists by the time this effect runs, so it gets the caret instead.
  const wasInline = useRef(false)
  useEffect(() => {
    if (wasInline.current && !inline) triggerRef.current?.focus()
    wasInline.current = inline
  }, [inline])

  return (
    <div
      className={['relative w-full px-page-x pb-6 mobile:pl-4 mobile:pr-0', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Node 1:2434, redrawn rather than imported: Figma exports it as a pre-blurred SVG, and this
          component may not add files under public/. A blurred ellipse in the cyan token is the same
          shape at the same place and re-tints itself if the token ever moves.

          Desktop only. `1:2434` lives under the desktop frame `1:2431`, and the mobile design has no
          such glow: frame `21:2922` renders a flat `#0F121D` from its top edge to its bottom, sampled
          down the whole 229px column. Ours leaked onto the phone through a `mobile:inset-x-4` that
          repositioned the ellipse instead of removing it — the same shape as the cyan ring on the
          active chip, which was a desktop treatment reaching mobile too. Owner decision 2026-09-10:
          the mobile category bar takes full Figma parity, and that includes its backdrop. */}
      <span
        aria-hidden
        className={[
          'pointer-events-none absolute inset-x-[76px] bottom-0 z-0 h-[81px]',
          'rounded-[50%] bg-cyan opacity-20 blur-[32px]',
          'mobile:hidden',
        ].join(' ')}
      />

      <div
        ref={capsuleRef}
        className={[
          // `scroll-mt-6` is the 24px the frames leave above the capsule, so the scroll above
          // lands the bar exactly where nodes 1:4334 / 1:4479 / 1:4611 draw it.
          'relative z-10 mx-auto flex max-w-content scroll-mt-6 items-center justify-between gap-4 p-4',
          // 44px, not `rounded-full`: the capsule is 78px tall, so a pill radius would be 39.
          'rounded-[44px] border border-solid border-divider bg-card',
          // Node 21:2975 has no capsule *at all* on mobile — it is a bare 390x42 band on the page
          // background. The element stays for layout and for the scroll container, but none of the
          // desktop chrome paints: the fill was measured as `#151624` in the 6px gap between two
          // chips where Figma has the page's `#0F121D`, and the 1px border as `#262633` in the last
          // column where Figma has the clipped chip's own artwork. The track starts 16px from the
          // page edge, which the wrapper's own `mobile:pl-4` already gives it, and runs to the
          // right edge so the chip that does not fit is visibly cut rather than hidden.
          //
          // One `mobile:` utility per Tailwind family, deliberately: `mobile:border-0` (width) and
          // not `mobile:border-none` (style), so it never competes with `border-solid`. Against the
          // unprefixed utility the order is defined, and it is verified with `getComputedStyle` on
          // the static export, not only in `next dev` — this repo has had a `mobile:` pair resolve
          // to 40 in dev and 32 in the Pages build.
          'mobile:rounded-none mobile:border-0 mobile:bg-transparent mobile:p-0',
        ].join(' ')}
      >
        {/* `mobile:gap-1.5` is node 21:2977, the Horizontal-Chips-Track, which sets the chips 6px
            apart rather than the desktop bar's 12px. The track is 42 tall and its background is
            `--bg-page`, which is what the page already paints behind it. */}
        <div className="no-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto mobile:gap-1.5">
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              label={category.label}
              icon={category.icon}
              active={category.id === selected}
              onClick={() => setCategory(category.id)}
            />
          ))}
        </div>

        {inline ? (
          // No `relative` on purpose — see the note at the top of the file.
          <div
            ref={surfaceRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search games"
            tabIndex={-1}
            className="shrink-0 outline-none"
          >
            <div className={SEARCH_FIELD_CLASSES}>
              <Icon name="search" width={16} height={16} className="size-4 shrink-0" />

              <label htmlFor={fieldId} className="sr-only">
                Search games
              </label>
              <input
                id={fieldId}
                type="search"
                value={query}
                placeholder={searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onFieldKeyDown}
                autoComplete="off"
                className={[
                  'min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-primary',
                  'placeholder:font-medium placeholder:text-muted focus:outline-none',
                  // Safari and Chrome draw their own clear affordance on type=search; node 1:4575
                  // has its own, and two of them side by side reads as a bug.
                  '[&::-webkit-search-cancel-button]:appearance-none',
                ].join(' ')}
              />

              {query.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className={[
                    // The glyph is 12px per node 1:4707 and sits 18px from the field's right edge;
                    // the padding is hit area, so the negative margin gives that 4px back.
                    'shrink-0 rounded-full p-1 -mr-1 transition-[filter] hover:brightness-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue',
                  ].join(' ')}
                >
                  {/* Node 1:4576 is a circled x; the exported glyph set only carries the bare x. */}
                  <Icon name="close" width={12} height={12} className="size-3" />
                </button>
              ) : null}
            </div>

            {/* Node 1:4710: the panel hangs off the capsule, not off the field — 720 wide, flush
                with the capsule's right edge and 12px below it. `top`/`right` resolve against the
                capsule's padding box, so the -1px pulls the panel back out over its border. */}
            <div
              ref={panelRef}
              className={`absolute -right-px top-full z-10 mt-3 w-[720px] ${SEARCH_PANEL_CLASSES}`}
            >
              <SearchDropdownBody />
            </div>
          </div>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            onClick={openSearch}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={SEARCH_TRIGGER_CLASSES}
          >
            <Icon name="search" width={16} height={16} className="size-4 shrink-0" />
            <span className="truncate">{searchPlaceholder}</span>
          </button>
        )}
      </div>
    </div>
  )
}
