/**
 * The shared vocabulary of the demo. Every other module imports its shapes from here so a
 * rename happens in one place instead of fifteen.
 *
 * Money is always a plain number of GBP units (not minor units): the mock data is authored by
 * hand and `41.04` is easier to read and to audit than `4104`. Rendering goes through
 * `src/lib/format.ts` — never through a local `toFixed`.
 */

/** The four tabs of the category bar (Figma node 1:2500). */
export type CategoryId = 'popular' | 'slots' | 'live-casino' | 'jackpots'

/**
 * Row membership. A tag is what puts a game into a homepage row; a category is what puts it
 * behind a nav tab. They are deliberately separate: "crash" is a row but not a tab.
 */
export type GameTag =
  | 'new'
  | 'hot'
  | 'drops'
  | 'megaways'
  | 'bonusbuy'
  | 'crash'
  | 'jackpot'
  | 'instant'
  | 'egypt'
  | 'lottery'

/**
 * Icon slots used by section headers and the category bar. Kept as a closed union so a typo in
 * a data file fails at compile time rather than rendering an empty box.
 */
export type IconName =
  | 'popular'
  | 'new'
  | 'providers'
  | 'recommended'
  | 'crash'
  | 'slots'
  | 'bonus-buy'
  | 'tournaments'
  | 'megaways'
  | 'jackpots'
  | 'lottery'
  | 'drops-wins'
  | 'wheel'
  | 'instant'
  | 'egypt'
  | 'live-casino'
  | 'search'

export interface Game {
  id: string
  /** Also the thumbnail file name: `/images/games/<slug>.png`. */
  slug: string
  title: string
  /** A `Provider.id`, not a display name. Resolve through `providers.json`. */
  provider: string
  /**
   * `null` whenever no real artwork was exported from Figma. GameCard then draws a deterministic
   * gradient placeholder with the title and provider on top — the Figma card bakes both into the
   * image, so the placeholder has to supply them itself.
   */
  thumb: string | null
  /**
   * May be empty: crash and instant titles belong to no nav tab. Consumers that need a badge
   * should fall back to the first entry of `tags`.
   */
  categories: CategoryId[]
  tags: GameTag[]
  /** Present only on games that actually carry a progressive pot. */
  jackpotGbp?: number
  rtp?: number
}

export interface Provider {
  id: string
  name: string
  /** `/images/providers/<id>.svg`, or `null` when no logo was exported from Figma. */
  logo: string | null
  /** Number of games this provider has in `games.json` — kept in sync with the data by hand. */
  gameCount: number
}

export interface RecentWin {
  id: string
  gameId: string
  gameTitle: string
  thumb: string | null
  amountGbp: number
  /** Already masked at the source, e.g. "le****et". Never store or render a full username. */
  username: string
  /** ISO 8601 timestamp. */
  at: string
}

export type JackpotTier = 'mini' | 'minor' | 'major' | 'grand'

export interface Jackpot {
  id: string
  tier: JackpotTier
  amountGbp: number
  label: string
}

export interface Tournament {
  id: string
  title: string
  subtitle: string
  prizePoolGbp: number
  /** ISO 8601 timestamp; the countdown is derived from it, not stored. */
  endsAt: string
  image: string
  ctaLabel: string
}

export type PromoVariant = 'tournament' | 'lottery' | 'wheel'

export interface PromoBannerData {
  id: string
  variant: PromoVariant
  title: string
  subtitle: string
  image: string
  ctaLabel: string
  ctaHref: string
}

export interface Category {
  id: CategoryId
  label: string
  icon: IconName
  count: number
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  phone: string
  /** ISO date, `YYYY-MM-DD`. */
  dob: string
  address: string
  tier: 'standard' | 'vip'
  kycVerified: boolean
}

export interface Balance {
  totalGbp: number
  cashGbp: number
  bonusGbp: number
  withdrawableGbp: number
  wagering: {
    requiredGbp: number
    completedGbp: number
  }
}

/** Which of the three balance sets a screen shows follows `useAppStore().authMode`. */
export type AuthMode = 'prelogin' | 'postlogin' | 'vip'

export interface FooterLogo {
  id: string
  label: string
  /** `null` until the asset is exported; the component then falls back to the label. */
  src: string | null
  href?: string
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterData {
  paymentLogos: FooterLogo[]
  partnerLogos: FooterLogo[]
  columns: FooterColumn[]
  legal: string
}

/**
 * Declarative row query. All present fields must match (AND). `limit` is applied last, after
 * filtering, so a row of six is `{ tag: 'crash', limit: 6 }`.
 */
export interface GameFilter {
  tag?: GameTag
  category?: CategoryId
  provider?: string
  limit?: number
}
