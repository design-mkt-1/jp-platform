import Icon from '../primitives/Icon'

/**
 * The "nothing matched" state, in the two sizes the design draws it.
 *
 * `lg` is the dropdown panel of node 1:4711: an 80px disc around a 32px glyph, a Bricolage
 * headline, a Roboto body line and the "Clear search" pill. `sm` is the compact form used inside a
 * section — node 1:4321 on desktop and node 1:2218 in the mobile Leading Providers row — where the
 * disc is dropped, the glyph stands alone at 48px and the copy is Inter.
 *
 * The copy is a prop rather than a branch on some `subject` union: the two nodes say "No games
 * found" and "No providers found", and a third caller will want a third noun. Defaults reproduce
 * node 1:4711 so the common case stays a one-word call — with one word of it dropped, on purpose.
 *
 * Node 1:4711's line ends "…or browse our categories below". There are no categories below: this
 * block's only child is the "Clear search" pill, and the category pills live in the same bar as
 * the field, to the left of it and above this panel. Both default callers — the search dropdown
 * (`SearchOverlay`) and the category view — inherit that sentence, so both were sending the reader
 * to something that is not there. The half that was true is kept; the half that was a direction is
 * not. `ProviderRow` already passes exactly this shorter line.
 */

/** `lg` is the search dropdown (node 1:4711); `sm` the in-section form (nodes 1:4321, 1:2218). */
export type SearchNoResultsSize = 'lg' | 'sm'

export interface SearchNoResultsProps {
  title?: string
  description?: string
  size?: SearchNoResultsSize
  /** Renders the "Clear search" pill of node 1:4719. Omit and the pill disappears with it. */
  onClear?: () => void
  className?: string
}

export default function SearchNoResults({
  title = 'No games found',
  description = 'Try a different search term',
  size = 'lg',
  onClear,
  className,
}: SearchNoResultsProps) {
  const large = size === 'lg'

  return (
    <div
      className={[
        'flex w-full flex-col items-center text-center',
        large ? 'gap-6 px-12 py-12 mobile:px-4' : 'gap-4 py-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {large ? (
        // Node 1:4712: an 80px disc holding a 32px glyph. Both boxes are stated explicitly so the
        // glyph keeps its designed padding instead of growing with the disc.
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full border border-solid border-separator bg-field">
          <Icon name="search" width={32} height={32} className="size-8" />
        </span>
      ) : (
        // Nodes 1:4329 / 1:2246 draw the glyph at 48px with no disc behind it.
        <Icon name="search" width={48} height={48} className="size-12 shrink-0" />
      )}

      <div className={`flex flex-col ${large ? 'gap-2' : 'gap-1.5'}`}>
        <p
          className={
            large
              ? 'font-display text-xl font-bold text-primary'
              : 'text-base font-extrabold leading-[1.2] text-primary'
          }
        >
          {title}
        </p>
        <p
          className={
            large
              ? 'font-flex text-sm leading-5 text-muted'
              : 'text-[13px] font-medium leading-[1.4] text-caption'
          }
        >
          {description}
        </p>
      </div>

      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className={[
            'inline-flex items-center gap-2 rounded-full bg-elevated px-4 py-2',
            'font-flex text-[13px] font-bold text-cyan',
            'transition-colors hover:bg-subtle',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
          ].join(' ')}
        >
          {/* Node 1:4721 is a circled x; the exported glyph set only carries the bare x. */}
          <Icon name="close" width={14} height={14} className="size-3.5" />
          Clear search
        </button>
      ) : null}
    </div>
  )
}
