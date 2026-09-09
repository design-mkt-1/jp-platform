import type { Game, GameFilter, IconName, PromoVariant } from './types'

/**
 * The homepage as data.
 *
 * Fifteen rows in a fixed order, on both viewports. Keeping them here rather than as JSX means
 * the desktop page, the mobile page and the /dev/screens harness cannot drift apart, and that
 * reordering a row is a one-line diff instead of a component move.
 *
 * `figmaNodeId` is carried through so any later visual diff can pull the exact frame back out of
 * the Figma file `2MyylxdZblfGnf05nQacUz` without a second inventory pass.
 */

interface SectionBase {
  id: string
  /** Header label. Stored in title case; the header applies whatever transform the design uses. */
  title: string
  icon: IconName
  figmaNodeId: string
}

export interface GamesSectionSpec extends SectionBase {
  kind: 'games'
  /** The "See All (n)" count from the Figma header — a catalogue total, not the row length. */
  total: number
  /** Rows of six cards. Two grids means twelve games, so `filter.limit` is 12. */
  grids: 1 | 2
  filter: GameFilter
}

export interface ProvidersSectionSpec extends SectionBase {
  kind: 'providers'
}

export interface PromoSectionSpec extends SectionBase {
  kind: 'promo'
  variant: PromoVariant
}

export type SectionSpec = GamesSectionSpec | ProvidersSectionSpec | PromoSectionSpec

/** Every games header in the desktop design reads "See All (206)". */
const SEE_ALL_TOTAL = 206

export const desktopSections: SectionSpec[] = [
  {
    kind: 'games',
    id: 'popular-games',
    title: 'Popular',
    icon: 'popular',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { category: 'popular', limit: 6 },
    figmaNodeId: '1:2592',
  },
  {
    kind: 'games',
    id: 'new-games',
    title: 'New Games',
    icon: 'new',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'new', limit: 6 },
    figmaNodeId: '1:2620',
  },
  {
    kind: 'providers',
    id: 'leading-providers',
    title: 'Leading Providers',
    icon: 'providers',
    figmaNodeId: '1:2649',
  },
  {
    kind: 'games',
    id: 'recommended-games',
    title: 'Recommended',
    icon: 'recommended',
    total: SEE_ALL_TOTAL,
    grids: 2,
    // No tag: the recommendation row is "whatever the catalogue leads with".
    filter: { limit: 12 },
    figmaNodeId: '1:3180',
  },
  {
    kind: 'games',
    id: 'crash-games',
    title: 'Crash Games',
    icon: 'crash',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'crash', limit: 6 },
    figmaNodeId: '1:3230',
  },
  {
    kind: 'games',
    id: 'must-play-slots',
    title: 'Must-Play Slots',
    icon: 'slots',
    total: SEE_ALL_TOTAL,
    grids: 2,
    filter: { category: 'slots', limit: 12 },
    figmaNodeId: '1:3285',
  },
  {
    kind: 'games',
    id: 'bonus-buy',
    title: 'Bonus Buy',
    icon: 'bonus-buy',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'bonusbuy', limit: 6 },
    figmaNodeId: '1:3364',
  },
  {
    kind: 'promo',
    id: 'current-tournaments',
    title: 'Current Tournaments',
    icon: 'tournaments',
    variant: 'tournament',
    figmaNodeId: '1:3427',
  },
  {
    kind: 'games',
    id: 'megaways-games',
    title: 'Megaways',
    icon: 'megaways',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'megaways', limit: 6 },
    figmaNodeId: '1:3456',
  },
  {
    kind: 'games',
    id: 'jackpot-games',
    title: 'Jackpots',
    icon: 'jackpots',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'jackpot', limit: 6 },
    figmaNodeId: '1:3485',
  },
  {
    kind: 'promo',
    id: 'weekly-lottery',
    title: 'Weekly Lottery',
    icon: 'lottery',
    variant: 'lottery',
    figmaNodeId: '1:3524',
  },
  {
    kind: 'games',
    id: 'drops-and-wins',
    title: 'Drops & Wins',
    icon: 'drops-wins',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'drops', limit: 6 },
    figmaNodeId: '1:3548',
  },
  {
    kind: 'promo',
    id: 'wheel',
    title: 'Wheel',
    icon: 'wheel',
    variant: 'wheel',
    figmaNodeId: '1:3580',
  },
  {
    kind: 'games',
    id: 'instant-games',
    title: 'Instant Games',
    icon: 'instant',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'instant', limit: 6 },
    figmaNodeId: '1:3605',
  },
  {
    kind: 'games',
    id: 'egypt-games',
    title: 'Egypt',
    icon: 'egypt',
    total: SEE_ALL_TOTAL,
    grids: 1,
    filter: { tag: 'egypt', limit: 6 },
    figmaNodeId: '1:3635',
  },
]

/**
 * The mobile frame (21:2896) repeats the same fifteen rows in the same order, but every games row
 * is a single 3x2 grid — so each one asks for six games even where desktop asks for twelve.
 * Ids are shared with `desktopSections` so a component can be looked up by id on either viewport.
 */
const MOBILE_NODE_IDS: Record<string, string> = {
  // Rebuilt in Figma on 2026-09-09 together with the frame itself. Every id this map used to
  // carry, 1:5882 to 1:6499, resolves to nothing; each replacement below was read back from the
  // row's own `section-header` and matched on its title text, because the layer names are
  // copy-paste — twelve of the fifteen row frames are still called `popular-section`.
  'popular-games': '21:3058',
  'new-games': '21:3077',
  'leading-providers': '21:3095',
  'recommended-games': '21:3296',
  'crash-games': '21:3314',
  'must-play-slots': '21:3332',
  'bonus-buy': '21:3350',
  'current-tournaments': '21:3368',
  'megaways-games': '21:3384',
  'jackpot-games': '21:3402',
  'weekly-lottery': '21:3420',
  'drops-and-wins': '21:3437',
  wheel: '21:3455',
  'instant-games': '21:3657',
  'egypt-games': '21:3675',
}

export const mobileSections: SectionSpec[] = desktopSections.map((section) => {
  const figmaNodeId = MOBILE_NODE_IDS[section.id]

  if (section.kind !== 'games') {
    return { ...section, figmaNodeId }
  }

  return {
    ...section,
    figmaNodeId,
    grids: 1,
    filter: { ...section.filter, limit: 6 },
  }
})

/**
 * The single implementation of a row query. Four components resolving `GameFilter` their own way
 * would eventually disagree about what "limit" means; this keeps that decision in one place.
 */
export function selectGames(filter: GameFilter, games: Game[]): Game[] {
  const matched = games.filter((game) => {
    if (filter.tag && !game.tags.includes(filter.tag)) return false
    if (filter.category && !game.categories.includes(filter.category)) return false
    if (filter.provider && game.provider !== filter.provider) return false
    return true
  })

  return typeof filter.limit === 'number' ? matched.slice(0, filter.limit) : matched
}
