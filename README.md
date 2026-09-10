# Jackpot — casino platform demo

A working demo of the Jackpot casino platform, built from the Figma file
`2MyylxdZblfGnf05nQacUz` (one page, `Platform`). Next.js 15, TypeScript, Tailwind v3, no backend —
all data is mock JSON under `src/data/`.

|                                         |                                                         |
| --------------------------------------- | ------------------------------------------------------- |
| **Demo**                                | https://design-mkt-1.github.io/jp-platform/             |
| **All screens, with their Figma nodes** | https://design-mkt-1.github.io/jp-platform/dev/screens/ |
| **Design vs implementation**            | https://design-mkt-1.github.io/jp-platform/review/      |

The site is public but carries `noindex` and a `robots.txt` disallow: it is an unreleased design
carrying third-party brand marks, so the link is shareable but should not surface in search.

## Running it

Needs Node 24 and Google Chrome (see _Screenshots_ below).

```bash
npm ci
npm run dev          # http://localhost:3000
```

### Opening one state directly

The store mirrors four things into the query string, so any state can be linked to instead of
clicked to.

| Suffix                         | Shows                                        |
| ------------------------------ | -------------------------------------------- |
| `?auth=prelogin` · `?auth=vip` | header and menu in that account state        |
| `?panel=balance`               | balance popover — Figma node 1:4116          |
| `?panel=personalInfo`          | account dropdown — node 1:4153               |
| `?panel=jackpotMenu`           | mobile menu — nodes 32:5279 / 32:4852 / 32:5063 (pre-login / post-login / VIP) |
| `?q=swe`                       | search suggestions — node 1:4479             |
| `?pq=xyzgame`                  | provider search — nodes 1:2218 / 1:4321      |

### Checks

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
npm run build:check          # production build, safe while dev is running
```

> **Never run `npm run build` while `next dev` is up.** Both own `.next`, and the collision corrupts
> it: every route starts returning 500 with `ENOENT ... _buildManifest.js.tmp.<random>` while the
> source is fine — a failure that looks like a code bug and is not one. `build:check` exists so this
> cannot happen. Editing `next.config.ts` while dev runs has the same effect, because Next restarts
> itself on config change; restart the server after touching it.

### Screenshots

```bash
node scripts/shot.mjs <url> <out.png> <width> <height> viewport '<selector|scrollY>'
node scripts/review.mjs <outDir>          # captures all 15 review states, twice each
node scripts/a11y.mjs <outDir>            # axe-core over 9 states; exits 1 on critical/serious
node scripts/clean-svg.mjs public/images --dry
```

These drive **the Chrome already installed on the machine** (`channel: 'chrome'`), not a Playwright
download — that download failed in this environment, so `npx playwright install` is not needed.
`shot.mjs` forces reduced motion, because the providers marquee never stops and a capture that waits
for a settled frame never gets one; `review.mjs` shoots every state in both motion modes, so a rule
that only fires under Reduce Motion cannot hide. A full-page shot walks the page down and back
first, otherwise Next's `loading="lazy"` never fires and the footer logos come out blank.

## Deployment

Every push to `main` runs `.github/workflows/pages.yml`: typecheck, lint, static export with
`GITHUB_PAGES=true`, then deploy. A commit that fails a check never reaches the client's link.

`basePath` is applied only when that variable is set. Turning it on locally would move the dev
server to `/jp-platform` and break the screenshot scripts, which address the root.

## Where things are

| Path                       | What                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/sections.ts`      | **The spine.** Fifteen rows described as data; three renderers, not fifteen components. A new row is four lines here.            |
| `src/lib/screens.ts`       | Registry behind `/dev/screens`, each entry carrying its Figma node id                                                            |
| `src/lib/assets.ts`        | The only place that turns an asset name into a URL, and the only place that knows about the deployment's base path               |
| `src/store/useAppStore.ts` | Auth mode, search, open panel. No provider — the page stays a Server Component                                                   |
| `docs/tokens.md`           | **Read this before touching colour.** The Figma file has no variables, so this document is the only link between design and code |
| `docs/next-session.md`     | What is still to be done                                                                                                         |
| `docs/build-plan.md`       | Why the architecture looks like this, and the traps already hit                                                                  |

## Known deliberate differences from the design

- Providers without a logo show initials (`EV`, `RG`); the design repeats the same five logos.
- Games without artwork get a brand gradient with the title drawn on it. Figma has three game
  images in total and bakes the title into them, so the card node has no text to copy.
- Currency is GBP throughout, where the design writes `$` in places and `RON` on one pill.
- The mobile hero shows one offer; Figma's node 1:5749 is a three-card track whose second card
  starts outside the 390px frame.
- The mobile lottery card keeps its own copy; Figma's node 1:6253 repeats the tournament's there.
- The mobile countdown reads `hh:mm:ss` where Figma writes four groups, `08:12:36:35`.
- The mobile artwork is the desktop image re-cropped; Figma feeds those frames a wider 4:1 export.
- The Drops & Wins header reads `DROPS & WINS`; Figma node 1:3556 is literally `drop&wins`.
- The mobile tournament subtitle is the real copy clamped to two lines; Figma writes "Best Slots, Huge Wins!!".
- The provider search with no matches shows only the message; Figma node 1:2218 keeps the two
  badge bands under it, and with nothing matching there are no badges to draw.
