# Next session — Jackpot demo

## Where things stand

The demo is built, pushed to `main`, and deployed.

- **Review build:** https://design-mkt-1.github.io/jp-platform/
- **Screen registry:** https://design-mkt-1.github.io/jp-platform/dev/screens/
- **Design vs implementation:** https://design-mkt-1.github.io/jp-platform/review/ — twenty-six
  comparisons and one accessibility card, Figma beside the built page. Sections 01–12 of that report
  are the history: what was measured in the Figma file before any code, and every decision taken
  since. Section 13 is the comparison.
- **Why the architecture looks like this:** [`docs/build-plan.md`](build-plan.md)
- **Repo:** https://github.com/design-mkt-1/jp-platform (public, `noindex` + `robots.txt` disallow)

Every push to `main` redeploys through `.github/workflows/pages.yml`. The workflow typechecks and
lints before it builds, so a broken commit does not reach the client's link. Since 2026-09-08 it
also runs axe-core after the build: the static export is copied to `a11y-site/jp-platform`, served
by `python3 -m http.server 4173`, and `node scripts/a11y.mjs a11y-out http://localhost:4173/jp-platform`
walks the same nine states the local script does. The copy exists because `basePath` puts every
asset under `/jp-platform/`, so an export served from its own root loads no CSS and every colour
pair reads as a violation. The step fails the job on any critical or serious violation, before the
deploy job runs, and `a11y-out/a11y.json` is uploaded with `if: always()` so a failure can be read
without re-running anything. No dependency was added: the runner already has python3, and the
script asks playwright for `channel: 'chrome'`, which is the Chrome preinstalled on
`ubuntu-latest`.

Verified on the live site: zero failing requests, `noindex` header served, `/dev/screens` reachable.

### Deep links, for reviewing one state directly

| URL suffix                     | Shows                                              |
| ------------------------------ | -------------------------------------------------- |
| `?auth=prelogin` / `?auth=vip` | header and menu in that account state              |
| `?panel=balance`               | the balance popover, Figma node 1:4116             |
| `?panel=personalInfo`          | the account dropdown, node 1:4153                  |
| `?panel=jackpotMenu`           | the mobile menu, nodes 1:8751 / 1:8260 / 1:8503    |
| `?q=swe`                       | the search suggestions state, node 1:4479          |
| `?pq=xyzgame`                  | the provider filter with no match, 1:2218 / 1:4321 |

## Local commands

```bash
npm run dev          # review server on :3000
npm run build:check  # production build into .next-build, safe while dev is running
npx tsc --noEmit
npx eslint src --max-warnings=0

node scripts/shot.mjs <url> <out.png> <w> <h> viewport '<selector|scrollY>'
node scripts/review.mjs <outDir>   # all 15 review states, each shot twice: reduce and no-preference
node scripts/a11y.mjs <outDir> [baseUrl]  # axe-core over 9 states; exits 1 when critical/serious exist
node scripts/clean-svg.mjs public/images --dry
```

A full-page capture used to come out with the footer's payment, partner and flag logos blank:
`page.screenshot({fullPage: true})` resizes the viewport once, so Next's default `loading="lazy"`
never fires. Both `shot.mjs` and `review.mjs` now walk the page down in viewport steps and back to
the top before shooting. If a future capture shows missing images, check that first — it was a
capture artefact, not a page defect.

**Never run `npm run build` while `next dev` is up.** Both own `.next` and the collision corrupts
it: every route starts returning 500 with `ENOENT ... _buildManifest.js.tmp.<random>` while the
source is fine. `build:check` exists so this cannot happen. Editing `next.config.ts` while dev runs
has the same effect — restart the server after touching it.

**`NEXT_DIST_DIR` does not protect `.next` once `GITHUB_PAGES=true` is set.** Measured on
2026-09-08: `GITHUB_PAGES=true NEXT_DIST_DIR=.next-export npx next build --turbopack` put the export
in `.next-export/` — `.next/export-detail.json` records `outDirectory` as exactly that — but wrote
the build itself into `.next` anyway, leaving `.next/routes-manifest.json` carrying
`basePath: /jp-platform` and the dev server answering 500 on every route. `build:check`'s trick
holds for an ordinary build and not for an export. To produce a static export locally, stop
`next dev` first, or build in a separate `git worktree`. To serve one, copy it to
`<root>/jp-platform` and serve `<root>`: the export's assets are all under the base path, so served
from its own root the page loads no CSS at all — which reads as dozens of contrast violations that
are not real.

## What is left, in the order agreed

### 1. Content rows compared — 15 of 15 — done

The nine rows that were still open have been shot beside their Figma nodes and are in section 13 of
the review report.

- **Weekly Lottery** (1:3524) — the content already matched; four gaps were corrected against node
  1:3532 (title-subtitle 6 to 12, subtitle-pills 16 to 12, pill gap 12 to 8, timer-button 20 to 16).
- **Wheel** (1:3580) — the three stat rows were a constant in `PromoRow`; they now live in
  `tournaments.json` under `stats`. Row height 40 to 34, gap 8 to 9, column gap 20 to 24, and the
  subtitle wraps to its own title's width the way node 1:3591 does.
- **Both of those banners** — the amber behind their pills is `#F2C146` at 10%, not `#F59E0B`.
  `tokens.md` had recorded it wrongly; `--amber-tint` is now the colour Figma actually paints.
- **The promo banners at 390px** (1:6195 / 1:6247 / 1:6282) — the desktop banner was being squeezed
  to 339px with JOIN NOW clipped off the edge. Figma draws a 358x220 card there instead;
  `PromoBannerMobile` is that card.
  Two things surfaced only when measured: the promo header's fixed 160px rule refused to shrink at
  390px and pushed the page to 414px wide — `SectionHeader` now lets it shrink below 767px only,
  desktop stays exactly 160 — and the tournament's 51-character subtitle wrapped to three lines in
  the design's 190px column, so it is clamped to two with an ellipsis (Figma's mobile copy is the
  short "Best Slots, Huge Wins!!").
- **Crash Games** (1:3230), **Must-Play Slots** (1:3285), **Bonus Buy** (1:3364), **Megaways**
  (1:3456), **Jackpots** (1:3485), **Drops & Wins** (1:3548), **Egypt** (1:3635) — all seven have
  Popular's structure and match it: 28px header, See All (206), 203x264 cards, one or two grids.
- **Two header icons were wrong** — `drops-wins` (1:3551) and `egypt` (1:3638) were whole-subtree
  exports carrying the wrong artwork. Replaced with the single-leaf SVGs from `get_design_context`.
- **`bonus-buy` (1:3367) still differs** — Figma draws a crown over the BONUS banner, ours draws
  three stars. Not fixed: that glyph is fifteen masked fragments in Figma, so there is no clean
  vector to export, and at 20px the difference is hard to see.

New Games, Recommended and Instant Games were not shot on their own: they are the same `GameRow`
with a different filter, compared under Popular.

### 2. The screen registry — 13 entries, all walked — done

Walked on 2026-09-08, mobile first, every state captured in both motion modes. The registry now has
13 entries: the 12 it started with, plus `mobile-providers-no-results` (1:2218), which had never
been built. The old `empty-search` entry never named a real state — node 1:4321 is the desktop
provider-search popover with nothing matching — so it is now `providers-no-results-desktop`. The
`mobile-nav` description called itself a navigation drawer; it is the tab bar fixed to the bottom of
every mobile page, and it says that now.

One real defect came out of the walk and is fixed (commit 811c12a). At 390px the category strip
showed a single chip: `CategoryNavBar` drew its own 244px `Search games…` trigger in that row, which
left the pill scroller 136px and put Slots, Live Casino and Jackpots behind an unsignalled swipe.
Node 1:5799 has no search field in that row at all — on mobile the search control is the header
magnifier, and both called the same `openSearch` — so the trigger is `mobile:hidden` and the chips
take the row. Re-measured at 390 in both motion modes: chips at 17–129, 135–226.1, 232.1–362.6 and
368.6–483.4, all 32px tall, 372px of strip showing 466px of content, `scrollWidth` still 390. At
1440 the bar is unchanged.

Everything else matched. What is left from the walk is not layout: the three items under §4 and the
five differences added to §5.

### 2b. Mobile tab bar prefetched three routes that do not exist — fixed

Measured on a static export served locally on 2026-09-08: the bottom tab bar's `Live Casino`,
`Sport` and `Promos` links point at `/live-casino`, `/sport`, `/promos`. Next prefetched all three
on mobile, which produced three `<route>/index.txt?_rsc=` requests, three 404s and three console
errors on every page load. `prefetch={false}` takes that to zero (commit 5f5bda4).

The earlier note here was wrong about where a tap lands. Measured on the export served locally, it
does **not** hit GitHub's own 404 page — it lands on our `src/app/not-found.tsx`, which
`build:check` confirms is prerendered (`○ /_not-found`, static). That is the intended behaviour for
a demo whose sport and promos pages do not exist yet, so nothing more is needed unless those pages
get built.

Also found the same day and fixed: with Reduce Motion on, the providers marquee made the page
3307px wide (commit 4e4be67).

### 2c. Jackpot menu — the Sign out row was clipped — fixed

Measuring it first changed the fix. The decision recorded here was to pad the sheet's bottom by the
tab bar's height, on the reading that the bar covered the row. It does not: at 390x844 the
top-anchored sheet is capped at `max-h-[90vh]` = 759.6px and the bar starts at 760, so the sheet
already ended above it. The row was clipped by the sheet's own overflow — 804px of content in a
759px box. Padding-bottom is appended after the last row and cannot move that row up; applied, it
left `Sign out` at 740–780 and took the scroll needed from 45px to 105px. So 48px came out of
paddings instead: the sheet's top-anchor insets go from `pt-3`/`pb-6` to `pt-2`/`pb-2`, and four
paddings in the menu lose 28px between them — the header's `mb-3` to `mb-2`, the nav's `mt-2.5` to
`mt-1.5`, the divider row's `mt-1` dropped, and the Support / Vip Manager row's `py-4` to `py-2`.
The row heights and the 6px account-row gaps that node 1:8503 sets are untouched. Measured at
390x844 in both motion modes: `Sign out` now spans 708–748, the sheet is 757 tall against a
scrollHeight of 756 and a clientHeight of 756 — nothing scrolls — and the page is still 390 wide.
The 90vh cap stays, so the strip of tab bar the design shows beneath the sheet is still there.
Commit f437f37.

### 3. Change requests — 3 of 3 — done

| What                             | How                                                                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Badge` `xs` size                | `Badge` now carries an `xs` size holding exactly what the hero's local spans held — 10px caps, 0.5px tracking, 8/3 padding, 6px radius — and the spans are gone (0e58891).                                    |
| `src/lib/data.ts`                | Each `src/data/*.json` is imported and cast once there and exported as a named constant; the fifteen casts spread over thirteen files are gone, and `grep -rn "@/data/" src` now lists only that file (68b8881). |
| Icon Button states (node 1:5687) | The circle moved out of `search-btn.svg` into `src/components/primitives/IconButton.tsx`, so it can respond to a pointer: white 6% at rest, 12% on hover, 4% while pressed, measured at all three call sites (abeb807). |

### 4. Accessibility — the three decisions taken, one question left

`node scripts/a11y.mjs <outDir> [baseUrl]` injects axe-core 4.10.2 from the CDN over nine states and
writes `a11y.json`. No package was added. It exits 1 while critical or serious violations exist, and
since the decisions below it runs in CI on every push to `main` — see the workflow note above.

Node counts from the run on 2026-09-08 after the three fixes, mobile first. The same nine states
that carried 12–15 serious violations each now carry none:

| state                          | critical | serious | moderate | minor |
| ------------------------------ | -------- | ------- | -------- | ----- |
| `mob-home` (390x844)           | 0        | 0       | 0        | 0     |
| `mob-menu` (390)               | 0        | 0       | 0        | 0     |
| `mob-menu-prelogin` (390)      | 0        | 0       | 0        | 0     |
| `mob-providers-no-results`     | 0        | 0       | 0        | 0     |
| `desktop-home` (1440x1000)     | 0        | 0       | 0        | 0     |
| `desktop-panel-balance`        | 0        | 0       | 0        | 0     |
| `desktop-panel-personal`       | 0        | 0       | 0        | 0     |
| `desktop-search-suggestions`   | 0        | 0       | 0        | 0     |
| `desktop-providers-no-results` | 0        | 0       | 0        | 0     |

**Contrast.** The decision was to change the colours until the rule passes AA and to record the
deviation from Figma. Three tokens moved, each keeping the original's hue and saturation and moving
only its lightness. `docs/tokens.md` §2b carries the full table — Figma node, Figma value, new
value, the composited background each pair actually lands on, and the measured ratio.

| token               | Figma     | now       | where it shows                                                     | ratio           |
| ------------------- | --------- | --------- | ------------------------------------------------------------------ | --------------- |
| `--blue`            | `#007AFF` | `#006EE6` | white on solid blue: the hero's `Get` pill, `Button` `primaryBlue`  | 4.02:1 → 4.80:1 |
| `--blue-text` (new) | `#007AFF` | `#479FFF` | blue text on a tint: `See All (206)`, the search badges, the eyebrow | 3.51–4.06:1 → 5.15–5.97:1 |
| `--text-legal`      | `#65616A` | `#7F7A85` | the footer's legal strip                                             | 3.17:1 → 4.58:1 |

The tints keep Figma's own `0 122 255` channels: they are backgrounds, and darkening them would only
have made the text on them harder to read. `--text-legal` was not one of the three pairs listed in
the report, but it was one serious violation in every one of the nine states, so the check could not
reach zero without it. The `See All` pill's hover and pressed fills were computed too, at 5.31:1 and
4.72:1, because axe only ever measures the resting state.

**The page heading.** One visually hidden `<h1>` reading `Jackpot — Online Casino`, with an em dash,
because the design has no text title — the wordmark is an image. It sits inside `<main>`
(`src/app/page.tsx:104`): placed above the landmark it cleared `page-has-heading-one` but raised
`region`, since content outside a landmark is its own violation.

**Cards as links — still open, and deliberately so.** Measured on the homepage at 390 and at 1440:
90 `<article>` elements, zero card links. `GameCard` and `ProviderCard` both accept an `href` and
render an `<a>` when they get one, but no caller passes it — `hrefForGame` exists on `ContentRow`
and `GameGrid` and nothing supplies it — because the demo has no game pages. The owner's decision
of 2026-09-08 is to leave them as `article` while that is true: a link to nowhere is worse than no
link. If game pages arrive, this resolves itself. `axe` does not flag it, so CI stays green either
way.

### 5. Deliberate differences, to re-confirm before sign-off

- Providers without a logo show initials (`EV`, `RG`, `PG`); the design repeats the same five logos
  fourteen times.
- Games without art get a brand gradient with the title drawn on it, because in Figma the title is
  baked into the image and the card has no text node.
- Currency is GBP throughout, where the design writes `$` in places and `RON` on one tournament pill.
- The mobile hero shows one offer. Figma node 1:5749 is a three-card track, but the second card
  starts at x=380 in a 390-wide frame, so none of it is visible. A carousel needs an offers data
  source that does not exist.
- The mobile lottery card keeps its own copy. Figma node 1:6253 repeats the tournament's
  `SPIN CHALLENGE 2000` inside the lottery card.
- The mobile countdown reads `hh:mm:ss`, the three groups the rest of the site counts in, where
  Figma writes four: `08:12:36:35`.
- The mobile artwork is the desktop image re-cropped. Figma feeds those frames a wider 4:1 export of
  each scene against our 4.92:1 banner, so the crop can match the framing but not the zoom.
- The Drops & Wins header reads `DROPS & WINS`. Figma node 1:3556 is literally `drop&wins`, which
  renders `DROP&WINS`.
- The mobile tournament subtitle is the real copy, clamped to two lines; Figma writes the short
  "Best Slots, Huge Wins!!" there.
- The mobile provider filter hides the logo bands under "No providers found". Node 1:2218 still
  draws them, but with nothing matching there are no logos left to draw — the bands would show a
  result the message has just denied.
- The desktop provider filter with no match lives only inside the popover. Node 1:4321 is the
  popover on its own, with no page behind it, which is why the Figma capture in the report stops at
  its edge.
- That popover's field measures 654 wide against Figma's 656. The popover is 720 with 32px padding
  on each side, and ours carries a 1px border the frame does not have. Two pixels, from the border.
- The magnifier inside both provider fields is now blue, as Figma draws it:
  `public/images/icons/search-blue.svg` is the node 1:2239 geometry restroked, used by
  `ProviderSearch` alone — the header magnifier, the games field and `SearchNoResults` keep the grey
  `search.svg`. Rasterised from the running page it measures `#007AFF` at both 390 and 1440. **Open
  question:** Figma's own export of that glyph is `#36BCFF` on both node 1:2239 and node 1:4323 — a
  light sky blue that is neither the blue token nor the `#00F0FF` cyan one — and the blue token is
  now `#006EE6` after the contrast pass. So the glyph is a third blue whichever way it is read.
- The `Sweet Bonanza` row in the search suggestions carries the badge `Popular`; Figma writes
  `Slots`. The chip is the game's first category (`SearchSuggestions.tsx:31`) and that game is
  `["popular", "slots"]` in `src/data/games.json` — the order of two strings in mock data, not
  layout.

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
