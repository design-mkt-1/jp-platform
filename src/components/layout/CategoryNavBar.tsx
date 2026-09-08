'use client'

import CategoryPill from '../primitives/CategoryPill'
import Icon from '../primitives/Icon'
import categoriesData from '@/data/categories.json'
import { useAppStore } from '@/store/useAppStore'
import type { Category, CategoryId } from '@/lib/types'

/**
 * The glass capsule of Figma node 1:2500: the category tabs on the left, the search field on the
 * right, and the cyan light ellipse (node 1:2434) bleeding out from under it.
 *
 * Client-side only because of the search trigger. The field in the design is a text input, but it
 * never receives typing here — tapping it opens the search overlay, which owns the real input and
 * the query in `useAppStore`. Rendering a second `<input>` that immediately hands focus away would
 * put two search fields in the accessibility tree for one search.
 *
 * The Figma bar shows six pills, three of them duplicate "Jackpots" placeholders. The four real
 * categories come from `categories.json` instead.
 */

const ALL_CATEGORIES = categoriesData as Category[]

/** 22px inset + 16px glyph + 8px gap + 176px label + 22px inset — node 1:2588 is 244 wide. */
const SEARCH_TRIGGER_CLASSES = [
  'flex h-12 w-[244px] shrink-0 items-center gap-2 rounded-full px-[22px]',
  'border border-solid border-divider bg-subtle backdrop-blur-[4px]',
  'text-left text-[13px] font-semibold text-nav',
  'transition-colors hover:border-medium hover:text-primary',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
  'mobile:w-auto mobile:flex-1',
].join(' ')

export interface CategoryNavBarProps {
  categories?: Category[]
  /** Only the outlined tab; the demo does not re-filter the page from here. */
  activeCategory?: CategoryId
  searchPlaceholder?: string
  className?: string
}

export default function CategoryNavBar({
  categories = ALL_CATEGORIES,
  activeCategory = 'popular',
  searchPlaceholder = 'Search games...',
  className,
}: CategoryNavBarProps) {
  // Selector form, not the whole store: the bar re-renders on nothing but this action's identity.
  const openSearch = useAppStore((state) => state.openSearch)

  return (
    <div
      className={['relative w-full px-page-x pb-6 mobile:px-4', className].filter(Boolean).join(' ')}
    >
      {/* Node 1:2434, redrawn rather than imported: Figma exports it as a pre-blurred SVG, and this
          component may not add files under public/. A blurred ellipse in the cyan token is the same
          shape at the same place and re-tints itself if the token ever moves. */}
      <span
        aria-hidden
        className={[
          'pointer-events-none absolute inset-x-[76px] bottom-0 z-0 h-[81px]',
          'rounded-[50%] bg-cyan opacity-20 blur-[32px]',
          'mobile:inset-x-4',
        ].join(' ')}
      />

      <div
        className={[
          'relative z-10 mx-auto flex max-w-content items-center justify-between gap-4 p-4',
          // 44px, not `rounded-full`: the capsule is 78px tall, so a pill radius would be 39.
          'rounded-[44px] border border-solid border-divider bg-card',
        ].join(' ')}
      >
        <div className="no-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto">
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              label={category.label}
              icon={category.icon}
              active={category.id === activeCategory}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={openSearch}
          aria-haspopup="dialog"
          className={SEARCH_TRIGGER_CLASSES}
        >
          <Icon name="search" width={16} height={16} className="size-4 shrink-0" />
          <span className="truncate">{searchPlaceholder}</span>
        </button>
      </div>
    </div>
  )
}
