import { chromium } from 'playwright'

/**
 * Where the caret lands when an overlay is dismissed.
 *
 * ## Why this is a script and not a vitest test
 *
 * `vitest.config.mts` is `environment: 'node'` with `include: ['src/**\/*.test.ts']` — no jsdom and
 * no `.tsx`. Moving it there would not help anyway. The defect this file guards against is caused
 * by the browser's *default action* for `mousedown`, which focuses the nearest focusable ancestor
 * of the press target and clears focus to `<body>` when there is none. jsdom does not implement it,
 * so a jsdom test would have passed on every one of the four cases below while they were broken in
 * Chrome. `Panel.tsx`'s `preventDefault()` exists for the same reason.
 *
 * So this runs beside `scripts/a11y.mjs` at fan-in, not in `npm test`.
 *
 * ## Every press here is a real press
 *
 * `element.click()` does not move focus and sets `:focus-visible` where a real press does not. It
 * produced two false findings in this project — session 8 wrote up a working focus restoration as
 * broken twice — so dismissals are driven with `mouse.move`/`down`/`up`, `touchscreen.tap` and
 * `keyboard.press`, and nothing else.
 *
 * The run refuses to report when `innerWidth` is not what it asked for: `resize_window` has
 * reported success on a maximised Chrome while the width stayed at 2552.
 *
 * Usage: node scripts/focus-restore.mjs [baseUrl]
 * Exit code is 1 when any row lands somewhere other than its expected control.
 */
const BASE = process.argv[2] ?? 'http://localhost:3000'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** What a screen reader would announce for whatever holds focus, or `<body>` for nothing. */
const ACTIVE_NAME = `(() => {
  const el = document.activeElement
  if (!el || el === document.body) return '<body>'
  return el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 40) || el.tagName
})()`

async function press(page, x, y) {
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(200)
}

/** Centre of the first *visible* control whose accessible name starts with `needle`. */
function control(page, needle) {
  return page.evaluate(
    ({ focusable, needle: n }) => {
      for (const el of document.querySelectorAll(focusable)) {
        const label = el.getAttribute('aria-label') || (el.textContent || '').trim()
        if (!label.startsWith(n)) continue
        const box = el.getBoundingClientRect()
        // A hidden control has no box, and pressing its coordinates would press whatever is
        // underneath — which is how a probe reports an interaction that never happened.
        if (box.width < 4 || box.height < 4) continue
        return { x: box.x + box.width / 2, y: box.y + box.height / 2, label }
      }
      return null
    },
    { focusable: FOCUSABLE, needle },
  )
}

/** A point whose element has no focusable ancestor, so pressing it must focus nothing by itself. */
function deadPoint(page) {
  return page.evaluate((focusable) => {
    for (let y = 5; y < window.innerHeight - 5; y += 7) {
      for (let x = 5; x < window.innerWidth - 5; x += 11) {
        const el = document.elementFromPoint(x, y)
        if (!el || el.closest(focusable)) continue
        return { x, y }
      }
    }
    return null
  }, FOCUSABLE)
}

async function pressControl(page, needle) {
  const found = await control(page, needle)
  if (!found) throw new Error(`no visible control named "${needle}"`)
  await press(page, found.x, found.y)
  return found
}

/** Bring a control into view before measuring it — the providers row sits well down the page. */
async function scrollTo(page, needle) {
  const first = await control(page, needle)
  if (!first) throw new Error(`no visible control named "${needle}"`)
  await page.mouse.wheel(0, first.y - 400)
  await page.waitForTimeout(300)
}

/*
 * One row per dismissal path, each with the accessible name focus has to end on.
 *
 * The two `HeaderNavMenu` rows are not a duplicate. A press that lands on empty chrome has to give
 * focus back to the burger; a press that lands on another control has to leave that control alone.
 * Restoring in both cases would be a second defect, and only running the first case would hide it.
 */
const CASES = [
  {
    name: 'HeaderNavMenu — outside press on empty chrome',
    width: 1024,
    height: 900,
    async run(page) {
      await pressControl(page, 'Main menu')
      // Tab once so focus sits on a link inside the panel: that is what closing strands.
      await page.keyboard.press('Tab')
      const dead = await deadPoint(page)
      if (!dead) throw new Error('no dead point in the viewport')
      await press(page, dead.x, dead.y)
    },
    expect: 'Main menu',
  },
  {
    name: 'HeaderNavMenu — outside press on another control',
    width: 1024,
    height: 900,
    async run(page) {
      await pressControl(page, 'Main menu')
      await page.keyboard.press('Tab')
      await pressControl(page, 'Jackpot — home')
    },
    expect: 'Jackpot — home',
  },
  {
    name: 'HeaderNavMenu — Escape',
    width: 1024,
    height: 900,
    async run(page) {
      await pressControl(page, 'Main menu')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(250)
    },
    expect: 'Main menu',
  },
  {
    name: 'CategoryNavBar search — outside press',
    width: 1440,
    height: 950,
    async run(page) {
      await pressControl(page, 'Search games')
      const dead = await deadPoint(page)
      if (!dead) throw new Error('no dead point in the viewport')
      await press(page, dead.x, dead.y)
    },
    expect: 'Search games...',
  },
  {
    name: 'CategoryNavBar search — Escape',
    width: 1440,
    height: 950,
    async run(page) {
      await pressControl(page, 'Search games')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(250)
    },
    expect: 'Search games...',
  },
  {
    name: 'PersonalInfoPanel — Sign out',
    width: 1440,
    height: 950,
    async run(page) {
      await pressControl(page, 'luckytest')
      await pressControl(page, 'Sign out')
    },
    // Owner's decision of 2026-09-10. The pill this panel hung off is unmounted by the same state
    // change, so there is nothing to return to and a landing has to be chosen rather than restored.
    // The name is "Log In", not "Login": the desktop control was respelled to match the phone in
    // the same session. This row failed on the old string and passed on the new one, which is the
    // guard working — the landing never moved, only its label did.
    expect: 'Log In',
  },
  {
    name: 'ProviderSearch inline at 390 — Escape',
    width: 390,
    height: 844,
    async run(page) {
      await scrollTo(page, 'Search providers')
      const found = await control(page, 'Search providers')
      await page.touchscreen.tap(found.x, found.y)
      await page.waitForTimeout(200)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    },
    expect: 'Search providers',
  },
  {
    name: 'ProviderSearch popover at 1440 — Escape',
    width: 1440,
    height: 950,
    async run(page) {
      await scrollTo(page, 'Search providers')
      await pressControl(page, 'Search providers')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    },
    expect: 'Search providers',
  },
]

const browser = await chromium.launch({ channel: 'chrome' })
const rows = []

for (const testCase of CASES) {
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    deviceScaleFactor: 1,
    isMobile: testCase.width < 768,
    hasTouch: testCase.width < 768,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  let landed = null
  let error = null

  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 })
    const real = await page.evaluate(() => window.innerWidth)
    if (real !== testCase.width) throw new Error(`innerWidth ${real}, asked for ${testCase.width}`)
    await testCase.run(page)
    landed = await page.evaluate(ACTIVE_NAME)
  } catch (thrown) {
    error = String(thrown).slice(0, 160)
  }

  rows.push({
    name: testCase.name,
    width: testCase.width,
    expected: testCase.expect,
    landed,
    ok: error === null && landed === testCase.expect,
    error,
  })
  await context.close()
}

await browser.close()

for (const row of rows) {
  const mark = row.ok ? 'ok  ' : 'FAIL'
  const got = row.error ? `error: ${row.error}` : `landed on ${row.landed}`
  console.log(`${mark} ${row.width} | ${row.name} | expected ${row.expected} | ${got}`)
}

const failed = rows.filter((row) => !row.ok)
console.log(`\n${rows.length - failed.length}/${rows.length} dismissal paths restore focus`)
process.exit(failed.length === 0 ? 0 : 1)
