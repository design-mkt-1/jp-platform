# Next session — Jackpot demo

## Where things stand

The demo is built, pushed to `main`, and deployed.

- **Review build:** https://design-mkt-1.github.io/jp-platform/
- **Screen registry:** https://design-mkt-1.github.io/jp-platform/dev/screens/
- **Repo:** https://github.com/design-mkt-1/jp-platform (public, `noindex` + `robots.txt` disallow)

Every push to `main` redeploys through `.github/workflows/pages.yml`. The workflow typechecks and
lints before it builds, so a broken commit does not reach the client's link.

Verified on the live site: zero failing requests, `noindex` header served, `/dev/screens` reachable.

### Deep links, for reviewing one state directly

| URL suffix | Shows |
|---|---|
| `?auth=prelogin` / `?auth=vip` | header and menu in that account state |
| `?panel=balance` | the balance popover, Figma node 1:4116 |
| `?panel=personalInfo` | the account dropdown, node 1:4153 |
| `?panel=jackpotMenu` | the mobile menu, nodes 1:8751 / 1:8260 / 1:8503 |
| `?q=swe` | the search suggestions state, node 1:4479 |

## Local commands

```bash
npm run dev          # review server on :3000
npm run build:check  # production build into .next-build, safe while dev is running
npx tsc --noEmit
npx eslint src --max-warnings=0

node scripts/shot.mjs <url> <out.png> <w> <h> viewport '<selector|scrollY>'
node scripts/review.mjs <outDir>   # drives and captures all ten interactive states
node scripts/clean-svg.mjs public/images --dry
```

**Never run `npm run build` while `next dev` is up.** Both own `.next` and the collision corrupts
it: every route starts returning 500 with `ENOENT ... _buildManifest.js.tmp.<random>` while the
source is fine. `build:check` exists so this cannot happen. Editing `next.config.ts` while dev runs
has the same effect — restart the server after touching it.

## What is left, in the order agreed

### 1. Content rows not yet compared — 9 of 15

Compared so far: Popular, Leading Providers, Current Tournaments.

Not yet looked at: **Crash Games** (1:3230), **Must-Play Slots** (1:3285), **Bonus Buy** (1:3364),
**Megaways** (1:3456), **Jackpots** (1:3485), **Weekly Lottery** (1:3524), **Drops & Wins** (1:3548),
**Wheel** (1:3580), **Egypt** (1:3635).

Start with **Lottery and Wheel**. They are variants of the same `PromoBanner` as Tournaments but
with different content — node 1:3587 draws three stat rows where Tournaments draws pills, and the
wave-2 agent reported that `PromoBannerData` has no field for them. If that is still true, those
two banners are missing content rather than mis-styled.

### 2. The screen registry — 13 entries, none walked through

`/dev/screens` lists every screen with its Figma node beside it, but no entry has been compared.
Two have never been seen at all, in code or on screen: `empty-search-state-desktop` (1:4321) and
`mobile-providers-no-results` (1:2218).

### 3. Change requests still open

| What | Why it matters |
|---|---|
| `Badge` has no `xs` size (only `sm`, `md`) | The mobile hero's two pills are local `<span>`s because `sm` renders them a third too tall. Two ways to draw the same pill. |
| `formatCountdown` lives in `PromoBanner.tsx` | `format.ts` opens with "no component reaches for `toFixed` on its own"; a countdown is the same class of decision. |
| No `src/lib/data.ts` | Every consumer writes its own cast from JSON at each import site. |
| Icon Button states (node 1:5687) | Design wants white at 12% hover, 4% active. The circle is painted inside the exported SVG, so honouring it means rebuilding the control around a real background. |

### 4. Accessibility — nothing has been run

`Panel` has a focus trap and `aria-modal`, and `ProviderCard` names itself for assistive tech. That
is all that was deliberate. Nothing automated has been run. First question worth answering: do the
sixty game cards have accessible names, or does a screen reader announce "link" sixty times?

### 5. Deliberate differences, to re-confirm before sign-off

- Providers without a logo show initials (`EV`, `RG`, `PG`); the design repeats the same five logos
  fourteen times.
- Games without art get a brand gradient with the title drawn on it, because in Figma the title is
  baked into the image and the card has no text node.
- Currency is GBP throughout, where the design writes `$` in places and `RON` on one tournament pill.
- The mobile hero shows one offer. Figma node 1:5749 is a three-card track, but the second card
  starts at x=380 in a 390-wide frame, so none of it is visible. A carousel needs an offers data
  source that does not exist.

## Things worth remembering about this codebase

- **`docs/tokens.md` is the only link between Figma and the code.** The Figma file has no variables:
  `get_variable_defs` returns one value. If that document goes stale, components start carrying
  hex again. An eslint rule rejects hex under `src/components/`.
- **The two UI Kits disagreed on five names.** Mobile won, by owner decision, except `bg-overlay`,
  which keeps both values — a corner popover and a full-screen sheet need different scrims.
- **`src/lib/sections.ts` is the spine.** Twelve of the fifteen rows are one data-driven component.
  A new row is four lines there and no new component. If a change ever needs an `if` for a specific
  row, something has gone wrong.
- **For icons, use `get_design_context`, not `download_assets`.** The latter returns every SVG in a
  node's subtree — artwork, masks, and sometimes the Figma canvas frame — with no way to tell them
  apart. `search-btn.svg` arrived that way: a 20x20 file containing the whole page, which rendered
  as a giant magnifier spilling off the edge.
- **A sub-path deployment breaks image `src`.** Next's `basePath` rewrites links and its own
  bundles but not images. `withBase()` in `src/lib/assets.ts` handles it; paths coming from
  `src/data/*.json` must be wrapped at the call site.
