# Next session — Jackpot demo

## Where things stand

The demo is built, pushed to `main`, and deployed.

- **Review build:** https://design-mkt-1.github.io/jp-platform/
- **Screen registry:** https://design-mkt-1.github.io/jp-platform/dev/screens/
- **Design vs implementation:** https://design-mkt-1.github.io/jp-platform/review/ — twenty-six
  comparisons and one accessibility card, Figma beside the built page. Sections 01–12 of that report
  are the history: what was measured in the Figma file before any code, and every decision taken
  since. Section 13 is the comparison. Section 14 is what came out of looking at the site in Chrome
  on 2026-09-09 — five defects found and fixed, each with the after-capture beside its Figma node.
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
| `?panel=jackpotMenu`           | the mobile menu, nodes 1:8751 / 13:2307 / 13:2519    |
| `?q=swe`                       | the search suggestions state, node 1:4479          |
| `?pq=xyzgame`                  | the provider filter with no match, 1:2218 / 1:4321 |

## Open items — the short list

Everything still outstanding, in one place. The sections below hold the reasoning; this table is
only the index, so nothing has to be reconstructed by reading the whole history. Nothing here blocks
the deploy: `main` is green and every item is a decision or a piece of polish, not a defect in
flight.

**Decided and done in session 8 — kept here only so the trail is findable:**

| # | What                 | The owner's decision, 2026-09-09                                                                     | Where |
| - | -------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| ~~1~~ | The countdown period | **24 hours.** `PERIOD_MS` is a day, so the hours field keeps the two digits the design draws. The editorial cost was stated and accepted: the copy beside the clock still reads "Weekly tournament active" and "Bi-Weekly Lottery draw is now open", and a timer that never exceeds 24 hours disagrees with both. Changing that copy is not done. | §12 |
| ~~2~~ | 768–1279 px          | **A burger.** Four treatments were rendered at 768, 1024 and 1279 and put side by side — accept it, thin the 80px gutter, drop two links, wrap onto a second row — and the owner picked the one none of them were. All six links now collapse behind a burger below 1280px, which costs no header height where wrapping cost 91px. | §12 |

**Still open from the session 8 audit — the owner has seen the list and picked from it:**

| # | What | Why it is still here | Where |
| - | ---- | -------------------- | ----- |
| 3 | Thirteen inert `See All (206)` pills | Every row header carries one; none has an `href` or an `onClick`, and the 206 is a Figma placeholder over a 60-game catalogue. Making them work means deciding what "see all" means for a row, which is a product question, not a wiring one. | audit §1.3 |
| 4 | "More" in the mobile menu opens a corner popover | It closes the full-screen sheet and raises a 171px desktop panel in the top-right of the phone. The decision behind it is recorded and defensible; the result on a phone is not. | audit §2.5 |
| 5 | Three menu rows promise a submenu | `Sport`, `Casino` and `Payments` draw a disclosure chevron and navigate instead. `Casino` goes to `/`, the page you are already on. | audit §2.6 |
| 6 | The provider filter's results ride a 40s marquee | Filter to `net` and the only match slides across the row, clipped 25px by its own container, off-screen for part of every cycle. | audit §2.7 |
| 7 | The no-results copy points at nothing | "browse our categories below" — the panel below it holds one button and no categories. | audit §2.9 |
| 8 | Four labels for two auth buttons | Desktop `Login`/`Register`, mobile `Log In`/`Sign In`; the mobile *register* button reads as log-in. The copy is Figma's own, so it is a question for whoever owns the design. | audit §3.4 |
| 9 | Six SVGs still carry the Figma artboard | `clean-svg.mjs --dry` reports nothing to do. The furniture is a `<path>`, and rule 2 only catches paths starting more than 1000 units outside the viewBox — these start at −149 to −961. Invisible today; the same class of bug as `slots.svg`. | audit §3.5 |

**Agreed and done:**

| # | What                         | Size                                                                                             | Where |
| - | ---------------------------- | -------------------------------------------------------------------------------------------------- | ----- |
| ~~3~~ | ~~Romanian docs become English~~ — **done in session 8** | It was **four** files, not the three this table used to name. All converted in one pass. | §10 |

**Done in session 7 — kept here only so the trail is findable:** the menu panel moved onto Figma's
`#0D1420` with opaque `#222431` rows, the identity line and ID follow the rebuilt frames, the
balance chip is node `13:2325`'s pill, the ten icon SVGs (and seventeen more nobody had checked)
lost their Figma artboard, backdrop dismissal returns focus to its trigger, and the prefetch 404s
are closed across the app. All in §11.

**Known, accepted, and not to be re-opened without a reason:**

| #  | What                                    | Why it stands                                                                                   | Where |
| -- | --------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- |
| 4  | The tab bar is live to touch, not to AT | The jackpot menu is `aria-modal` with a focus trap, so a screen reader stays inside it while the bar is visibly lit. Nobody is stranded — Escape closes it, and Sport, Casino and Promotions are rows in the menu — but Live Casino is reachable only after closing. Undoing this means giving up `aria-modal`, the trap and backdrop dismissal together. | §9 |
| 5  | Game cards are `article`, not links     | `GameCard` and `ProviderCard` both render an `<a>` when given an `href`; no caller passes one, because the demo has no game pages. A link to nowhere is worse than no link. Resolves itself if game pages arrive. | §4 |
| 6  | `bonus-buy` draws stars, Figma a crown  | Node `1:3367`'s crown is fifteen masked fragments with no clean vector to export, and at 20px the difference is hard to see. | §1 |
| 7  | A dead Figma node id cannot be detected | `screens.test.ts` checks that every `figmaNodeId` matches `^\d+:\d+$`, which the three dead ones did. Nothing in the repo can do better without calling Figma. | §9 |
| 8  | Thirteen deliberate differences         | Currency, fallback artwork, the mobile hero showing one offer, and ten more — each listed with its node and its reason. To be re-confirmed at sign-off, not fixed. | §5 |

## Local commands

```bash
npm run dev          # review server on :3000
npm test             # vitest, 64 tests; also runs in CI, before the build
npm run build:check  # production build into .next-build, safe while dev is running
npx tsc --noEmit
npx eslint src --max-warnings=0

node scripts/shot.mjs <url> <out.png> <w> <h> viewport '<selector|scrollY>'
node scripts/review.mjs <outDir>   # all 15 review states, each shot twice: reduce and no-preference
node scripts/a11y.mjs <outDir> [baseUrl]  # axe-core over 9 states; exits 1 when critical/serious exist
node scripts/clean-svg.mjs public/images --dry
node scripts/to-webp.mjs public/images --dry   # re-encode any new PNG export
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
The row heights and the 6px account-row gaps that the VIP frame sets are untouched. Measured at
390x844 in both motion modes: `Sign out` now spans 708–748, the sheet is 757 tall against a
scrollHeight of 756 and a clientHeight of 756 — nothing scrolls — and the page is still 390 wide.
The 90vh cap stays, so the strip of tab bar the design shows beneath the sheet is still there.
Commit f437f37.

Two things here have since been overtaken by §9, and are left as written because they are what was
measured at the time. The 90vh cap is gone — the sheet now fills the box down to the bar — and the
VIP frame is no longer node 1:8503, which does not resolve any more; it is 13:2519.

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
- The magnifier inside both provider fields is blue, as Figma draws it:
  `public/images/icons/search-blue.svg` is the node 1:2239 geometry restroked, used by
  `ProviderSearch` alone — the header magnifier, the games field and `SearchNoResults` keep the grey
  `search.svg`. It is a third blue, neither the `#006EE6` token nor the `#00F0FF` cyan, and that is
  deliberate: the owner's decision of 2026-09-09 is Figma's own `#36BCFF` from nodes 1:2239 and
  1:4323. Rasterised from the running page it measures `#36BCFF` at both 390 and 1440, and
  `docs/tokens.md` §2b records it. Nothing left open here.

### 6. Seen in Chrome, 2026-09-09

Two sessions of measurements had gone by — bounding boxes, axe-core, `scrollWidth` — and the page
still looked wrong. So this session **looked** at it. The site was opened in Claude in Chrome at 390
and at 1440, state by state, beside its Figma captures (file `2MyylxdZblfGnf05nQacUz`), and every
claim below started from something visible on screen rather than from a number.

The rig is a single same-origin page holding four 390x844 iframes, each with
`::-webkit-scrollbar{display:none}` injected, so one screenshot is four phone screens at once and
the browser's own scrollbars do not eat 15px of every frame. Zoom into the raw PNG for detail. One
trap is worth writing down: the downscaled JPEG that comes back from a screenshot hides 16px icons
entirely, so "the icon is missing" is a claim the capture cannot support. Confirm it with
`img.naturalWidth` first — twice this session an icon that looked absent was there.

**What was found and fixed.**

| # | What | Evidence | Fix | Commit |
| - | ---- | -------- | --- | ------ |
| B1 | Every promo countdown read `00:00:00` | `tournaments.json` carries the design's deadline `endsAt: "2026-09-08T18:12:36Z"`, which is in the past, and the banners formatted it once on the server through `Math.max(0, …)` | `nextCountdownEnd()` in `src/lib/format.ts` rolls a past deadline forward in whole 7-day periods at read time, and the new `useCountdown` hook re-formats from `Date.now()` once a second on the client; both promo banners became client components for that one reason. Measured live: `164:03:23`, ticking, 0 console errors and 0 hydration warnings. Hours now reach three digits (164h) where the design draws `08h`, because the period is a week — a 24-hour period is a one-constant change if you prefer the design's width | `202ba23` |
| B2 | The mobile Weekly Lottery subtitle disappeared into the artwork | The reported diagnosis, "the text is under the image", was wrong: `document.elementFromPoint` at the end of that line returns the `<p>`, not the `<img>`, so the text has always been painted on top and a `z-index` would have changed nothing. The real defect is contrast — the copy wraps to two lines in the 190px column and "now" lands on the lit phone in the middle of the scene, where `text-subtitle` measured **1.68:1** at 390 | A radial scrim of `--bg-card` between the image and the body, anchored to the card's left edge, 400 wide against a 358 card so it never draws an edge of its own. Gated off the wheel card by the owner's decision (node 1:6282), which renders pixel-identical, 0 differing pixels. "now" measures **6.50:1**, the same under both motion preferences | `9efd153` |
| B3 | At 390 the search was a floating card, 358x384 at y=16, with a strip of header showing above it and the balance pill cut in half | Figma has no mobile search frame at all — nodes 1:4334, 1:4479 and 1:4611 are all 1440 wide | Below 768px `SearchOverlay` renders through `Sheet` with `anchor="top"`, the same container the Jackpot menu uses. Measured: `[role=dialog]` at top 0, 390 wide, no header pixel reachable behind it, focus trapped across 30 tabs, `Escape` returns focus to the header magnifier. Desktop is pixel-identical. **Known, pre-existing, still open:** clicking the backdrop leaves focus on `body` — the same in the Jackpot menu sheet, so it lives in `useOverlayBehavior`/`Sheet`, not in the search | `f06e5ae` |
| — | The search chip on Sweet Bonanza read `Popular` where Figma writes `Slots` (node 1:4479) | Found by the systematic app-vs-Figma diff of all 15 states (`.review-tmp/visual/report.md`). `chipLabel` took `categories[0]`, and `games.json` lists the curation tab "popular" first on the seven games that carry it | The chip now prefers a genre category and falls back to the curation one, so the order in `games.json` — which the Popular tab depends on — stays untouched. At 1440 the only change on `/?q=swe` is the chip itself, a 57x24 box at (1262,183) | `5251402` |
| — | The mobile footer was one long single column: payment tiles one per row, partners two per row, the link columns stacked, flags 6+4. Figma's mobile frame (node 1:5720 / 1:6517) draws 2-column tiles, three partners per row, two link columns side by side and 5 flags per row | Same diff. Confirmed from computed layout, not pixels: the row is 316px wide but two fixed `w-40` (160px) tiles plus `gap-3` need 332px, so every tile wrapped | Figma's mobile frame starts every row at x=8 rather than x=16, and that 16px was the overflow. The footer's mobile padding now matches, the tile takes half the row minus the gap — exactly the 160px Figma draws — partner slots take a third of their row, Navigation and Policies & Legal sit side by side again with Figma's 32px gutter and 21.5px inset, and the flags drop to the 32.2x31.7 Figma uses on mobile. Measured at 390 in both motion modes: `scrollWidth` 390, tiles 2/2/2/1 at 160px, partners 3/3/1, flags 5/5, the two link columns at the same top. The desktop footer at 1440 is pixel-identical, 0 differing pixels | `5251402` |

**Decision 2 of the day — the provider magnifier is `#36BCFF`.** That is the value Figma exports on
nodes 1:2239 and 1:4323, and it is neither the blue token (`#006EE6` after the contrast pass) nor
the `#00F0FF` cyan. It lives in `public/images/icons/search-blue.svg`, used by `ProviderSearch`
alone, and `docs/tokens.md` §2b records it with its source node. No CSS variable and no Tailwind
token come with it: `Icon` serves the file through `next/image` with `unoptimized`, so the colour
lives in the SVG and nothing in the theme can reach it. This closes the open question that §5 used
to carry.

**Verified beside Figma and deliberately not fixed.** These all looked wrong on screen and are not.
Nobody should re-open them:

- The dark 64x64 disc behind the tab-bar `Menu` button — node 1:8235 draws it.
- The short rule in the `Leading Providers` header — node 1:2650 fixes it at 160px.
- `Invite Friends` on two lines in the account dropdown — node 1:4153 breaks it the same way.
- The orange `SPIN THE WHEEL` text over the wheel artwork — node 1:6282.
- `Sign out` visible without scrolling in the Jackpot menu, both post-login and VIP.
- Plus the deliberate deviations the systematic diff re-confirmed: the gradient and initials
  fallbacks where no artwork was ever exported, the provider "no results" state hiding the carousel,
  the email standing in for an account id, GBP against the design's placeholder currency, and one
  real `Jackpots` tab against Figma's three repeated placeholders.

Section 14 of the review report is the same five fixes with the after-capture beside the Figma node.

### 7. Resuming on another machine (written 2026-09-09, after session 4)

Everything is on `main` and deployed (`f00c275..a1c7bc0`). Nothing is half-done. Start here:

- **One decision is open: the countdown period.** `PERIOD_MS` in `src/lib/format.ts` rolls a past
  deadline forward in 7-day periods, as the session-4 plan asked. That makes the hours field three
  digits (`164h : 06m : 33s`) where the design draws `08h : 12m : 36s`. A 24-hour period keeps two
  digits; it is a one-constant change plus the roll-forward assert. Owner's call.
- **Known and accepted, not to be re-opened:** the list under §6 "verified against Figma, do not fix".
- **Pre-existing, open, small:** clicking a sheet's backdrop leaves focus on `body` instead of
  returning it to the trigger (same in the Jackpot menu and the new mobile search; lives in
  `useOverlayBehavior` / `Sheet`). Escape does return focus correctly.
- **How to look before claiming a state is fine:** the iframe rig in §6, on `localhost:3000` or on
  the deployed site. Two traps from this session: lazy images need about 3 s after a programmatic
  `scrollTo` before the screenshot, or every card looks empty; and the dark "N" disc bottom-left at
  390 in dev is the Next.js dev indicator, not the app.
- **Parallel workers in one checkout.** Session 4 ran six workers through Orca (Run
  `run_ee5ca14d3211` on the first machine; Orca state is per-machine, so on another PC use whatever
  orchestration is installed there, or plain subagents). Two rules earned the hard way: a worker
  that commits sweeps in whatever another worker has staged, so every worker stages and commits
  its own paths in one step and checks `git show --stat`; and when two workers must edit one file,
  give each a disjoint set of lines and re-read the file right before editing.
- **Never** run `npm run build` or a static export in a checkout whose `next dev` is running:
  they share `.next`. `npm run build:check` is the safe check.

### 8. Session 5 — the safety net, the bytes, and the range nobody had looked at

Four things that were not on any list, found by measuring the repo and the deployed build. This
session ran on a second machine and started from commit `e0dbe47`, so §6 and §7 above were written
in parallel and none of it overlaps.

**There are tests now.** `npm test` — vitest, six suites, 58 cases — and the Pages workflow runs it
before the build. The one that earns its keep is `src/lib/__tests__/assets.test.ts`: it walks every
path the code can produce, both the helpers in `assets.ts` and the raw strings in `src/data/*.json`,
and fails if the file is not on disk; then it walks the other way and fails on a file no list
mentions. That is the failure this project has already shipped twice — the sub-path deploy that
404'd every image, and the `search-btn.svg` export that contained the whole page. `IconName` is
checked as a `Record<IconName, true>`, so adding a glyph to the union without adding the file fails
to compile; that is how `search-blue` was caught during the rebase.

**The first run found a real bug.** Search could not find `Gonzo's Quest`. `normalize()` replaced
the apostrophe with a space, so the stored title read `gonzo s quest` and a player typing "gonzos" —
the case the function's own comment cites as its reason to exist — matched nothing. Three catalogue
titles carry one. Fixed, with the test that names them.

**Images: 2.7 MB → 313 KB.** Every PNG under `public/images` is WebP at quality 90, via
`node scripts/to-webp.mjs`, which keeps the PNG whenever WebP would be larger. Checked on screen at
both viewports; no banding in the hero's navy gradient or the tournament banner's smoke.

**Each device fetches one hero artwork, not both.** `HeroBanner` draws two compositions and hides
one with CSS. Both carried `priority`, which emits a preload nothing gates by viewport, so every
phone downloaded the 575 KB desktop banner it never shows. Now: `loading="lazy"` on both, so the
hidden twin has no layout box and is never fetched, plus two `media`-scoped preloads for the one
that will show. Measured on the built export at 390 and at 1440: one hero file each, the right one.
The same mistake was in `src/app/page.tsx`, which marked both twins of a doubled row as priority.

**768–1279 px no longer overflows.** The Figma file draws 390 and 1440; the range between them ran
the desktop layout squeezed and nobody had looked. Measured: `document.scrollWidth` was 1191 at
every width below that, so the page carried a horizontal scrollbar and the header's right cluster
sat outside the viewport — at 768 the balance, `Deposit` and the account menu were unreachable, not
merely clipped. The header's nav now scrolls inside itself (`min-w-0` plus a hidden-scrollbar
scroller) while the account cluster is `shrink-0`. Re-measured: `scrollWidth` equals the viewport
from 768 to 1280, and 1440 is unchanged. `break-words` on the game card title for the same reason —
at 1024 a squeezed card cut "Starburst" mid-letter.

**The audit, and what checking it in a browser was worth.** Twelve agents compared the nine content
rows against their Figma nodes and audited accessibility; none of them was allowed to run the site,
so every figure came from node data plus source. Checking each claim against a rendered page changed
the answer three times out of nine:

- **The amber was already right.** The audit reported `docs/tokens.md` recording the promo pill fill
  as `#F59E0B @ 10%` and `globals.css` implementing it. Measured on the "1,000,000.00 GBP PRIZE"
  pill: background `rgba(242,193,70,0.1)`, text `rgb(245,158,11)` — the `#F2C146` tint with
  `#F59E0B` text, exactly what nodes 1:3538 / 1:3594–1:3600 draw, and exactly what §2b records. The
  agents read the token file from before that section existed.
- **The wheel's stat rows do not overflow.** The audit inferred the banner would grow to ~264px.
  Measured: pill stack 180x120 at y=36, each row 34 tall with 9px gaps, SPIN button at y=180,
  banner 260 — every number equal to node 1:3593.
- **The promo spacing was fixed already**, by `31f69f6`'s per-variant class maps.

Five were real, and are now applied — each measured against its node before and after:

| what | node | was | now |
| --- | --- | --- | --- |
| promo title line box | `1:3443`, `1:3535`, `1:3590` | `leading-none`, 32px, lifting the subtitle 5.5px | `leading-[39px]`; subtitle within 2px of the design |
| `See All (206)` pill | `1:3264` | 31.5px tall, an inherited 1.5 line-height | 28px, on the `seeAll` variant so the hero's Get pill is untouched |
| mobile row, header to grid | `1:6175` | 20px, the desktop value | 16px via `mobile:gap-4`, twelve rows at once |
| mobile card shadow | `1:6179` | the desktop `0 4px 8px rgb(0 0 0/0.25)` | `-2px 2px 12px rgb(8 8 20/0.75)` under 768px |
| gold button label | `1:3547`, `1:3604` | `text-page`, `#0f121d` | `text-black` |

**Still open from this session:**

- **Ten of the twenty-one icon files carry the whole Figma artboard** — `bonus-buy`, `crash`,
  `instant`, `lottery`, `megaways`, `new`, `recommended`, `slots`, `tournaments`, `wheel` each open
  with `<rect width="1440" height="7453" fill="#0F121D"/>`. `bonus-buy.svg` is 16.9 KB for a 20px
  glyph. They are invisible today only because that fill equals the page background; `slots.svg`
  also carries the category bar's capsule, so its glyph already sits on a lighter square. Put any
  section icon on a card or a hover tint and ten dark squares appear at once. `scripts/clean-svg.mjs`
  does not catch them: it strips Figma's `#1E1E1E` canvas rect, and this is a different fill.
  (`drops-wins` and `egypt` are already clean — commit `5590575` re-exported them.)
- **Between 768 and 1279 the nav is a scrollable sliver.** All links stay reachable, but the strip
  is narrow. Figma has no frame for that range, so widening it means designing it. Owner's call.

### 9. Session 6 — the mobile menu fills the screen, and the tab bar stays switched on

**What the owner saw.** Opening the mobile jackpot menu at 390px left the page showing through
underneath it — the Sweet Bonanza and Starburst cards, dimmed — with the bottom tab bar greyed out.
Figma draws that screen as one dark surface running from the top of the phone down to a *lit* tab
bar with `Menu` active. Measured on the deployed build at 390x844 before any change: the dialog was
390x631 pre-login, 390x757 post-login and 390x757.5 VIP, which is 213px, 87px and 86.5px of live
page inside the modal.

**Two causes, both in code.** `Sheet` rendered a `fixed inset-0` scrim with a top-anchored surface
capped at `max-h-[90vh]`; nothing stretched it, so whatever the menu did not fill stayed page. And
the scrim was full-bleed at `z-50` over a `z-40` bar, so the bar was dimmed *and* swallowing taps —
pressing `Casino` hit the backdrop and closed the menu instead of navigating.

**The fix, in four pieces.**

- `Sheet` takes an opt-in `clearsNavBar`. The scrim becomes `top-0` with
  `bottom-[calc(var(--mobile-nav-h) + env(safe-area-inset-bottom))]` and the surface fills that box
  with `h-full` instead of a cap. Only the jackpot menu passes it: the mobile search sheet is also
  `anchor="top"`, Figma has no mobile search frame at all, so its relationship to the bar is our own
  decision and is deliberately unchanged. Verified — the search sheet still draws an 844px scrim
  over a 566px dialog with the bar under it at `z-40`.
- The clearance is scoped to the `mobile:` breakpoint, because that is where the bar exists.
  Above 767px `MobileNavBar` renders nothing, and reserving 84px there would leave an undimmed
  strip of page with no bar in it.
- The 84 now lives once, as `--mobile-nav-h` in `globals.css`. Three places read it: the bar draws
  it, `MobileShell` reserves it at the end of the document, and the sheet stops at it. It used to be
  written out twice.
- `NavTab` closes the panel on click. Without it, tapping `Casino` while already on `/` navigates
  nowhere and the menu stays open on top of the page it was meant to reveal.

**The bottom row.** The rebuilt frames put Sign out and Support on one row (node `13:2486`) and drop
the solid green *Vip Manager* button that used to sit beside Support. Sign out is `#FF787A`, a new
token — the only red in the design. The row is `items-stretch` rather than two fixed heights,
because that is how Figma reaches its own two numbers: Support is 38 tall on its own pre-login and
42 when Sign out stands next to it. Support's padding is `py-[9px]` and not Figma's 10, because
Figma leaves the 1px stroke outside the 38 it measures and CSS puts it inside.

**Deposit turned green** — node `13:2340`, `#00B579`, off the gold ramp it used to be on. Figma
writes its label white, which measures 2.66:1 and would have turned the Pages workflow red;
owner's decision is to keep the design's green and write the label in `text-page`, 7.01:1. It lives
in `Button.tsx` as the `deposit` variant. `docs/tokens.md` §2b records both numbers.

**One defect the screenshots caught that the numbers did not.** With the sheet ending exactly at
the bar's top edge, the raised `Menu` disc — 54px of circle sitting 42px proud of the 84px strip —
was painted over by the panel and rendered as a gold semicircle. The bar is now `z-[60]` while the
menu is open and `z-40` otherwise, so the disc draws whole and over the panel, as Figma has it. The
condition matters: the search sheet must keep covering this bar, and the sheet is portalled after
the nav in the DOM, so equal z-index values would still put it on top.

**Measured after, at 390x844, on the static export served the way CI serves it.** All three states:
dialog 390x760 against an 844 viewport with the bar's top at 760, `scrollHeight` equal to
`clientHeight` so nothing scrolls, and `document.scrollWidth` still 390.
`elementFromPoint(195, 700)` lands inside the dialog in all three, where it used to land on a game
card. At the bar's centre it lands in the nav, not the backdrop; the `Menu` label computes to
`rgb(245, 158, 11)`, the amber token; tapping `Casino` closes the panel. Sign out is 130x42 at
x=42 in `rgb(255, 120, 122)`, Support 168x42 at x=180 — which is 26 and 164 inside the 358-wide
panel, the two numbers node `13:2486` gives. Pre-login shows Support alone, 168x38 at x=111, and
node `1:8908` puts it at 95 of 358. No Vip Manager in any state. Deposit is 113x38,
`rgb(0, 181, 121)` with a `rgb(15, 18, 29)` label. `scripts/a11y.mjs` over all nine states: zero
critical, serious, moderate and minor.

**The Figma frames were rebuilt** on 2026-09-09 and two of the three node ids in this repo now
point at nothing. `1:8260` became `13:2307` (post-login) and `1:8503` / `1:8504` became `13:2519`
(VIP); `1:8751` (pre-login) is unchanged. Replaced in `src/lib/screens.ts` — where they are the
deep links `/dev/screens` builds, so two entries were linking into a void — plus `JackpotMenu`,
`Sheet`, `dev/screens/page.tsx`, this file, `start-here.txt` and `README.md`.
`public/review/index.html` still carries the old ids and is left alone on purpose: it is a dated
report of what was reviewed at the time, not a live reference.

**Left open, deliberately:**

- **The panel's own colour.** Figma's menu surface, the strip under it and the tab bar all sample to
  `#0D1420`; ours is `--bg-card #151624` on `--bg-page #0F121D`. Filling the height makes the screen
  read as uniform either way, so this change did not need it — but the design and the tokens
  disagree by a few units and somebody should decide whether the menu should sit on the page colour.
- **The tab bar is live to a finger, not to a screen reader.** The sheet is `aria-modal="true"` with
  a focus trap, so assistive tech and the Tab key stay inside the dialog while the bar is visibly
  lit and tappable. Nobody is stranded — Escape closes the menu, and Sport, Casino and Promotions
  are rows inside it — but Live Casino is reachable only after closing. Making the bar genuinely
  non-modal means giving up `aria-modal`, the trap and the backdrop dismissal together, which is a
  bigger decision than this task.
- **The identity line.** The rebuilt frames print `luckytest1234567` as the name and `23885` in the
  ID field; we print the email above the name and `user-luckytest` as the ID. That was a recorded
  deliberate difference back when the design had no username to show. It now has one.
- **The header balance chip.** Node `13:2325` puts the `$ 140.00` in a 40px pill with a 4%
  `rgba(0,92,64)` fill and a gold text-shadow; ours is plain gold text at the same size and colour.
- **A node id in this repo cannot be known to be stale.** `src/lib/__tests__/screens.test.ts` checks
  that every `figmaNodeId` matches `^\d+:\d+$`, which the three dead ones did. Nothing here can do
  better without calling Figma.

### 10. Backlog — the Romanian documentation has to become English

Owner's instruction, 2026-09-09: the code is going to a team with no Romanian, so every information
file has to be in English. Not urgent, and explicitly not to be done piecemeal — new writing goes
in English from now on, and what already exists in Romanian gets converted in one pass at the end.

**Done in session 8.** All of it, in one pass. The table below is kept because the list it
originally carried was wrong, and that is worth remembering: it named three files and there were
**four**. `scripts/to-webp.mjs` was missed, and it would have stayed missed — a scan by diacritics
does not find `docs/start-here.txt`, which is written without them, and a scan for `.md` and `.html`
does not find a `.mjs`. The list was re-derived here twice, once by diacritics and once by a
diacritic-free keyword list, and both sweeps have to agree before the job can be called finished.

| File                       | Lines | Note                                                                     |
| -------------------------- | ----- | ------------------------------------------------------------------------ |
| `public/review/index.html` | 2343  | the design-vs-implementation report, deployed at `/review/`. The only Romanian a non-developer could see. `lang="ro"` → `lang="en"`; the 14 Romanian `id`s left alone on purpose, so any URL already shared with the client still resolves |
| `docs/tokens.md`           | 354   | the Figma-to-code token mapping; the one document that must not go stale. Section numbers `1 / 2 / 2b / 3 / 4` preserved — four other files cross-reference them |
| `docs/start-here.txt`      | 182   | how to open the next session. Romanian written *without* diacritics, which is why a diacritic scan alone is not enough |
| `scripts/to-webp.mjs`      | 5 printed lines | the one the old list missed; the file paths inside the strings are unchanged |

`README.md`, `docs/next-session.md` and `docs/build-plan.md` were already English.

One thing was changed rather than translated, and it needs the owner's eye: `docs/start-here.txt`
used to print the previous developer's absolute Windows paths (`C:\Users\grosu.b\.claude\…`). That
file goes to an outside team, so the paths are now written as `<your home>/.claude/…`. The
information is the same; the username is gone.

### 11. Session 7 — what looking at the deployed build in a browser found

The previous session shipped the menu fix and every static check was green. This session opened the
**deployed** build in Chrome, which found two things no static check could reach.

**The page was quietly asking for pages that do not exist.** Measured at 390x844 on the live site:
one failed `<route>/index.txt?_rsc=` request per dead link — eleven from the jackpot menu, nine more
from the footer. Next prefetches `<Link>`s by default and this demo has exactly two routes, so every
other href asks the static export for a page that is not there.

This was the **third** appearance of one bug. It was fixed for the bottom tab bar in §2b (`5f5bda4`)
and for the header before that, each time at the one place it was noticed. So it is now closed
across the codebase: `prefetch={false}` on the five menu links, on `FooterLinkColumn` (eleven dead
hrefs in `footer.json`, the largest offender), on the promo card's raw link, and hard-coded inside
`Button`'s link branch — before the spread, so a caller that one day links somewhere real can still
override it without widening a prop type. One thing worth knowing: the `mailto:` in `footer.json`
goes through `<Link>` and is left alone on purpose.

**The check is an A/B, because "zero 404s" on its own proves nothing.** The same script was pointed
at the fixed export and at the deployed pre-fix build: open the menu at 390x844, hover a menu link,
scroll to the footer, hover a footer link, then sit on the open menu for six minutes.

| build | after the menu | after the footer | after six minutes | of which 404 |
| --- | --- | --- | --- | --- |
| before the fix (deployed) | 11 | 20 | 20 | **20** |
| after the fix (local export) | 0 | 0 | 0 | 0 |

Read the eleven and the nine. Eleven is every link in the pre-login menu — `/sport`, `/referral`,
`/bonuses`, `/promos`, `/cashback`, `/payments`, `/profile`, `/terms`, `/support`, `/login`,
`/register`. The other nine are the footer: `/responsible-gaming`, `/refer-a-friend`, `/providers`
and the six under `/legal/`. **The footer really was an offender**, which is worth stating plainly
because the short probes earlier in this session failed to reproduce it and could easily have been
read as "the footer is fine". Fixing everything that can 404, rather than only the place the bug was
first seen, was the right call — and it is the third time this bug has been found in this codebase
precisely because the previous two fixes stopped at the place they were noticed.

That control matters on its own terms too. Three separate probes against the fixed build returned
zero before it ran, and none of them were evidence of anything. Only the side-by-side settles it.

The control also corrected two things this session had believed on the way in. The requests do
**not** trickle in over minutes — the pre-fix build fires all twenty inside the first minute and
then stops; the "takes minutes to appear" reading came from measuring inside iframes parked outside
the host page's viewport, which is a property of the measuring rig, not of Next. And the caveat that
`prefetch={false}` leaves hover prefetching alive was dropped from the code comments, because on
Next 15.5.25 a deliberate hover on a menu link and on a footer link produced nothing.

**`slots.svg` was not a latent problem, it was a live one.** Ten icon files carry a
`1440x7453` Figma artboard rect. Nine paint `#0F121D`, which equals the page, so they hide.
`slots.svg` also drags along the category bar's glass capsule (`#151624`), an inactive tab chip and
a backdrop-blur layer — its topmost opaque fill is *not* the page colour, so it has been drawing a
lighter square in the "Must-Play Slots" header all along. It reads as fine inside the category bar
only because the file happens to reproduce that exact stack.

`scripts/clean-svg.mjs` now has a third rule, and the interesting part is why it is geometric.
Extending the old fill list would have fixed nine files and missed `slots.svg`, whose extra layers
are perfectly ordinary colours. What they are not is small. But a plain "bigger than the viewBox"
test was worse: it would have deleted **the ring around every flag** — 39.142 in a 39 box, which is
`--border-flag`, node 1:4016, and part of the design. Measured across all 62 SVGs the shapes sort
into two groups with a wide gap: everything to keep is at most 1.63x the viewBox, everything to
remove is at least 2.7x. The threshold sits in that gap.

The rule found the same page rect in **seventeen more files** nobody had looked at — every flag,
every provider badge, both payment logos. All 27 were checked line by line afterwards: the only
things removed are page rects, the footer panel behind the payment logos, `slots.svg`'s four bar
layers and its blur layer. Every file still parses balanced with no dangling `url(#…)`.

Then they were checked by rendering rather than by reading, because bytes do not prove pixels. Drawn
into a canvas at 40px, `megaways` before the fix is **100% painted with all four corners fully
opaque** — a solid block — and 29% with transparent corners after. Every one of the sixteen icon
files now has transparent corners. And drawn side by side on the page colour, the "lighter square"
`slots.svg` was suspected of is plainly visible in the before and gone in the after, while
`megaways` looks identical in both — exactly as it should, since its rect *was* the page colour.

**Also in this pass, from §9's open list:**

- **The menu panel moved onto Figma's `#0D1420`**, and the rows had to move with it. This is the
  trap worth remembering: our rows already matched the design at `#232431` — but only because
  `bg-elevated` is white 6% *over `#151624`*. Dropping the surface to `#0D1420` would have taken the
  same 6% to `#1C222D` and broken a colour that was right. Node `13:2362` declares an opaque
  `#222431`, so the rows and the ID field now use a token instead of a translucent fill. `Sheet`
  takes the colour as a prop rather than globally, because `SearchOverlay` shares the component and
  its rows are `bg-card` — they would have become visibly lighter cards.
- **The identity line follows the rebuilt frames.** Post-login is one line, the name (node
  `13:2338`); VIP puts the badge on its own line above it (node `13:2550`), not beside it. The email
  is gone: it stood in while the design had no username, and now it has one. The ID is `23885`, from
  node `13:2345`. `profile.email` now has no reader anywhere in `src`, and stays in `user.json`
  alongside `phone`, `dob` and `address`, which have never had one either — the mock account is
  meant to look like a real one, and `PersonalInfoPanel` renders none of those four because node
  1:4153 does not draw them.
- **The balance chip** is node `13:2325`'s pill — 4% green, 22px radius, extra-bold gold under a
  gold-dark 25% text shadow. It stays a label and not a button: the layer is named "Emerald Outlined
  Button" in Figma but carries no affordance, where the desktop header's pill has a chevron.
- **Backdrop dismissal now returns focus to the trigger.** The cause was not a missed restoration —
  both paths run `opener.focus()`. The backdrop path then hands control back to the browser, which
  performs the uncancelled default action of `mousedown`: focus the nearest focusable ancestor of
  the press target. That target is the backdrop, non-focusable and detached by then, so focus falls
  to `body` and overwrites a restoration that had already succeeded. `keydown` has no such default
  action, which is the whole of the difference. One `preventDefault()`, inside the existing
  `target === currentTarget` guard — it has to stay inside it, or clicking into the search field
  would stop focusing it.

Still open and unchanged: the tab bar's modality, the 768–1279 nav, the countdown period, the
Romanian docs (§10) and `public/review/index.html`'s dead node ids. See the table at the top.

### 12. Session 8 — pressing every button, and what the owner picked

The centre of gravity was a hands-on walk of the deployed build rather than another measuring pass.
The full ranked list is [`docs/audit-session-8.md`](audit-session-8.md); this section is only what
changed afterwards.

**The one number.** Of the **49 visible controls on the desktop homepage, 8 did what they said.**
19 navigated to routes that do not exist, 15 had no handler at all, 7 pointed at `example.com`.

**What was fixed, with the after-measurement.**

- **The four category tabs now filter.** They were `<button aria-pressed>` with no handler — a
  toggle group that announced itself as one and swallowed the press. `activeCategory` is now store
  state and `CategoryView` switches on it: Popular 90 cards -> Slots 40 -> Live Casino 6 -> Popular
  90. Popular is not a special case bolted on; the fifteen rows *are* the house curation, so that
  tab renders the server-rendered rows untouched and every existing Figma comparison stays valid.
- **The search funnel ends somewhere.** Enter commits, ArrowDown moves focus into the first
  suggestion, and picking a game puts its matches on the page instead of just closing the panel.
  `search.committed` is the new slice — distinct from `search.query`, which is only what is in the
  field right now.
- **Both header popovers hang off their trigger.** One cause, two symptoms: `Panel`'s
  `ALIGN_CLASSES.right` pinned every header popover to the viewport's top-right corner and never
  read the trigger. Measured after, at 1440 and 1024, both panels: left-edge delta **0px**,
  top-to-trigger-bottom **8px**, which is exactly what nodes `1:4118` and `1:4155` draw.
- **The tab-bar marks fill their box.** The owner reported them as "smaller than in Figma" and was
  right, more directly than the session plan assumed — the 22px box matched, the drawing inside it
  did not. Casino, Sport and Promos are now 22x22 = 100%; Live Casino is 17.77x22 because node
  `1:8249` genuinely is that shape. Three were also the wrong drawing: Live Casino was missing its
  chip stack, Sport was not a football, Promos was not a scalloped seal. The path data is now
  byte-identical to the Figma exports rather than hand-redrawn.
- **768-1279 gets a burger.** Four treatments were rendered at all three widths and compared before
  anything was chosen. Only wrapping showed all six links at 768, and it cost 91px of header
  height. The owner picked the fifth option — a burger — which keeps all six and costs no height.
- **The countdown is 24h**, and `<time dateTime>` no longer publishes a date in the past.

**Two things this session cost time on, worth not repeating.**

- **`element.click()` does not move focus.** It made a working focus restoration look broken and it
  sets `:focus-visible` where a real mouse press does not. Two candidate findings died to this, and
  six in total died to control runs — they are listed in the audit so nobody re-finds them. Drive
  anything about focus or hover with real mouse events.
- **`resize_window` still lies on a maximised Chrome.** It reported success while `innerWidth`
  stayed 2552. The rig that works is a same-origin host page holding one `<iframe>` sized to the
  viewport under test.

**Still open from the audit, not picked:** the thirteen inert `See All (206)` pills, "More" opening
a corner popover on a phone, the three mobile-menu rows that draw a disclosure chevron and navigate
instead, the provider filter's results riding a 40-second marquee, the no-results copy pointing at
categories that are not in the panel, the four labels for two auth buttons, and six SVGs that still
carry the Figma artboard because `clean-svg.mjs`'s rule 2 only catches paths starting more than
1000 units outside the viewBox and these start at -149 to -961.

## Things worth remembering about this codebase

- **This demo has three routes.** `/`, `/dev/screens` and `not-found`. Every other href in the app
  is dead by design, and Next prefetches `<Link>`s by default — so a new `<Link>` needs
  `prefetch={false}` unless its href is one of those two. Forgetting it is silent: the page renders
  correctly and 404s in the background. The same bug has now been fixed three times, in
  `Header`, `MobileNavBar` and finally everywhere else.
- **A translucent fill only matches the design while the surface under it agrees.** `bg-elevated`
  is white 6%; it matched Figma's menu rows exactly until the panel colour moved, and then it did
  not. Where a node declares a flat fill, use a flat token.
- **`assets.test.ts` cannot see inside a file.** It walks every asset path both ways and fails on a
  missing or unreferenced file, but it only ever calls `existsSync`. A dirty re-export — the exact
  failure its own docblock cites as its reason to exist — passes it. Look at the bytes.

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
- **A control that cannot do anything must not look pressable.** The audit's largest single class
  of finding was affordance without behaviour: pills with `aria-pressed` and no handler, buttons
  with hover and active states and no `onClick`. It is worse than a missing control, because the
  player blames themselves. When a demo genuinely has nowhere to go, say so in the markup —
  `aria-disabled` and a muted treatment — rather than drawing a live-looking button.
