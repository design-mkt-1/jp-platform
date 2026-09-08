import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

/**
 * Drives the interactive states the design defines and captures each one.
 *
 * These are the states no static screenshot can reach: the three search states, the two header
 * panels and the three jackpot menus. Anything that renders wrong here would otherwise only be
 * found by a person clicking through the demo.
 */
const OUT = process.argv[2]
const BASE = process.argv[3] ?? 'http://localhost:3000'

if (!OUT) {
  console.error('usage: node scripts/review.mjs <outDir> [baseUrl]')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const findings = []

async function shot(name, { width, height, url = BASE, steps }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
    if (steps) await steps(page)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/${name}.png` })
    findings.push({ name, url, viewport: `${width}x${height}`, errors, ok: true })
  } catch (error) {
    findings.push({ name, url, viewport: `${width}x${height}`, errors, ok: false, failure: String(error) })
  } finally {
    await page.close()
  }
}

const openSearch = async (page) => {
  /*
   * The category bar's search affordance looks like a field but is a button carrying the text
   * "Search games..." (CategoryNavBar). The real input lives in the overlay it opens. Matching on
   * placeholder therefore finds nothing at 1440; the accessible name comes from the button's text.
   * `visible=true` is still needed because the mobile header has its own hidden copy.
   */
  await page
    .getByRole('button', { name: /search games/i })
    .locator('visible=true')
    .first()
    .click()
  await page.waitForTimeout(500)
}

await shot('search-1-popular-recent', { width: 1440, height: 900, steps: openSearch })

await shot('search-2-suggestions', {
  width: 1440,
  height: 900,
  steps: async (page) => {
    await openSearch(page)
    // "swe" matches three Sweet Bonanza titles. An earlier run used "zeu" for Zeus, which matches
    // nothing — the game is called Gates of Olympus — and made a correct empty state look like a bug.
    await page.keyboard.type('swe', { delay: 60 })
    await page.waitForTimeout(400)
  },
})

await shot('search-3-no-results', {
  width: 1440,
  height: 900,
  steps: async (page) => {
    await openSearch(page)
    await page.keyboard.type('xyzzy', { delay: 60 })
    await page.waitForTimeout(400)
  },
})

await shot('panel-balance', { width: 1440, height: 1000, url: `${BASE}?panel=balance` })
await shot('panel-personal', { width: 1440, height: 1000, url: `${BASE}?panel=personalInfo` })

await shot('auth-prelogin', { width: 1440, height: 700, url: `${BASE}?auth=prelogin` })
await shot('auth-vip', { width: 1440, height: 700, url: `${BASE}?auth=vip` })

await shot('mob-menu-prelogin', { width: 390, height: 900, url: `${BASE}?auth=prelogin&panel=jackpotMenu` })
await shot('mob-menu-postlogin', { width: 390, height: 900, url: `${BASE}?auth=postlogin&panel=jackpotMenu` })
await shot('mob-menu-vip', { width: 390, height: 900, url: `${BASE}?auth=vip&panel=jackpotMenu` })

await browser.close()

console.log(JSON.stringify(findings, null, 2))
