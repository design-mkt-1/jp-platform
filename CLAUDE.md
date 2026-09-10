# jp-platform — working rules

Next.js 15 + Tailwind casino platform, built against Figma. Static export, Vitest for tests.

## Skills are in this repo — use them, don't improvise

Project skills live in `.claude/skills/` and are committed, so every clone has them.

Plugins do not work that way. `.claude/settings.json` only **declares** them; the install is
recorded per project on the machine, keyed by that project's path. A plugin installed for another
checkout does not load here. `npm run plugins` says which are actually installed for this one and
`npm run plugins:install` fixes it — and do not read `claude plugin list` instead, because its
"enabled" column is machine-wide. On 2026-09-10 it called fifteen plugins enabled while exactly one
was installed for this checkout.

The rules below are not suggestions. Invoke the named skill before doing the work, not after.

**Why this file exists.** `ui-ux-pro-max` was `true` in `.claude/settings.json` from the first
commit and its skills were listed as available every session. Session 8 then ran a 49-control UI
audit and eight fixes and invoked **none of them**. Being installed is not being used.

### Always, before touching UI

| Trigger | Skill |
| --- | --- |
| Any new page, component, colour, type scale, or layout | `ui-ux-pro-max:ui-ux-pro-max`, then `ui-ux-pro-max:ui-styling` |
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
npm test                          # vitest, 65 tests
npx tsc --noEmit
npx eslint src --max-warnings=0
npm run build:check               # safe while `next dev` is running
```

and, when `src/` changed, the accessibility run over the nine states, which must stay at zero.
**Stop `next dev` first** — see below, this run is not exempt:

```bash
GITHUB_PAGES=true NEXT_DIST_DIR=.next-a11y npx next build --turbopack
mkdir -p $TEMP/a11y-site && cp -r .next-a11y $TEMP/a11y-site/jp-platform
cd $TEMP/a11y-site && python -m http.server 4173 &
node scripts/a11y.mjs $TEMP/a11y-out http://localhost:4173/jp-platform
```

**Never** run `npm run build` or a static export while `next dev` is up. They share `.next`, the
collision corrupts it, and every route starts returning 500 with `ENOENT … _buildManifest.js.tmp.…`
while the source is perfectly fine. It looks like an application bug and it is not.

**That includes the accessibility run above**, which is the trap session 11 paid for. It exists to
avoid `.next` and so it reads as exempt. It is not, and session 12 measured why.

With `.next` deleted first and **no dev server running**, so nothing else could have created it:

| build | `NEXT_DIST_DIR` | what appeared |
| --- | --- | --- |
| `GITHUB_PAGES=true npx next build --turbopack` | `.next-a11y` | `.next-a11y` 187 files **and `.next` 239 files** — a whole build tree: `build/chunks`, `server/app`, `cache`, `BUILD_ID`, every manifest, 5 HTML |
| `npx next build --turbopack` | `.next-probe` | `.next-probe` 238 files, **`.next` never created** |

So `distDir` works. What breaks it is the `isPages` branch of `next.config.ts` — the one that adds
`output: 'export'`. Which of that block's four keys does it was **not** isolated; the block was.

Two things follow. **`npm run build:check` really is safe** while `next dev` is up — that is the
second row, measured, not assumed. **The accessibility run is not**, and it is not a mystery any
more: it writes a complete second build into `.next` and tramples the dev server's. Session 11 saw
only four stray JSON files because it looked after deleting most of the evidence.

Recovery, if it happens anyway: delete `.next`, restart `next dev`.

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
- `frontend-patterns` for anything above the component level — data flow, state, page composition.
- `nextjs-turbopack` before touching the build, the dev server, or `next.config.ts`. This repo
  builds with `--turbopack` and owns the `.next` collision trap described below; that is exactly
  the ground this skill covers.
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

The same shape ran again with Figma node ids. `CategoryPill.tsx` sized the mobile chip from `1:5799`,
a node the designers had deleted; that one citation was noticed and dealt with, and the class was
not. `screens.ts` was still carrying `21:2896`, `13:2307` and `13:2519` as live `figmaNodeId` values,
and `screens.test.ts` passed them every run because it validates the `^\d+:\d+$` **shape**, which a
deleted id matches perfectly. Probing one id at a time put the real number at **70 dead ids cited
under `src/`**. The class fix is `src/lib/__tests__/figma-dead-nodes.test.ts`.

`src/lib/__tests__/assets.test.ts` is the closed version of the same blindness. It walked every
asset path both ways and only ever called `existsSync`, which is how `slots.svg` shipped for weeks
carrying the category bar's glass capsule, drew a lighter square in the Must-Play Slots header, and
passed every time. `eb99091` closed the class and not the file: the test now runs `clean-svg.mjs
--dry` and fails unless it reports zero changes. **Look at the bytes, not just the path.**

One caution about that fix, since it has already cost a wasted worker. `eb99091` added
`import { execFileSync }` on **line 1**, so line 2 still reads `import { existsSync, readdirSync }`.
A backlog note written from line 2 alone declared the gap still open, and the task built on it was
dispatched against a problem that no longer existed. `clean-svg.mjs` exports nothing either, though
the same note said it exported `isFurniturePath`. **Read the file before quoting a note about it**,
including a note in this document.

### Figma

Use `get_design_context`, never `download_assets`. The latter returns every SVG in a node's subtree —
artwork, masks, sometimes the canvas frame — with no way to tell them apart. That is how
`search-btn.svg` arrived: a 20x20 file containing the whole page, rendering as a giant magnifier
spilling off the edge.

**A node id here goes stale without anything failing, and it has now happened three times.** The
menu frames were rebuilt first, the mobile subtree on 2026-09-09, and the designers rebuilt the
mobile subtree again on or before 2026-09-10 — this time into a new **`32:*`** range. So do not
write a "live pair" into this file again; the last one was wrong within a day. As of 2026-09-10 the
mobile page is `32:1813` **mob main**, 390x7159, but treat that the same way: check it before you
use it.

**How to check, and the only way that is sound.** `get_metadata` on a single id answers plainly — a
deleted node returns *"The provided node ID was not found in the file"*. Do **not** classify by
numeric range and do **not** classify from a whole-page dump. Both were tried on 2026-09-10 and both
gave confident wrong answers:

- By range: session 11 recorded a dead band `1:5720`–`1:8234` and put `1:5687` inside the rot. It is
  **alive** — a UI-Kit spec frame, not a page node, and the three citations of it in `IconButton.tsx`,
  `Header.tsx` and `globals.css` are correct. Meanwhile `21:3297`, `21:3675` and `21:3693` are dead
  and sit nowhere near the band.
- By dump: `get_metadata` on page `0:1` and on `32:1812` both exceed the tool's limit and are written
  to a file **truncated**. Seven ids confirmed alive one at a time were absent from the dump. A
  classification built on it reported 149 dead ids under `src/`, which is not true. **Absence from a
  dump proves nothing.** Only the per-id call does.

`screens.test.ts` only checks the `^\d+:\d+$` shape, which a dead id still matches — so when a
comparison looks wrong, check the id against the file first.

## Orchestration — one worktree per worker, always

Parallel work on this repo runs as **Orca workers, one git worktree per task**. The CLI is
`orca` (`orca --help` lists it); this repo is registered as `D:/jp-platform`, so
`orca worktree create --name <task> --repo path:D:/jp-platform` and
`orca orchestration worker-start` are available without any setup. Use
`orca worktree ps` to see what is running and `orca orchestration task-list` for the queue.

Ask before fanning out, not after. State how many workers and what each one owns, then wait.

**Why a worktree and not a plain subagent.** Subagents in the same checkout share the working tree,
and Next owns `.next` per directory. On 2026-09-10 a worker doing the hero badge ran its own dev
server with `NEXT_DIST_DIR=.next-w7` — correct, by this file's own rule — and it still cost two
separate defects:

- Its dev server rewrote the shared `tsconfig.json`, adding `.next-w7/types/**/*.ts` to `include`.
  The worker deleted `.next-w7` when it finished but not the line, and the line was one `git add`
  away from being committed into a tsconfig that points at a directory no clone will ever have.
- The worker's report said its dev server was gone. The **directory** was gone; the **process** was
  not. The orphan on port 3107 recreated `.next-w7` within two minutes of the check.

A worktree removes the shared surface instead of relying on every worker remembering. It also gives
each worker its own branch, so a bad run is discarded rather than untangled.

**Whatever the mechanism, three things stay true.** A worker's own claim that it cleaned up is not
evidence — check the processes and the directories. A worker's measurements are re-taken on the
artefact that ships, not on the worker's private build. And nothing scratch enters a commit: files
are staged by name, never with `git add -A`.

**What a worker does not get, measured 2026-09-10 and not obvious from anything above.** A worktree
buys isolation and costs capability, and the cost was paid before it was known:

- **claude.ai account connectors do not follow a worker.** A worker sent to verify Figma node ids
  ran `ToolSearch` for `mcp__claude_ai_Figma__get_screenshot` and got *"No matching deferred tools
  found"*. The only Figma server present was `plugin:figma:figma`, unauthenticated. **Anything that
  needs the Figma connector stays in the coordinator.**
- **A new worktree is a new project path, so it has none of the 17 declared plugins.** Installs are
  recorded per project path — which is the same fact this file already states about
  `claude plugin list` being machine-wide, carried one step further than anyone had carried it. The
  committed `.claude/skills/` *do* travel, because a worktree is a checkout of this repo.

So the rule stays "one worktree per worker", and the shape of the task has to fit inside it: scope
workers to code, tests and measurement, and keep connector-bound and plugin-bound work here. Say
which of the two a task needs **before** creating the worktree, not after.

That worker was cheap to lose because its brief told it to stop and report on the first failure
rather than work around it, and it did — 108 ids written as `"unknown"` with the error text, not one
status guessed. Put that instruction in every task spec.

Beyond Orca, `superpowers` carries `dispatching-parallel-agents`, `subagent-driven-development` and
`using-git-worktrees`; read the matching one before inventing a fan-out shape. That holds only once
`npm run plugins` reports `superpowers ok` — a rule pointing at a plugin that does not load is the
failure this whole file opens with.

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

That hook is also the mechanism this repo now copies. `.claude/hooks/skill-triggers.mjs` is a
`UserPromptSubmit` hook, wired in `.claude/settings.json`, that injects the skill triggers on every
turn — because this document alone already failed once. Keep it short: a long reminder on every turn
becomes noise and gets skimmed, which is the failure it exists to fix. (This sentence used to quote
an exact character count. The count was wrong by the next edit, which is what a hardcoded
measurement of a file that changes always does.)

`.claude/settings.json` also wires a `SessionStart` hook running `scripts/plugins.mjs --quiet`. It
prints nothing when every declared plugin is installed for this checkout, and the missing ones plus
the one command to fix them when they are not. Silence is the pass condition.

Measured when it was added, not assumed: hooks from this file execute with no restart, the hook's
cwd is the repo root, and `CLAUDE_PROJECT_DIR` is set — so the command tries the relative path and
falls back to the env var. It ends in `|| true`, because a broken reminder must never block a
prompt.

If a rule in this document keeps getting skipped, move it into that hook rather than making the
document longer.
