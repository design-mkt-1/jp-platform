# Working rules — Jackpot demo

These are triggers, not advice. If a rule below matches what you are about to do, the skill fires
first. A skill that is installed and never invoked is the same as a skill that is not installed —
which is exactly what happened here: `ui-ux-pro-max` was enabled in `.claude/settings.json` from the
first commit, and session 8 ran a full UI audit and eight fixes without once calling it. This file
exists so that cannot happen again.

Skills live in `.claude/skills/` and are committed, so they travel with the repo. Plugins are
declared in `.claude/settings.json` and do **not** travel — see the last section.

---

## Before touching any UI

| You are about to… | Fires first |
| ----------------- | ----------- |
| build or change any screen, component or layout | `ui-ux-pro-max:design`, then `ui-ux-pro-max:ui-styling` |
| touch a token, `globals.css`, or `tailwind.config.ts` | `design-system` and `ui-ux-pro-max:design-system` |
| change spacing, borders, shadows, radii, hit areas, or hover / focus / pressed states | `make-interfaces-feel-better` |
| decide how something should look when the design does not say | `frontend-design-direction`, `taste` |
| add or change any animation or transition | `motion-foundations` **before** `motion-ui` |
| add or change any interactive control | `accessibility` and `frontend-a11y` |
| write or restructure React | `react-patterns`, `frontend-patterns` |
| touch rendering cost, bundle size, or anything that re-renders on a tick | `react-performance` |
| add or change a test | `react-testing` |
| touch the build, dev server, or Turbopack config | `nextjs-turbopack` |

`docs/tokens.md` is the only bridge between Figma and the code. An eslint rule already rejects a raw
hex under `src/components/`. If a node needs a colour that is not in that document, add it there
**with its Figma node id** in the same change — that citation rule is what keeps the file from
becoming a dumping ground.

## Before calling a UI change done

| Gate | Skill |
| ---- | ----- |
| Look at it in a real browser. Do not reason a UI change from the diff. | `browser-qa` |
| Any button, tab, menu, drawer or sheet: trace the whole state sequence, not the click handler | `click-path-audit` |
| Closing out a task | `verification-loop` |

Then the standard gate, all four:

```bash
npm test                          # vitest, 64 tests
npx tsc --noEmit
npx eslint src --max-warnings=0
npm run build:check               # safe while `next dev` is running
```

and, when `src/` changed, the accessibility run over the nine states, which must stay at zero:

```bash
GITHUB_PAGES=true NEXT_DIST_DIR=.next-a11y npx next build --turbopack
mkdir -p $TEMP/a11y-site && cp -r .next-a11y $TEMP/a11y-site/jp-platform
cd $TEMP/a11y-site && python -m http.server 4173 &
node scripts/a11y.mjs $TEMP/a11y-out http://localhost:4173/jp-platform
```

**Never** run `npm run build` or a static export while `next dev` is up. They share `.next`, the
collision corrupts it, and every route starts returning 500 with `ENOENT … _buildManifest.js.tmp.…`
while the source is perfectly fine. It looks like an application bug and it is not.

### Two measuring traps this repo has already paid for

- **`element.click()` does not move focus.** In session 8 it made a working focus restoration look
  broken and it sets `:focus-visible` where a real mouse press does not. Two findings were written
  down and then killed by re-testing with real mouse events. Anything about focus, hover or pressed
  state is driven with `page.click()` / `page.mouse`, never a scripted `.click()`.
- **`resize_window` lies on a maximised Chrome.** It reports success while `innerWidth` stays what
  it was — measured at 2552 twice. Check `innerWidth` before trusting a viewport, or use a page
  holding one `<iframe>` sized to the viewport under test.

## Answering questions about the codebase

`graphify` first. If `graphify-out/` exists, treat the question as a graphify query before reading
files by hand.

## Explaining a bug, a decision, or why something behaves the way it does

`explica`. Plain words a non-programmer follows, and at least one **concrete named example from this
project** — a real file, a real node id, a real incident — never an abstract one. Say what the thing
is keyed on and what breaks, not only which function ran.

Draw the line between what was measured and what is reasoning, explicitly. Session 8 reported that
35 of 47 mobile controls failed touch-target size; running axe's own `target-size` rule then passed
all 47, because WCAG 2.2 allows undersized targets with enough clear space. The 44px figure was
Apple's guidance, not a conformance failure, and saying so was the difference between a real finding
and an inflated one.

**Never fill a gap with a plausible guess.** When a fact is missing, a probe failed, or two readings
are possible, name exactly what you do not know and ask. If an answer already shipped, say which
part was measured and which was reasoning.

For a short Romanian answer when one is asked for: `ro-scurt`.

## Writing code

`ponytail` — the simplest thing that works, YAGNI, standard library first, no abstraction nobody
asked for. Then `no-ai-slop` and `taste`.

`src/lib/sections.ts` is the spine: twelve of the fifteen homepage rows are one data-driven
component. A new row is four lines there and no new component. If a change needs an `if` for one
specific row, something has gone wrong.

## Fixing a bug

Understand **why** it exists and where it came from, then grep for every other place the same
pattern appears, and fix the class rather than the instance.

This repo is the argument for that rule. Next prefetches `<Link>`s by default and the demo has
exactly three routes, so every other href silently 404s in the background. It was fixed in `Header`,
then again in `MobileNavBar`, then a third time across the footer, the menu and `Button` — twenty
dead requests per page load, three times, because the first two fixes stopped at the place the bug
was noticed.

The same shape appears elsewhere: `scripts/clean-svg.mjs` was extended twice and still misses six
files, because its rule 2 only catches paths starting more than 1000 units outside the viewBox and
those six start at −149 to −961. And `src/lib/__tests__/assets.test.ts` walks every asset path both
ways but only ever calls `existsSync` — `slots.svg` shipped for weeks carrying the category bar's
glass capsule and drawing a lighter square in the Must-Play Slots header, and the test passed it
every time. **Look at the bytes, not just the path.**

## Figma

Use `get_design_context`, never `download_assets`. The latter returns every SVG in a node's subtree
— artwork, masks, and sometimes the canvas frame — with no way to tell them apart. That is how
`search-btn.svg` arrived: a 20x20 file containing the whole page, which rendered as a giant
magnifier spilling off the edge.

A node id in this repo can go stale without anything failing. The mobile subtree was rebuilt on
2026-09-09 and `1:5720`, `1:5799` and `1:6517` all resolve to nothing; the menu frames were rebuilt
before that. `screens.test.ts` only checks the `^\d+:\d+$` shape, which a dead id still matches — so
when a comparison looks wrong, check the id against the file before trusting it.

## Language

Conversation with the owner is **Romanian**. Everything that lands in a file — code, comments,
commit messages, docs — is **English**. Session 8 converted the last four Romanian files in one
pass; do not reintroduce any.

## Plugins, and what does not travel

`.claude/settings.json` declares three:

- `ui-ux-pro-max@ui-ux-pro-max-skill` — on
- `ponytail@ponytail` — on
- `caveman@caveman` — **off, deliberately.** It advertises cutting ~65% of output tokens by writing
  like a caveman, which directly fights the "explain, do not just report" rule above. Do not flip it
  on without deciding to give that rule up.

Declaring a plugin is not the same as installing it. On this machine `ponytail` and `caveman` are
recorded against `projectPath: D:\DesignTeamPlatform`, not this repo, and plugins load at session
start — so whether `enabledPlugins` alone is enough here is **unverified**. The check takes ten
seconds: restart the session and type `/ponytail-help`. If nothing answers, run
`/plugin install ponytail@ponytail` in this repo. Their marketplaces are
`github:dietrichgebert/ponytail` and `github:JuliusBrussee/caveman`.

The owner's own two rules — "do not assume, verify" and "explain, do not just report" — are hooks in
`~/.claude/settings.json` plus `~/.claude/CLAUDE.md`. They are **local** and do not travel with the
repo, which is why the important half of them is written out above. See `docs/start-here.txt`.
