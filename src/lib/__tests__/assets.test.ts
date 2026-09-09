import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BASE_PATH,
  GAMES_WITH_ART,
  HERO_BONUS,
  HERO_BONUS_MOBILE,
  LANGUAGE_FLAGS,
  LOGO,
  PARTNER_LOGOS,
  PAYMENT_LOGOS,
  PROMO_BANNERS,
  PROVIDERS_WITH_LOGO,
  SEARCH_BUTTON_ICON,
  SEARCH_ICON,
  gameThumb,
  languageFlag,
  providerLogo,
  sectionIcon,
} from '@/lib/assets'
import { desktopSections } from '@/lib/sections'
import type { IconName } from '@/lib/types'
import footer from '@/data/footer.json'
import games from '@/data/games.json'
import providers from '@/data/providers.json'
import tournaments from '@/data/tournaments.json'

/**
 * Every image the app can ask for has to exist on disk.
 *
 * This is the one failure this project has already shipped twice. The sub-path deploy broke every
 * image at once, because `basePath` rewrites links but not an image `src`, and the page looked
 * perfect on the dev server the whole time. Separately, a bad Figma export left `search-btn.svg`
 * holding the entire page instead of the 20x20 glyph. Neither shows up in a type check or a lint
 * run: a wrong path is a valid string.
 *
 * So the suite walks in both directions — every path the code can produce must have a file, and
 * every file that ships must be one the code knows about.
 */

const PUBLIC_DIR = join(process.cwd(), 'public')

/** Turns a public URL back into a path on disk, undoing the deployment prefix if one is set. */
function fileFor(url: string): string {
  const rooted = BASE_PATH && url.startsWith(BASE_PATH) ? url.slice(BASE_PATH.length) : url
  return join(PUBLIC_DIR, rooted)
}

function expectExists(url: string) {
  expect(existsSync(fileFor(url)), `${url} has no file under public/`).toBe(true)
}

/**
 * Exhaustive by construction: `IconName` is a closed union, so `Record<IconName, true>` fails to
 * compile the day a glyph is added to the type without being added here.
 */
const ALL_ICONS: Record<IconName, true> = {
  popular: true,
  new: true,
  providers: true,
  recommended: true,
  crash: true,
  slots: true,
  'bonus-buy': true,
  tournaments: true,
  megaways: true,
  jackpots: true,
  lottery: true,
  'drops-wins': true,
  wheel: true,
  instant: true,
  egypt: true,
  'live-casino': true,
  search: true,
  'search-blue': true,
  close: true,
  'chevron-down': true,
  plus: true,
}

describe('paths produced by src/lib/assets.ts', () => {
  it('resolves every section icon to a file', () => {
    for (const icon of Object.keys(ALL_ICONS) as IconName[]) {
      expectExists(sectionIcon(icon))
    }
  })

  it('resolves the standalone glyphs and the wordmark', () => {
    for (const url of [LOGO, SEARCH_ICON, SEARCH_BUTTON_ICON]) {
      expectExists(url)
    }
  })

  it('resolves both hero artworks and all three promo backdrops', () => {
    for (const url of [HERO_BONUS, HERO_BONUS_MOBILE, ...Object.values(PROMO_BANNERS)]) {
      expectExists(url)
    }
  })

  it('resolves every game slug it claims to have art for', () => {
    for (const slug of GAMES_WITH_ART) {
      expectExists(gameThumb(slug))
    }
  })

  it('resolves every provider it claims to have a logo for', () => {
    for (const id of PROVIDERS_WITH_LOGO) {
      expectExists(providerLogo(id))
    }
  })

  it('resolves every payment, partner and flag in the footer maps', () => {
    for (const url of [...Object.values(PAYMENT_LOGOS), ...Object.values(PARTNER_LOGOS)]) {
      expectExists(url)
    }
    for (const code of LANGUAGE_FLAGS) {
      expectExists(languageFlag(code))
    }
  })
})

/**
 * The data files name their own paths — `games.json` carries a `thumb`, `footer.json` an `src` per
 * logo — and those bypass the helpers above entirely. They are wrapped with `withBase()` at the
 * call site, which means a typo here fails only in the browser.
 */
describe('paths written directly into src/data/*.json', () => {
  it('resolves every game thumbnail', () => {
    for (const game of games) {
      if (game.thumb) expectExists(game.thumb)
    }
  })

  it('resolves every provider logo', () => {
    for (const provider of providers) {
      if (provider.logo) expectExists(provider.logo)
    }
  })

  it('resolves every footer logo', () => {
    for (const logo of [...footer.paymentLogos, ...footer.partnerLogos]) {
      if (logo.src) expectExists(logo.src)
    }
  })

  it('resolves every promo and tournament image', () => {
    for (const item of [...tournaments.tournaments, ...tournaments.promos]) {
      if (item.image) expectExists(item.image)
    }
  })
})

/**
 * The other direction. `GAMES_WITH_ART` and `PROVIDERS_WITH_LOGO` are described in `assets.ts` as
 * "the contract with the placeholder logic": a card consults them to decide whether to draw the
 * picture or the gradient fallback. A file that arrives on disk without being added to the list
 * ships as dead weight and never renders — silent, and only visible by comparing two folders.
 */
describe('files on disk that no list mentions', () => {
  const slugsOf = (dir: string, extension: string) =>
    readdirSync(join(PUBLIC_DIR, 'images', dir))
      .filter((name) => name.endsWith(extension))
      .map((name) => name.slice(0, -extension.length))

  it('has no game artwork missing from GAMES_WITH_ART', () => {
    const onDisk = readdirSync(join(PUBLIC_DIR, 'images', 'games')).map((name) =>
      name.replace(/\.[^.]+$/, ''),
    )
    expect([...onDisk].sort()).toEqual([...GAMES_WITH_ART].sort())
  })

  it('has no provider logo missing from PROVIDERS_WITH_LOGO', () => {
    expect(slugsOf('providers', '.svg').sort()).toEqual([...PROVIDERS_WITH_LOGO].sort())
  })

  it('has no section icon that no row and no glyph constant asks for', () => {
    // `search-btn.svg` is reached through SEARCH_BUTTON_ICON rather than through `sectionIcon`,
    // so the constants have to be folded in by file name or the check reports its own blind spot.
    const basename = (url: string) => url.split('/').pop()?.replace(/\.svg$/, '') ?? ''

    const referenced = new Set<string>([
      ...desktopSections.map((section) => section.icon),
      ...(Object.keys(ALL_ICONS) as IconName[]),
      basename(SEARCH_ICON),
      basename(SEARCH_BUTTON_ICON),
    ])
    for (const name of slugsOf('icons', '.svg')) {
      expect(referenced.has(name), `public/images/icons/${name}.svg is referenced nowhere`).toBe(
        true,
      )
    }
  })
})

/**
 * The bytes, not just the path.
 *
 * Every check above stops at `existsSync`, which is how `slots.svg` shipped for weeks holding the
 * category bar's glass capsule and still passed. The same class came back in six files — four
 * flags and two payment tiles kept the 1440x729 footer panel of node `1:3666` — and nothing failed,
 * because a file carrying the whole artboard is still a file.
 *
 * `clean-svg.mjs --dry` is the byte-level reader that already exists: it opens all 50 SVGs, works
 * out what is page furniture and what is artwork, and writes nothing. Asking it here keeps one
 * definition of furniture instead of a second copy that drifts, and fails the moment an export
 * lands with the artboard still attached.
 */
describe('bytes of the SVGs that ship', () => {
  it('has no SVG still carrying its Figma artboard', () => {
    const report = execFileSync(
      process.execPath,
      ['scripts/clean-svg.mjs', 'public/images', '--dry'],
      { cwd: process.cwd(), encoding: 'utf8' },
    )
    expect(report, report).toContain('0 file(s) would be changed')
  })
})
