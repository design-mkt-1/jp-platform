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

/**
 * Everything under `public/` moves when the site is served from a sub-path.
 *
 * The GitHub Pages review build lives at `/jp-platform/`, and Next's `basePath` rewrites links and
 * its own bundles but NOT the `src` of an image. Without this prefix every picture on the deployed
 * page 404s — the hero, all three real game thumbnails, the logo — while the dev server, served
 * from the root, looks perfectly fine. That is exactly the failure a local check cannot see.
 *
 * Empty in development and in any root-hosted deployment.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Prefixes a root-relative asset path with the deployment's base path.
 *
 * Paths that come out of `src/data/*.json` — game thumbnails, footer logos, promo backgrounds —
 * bypass the helpers below, so their call sites have to pass them through this.
 */
export const withBase = (path: string): string =>
  path.startsWith('/') ? `${BASE_PATH}${path}` : path

/*
 * WebP, not PNG. The Figma exports were the raw bitmaps and the Pages build serves them untouched
 * — a static export has no image optimiser — so the whole of public/images went through
 * `node scripts/to-webp.mjs`: 2.7 MB down to 313 KB. Add a new export by running that script, not
 * by dropping a .png in beside these.
 */
export const gameThumb = (slug: string) => withBase(`/images/games/${slug}.webp`)

export const providerLogo = (id: string) => withBase(`/images/providers/${id}.svg`)

/** Section headers and the category bar. `IconName` is closed, so a typo fails to compile. */
export const sectionIcon = (name: IconName) => withBase(`/images/icons/${name}.svg`)

/** The Jackpot wordmark, node 1:4250. Was a literal in two components before the sub-path move. */
export const LOGO = withBase('/images/logo.svg')

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
export const HERO_BONUS = withBase('/images/hero/welcome-bonus.webp')

/**
 * The mobile hero has its own artwork in Figma (node 1:5751), not a crop of the desktop one: the
 * navy gradient, the figure and the violet shard in the bottom corner are all painted into it.
 * Exported at 3x for a 358x170 card.
 */
export const HERO_BONUS_MOBILE = withBase('/images/hero/welcome-bonus-mobile.webp')

/** Backdrops for the three promo rows. Keyed by `PromoVariant` so the banner needs no switch. */
export const PROMO_BANNERS: Readonly<Record<PromoVariant, string>> = {
  tournament: withBase('/images/hero/tournament-banner.webp'),
  lottery: withBase('/images/hero/lottery-banner.webp'),
  wheel: withBase('/images/hero/wheel-banner.webp'),
}

/**
 * Footer payment logos, keyed by the ids in `src/data/footer.json`. File names keep the Figma
 * layer names, which is why the keys and the paths disagree — that mismatch is the reason this
 * map exists rather than a template string.
 */
export const PAYMENT_LOGOS: Readonly<Record<string, string>> = {
  'cascading-gbp': withBase('/images/payments/cascading-gbp-a.svg'),
  'gateway-crypto': withBase('/images/payments/gateway-crypto.svg'),
  'bitcoin-cash': withBase('/images/payments/gatewaycrypto-bch.svg'),
  bitcoin: withBase('/images/payments/gatewaycrypto-btc.svg'),
  ethereum: withBase('/images/payments/gatewaycrypto-eth.svg'),
  tether: withBase('/images/payments/gatewaycrypto-usdt.svg'),
  'visa-mastercard': withBase('/images/payments/mock.svg'),
}

/**
 * Footer partner logos, keyed by the ids in `src/data/footer.json`. `partner-7` is deliberately
 * absent: the Figma slot (node 1:3993) is an empty frame.
 */
export const PARTNER_LOGOS: Readonly<Record<string, string>> = {
  casinostest: withBase('/images/partners/casinostest.svg'),
  gamblersbet: withBase('/images/partners/gamblersbet.svg'),
  'casino-bonus-now': withBase('/images/partners/cbn.svg'),
  'no-deposit': withBase('/images/partners/nodeposit.svg'),
  'casino-bonus-club': withBase('/images/partners/cbc.svg'),
  // Zamsino was a raster fill in Figma, not a vector — the only partner that is not an SVG.
  zamsino: withBase('/images/partners/zamsino.webp'),
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

export const languageFlag = (code: string) => withBase(`/images/flags/${code}.svg`)

/** 16px glyph inside the search input of the category bar (node 1:2589). */
export const SEARCH_ICON = withBase('/images/icons/search.svg')

/** 20px glyph of the standalone search button in the Leading Providers header (node 1:2656). */
export const SEARCH_BUTTON_ICON = withBase('/images/icons/search-btn.svg')
