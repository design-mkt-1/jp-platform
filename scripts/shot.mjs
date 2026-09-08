import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Screenshot helper for the design-review loop.
 *
 * Uses the Chrome already installed on the machine (`channel: 'chrome'`) rather than Playwright's
 * own build: the bundled Chromium download fails in this environment, and the review only needs a
 * browser that renders the page, not a pinned one.
 *
 * Usage: node scripts/shot.mjs <url> <outPath> [width] [height] [full]
 */
const [, , url, out, wRaw, hRaw, full, targetRaw] = process.argv

if (!url || !out) {
  console.error(
    'usage: node scripts/shot.mjs <url> <outPath> [width] [height] [full|viewport] [scrollY|#selector]',
  )
  process.exit(1)
}

const width = Number(wRaw ?? 1440)
const height = Number(hRaw ?? 1000)

mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
  // The provider marquee runs forever. A capture that waits for a settled frame never gets one,
  // which is what made the Chrome-extension screenshots time out.
  reducedMotion: 'reduce',
})

const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

/** Scroll the whole page past the viewport once and come back, so every lazy image has been seen. */
async function settleLazyImages(target) {
  await target.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    window.scrollTo(0, 0)
  })
  await target.waitForTimeout(300)
}

await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })

/*
 * A section can be reached either by pixel offset or by CSS selector. The selector form is what
 * the review loop uses, so a shot stays pinned to a section when the rows above it change height.
 */
let clipped = null
// Anything that is not a plain number is a selector — `section[aria-label="…"]` has no sigil.
if (targetRaw && !/^\d+$/.test(targetRaw)) {
  const element = page.locator(targetRaw).first()
  await element.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  clipped = targetRaw
  await element.screenshot({ path: out })
} else {
  if (targetRaw) {
    await page.evaluate((y) => window.scrollTo(0, y), Number(targetRaw))
    await page.waitForTimeout(400)
  }
  // A full-page shot resizes the viewport once and captures, so Next's default `loading="lazy"`
  // never fires and the footer's payment, partner and flag logos come out blank. Walking the page
  // down and back first is what puts them in view long enough to load.
  if (full === 'full') await settleLazyImages(page)
  await page.screenshot({ path: out, fullPage: full === 'full' })
}

await browser.close()

console.log(JSON.stringify({ url, out, width, height, clipped, scrollY: targetRaw, errors }, null, 2))
