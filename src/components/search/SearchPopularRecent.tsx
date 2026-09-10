import Icon from '../primitives/Icon'
import { popularSearches } from '@/lib/search'

/**
 * The panel body shown while the query is empty — node 1:4431: "Popular Searches" as a wrap of
 * tags, a hairline, then "Recent Searches" as removable rows.
 *
 * Both lists are terms, not games. Picking one writes it into the field rather than navigating, so
 * the player sees what the term matches before committing; that is why `onSelect` takes a string
 * and the caller decides what to do with it.
 *
 * The recent list is a prop instead of being read from the store here: the store owns it, and a
 * second component subscribing to the same slice is one more place that can disagree about whether
 * a term was already removed.
 */

export interface SearchPopularRecentProps {
  /** Defaults to the eight tags of node 1:4434. */
  popular?: string[]
  /** The store's `search.recent`. An empty list hides the section and its divider. */
  recent: string[]
  onSelect: (term: string) => void
  onRemoveRecent: (term: string) => void
  className?: string
}

const SECTION_LABEL_CLASSES =
  'font-flex text-xs font-bold uppercase tracking-[0.8px] text-muted'

/** Node 1:4435: 16/8 padding, pill radius, on the field fill with a separator hairline. */
const TAG_CLASSES = [
  'rounded-full border border-solid border-separator bg-field px-4 py-2',
  // 15px, not the 16 the Inter sites use: this is `font-flex`, Roboto Flex, and `line-height:
  // normal` measures differently per family. Node 1:4436 writes `normal` at 13px.
  'font-flex text-[13px] leading-[15px] font-medium text-primary',
  'transition-colors hover:border-medium hover:bg-elevated',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

export default function SearchPopularRecent({
  popular = popularSearches,
  recent,
  onSelect,
  onRemoveRecent,
  className,
}: SearchPopularRecentProps) {
  return (
    <div className={['flex flex-col gap-6', className].filter(Boolean).join(' ')}>
      {/* Headings rather than `aria-labelledby`: a fixed id would collide the moment a page shows
          this body twice, and these components carry no `useId` because they are not islands. */}
      <section className="flex flex-col gap-3">
        <h3 className={SECTION_LABEL_CLASSES}>Popular Searches</h3>
        <div className="flex flex-wrap gap-2">
          {popular.map((term) => (
            <button key={term} type="button" onClick={() => onSelect(term)} className={TAG_CLASSES}>
              {term}
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 ? (
        <>
          <span aria-hidden className="h-0 border-t border-solid border-separator" />

          <section className="flex flex-col gap-3">
            <h3 className={SECTION_LABEL_CLASSES}>Recent Searches</h3>
            <ul className="flex flex-col gap-2">
              {recent.map((term) => (
                // The row is not itself a button: it holds two independent controls, and nesting
                // the remove control inside a clickable row is invalid HTML that keyboard users
                // reach in the wrong order.
                <li
                  key={term}
                  className="flex items-center justify-between gap-3 rounded-xl bg-card transition-colors hover:bg-field"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(term)}
                    className="min-w-0 flex-1 truncate px-3 py-2 text-left font-flex text-[13px] leading-[15px] font-medium text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
                  >
                    {term}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveRecent(term)}
                    aria-label={`Remove ${term} from recent searches`}
                    className="shrink-0 px-3 py-2 transition-[filter] hover:brightness-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
                  >
                    {/* Node 1:4459 is a 12px circled x; the exported set only has the bare x. */}
                    <Icon name="close" width={12} height={12} className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
