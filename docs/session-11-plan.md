# Session 11 — the mobile demo, after four leaks were closed

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
**Read first:** [`CLAUDE.md`](../CLAUDE.md), then [`next-session.md`](next-session.md) §14.

---

## 0. First, on the new machine — ten minutes, do not skip

**`git pull` before anything else.** Two sessions running have opened stale. A session that reads a
plan before pulling is reading an old plan.

Then `npm ci` and `npm run dev`. Then check what a clone does not carry:

| Travels with the clone | Does **not** travel |
| --- | --- |
| `.claude/skills/` (20), `CLAUDE.md`, `.claude/hooks/skill-triggers.mjs` and its wiring in `.claude/settings.json`, `.caveman/config.json`, all of `docs/` | the plugins — `settings.json` only *declares* them |
| | the owner's two global rules — `UserPromptSubmit` hooks in `~/.claude/settings.json` plus `~/.claude/CLAUDE.md` |
| | Orca's state, which is per machine |
| | the memory files under `~/.claude/projects/D--jp-platform/memory/` |

1. **Plugins.** Measured on 2026-09-10: `ui-ux-pro-max@ui-ux-pro-max-skill` v2.13.0 **is** installed
   for `D:\jp-platform`. **`ponytail` and `caveman` are NOT** — they are registered only against
   `D:\DesignTeamPlatform`, `D:\tw-platform` and the orca workspaces. `CLAUDE.md` names `ponytail` as
   the rule for writing code, and it does not load. Install if wanted:
   `/plugin install ponytail@ponytail`, `/plugin install caveman@caveman`.
   Verify with `claude plugin list`, not by reading a file.
2. **The owner's rules.** "Never assume, verify" and "explain, do not just report".
3. **Orca.** `orca status` should answer `runtimeState: ready`. Command surface, verified:
   `orca orchestration run-create --objective`, `task-create --spec --task-title --display-name`,
   `task-update --id --status`. **`--task` is not a flag** and `in_progress` is not a valid status —
   the set is `pending, ready, dispatched, completed, failed, blocked`.
4. **Figma.** `get_metadata` on `2MyylxdZblfGnf05nQacUz` must answer `0:1: Platform`.
5. **Chrome** must be installed. `npx playwright install` is **not** needed.

**Then confirm the repo's hook fires:** `PROJECT SKILLS (.claude/skills, committed)` must appear above
your first message.

## 1. Where things stand

Everything below was measured on the static export at 390×844, `isMobile`, `hasTouch`, `innerWidth`
asserted.

| | |
| --- | --- |
| Gate | 65 tests · `tsc` 0 · `eslint` 0 · static export green |
| axe over the nine states | 0 critical / 0 serious / 0 moderate / 0 minor |
| Mobile page height | 7150, from 7228 |
| Mobile footer | 1069.38, from 1181.38. Figma `21:3693` is 1140.4 |

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

Roughly **54 distinct ids** in the deleted `1:5720`–`1:8234` band, across roughly **87 sites** in
`src/` and `docs/`. The band was removed when the mobile subtree was rebuilt on 2026-09-09.

Nothing breaks today. What breaks is every future comparison: `CategoryPill.tsx` derived the mobile
chip's 32px height and 12px label from `1:5799`, a node that no longer exists, and that is exactly the
bar the owner rejected. `screens.test.ts` validates the `^\d+:\d+$` **shape**, which a dead id matches.

Already repointed: `CategoryPill.tsx`, `CategoryNavBar.tsx`, `sections.ts` (session 9).
Known live replacements: `1:5750`→`21:2926`, `1:5751`→`21:2927`, `1:5756`→`21:2932`,
`1:5758`→`21:2934`, `1:5761`→`21:2937`, `1:5762`→`21:2938`, `1:5799`→`21:2977`, mobile frame
`21:2896` post-login / `21:4154` pre-login.

Still stale, listed in `docs/tokens.md`: `page.tsx`, `screens.ts`, `assets.ts`, `types.ts`,
`PromoBannerMobile.tsx` (~20 ids), `GameCard.tsx`, `HeroBanner.tsx`, `Header.tsx`,
`HeaderPostlogin.tsx`, `MobileShell.tsx`, `SectionHeader.tsx`, `ProviderRow.tsx`, `ContentRow.tsx`,
`PromoRow.tsx`, `GameGrid.tsx`, `Badge.tsx`, `Icon.tsx`, `globals.css`.

**Check every replacement against the live file before writing it.** Consider strengthening
`screens.test.ts` so a shape check is not mistaken for an existence check — but that needs network
access in a test, which the current setup does not have. Decide deliberately.

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

### D — the recent-wins strip

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
- **Never run `npm run build` while `next dev` is up.** They share `.next`; every route then returns
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

## 6. Docs at fan-in

Add a §15 to [`next-session.md`](next-session.md). Update the status tables in
[`audit-session-8.md`](audit-session-8.md) for anything closed. Record measurements, not adjectives.
Any new colour goes into [`tokens.md`](tokens.md) **with its Figma node id**, in the same change — the
citation rule is what stops that file becoming a dumping ground.
