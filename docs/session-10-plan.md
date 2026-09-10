# Session 10 — the open items are decisions, not code

**This file is in the repo on purpose.** The next session runs on a different machine again, and
nothing under `~/.claude/` travels — not the plan, not the plugins, not the memory files.

**Repo:** `main`, clean, `e9ecefa`. **Deployed:** https://design-mkt-1.github.io/jp-platform/
**Read first:** [`CLAUDE.md`](../CLAUDE.md), then [`next-session.md`](next-session.md) §13 and
[`audit-session-8.md`](audit-session-8.md)'s two status tables.

---

## 0. First, on the new machine — ten minutes, do not skip

> **Superseded 2026-09-10.** The live checklist is [`start-here.txt`](start-here.txt) plus
> `npm run plugins`. This section is kept as the record of what session 10 was instructed to do, not
> as instructions to follow.

**`git pull` before anything else.** Session 9 opened on a checkout **22 commits behind** `origin/main`,
so the plan, the twenty skills in `.claude/skills/` and the hook that fires them were all on the
remote and not on disk. The hook then fired from the very next prompt — no restart needed — but a
session that reads a plan before pulling is reading last month's plan.

Then `npm ci` and `npm run dev`. Then check the three things a clone does not carry:

| Travels with the clone | Does **not** travel |
| --- | --- |
| `.claude/skills/` (20), `CLAUDE.md`, `.claude/hooks/skill-triggers.mjs` and its wiring in `.claude/settings.json`, `.caveman/config.json`, all of `docs/` | the plugins — `settings.json` only *declares* them; the code is in `~/.claude/plugins/` |
| | the owner's two global rules — `UserPromptSubmit` hooks in `~/.claude/settings.json` plus `~/.claude/CLAUDE.md` |
| | Orca's state, which is per machine |
| | **the memory files** — `~/.claude/projects/D--jp-platform/memory/` had six of them on the last machine, and none of it follows the repo |

1. **Plugins.** Type `/ponytail-help`. Nothing back → install:
   `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`, `/plugin install ponytail@ponytail`,
   `/plugin install caveman@caveman`. Marketplaces: `github:nextlevelbuilder/ui-ux-pro-max-skill`,
   `github:dietrichgebert/ponytail`, `github:JuliusBrussee/caveman`.
2. **The owner's rules.** "Never assume, verify" and "explain, do not just report". On the last
   machine only the second one existed, as a hook running `cat ~/.claude/hooks/explain-simply.json`;
   the first was written into `~/.claude/CLAUDE.md` by hand. Without them the answers go dry and
   gaps get filled with plausible guesses instead of questions.
3. **Orca.** `orca status` should answer `runtimeState: ready`. If it does not, use plain subagents —
   the wave structure below works either way. Do not spend the session installing an orchestrator.
4. **Figma.** `get_metadata` on file `2MyylxdZblfGnf05nQacUz` must answer `0:1: Platform`.
5. **Chrome** must be installed. `npx playwright install` is **not** needed — the scripts drive the
   machine's own Chrome with `channel: 'chrome'`.

**Then confirm the repo's hook fires:** the text `PROJECT SKILLS (.claude/skills, committed)` must
appear above your first message. If it is missing after the pull, say so out loud and fix it before
doing any work.

## 1. Where things stand, measured

Everything below was measured on the deployed build at 390×844, not on `localhost`.

| | |
| --- | --- |
| Mobile page height | **7228** against Figma `21:2896`'s 7129.4 |
| Gate | 65 tests · `tsc` 0 · `eslint` 0 · `build:check` 0 |
| axe over the nine states | 0 critical / 0 serious / 0 moderate / 0 minor |

Session 9 closed the 231px height gap by attribution rather than by editing toward the number, then
took five items off the session-8 audit. The remaining difference is understood block by block and
written down in `next-session.md` §13.

## 2. The honest shape of this session

**Six of the seven open items are decisions, not defects.** Only one is work a session can simply
do. So do not open this session by editing — open it by making the choices visible.

### Wave 0 — render the choices, do not describe them (serial, one agent)

Session 8 settled the 768–1279px nav by rendering four treatments side by side at three widths and
letting the owner point at one. Do that again. For each item below, produce a **before/after pair at
390**, from the real app, and put them in front of the owner in one message.

| # | The choice | What it costs | Where |
| - | ---------- | ------------- | ----- |
| 1 | The **legal paragraph** in the mobile footer | 80px plus its 32px gap. Figma's `21:3693` does not draw it at all | `FooterBottom.tsx` |
| 2 | The **footer link rows**: 32 tall, Figma draws 44 (`21:4026`, text at y=14 in a 44 frame) | +72px over six rows | `FooterLinkColumn.tsx` |
| 3 | The **second divider**: Figma puts it between the links and the flags; we stack both above the links | same height, different picture | `Footer.tsx` |
| 4 | The **34px** Figma keeps under the last row (`21:3675` is 410 for 376 of content) | design intent or a stray frame size — **unknown, ask** | `page.tsx` rhythm |
| 5 | A visible **play/pause button** on the provider marquee | new furniture Figma does not draw. `ui-ux-pro-max`'s "Auto-Rotating Content Controls" rule is severity **High**; hover, focus-within and reduced-motion pausing already landed in `b061207` | `ProviderRow.tsx` |
| 7 | The **four auth labels**: desktop `Login` / `Register`, mobile `Log In` / `Sign In` — the mobile *register* button reads as log-in | the copy is Figma's own, nodes `1:4309` and `1:6994` | `HeaderPrelogin.tsx` |

**Items 1 and 2 interact — say so when you ask.** Our footer is 1221 against Figma's 1140. Removing
the legal block takes off 112; giving the rows their 44 puts back 72. Neither alone lands on 1140,
and the owner should see both numbers in the same sentence rather than answer them a month apart.

### Wave 1 — the one item that needs no decision

**Item 6: Escape on the phone account sheet returns focus to `<body>`, not to `More`.**

Confirmed pre-existing in session 9 by re-running the same script against the code before the sheet
change, so it is not a regression from `5a7ddc9`. It cannot be fixed from `PersonalInfoPanel.tsx`
alone: the `More` button is unmounted by the same commit that opens the panel, and the opener is
captured inside `useOverlayBehavior` in `src/components/primitives/Panel.tsx` — which `Sheet` shares.

That makes it a change in shared overlay code, so it is a **single serial task, not a parallel
worker**, and it needs the click-path traced before anything is edited: `JackpotMenu` → `More` →
`PersonalInfoPanel`, and what unmounts what in which order. Backdrop dismissal already restores
focus correctly (re-verified 2026-09-09 with real presses) — find out why Escape does not follow the
same path.

### Wave 2 — whatever the owner picked

One worker per decision, disjoint files, the table above says which. Then fan-in.

## 3. How to work here

Orca if available: `run-create` → `task-create` → `worker-start --worktree current` →
`check --wait --types "worker_done,escalation,question"` → `task-update --status completed` →
`worker-release --dispatch <ctx>`. Otherwise plain subagents, same shape.

**Put in every task spec, verbatim:** *no worker runs `npm run build` or a static export inside a
worktree — `.next` is shared and every route starts returning 500. The build and the a11y run happen
once, at fan-in.* And: *put your scripts in `scripts/.tmp/<your letter>/` and delete only that
subfolder* — in session 9 a worker's `rm -rf scripts/.tmp` took the coordinator's measuring script
with it.

**Fire the skills and say which fired.** `ui-ux-pro-max:ui-ux-pro-max` is the primary and it is not
"used" by being loaded — run its `search.py` on the concern actually at hand and report the rule you
applied or contradicted. Session 9's marquee and no-results decisions both came out of it. Then
`:ui-styling`, `make-interfaces-feel-better`, `accessibility` + `frontend-a11y`, `browser-qa`,
`click-path-audit`, `verification-loop`, `ponytail`, `explica`.

## 4. Traps this project has already paid for

- **Re-measure the "before" against `HEAD`.** The session-8 audit recorded the account panel as a
  171px corner box; by the time it was fixed, commit `b1665c4` had already made it a 280px centred
  card. A written measurement ages.
- **Two competing utilities on one element are an ordering accident, not a decision.** A slot
  carrying both `mobile:h-8` and `mobile:h-10` resolved to 40 in `next dev` and 32 in the Pages
  build, and the deployed footer measured 7220 where local said 7228. **Re-measure on the export.**
- **An a11y run that does not confirm the server is up proves nothing.** A 404 page scores five
  identical "moderate" findings per state and reads exactly like a result. Check `served 200` first.
- **Presses are `page.tap()` or `mouse.move → down → up`.** `element.click()` does not move focus and
  has already killed two real findings here by making working code look broken.
- **`resize_window` lies on a maximised Chrome** — it reported success while `innerWidth` stayed
  2552. Check `innerWidth` before trusting a viewport.
- **Never run `npm run build` while `next dev` is up.** They share `.next`; every route then returns
  500 with `ENOENT … _buildManifest.js.tmp.…` while the source is fine. Use `npm run build:check`.

## 5. The gate, once, at fan-in

```
npm test            # 65
npx tsc --noEmit
npx eslint src --max-warnings=0
npm run build:check
```

plus axe over the nine states, which must stay at zero:

```
GITHUB_PAGES=true NEXT_DIST_DIR=.next-a11y npx next build --turbopack
mkdir -p $TEMP/a11y-site && cp -r .next-a11y $TEMP/a11y-site/jp-platform
cd $TEMP/a11y-site && python -m http.server 4173 &
curl -sf http://localhost:4173/jp-platform/    # must be 200 before the next line means anything
node scripts/a11y.mjs $TEMP/a11y-out http://localhost:4173/jp-platform
```

Then commit, push, watch the Pages run, and **re-check on the deployed site at 390**.

## 6. Docs at fan-in

Add a §14 to [`next-session.md`](next-session.md) and fold this file's outcome into it. Record
measurements, not adjectives. Update the status tables in `audit-session-8.md` for anything closed.
