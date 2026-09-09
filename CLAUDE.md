# jp-platform — working rules

Next.js 15 + Tailwind casino platform, built against Figma. Static export, Vitest for tests.

## Skills are in this repo — use them, don't improvise

Project skills live in `.claude/skills/` and are committed, so every clone has them.
Plugins are declared in `.claude/settings.json` and resolve from the marketplaces in `~/.claude/plugins`.

The rules below are not suggestions. Invoke the named skill before doing the work, not after.

**Why this file exists.** `ui-ux-pro-max` was `true` in `.claude/settings.json` from the first
commit and its skills were listed as available every session. Session 8 then ran a 49-control UI
audit and eight fixes and invoked **none of them**. Being installed is not being used.

### Always, before touching UI

| Trigger | Skill |
| --- | --- |
| Any new page, component, colour, type scale, or layout | `ui-ux-pro-max:design`, then `ui-ux-pro-max:ui-styling` |
| Changing shared tokens, `globals.css`, or `tailwind.config.ts` | `design-system` |
| Spacing, borders, shadows, radii, hit areas, hover/focus/pressed states | `make-interfaces-feel-better` |
| Deciding how something should look when the design does not say | `frontend-design-direction`, `taste` |
| Anything animated | `motion-foundations` first, then `motion-ui` |
| Any interactive control | `accessibility` and `frontend-a11y` |

`docs/tokens.md` is the only bridge between Figma and the code, and an eslint rule already rejects a
raw hex under `src/components/`. A colour that is not in that document gets added there **with its
Figma node id**, in the same change. That citation rule is what stops the file becoming a dumping
ground of ad-hoc colours.

### Always, before saying a UI change is done

| Trigger | Skill |
| --- | --- |
| Visual change of any kind | `browser-qa` — confirm it in a real browser, don't reason about it |
| Buttons, menus, tabs, drawers | `click-path-audit` — trace the whole state sequence, not just the click handler |
| Closing out a task | `verification-loop` |

Do not report a UI change as working on the strength of the diff alone. This repo has a history of
that failing: the mobile jackpot menu and the tab bar were each "fixed" and had to be fixed again
once somebody actually pressed the buttons.

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

### Two measuring traps already paid for

- **`element.click()` does not move focus**, and it sets `:focus-visible` where a real press does
  not. In session 8 it made a working focus restoration look broken; two findings were written down
  and then killed by re-testing with real events. Anything about focus, hover or pressed state is
  driven with `page.click()` / `page.tap()` / `page.mouse`, never a scripted `.click()`.
- **`resize_window` lies on a maximised Chrome.** It reports success while `innerWidth` stays what
  it was — measured at 2552 twice. Check `innerWidth` before trusting a viewport.

### Always, when answering questions about the codebase

- Architecture, file relationships, "where does X live", "how does Y work" → `graphify` first.
- Explaining a bug, a decision, or why something behaves as it does → `explica`.
  Plain words, at least one concrete named example from this project, and an explicit line
  between what was measured and what is reasoning.
- Never fill a gap with a plausible guess. Name what you don't know and ask.

That measured-versus-reasoning line has already earned its keep. Session 8 reported "35 of 47 mobile
controls fail touch-target size"; running axe's own `target-size` rule then passed all 47, because
WCAG 2.2 allows undersized targets with enough clear space around them. 44px is Apple's guidance and
WCAG **AAA**; the bar the gate enforces is **AA, 24×24**. Saying which was which was the difference
between a real finding and an inflated one.

For a short Romanian answer when one is asked for: `ro-scurt`.

### Always, when writing code

- `ponytail` — simplest thing that works. YAGNI, stdlib first, no unrequested abstractions.
- `react-patterns` / `react-performance` for component work, `react-testing` for tests.
- `no-ai-slop` and `taste` before shipping copy or visual design.

`src/lib/sections.ts` is the spine: twelve of the fifteen homepage rows are one data-driven
component. A new row is four lines there and no new component. If a change needs an `if` for one
specific row, something has gone wrong.

### Bug fixes

Understand why the bug exists and where it came from, then grep for every other place the same
pattern appears. Fix the class, not the instance.

This repo is the argument. Next prefetches `<Link>`s by default and the demo has exactly three
routes, so every other href silently 404s in the background. It was fixed in `Header`, then again in
`MobileNavBar`, then a third time across the footer, the menu and `Button` — twenty dead requests per
page load, three times, because the first two fixes stopped where the bug was noticed.

The same shape is still open elsewhere: `scripts/clean-svg.mjs` was extended twice and still misses
six files, because its rule 2 only catches paths starting more than 1000 units outside the viewBox
and those six start at −149 to −961. And `src/lib/__tests__/assets.test.ts` walks every asset path
both ways but only ever calls `existsSync` — `slots.svg` shipped for weeks carrying the category
bar's glass capsule, drawing a lighter square in the Must-Play Slots header, and the test passed it
every time. **Look at the bytes, not just the path.**

### Figma

Use `get_design_context`, never `download_assets`. The latter returns every SVG in a node's subtree —
artwork, masks, sometimes the canvas frame — with no way to tell them apart. That is how
`search-btn.svg` arrived: a 20x20 file containing the whole page, rendering as a giant magnifier
spilling off the edge.

A node id here can go stale without anything failing. The mobile subtree was rebuilt on 2026-09-09
and `1:5720`, `1:5799` and `1:6517` all resolve to nothing; the live pair is `21:2896` / `21:4154`.
The menu frames were rebuilt before that. `screens.test.ts` only checks the `^\d+:\d+$` shape, which
a dead id still matches — so when a comparison looks wrong, check the id against the file first.

## Language

Conversation with the owner is in Romanian. Everything that lands in a file — code, comments,
commit messages, docs, this file — is English.

## caveman and explica run together

Both are on. They govern different things, and the order between them is fixed.

`caveman` is pinned to **lite** in `.caveman/config.json` — committed, so it applies to everyone who
clones. At lite it drops filler and hedging but keeps articles and full sentences. It does not
shorten explanations; it removes the padding around them.

`explica` decides *what must be present*. `caveman` decides *how tightly it is written*.
On any conflict, `explica` wins:

- The concrete named example from this project is content, not filler. It is never cut.
- The line between what was measured and what is reasoning is content. Never cut.
- Naming what is unknown, instead of guessing, is content. Never cut.
- Cut instead: pleasantries, hedging, tool-call narration, restating the question,
  decorative tables, summaries of what was just said.

caveman's own rules already agree — its Auto-Clarity section drops compression for security
warnings, irreversible actions, multi-step sequences where order could be misread, and anywhere
compressing creates ambiguity. Its Boundaries section keeps normal prose in everything that outlives
the chat: code, comments, commits, docs, PR text and memory files. So this file, the commit messages
and `docs/` stay in full English whatever mode the session is in.

Per-session override: `/caveman full`, `/caveman ultra`, `/caveman off`. The level resets to lite
next session.

## What does not travel with the repo

The owner's own two rules — "do not assume, verify" and "explain, do not just report" — are
`UserPromptSubmit` hooks in `~/.claude/settings.json` plus `~/.claude/CLAUDE.md`. They are **local**.
On a fresh machine they are simply absent, which is why the important half of them is written out
above. See `docs/start-here.txt`.

That hook is also the mechanism worth copying: it fires on every turn, where a file on disk waits to
be read. If a rule in this document keeps getting skipped, move it into a hook rather than making
the document longer.
