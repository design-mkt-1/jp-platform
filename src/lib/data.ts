import categoriesJson from '@/data/categories.json'
import footerJson from '@/data/footer.json'
import gamesJson from '@/data/games.json'
import jackpotsJson from '@/data/jackpots.json'
import providersJson from '@/data/providers.json'
import recentWinsJson from '@/data/recentWins.json'
import tournamentsJson from '@/data/tournaments.json'
import userJson from '@/data/user.json'
import type {
  AuthMode,
  Balance,
  Category,
  FooterData,
  Game,
  Jackpot,
  PromoBannerData,
  Provider,
  RecentWin,
  Tournament,
  UserProfile,
} from './types'

/**
 * The single place where the mock JSON meets the types in `./types`.
 *
 * TypeScript infers a JSON import structurally — `tags: string[]`, not `tags: GameTag[]` — so
 * every consumer used to repeat its own `as Game[]` at the import site. Fifteen casts meant
 * fifteen chances for two files to disagree about the same file's shape. They live here now:
 * the JSON stays the source of the values, this module only names and types them.
 *
 * Nothing is transformed on the way through. A consumer that needs `withBase()` or a filter
 * still applies it itself.
 */

export const categories = categoriesJson as Category[]
export const games = gamesJson as Game[]
export const providers = providersJson as Provider[]
export const recentWins = recentWinsJson as RecentWin[]
export const jackpots = jackpotsJson as Jackpot[]
export const footer: FooterData = footerJson

/** `tournaments.json` holds two lists: the tournament records and the promo banners built from them. */
export const tournaments = tournamentsJson.tournaments as Tournament[]
export const promos = tournamentsJson.promos as PromoBannerData[]

/** `user.json` is one object with three top-level keys rather than three files. */
export const profile = userJson.profile as UserProfile
export const vipProfile = userJson.vipProfile as UserProfile
export const balances = userJson.balances as Record<AuthMode, Balance>
