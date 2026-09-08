import Image from 'next/image'
import Badge from '../primitives/Badge'
import { gradientForId } from '../cards/GameCard'
import { categories } from '@/lib/data'
import { gameThumbOrNull } from '@/lib/assets'
import type { CategoryId, Game } from '@/lib/types'

/**
 * The typing state — node 1:4579: a "Matching Suggestions" label over four 60px rows, each a
 * 48x36 thumbnail, the title, the studio and a category chip.
 *
 * The list arrives already matched and already cut to four by `getSuggestions`; this component does
 * no filtering of its own. Duplicating the ranking here is exactly how the dropdown and a results
 * page start disagreeing about what "Bonanza" returns.
 *
 * Node 1:4583 paints the first row on a lighter fill and the other three transparent. The list is
 * already ranked by `getSuggestions`, so that fill marks the best match — the row Enter would take
 * you to — and it is reproduced here as a permanent state on the first row. The same swatch is
 * also the `:hover`/`:focus-visible` cue on every row, so a keyboard user gets it too.
 */

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  categories.map((category) => [category.id, category.label]),
)

/**
 * "Popular" is a curation tab rather than a genre: it is how the category bar collects the house
 * picks, and `games.json` deliberately lists it first on the games that carry it so that tab keeps
 * its order. Reading `categories[0]` therefore chipped seven rows "Popular" where Figma (node
 * 1:4479) chips the genre — "Slots" for Sweet Bonanza. Skipping it here leaves the data file alone.
 */
const CURATION_CATEGORIES: CategoryId[] = ['popular']

/**
 * Crash and instant titles belong to no nav tab, so their `categories` array is empty and the chip
 * falls back to the first tag — the alternative is a row with a hole where every sibling has a chip.
 * A game whose only category is a curation one still chips it: that is the truest label it has.
 */
function chipLabel(game: Game): string | null {
  const category =
    game.categories.find((id) => !CURATION_CATEGORIES.includes(id)) ?? game.categories[0]
  if (category) return CATEGORY_LABELS[category] ?? category

  const tag = game.tags[0]
  return tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : null
}

export interface SearchSuggestionsProps {
  games: Game[]
  /** `Provider.id` → display name. A missing entry falls back to the raw id. */
  providerNames?: Record<string, string>
  onSelect: (game: Game) => void
  className?: string
}

const ROW_CLASSES = [
  'flex w-full items-center gap-3 rounded-xl p-3 text-left',
  'transition-colors hover:bg-field focus-visible:bg-field',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue',
].join(' ')

export default function SearchSuggestions({
  games,
  providerNames,
  onSelect,
  className,
}: SearchSuggestionsProps) {
  return (
    <div className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      {/* A heading, not an `aria-labelledby` target: a fixed id would collide if a page ever showed
          two suggestion lists, and this component takes no `useId` because it is not an island. */}
      <h3 className="px-2 font-flex text-xs font-bold uppercase tracking-[0.8px] text-muted">
        Matching Suggestions
      </h3>

      <ul className="flex flex-col gap-1" aria-label="Matching suggestions">
        {games.map((game, index) => {
          const thumb = gameThumbOrNull(game.slug)
          const provider = providerNames?.[game.provider] ?? game.provider
          const chip = chipLabel(game)

          return (
            <li key={game.id}>
              <button
                type="button"
                onClick={() => onSelect(game)}
                className={index === 0 ? `${ROW_CLASSES} bg-field` : ROW_CLASSES}
              >
                {thumb ? (
                  <Image
                    src={thumb}
                    alt=""
                    width={48}
                    height={36}
                    className="h-9 w-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  // Same deterministic gradient the card grid uses, so one game is one colour
                  // wherever it appears. No title on it: the title is 12px to its right.
                  <span
                    aria-hidden
                    className={`h-9 w-12 shrink-0 rounded-md ${gradientForId(game.id)}`}
                  />
                )}

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-flex text-sm font-semibold text-primary">
                    {game.title}
                  </span>
                  <span className="truncate font-flex text-[11px] font-medium text-muted">
                    {provider}
                  </span>
                </span>

                {chip ? (
                  <Badge tone="blue" size="sm" className="shrink-0">
                    {chip}
                  </Badge>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
