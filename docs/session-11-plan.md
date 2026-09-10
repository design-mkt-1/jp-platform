# Session 11 — the mobile demo, after four leaks were closed

> **Live as of 2026-09-10, after session 12. §2 areas A, C and D are CLOSED; B is open and its
> premise was wrong — see §2 B below and `next-session.md` §16.** The 11 in the filename is not
> staleness: this is the plan in force, amended in place rather than replaced. A new
> `session-N-plan.md` opens only when the previous one's §2 has been drained. Copying a plan forward
> is how four copies of one setup checklist came to disagree with each other, which `3257db2` spent a
> commit undoing.
>
> **Before anything else, read §2 B.** The designers rebuilt the mobile subtree into a new `32:*`
> range on or before 2026-09-10, so every mobile node id written anywhere in this repo — including
> the ones §2 lists as replacements — has to be re-checked before it is used.

## Context

**Why this file exists.** Session 9 opened on a checkout **22 commits behind** `origin/main`. Session 10
opened **13 commits behind**. Both times the plan, the skills and the hook were on the remote and not
on disk, and the session read last month's instructions. Nothing under `~/.claude/` travels — not
plans, not plugins, not the memory files. **So this document is written to be committed into the repo
as `docs/session-11-plan.md`.** If you are reading it from `~/.claude/plans/`, copy it in first.

**What session 10 was.** The owner asked for a mobile-only demo to show a client, built against the
Jackpot Figma file `2MyylxdZblfGnf05nQacUz`. The demo already existed and was live; the session's job
was to close what was left. Six of seven open items turned out to be owner decisions rather than
defects, so the session opened by rendering the choices at 390 rather than by editing.

Then the owner compared the category bar against Figma and rejected it. That comparison opened a vein:
**four separate desktop-frame elements were painting on the phone**, none of them scoped to a viewport.
Closing them is most of what session 10 actually did, and the same shape is still open in two places.

**Repo:** `main`. **Deployed:** https://design-mkt-1.github.io/jp-platform/
**Read first:** [`CLAUDE.md`](../CLAUDE.md), then [`next-session.md`](next-session.md) §15.

---

## 0. First, on the new machine

```
git pull          two sessions running have opened stale; a plan read before pulling is an old plan
npm ci
npm run plugins   17 ok, or `npm run plugins:install` then restart the session
```

**The setup checklist lives in [`start-here.txt`](start-here.txt) and nowhere else.** It used to be
copied into every session plan, which is how four copies came to disagree with one another — this
one told you `ponytail` and `caveman` were not installed while `claude plugin list` said they were,
and both readings were wrong in different ways. One list, one place.

A `SessionStart` hook runs the plugin check before your first message, so silence there means all
seventeen are installed for this checkout; `npm run plugins` is the manual confirmation. If anything
is missing, `start-here.txt` carries the install step and the `git diff .claude/settings.json` that
has to follow it — the installer rewrites that committed file.

**Then confirm the repo's hook fires:** `PROJECT SKILLS (.claude/skills, committed)` must appear above
your first message.

## 1. Where things stand

Everything below was measured on the static export at 390×844, `isMobile`, `hasTouch`, `innerWidth`
asserted.

| | |
| --- | --- |
| Gate, 2026-09-10 | 65 tests · `tsc` 0 · `eslint` 0 · `build:check` 0 |
| axe over the nine states | 0 critical / 0 serious / 0 moderate / 0 minor |
| Plugins installed for this checkout | 17/17 |
| Mobile page height | **7223** after session 13's footer hit-area work (+80), from 7143 after session 12's ticker work (−14), from a 7157 baseline. Dev and static export agree on every value. The **7150** this row used to carry does not reproduce, and session 13 settled why by measuring the commits: `eb99091` is 7228 and `9f73ce8` is 7157, with all 71px between them attributed — header −1, category bar +8, content rows +34, footer −112. Figma's own number is **7159**, node `32:1813`, confirmed alive 2026-09-10 |
| Mobile footer | **1149.38** after session 13, from 1069.38, from 1181.38. The 1140.4 target was read from `21:3693`, which is **dead**; the figure survives because the designers' new `32:2626` **footer-mobile** is 390x1140 |

### What session 11 landed — and what it did not

Session 11 closed this plan's §0 and §3 preconditions and **executed none of §2**.

| Commit | What |
| --- | --- |
| `9f73ce8` | session 10's UI work, which was still uncommitted in the tree — the four desktop leaks, the chips, `Badge` `leading-3`, `--blue-tint` 15% → 10%, and `.gitignore` globbed to `.next-*/` |
| `56e9c5c` | `CLAUDE.md` Orchestration — Orca workers, one git worktree per task |
| `3257db2` | `scripts/plugins.mjs`, `npm run plugins`, the `SessionStart` hook, and four setup checklists collapsed into `start-here.txt` |

Re-measured on 2026-09-10 so the next session does not derive it again:

| Area | State after session 12 | Evidence |
| --- | --- | --- |
| A — focus defects | **CLOSED** | four sites, not three — `CategoryNavBar` was missing from this plan. `scripts/focus-restore.mjs` now exists: 8/8 with the fix, **4/8 against HEAD**, failing on exactly the four broken paths |
| B — dead node ids | **open, and this plan's premise for it is wrong** | `1:5687` is **alive**; range classification does not work; `21:2896`/`21:4154`/`21:3693` are dead; the subtree was rebuilt again into `32:*`. See below |
| C — header and hero differences | **CLOSED** | all five decided by the owner on 2026-09-10; #1 and #4 implemented, #2, #3 and #5 recorded as deliberate deviations |
| D — recent-wins strip | **CLOSED** | mobile node was `21:3035`; band 80→66, full-bleed, divider 44 at white 8%, amount 12/22. Desktop unchanged on all thirteen measured values |

### What session 10 landed

| Area | Change |
| --- | --- |
| Footer | legal paragraph hidden on mobile (−112), second divider moved between links and flags, 34px restored under the last row. Desktop byte-identical |
| Auth labels | mobile `Sign In` → `Register`, in **both** `HeaderPrelogin.tsx` and `JackpotMenu.tsx` — the second one links to `/register` and said otherwise |
| Focus restoration | `Panel.tsx` now captures the opener from `pointerdown`/`keydown` **capture phase**, before the commit, and falls back to the old post-commit capture on `isConnected`. Fixes `ProviderSearch` desktop; ten passing rows unchanged |
| Category chips | full Figma parity on mobile per owner decision: white labels, 42 tall, `bg-section` fill, new `--border-chip` `#222A4E`, Inter 12/0.4 — Figma genuinely specifies Inter on mobile and Bricolage on desktop |
| Header | the `1:4245` rule scoped off mobile; header 61 → 60 |

### The class this session was really about

Four desktop-frame elements were painting on the phone with no viewport scope. All four are real on
desktop and absent from the mobile frames:

| Element | Node cited | Lives under |
| --- | --- | --- |
| cyan ring on the active chip | `1:2503` | desktop frame |
| cyan glow ellipse under the bar | `1:2434` | desktop frame `1:2431` |
| the category capsule — border, `bg-card`, radius | `1:2500` | desktop frame |
| the rule under the header | `1:4245` | desktop board `1:4244` |

The capsule shows how it happens: someone noticed the capsule has no padding on mobile and wrote
`mobile:p-0`. The comment at `CategoryNavBar.tsx` still says *"Node 21:2975 has no capsule padding on
mobile."* On mobile there is no capsule at all.

## 2. The work

### A — the three remaining focus defects

Ten of fourteen overlay dismissal paths restore focus correctly. Three do not, measured with real
presses at 390 and 1440:

1. **`PersonalInfoPanel` desktop → `Sign out` → `<body>`.** `setAuthMode('prelogin')` swaps
   `HeaderPostlogin` for `HeaderPrelogin`, so nothing that existed before the press survives.
   **Needs an owner decision on a landing target** — the pre-login `Login` button is the obvious
   candidate but nobody has chosen it.
2. **`HeaderNavMenu` burger, outside click → `<body>`.** `HeaderNavMenu.tsx:73` restores on Escape;
   the `onPointerDown` branch at 76–79 calls `setOpen(false)` with no `focus()`. Note this file
   **does not use `useOverlayBehavior` at all** — it is a fourth private copy of the pattern, not a
   consumer of the fixed one. Guard on "focus was inside the panel" so it does not steal focus when
   the outside press landed on another control.
3. **`ProviderSearch` inline at 390 → `<body>`.** `ProviderRow.tsx:73` hides the trigger while the
   field is open, so there is nothing to return to. **This is a design decision, not a fix.**

**A regression test cannot live in `src/lib/__tests__/`.** `vitest.config.mts` is `environment: 'node'`
with `include: ['src/**/*.test.ts']` — no jsdom, no `.tsx`. And jsdom would not test the right thing:
`Panel.tsx:126`'s `preventDefault()` exists because of the browser's default focus action on
`mousedown`, which jsdom does not implement. A jsdom test would pass on code that is broken in Chrome.
Write `scripts/focus-restore.mjs` instead — a table of `{viewport, open steps, dismissal, expected
accessible name}` rows driven with `touchscreen.tap` / `mouse.down`+`up` / `keyboard.press`, asserting
`document.activeElement`'s accessible name and refusing to report if `innerWidth` is wrong. It belongs
beside the a11y run at fan-in, not in `npm test`.

### B — the dead node citations

**Read this section before the counts. Session 12 measured the premise and it does not hold.**

The original framing — "one deleted band, `1:5720`–`1:8234`, repoint everything in it" — is wrong in
three ways, each measured on 2026-09-10 with `get_metadata` on single ids:

1. **`1:5687` is alive.** This plan said it was dead and told the next session to repoint three
   citations of it. It is a **UI-Kit** spec frame, not a page node, and the kits were never rebuilt;
   it returns in full, with the `DEFAULT` / `HOVER` / `ACTIVE` fills of 6% / 12% / 4% that
   `IconButton.tsx`, `Header.tsx` and `globals.css` quote. Repointing them would have destroyed three
   correct references. `1:5325` and `1:5655` are alive for the same reason.
2. **A numeric range cannot classify these.** `21:3297`, `21:3675` and `21:3693` are dead and are
   nowhere near the band — they are ids that were *added* after the 2026-09-09 rebuild.
3. **The mobile subtree was rebuilt again**, by the designers, into a new **`32:*`** range, confirmed
   by the owner. `21:2896` and `21:4154` — the "live pair" named below, in `CLAUDE.md`, in
   `start-here.txt` and in `next-session.md` — are **both dead**. So is `21:3693`, which §1's
   "Figma footer 1140.4" was read from.

The counts themselves were confirmed for the state before the second rebuild: **38 distinct ids
across 18 files under `src/`** (55 citations) and **47 across 6 files under `docs/`** (107, not the
105 recorded). They are now a lower bound, not a total.

**The new mobile tree, for whoever picks this up** — read out of `32:1812` on 2026-09-10:
`32:1813` **mob main** 390x7159 · `32:1814` header+hero 390x335 · `32:1968` wins ticker 390x66 at
y=355 · `32:2626` footer-mobile 390x1140 · `32:3087` mob postlogin homepage · `32:3308` mob prelogin
homepage · `32:3284` mobile-navigation-bar postlog 390x84.

**The method, and the one that looks right and is not.** `get_metadata` on a single id answers
plainly: a deleted node returns *"The provided node ID was not found in the file"*. Do **not** build
the live set from a whole-page dump. `get_metadata` on `0:1` and on `32:1812` both exceed the tool's
limit and are written to a file **truncated**; a classification built on the first reported 149 dead
ids under `src/`, which is false. It was caught by checking the dump against ids already established
one at a time — seven known-alive ones were missing from it. **Absence from a dump proves nothing.**

What is still true and still wanted: nothing breaks today, but every future comparison does.
`CategoryPill.tsx` derived the mobile chip's 32px height and 12px label from `1:5799`, a node that no
longer exists, and that is exactly the bar the owner rejected. `screens.test.ts` validates the
`^\d+:\d+$` **shape**, which a dead id matches.

Already repointed: `CategoryPill.tsx`, `CategoryNavBar.tsx`, `sections.ts` (session 9). The
replacement list this section used to carry — `1:5750`→`21:2926` and the rest — points into the
`21:*` range and **has to be re-derived against `32:*` before any of it is used.**

Still stale, listed in `docs/tokens.md`: `page.tsx`, `screens.ts`, `assets.ts`, `types.ts`,
`PromoBannerMobile.tsx` (~20 ids), `GameCard.tsx`, `HeroBanner.tsx`, `Header.tsx`,
`HeaderPostlogin.tsx`, `MobileShell.tsx`, `SectionHeader.tsx`, `ProviderRow.tsx`, `ContentRow.tsx`,
`PromoRow.tsx`, `GameGrid.tsx`, `Badge.tsx`, `Icon.tsx`, `globals.css`.

**Session 13 started the sweep and was stopped by a quota, not by a method problem.** The inventory
is **322 distinct ids**, not the 38 + 47 above — those were the suspected band, not the total. 67
were settled (66 alive, 1 dead) before the Figma MCP returned *"You've reached the Figma MCP tool
call limit for your Full seat on the Professional plan."* Everything reached lies in the intact
`1:*` desktop tree; the ids already known to be dead live in `21:*`, which the quota cut off before,
**so the part of the ledger that carries the value is the part still missing**. The method, the 67
settled rows and the remaining 255 are in [`figma-node-ledger.md`](figma-node-ledger.md). Resume
there rather than re-deriving; the quota is the binding constraint, not the reading.

The probe to use is `get_screenshot` with `maxDimension: 16`, not `get_metadata` — measured: a live
node returns a small JSON with its real size, a dead one returns the not-found error, and both cost
about a hundred tokens, where `get_metadata` on a live node returns the whole subtree XML.

**This work cannot be given to an Orca worker.** Session 13 tried; the claude.ai Figma connector
does not follow into a worktree, and a fresh worktree has none of the 17 declared plugins either,
because installs are keyed per project path. See the Orchestration section of `CLAUDE.md`.

**Check every replacement against the live file before writing it**, one id at a time. Strengthening
`screens.test.ts` so a shape check is not mistaken for an existence check still needs network access
a test does not have; the workable shape is a checked-in list of verified-dead ids plus a test that
fails when a new citation of one appears. Decide deliberately.

### C — the rest of the header and hero differences, all measured, none decided

| # | What | Figma | Ours |
| - | ---- | ----- | ---- |
| 1 | The search button's disc | `21:2919` is `size-[40px]` with **no background and no radius** — a bare 18px magnifier | `IconButton` paints `bg-elevated` white 6% at `rounded-full`, bridging the 7px gap Figma leaves clean. Cites `1:5687`, a rebuilt-subtree id |
| 2 | Header content insets | container `21:2899` sits at x=16, 374 wide, plus its own 10px — effective **26 left / 10 right** | symmetric **16 / 16** |
| 3 | The emerald pill's stroke | `rgba(0,163,114,0.5)` | `--emerald` `#00F299` at the same alpha — ~40/255 brighter in green |
| 4 | The plus button's shadow | two layers: `0 6px 14px rgba(59,130,246,.2)` **and** `0 10px 18px rgba(0,242,153,.2)` | only the emerald layer |
| 5 | The desktop flame | node `1:2504` is **14×20** | forced 20×20, so the desktop `Popular` pill is 143.30 against Figma's 135 |

On #2: whether 26/10 is intent or an authoring artefact of an auto-layout child left at x=16 is
**unknown**. Symmetric 16/16 is what the category track and the hero card already use. Do not
"fix" it without the owner saying which.

On #5: fixing it *shrinks* the desktop pill by 6px. That is a visible desktop change — closer to the
design, but the owner declined it in session 10 and it stays declined until they say otherwise.

The right cluster also sits 23.59px left of Figma's, and that is **not a bug**: our demo balance
string is `£5,500.00` where Figma's is `$ 140.00`. Same structure, different data.

### D — the recent-wins strip — **CLOSED in session 12**

> Closed 2026-09-10. The band is now 66 tall, full-bleed and card-less at 390, and desktop is
> unchanged on all thirteen measured values. Two things below were wrong and are corrected in
> `next-session.md` §16: `RecentWinItem.tsx:37` is **not** a leak — the mobile thumbnail `21:3037`
> carries the identical 8px radius and white-10% border — and the mobile node was reachable directly
> as `21:3035`, because `21:2896`, named as its parent below, is dead. The new file calls the same
> band `32:1968`, still 390x66, so the work survives the designers' rebuild.

Three sites paint desktop chrome with no `mobile:` scope, all rendered on the homepage:

- `RecentWinsTicker.tsx:44-45` — `h-20 px-6 rounded-xl border border-solid border-card bg-card`, node `1:2438`
- `RecentWinsTicker.tsx:61` — `border-l border-emphasis`, node `1:2433`
- `RecentWinItem.tsx:37` — `size-[46px] rounded-lg border border-solid border-strong bg-page`, node `1:2441`

The tell is that the ticker's own `<section>` carries `mobile:px-4` while the card inside it carries
nothing — the page inset was scoped and the chrome was not, the identical stopping-short that made the
`prefetch` bug need three fixes.

**Do not edit this yet.** Frame `21:2897` is only 390×305 and stops before the wins row. **There is no
mobile Figma frame for it in hand.** The first task is to find the mobile node — start from `21:2896`'s
child `21:3035` `Recent wins - Ticker (iOS)`, 390×66 at y=325 — and establish whether the mobile design
draws a card there, a bare band like `21:2975`, or nothing.

> **Corrected 2026-09-10, session 14.** Every id in the paragraph above is **deleted**: `21:2897`,
> `21:2896`, `21:3035` and `21:2975`, along with the whole of `21:*`, verified one id at a time with
> `get_screenshot`. Following that instruction reaches nothing. The live band is **`32:1968`**, still
> **390×66** — the same size `21:3035` was recorded at, in the `32:*` subtree the designers rebuilt
> the mobile page into. Start there instead, and see `docs/figma-node-ledger.md`.

## 3. How to work here

Orca if available; plain subagents otherwise, same shape. Session 10 used orca for the task ledger and
native subagents for execution — that worked and is worth repeating.

**Put in every task spec, verbatim:** *no worker runs `npm run build`, `npm run build:check` or a
static export — `.next` is shared and every route starts returning 500. The build and the a11y run
happen once, at fan-in.* And: *put your scripts in `scripts/.tmp/<letter>/` and delete only that
subfolder* — in session 9 a worker's `rm -rf scripts/.tmp` took the coordinator's script with it.

**Fire the skills and say which fired.** `ui-ux-pro-max:ui-ux-pro-max` is the primary and is not "used"
by being loaded — run its `search.py` on the concern actually at hand and report the rule applied or
contradicted. `:design` is a router for logo/banner/slide *generation*; session 8 fired it by name and
got a table about generating logos with Gemini.

Rules that earned their keep in session 10, worth quoting to workers:
- **Target Size (Minimum)**: WCAG 2.2 AA for web is **24 CSS px**. 44 is Apple/AAA. Do not dress a
  parity change as an accessibility fix.
- **Auto-Rotating Content Controls** (severity High): the provider marquee still has **no
  user-invocable stop on a phone**. Reduced-motion and hover work; `focus-within` is dead code because
  `SectionRenderer.tsx:36` never passes `hrefForProvider`, so nothing in the band is focusable. Owner
  chose to leave it. It is a standing, known gap.

## 4. Traps this project has already paid for

- **`NEXT_DIST_DIR=.next-a11y` writes the export into `.next-a11y/`, not `out/`.** Session 10 served a
  stale `out/` left over from session 9 — twice — and got 12–15 phantom `serious` colour-contrast
  findings per state, then "proved" the session's changes were innocent by comparing the stale export
  against itself. **Confirm the served bytes equal the built bytes** and that the HTML references that
  exact file. An HTTP 200 proves a server is up, not what it is serving.
- **The a11y build writes a whole second build into the shared `.next`. Cause measured in session 12.**
  Session 11 ran it with `next dev` up, which the gate below presents as safe, and every route
  returned 500. It recorded the cause as unknown because `.next` had been deleted to recover the
  server. Reproduced cleanly on 2026-09-10 with `.next` deleted first and **no dev server running**:

  | build | `NEXT_DIST_DIR` | result |
  | --- | --- | --- |
  | `GITHUB_PAGES=true npx next build --turbopack` | `.next-a11y` | `.next-a11y` 187 files **and `.next` 239** — `build/chunks`, `server/app`, `cache`, `BUILD_ID`, every manifest, 5 HTML |
  | `npx next build --turbopack` | `.next-probe` | `.next-probe` 238 files, **`.next` never created** |

  `distDir` is honoured; `next.config.ts:23` does read `NEXT_DIST_DIR`. What defeats it is the
  `isPages` branch, the one that adds `output: 'export'`. **Which of that block's four keys is
  responsible was not isolated** — the block was. Session 11 saw four stray JSON files rather than
  239 because it looked after the fact. **Stop the dev server before the a11y run**; and
  `npm run build:check` is now measured, not merely asserted, to be safe while it is up.
- **A written measurement ages.** The footer's recorded 1221.4 was taken before session 9's own commit
  `0855c23` removed 40px from the partner slots. The real baseline was 1181.38, and the "40px
  dev-vs-export divergence" that cost an hour did not exist.
- **`text-[Npx]` sets font-size only.** Tailwind's arbitrary form carries no line-height, so the hero
  badge inherited `line-height: 15px` from `html` and came out 21 tall against Figma's 18 — which
  pushed the title and subtitle 3px down. Roughly a dozen other `text-[Npx]`-without-`leading-` sites
  exist; most sit in fixed-height boxes and are probably invisible. **Nobody has measured them.**
- **Two competing utilities of the same Tailwind family on one element** are resolved by stylesheet
  order, not intent. Prefer `border-0` (width family) over `border-none` (style family) so
  `border-solid` is never a competitor; split `size-5` into `h-5 w-5` so each override lands on its own
  property. Session 10 verified rule indices in **both** dev and the Pages export rather than arguing.
- **Presses are `page.tap()` or `mouse.move → down → up`.** `element.click()` does not move focus and
  has killed two real findings here. A third near-miss in session 10: a worker reported hover not
  pausing the marquee, having aimed the mouse at the centre of a `w-max` band ~3376px wide — outside
  the viewport. The mouse never touched the element. An interaction that never happened reads exactly
  like a feature that does not work.
- **`resize_window` lies on a maximised Chrome** — it reported success while `innerWidth` stayed 2552.
- **Look at the bytes.** `popular.svg` is `viewBox="0 0 14 20" preserveAspectRatio="none"` — the file
  was right and the CSS was forcing it square. But `live-casino.svg` (16.0087×11.2961) and
  `jackpots.svg` (20×17.8906) are also non-square while their Figma frames are 16×16, so a blanket
  "auto width for all icons" would have broken `Live Casino` by ~6.7px. Fix the instance you measured.
- **Never run `npm run build` while `next dev` is up** — and that includes the `NEXT_DIST_DIR=.next-a11y`
  run, which looks exempt and is not, measured 2026-09-10. They share `.next`; every route then returns
  500 with `ENOENT … _buildManifest.js.tmp.…` while the source is fine.

## 5. The gate, once, at fan-in

```
npm test                          # 65
npx tsc --noEmit
npx eslint src --max-warnings=0
```

then, with **no dev server running**:

```
rm -rf .next-a11y out
GITHUB_PAGES=true NEXT_DIST_DIR=.next-a11y npx next build --turbopack
# the export lands in .next-a11y/ — NOT in out/
cp -r .next-a11y $TEMP/a11y-site/jp-platform
cd $TEMP/a11y-site && python -m http.server 4180 &
# prove the bytes, not just the status code:
#   the HTML's referenced .css must equal the freshly built .css, byte for byte
node scripts/a11y.mjs $TEMP/a11y-out http://localhost:4180/jp-platform
```

axe must stay at **0 critical / 0 serious**. Then commit, push, watch the Pages run, and re-check on
the deployed site at 390.

**"No dev server running" is not a formality.** If one was up when that build ran, `.next` is poisoned
and every route returns 500. Delete `.next` and restart the server. The 500s are not a code defect and
the source is fine — see §4.

## 6. Docs at fan-in

Add a §16 to [`next-session.md`](next-session.md) — §15 is session 11's. Update the status tables in
[`audit-session-8.md`](audit-session-8.md) for anything closed, and if nothing closed, say so in the
new section rather than touching the file for a date. Record measurements, not adjectives.
Any new colour goes into [`tokens.md`](tokens.md) **with its Figma node id**, in the same change — the
citation rule is what stops that file becoming a dumping ground.
