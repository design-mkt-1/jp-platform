import type { IconName, PromoVariant } from './types'

/**
 * The only place that knows how an asset name becomes a URL.
 *
 * Every file under `public/images/` was exported node-by-node from the Figma file
 * `2MyylxdZblfGnf05nQacUz`. Components must not hardcode those paths: the Figma layer names are
 * inconsistent (`Img - mock:margin` is in fact the Visa/Mastercard lockup) and a later re-export
 * will rename files. Routing every reference through this module keeps that churn to one diff.
 *
 * The `*_WITH_*` lists are the contract with the placeholder logic: they name exactly the assets
 * that exist on disk, so a component can decide to fall back before it ever requests a 404.
 */

export const gameThumb = (slug: string) => `/images/games/${slug}.png`

export const providerLogo = (id: string) => `/images/providers/${id}.svg`

/** Section headers and the category bar. `IconName` is closed, so a typo fails to compile. */
export const sectionIcon = (name: IconName) => `/images/icons/${name}.svg`

/**
 * The three game slugs whose artwork was actually baked into the Figma design. Everything else in
 * `games.json` is invented for the demo and has no exported art — `hasGameArt` returns false and
 * GameCard draws its gradient placeholder instead.
 */
export const GAMES_WITH_ART: readonly string[] = [
  'gates-of-olympus-1000',
  'big-bass-amazon-xtreme',
  'yeti-quest',
]

/** The five providers named in the Figma "Leading Providers" slider. The other seven are mock. */
export const PROVIDERS_WITH_LOGO: readonly string[] = [
  'pragmatic-play',
  'three-oaks-gaming',
  'bgaming',
  'nolimit-city',
  'spribe',
]

export const hasGameArt = (slug: string): boolean => GAMES_WITH_ART.includes(slug)

export const hasProviderLogo = (id: string): boolean => PROVIDERS_WITH_LOGO.includes(id)

/**
 * Resolves to a real file or to `null`, never to a broken URL. Components branch on the `null`
 * rather than on a load error, so the placeholder renders on the first paint.
 */
export const gameThumbOrNull = (slug: string): string | null =>
  hasGameArt(slug) ? gameThumb(slug) : null

export const providerLogoOrNull = (id: string): string | null =>
  hasProviderLogo(id) ? providerLogo(id) : null

/** Hero art under the header (Figma node 1:2437), exported at scale 1 to stay under 600 KB. */
export const HERO_BONUS = '/images/hero/welcome-bonus.png'

/**
 * The mobile hero has its own artwork in Figma (node 1:5751), not a crop of the desktop one: the
 * navy gradient, the figure and the violet shard in the bottom corner are all painted into it.
 * Exported at 3x for a 358x170 card.
 */
export const HERO_BONUS_MOBILE = '/images/hero/welcome-bonus-mobile.png'

/** Backdrops for the three promo rows. Keyed by `PromoVariant` so the banner needs no switch. */
export const PROMO_BANNERS: Readonly<Record<PromoVariant, string>> = {
  tournament: '/images/hero/tournament-banner.png',
  lottery: '/images/hero/lottery-banner.png',
  wheel: '/images/hero/wheel-banner.png',
}

/**
 * Footer payment logos, keyed by the ids in `src/data/footer.json`. File names keep the Figma
 * layer names, which is why the keys and the paths disagree — that mismatch is the reason this
 * map exists rather than a template string.
 */
export const PAYMENT_LOGOS: Readonly<Record<string, string>> = {
  'cascading-gbp': '/images/payments/cascading-gbp-a.svg',
  'gateway-crypto': '/images/payments/gateway-crypto.svg',
  'bitcoin-cash': '/images/payments/gatewaycrypto-bch.svg',
  bitcoin: '/images/payments/gatewaycrypto-btc.svg',
  ethereum: '/images/payments/gatewaycrypto-eth.svg',
  tether: '/images/payments/gatewaycrypto-usdt.svg',
  'visa-mastercard': '/images/payments/mock.svg',
}

/**
 * Footer partner logos, keyed by the ids in `src/data/footer.json`. `partner-7` is deliberately
 * absent: the Figma slot (node 1:3993) is an empty frame.
 */
export const PARTNER_LOGOS: Readonly<Record<string, string>> = {
  casinostest: '/images/partners/casinostest.svg',
  gamblersbet: '/images/partners/gamblersbet.svg',
  'casino-bonus-now': '/images/partners/cbn.svg',
  'no-deposit': '/images/partners/nodeposit.svg',
  'casino-bonus-club': '/images/partners/cbc.svg',
  // Zamsino was a raster fill in Figma, not a vector — the only partner that is not an SVG.
  zamsino: '/images/partners/zamsino.png',
}

export const paymentLogo = (id: string): string | null => PAYMENT_LOGOS[id] ?? null

export const partnerLogo = (id: string): string | null => PARTNER_LOGOS[id] ?? null

/**
 * The language switcher in the footer (Figma node 1:4016). Figma named every one of these layers
 * `en`, so the codes below come from reading the flags, not from the layer names.
 */
export const LANGUAGE_FLAGS: readonly string[] = [
  'gb',
  'ru',
  'de',
  'bg',
  'nl',
  'tr',
  'no',
  'it',
  'dk',
  'se',
]

export const languageFlag = (code: string) => `/images/flags/${code}.svg`

/** 16px glyph inside the search input of the category bar (node 1:2589). */
export const SEARCH_ICON = '/images/icons/search.svg'

/** 20px glyph of the standalone search button in the Leading Providers header (node 1:2656). */
export const SEARCH_BUTTON_ICON = '/images/icons/search-btn.svg'
