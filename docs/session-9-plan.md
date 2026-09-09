# Session 9 — mobile polish, measured before edited

**This file is in the repo on purpose.** The next session runs on a different machine, and a plan
in `~/.claude/plans/` does not travel. Everything needed to execute is here.

**Repo:** `main`, clean. **Deployed:** https://design-mkt-1.github.io/jp-platform/
**Read first:** [`CLAUDE.md`](../CLAUDE.md), [`docs/audit-session-8.md`](audit-session-8.md),
[`docs/next-session.md`](next-session.md) — its "How this repo is worked on" section and §12.

---

## 0. First, on the new machine — ten minutes, do not skip

`git clone`, `npm ci`, `npm run dev`. Then check what did **not** come with the repo. Three things
travel and three do not, and confusing them wastes an hour.

**Travels (already in the clone):** `.claude/skills/` (20 skills), `CLAUDE.md`,
`.claude/hooks/skill-triggers.mjs` and its wiring in `.claude/settings.json`, `.caveman/config.json`,
all of `docs/`.

**Does not travel — check each:**

1. **The plugins.** `.claude/settings.json` *declares* `ui-ux-pro-max`, `ponytail` and `caveman`, but
   their code lives in `~/.claude/plugins/cache/` on the old machine. Type `/ponytail-help`. If
   nothing answers, install them:
   `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`, `/plugin install ponytail@ponytail`,
   `/plugin install caveman@caveman`. Marketplaces: `github:nextlevelbuilder/ui-ux-pro-max-skill`,
   `github:dietrichgebert/ponytail`, `github:JuliusBrussee/caveman`.
   **This was already unverified on the old machine** — both were recorded against
   `projectPath: D:\DesignTeamPlatform`, not this repo — so treat it as unknown, not as working.
2. **The owner's two global rules.** "Never assume, verify" and "explain, do not just report" are
   `UserPromptSubmit` hooks in `~/.claude/settings.json` plus `~/.claude/CLAUDE.md`. They are local.
   Without them the answers get dry and gaps get filled with plausible guesses instead of questions.
   `docs/start-here.txt` says which two files to copy.
3. **Orca.** Installed at `…\AppData\Local\Programs\orca` on the old machine, and its run state is
   per-machine. If `orca status` does not answer, use plain subagents — the wave structure in §3
   works either way. Do not spend the session installing an orchestrator.

**Then confirm the repo's own hook fires:** the text `PROJECT SKILLS (.claude/skills, committed)`
must appear above your first message. If it is not there, say so out loud and fix it before doing
any work — that hook is the only thing standing between "the skills are installed" and "the skills
are used", and the difference has already cost this project one whole session.

## Context

95%+ of this product's traffic is a phone. Mobile at 390px is the only priority; desktop must not
regress.

Session 8 landed on mobile and it is all live: the tab-bar marks fill their box (three of the five
were the *wrong drawing*, not merely small — Live Casino was missing its chip stack), the row rhythm
went from 20px to the design's 44px, the countdown keeps two digits and no longer publishes a past
date, the category tabs filter, search goes somewhere, and the cards respond to a pointer.

What is left is smaller, and most of it **needs measuring before anything is edited**. The
arithmetic on the page-height gap does not close, and an agent that starts editing toward a number
nobody has attributed will make the page worse while appearing to make it better.

## 1. The skill contract — the owner approved this list

Fire these, and **say which fired** when reporting. A skill that is installed and never invoked is
the same as one that is not installed — which is exactly how `ui-ux-pro-max` sat unused through a
49-control audit in session 8.

| When | Fire |
| ---- | ---- |
| Before touching any UI | **`ui-ux-pro-max:ui-ux-pro-max`** (the primary), then `ui-ux-pro-max:ui-styling` |
| Spacing, hit areas, hover/focus/pressed | `make-interfaces-feel-better` |
| Any interactive control | `accessibility` and `frontend-a11y` |
| Measuring or confirming anything visual | `browser-qa` |
| Buttons, menus, tabs, sheets | `click-path-audit` — the whole state sequence, not the handler |
| Closing out | `verification-loop` |
| Explaining anything to the owner | `explica` |
| Codebase questions | `graphify` |
| Writing the code | `ponytail` |

`ui-ux-pro-max` is **seven** skills, not one. The primary is `ui-ux-pro-max:ui-ux-pro-max` —
"designing, building, reviewing, or fixing interfaces". `:design` is a router for logo, banner and
slide *generation*; session 8 fired it by name and got a table about generating logos with Gemini.
`:brand`, `:banner-design`, `:slides` make marketing assets and do not apply here.

Not fired, and do not pretend otherwise: `motion-ui`, `motion-foundations`, `react-performance`,
`nextjs-turbopack`, `design-system`, `frontend-design-direction`, `frontend-patterns`, `ro-scurt`.
`react-testing` only if package D touches `screens.test.ts`.

## 2. Owner decisions already taken — do not re-open

| Item | Decision |
| ---- | -------- |
| The 11 inert `See All (206)` pills | **Leave them.** Figma draws the pill on all 11 rows. |
| Footer links at 16px tall | **Leave them.** Design parity wins. |
| The 3 menu disclosure chevrons | **Remove.** No `chevron-right` glyph exists; anything else is new drawing. |
| The mobile header shell | **Fill the existing 40px.** Figma draws it at 40. |
| Dead Figma node ids | **Only the ones that do something** — §3 Wave 1 D. |

**If touch targets come up:** 44px is Apple's guidance and WCAG **AAA** 2.5.5. The bar the gate
enforces is **AA 2.5.8, 24×24**. Session 8 first reported "35 of 47 controls fail" and that was
wrong — axe's own `target-size` rule passed all 47, because WCAG allows undersized targets with
enough clear space. Do not inflate it again.

## 3. The work

Orca if it is available (`run-create` → `task-create` → subagents, then
`task-update --id <id> --status completed`); plain subagents if it is not. One worktree and one
dev-server port per worker. **Put this in every task spec, verbatim:** *no worker runs
`npm run build` or a static export inside a worktree — `.next` is shared and every route starts
returning 500. The build and the a11y run happen once, at fan-in.*

### Wave 0 — measure only, no edits (serial, one agent)

The page-height gap is a **total, not an attribution**, and it does not close: our mobile page is
7360 tall against Figma `21:2896`'s 7129. Suspects: the footer (+81 against `21:3693`'s 1140) and
the providers row (+76 against 264). That is 157 of 231, leaving **74px unexplained** — which could
equally mean one of the two known numbers was measured against the wrong Figma child.

Deliverable: a **cumulative-y ledger** — for `21:3693` and the mobile providers frame, every direct
child's y-offset and height beside the same list read from the DOM at 390. Diff per block.
**Nothing is edited until a block is named.** Also capture every "before" measurement §4 needs.

Cheap first hypothesis for the providers row — test it, do not assume it:
`src/components/cards/ProviderCard.tsx:80` is
`'inline-flex size-[140px] shrink-0 items-center justify-center p-[14px]'` with **zero** `mobile:`
variants in the whole file, so two bands cost 280px; and `src/components/sections/ProviderRow.tsx:95`
is `'flex flex-col gap-5'` where `src/components/sections/ContentRow.tsx:79` is
`'flex flex-col gap-5 mobile:gap-4'`. That is ~64 of the ~76.

### Wave 1 — parallel, separate worktrees, zero shared files

| Pkg | Owns (write) | Work |
| --- | ------------ | ---- |
| **A** | `src/components/panels/JackpotMenu.tsx` | Remove `chevron: true` from Sport (**49**), Casino (**50**), Payments (**59**), and the `chevron?: boolean` field (**44**; 43 is its docblock). The render at **94–96** is already `row.chevron ? … : null` and the row is `justify-between`. **Trap:** the `More` button's own `chevron-down` at **243** stays. Line 293 is prose. |
| **B** | `src/components/layout/HeaderPostlogin.tsx` | Fill the 40px mobile shell. Balance `<button>` opens at **117**, className at **121**: `` `rounded-full px-1 text-sm font-extrabold tracking-[-0.14px] text-emerald ${FOCUS_RING}` `` — no height, no `py`, so its box is `text-sm`'s 20px line-height (measured 81×20). The `+` is `size-8` at **133**; the shell's `h-10` at **111**. **Trap:** the *desktop* pill at **80** also has `h-10` — leave it. Use the repo's idiom, `p-*` with `-m-*` (`CategoryNavBar.tsx:241-246`). Add `tabular-nums` to the balance figures while there. |
| **C** | `src/components/cards/PromoBanner.tsx` | `tabular-nums` on the desktop `<time>` — opens at **218**, className at **221–223**, currently without it. `PromoBannerMobile.tsx:206` is the pattern. |
| **D** | `src/lib/screens.ts`, `src/lib/sections.ts` | Remap only the ids that **do something**. `MOBILE_NODE_IDS` (`sections.ts`, entries **196–210**, consumed at **214**) drives the `/dev/screens` deep links; all 15 point into the dead `1:5882`…`1:6499` band. **Check every replacement against Figma before writing it** — `screens.test.ts` validates the `^\d+:\d+$` shape, which a dead id still matches. Live mobile pair: `21:2896` post-login, `21:4154` pre-login. |

**Do not touch in any worker:** `src/components/primitives/Button.tsx` — `CategoryView.tsx:68`
renders a live `<Button variant="seeAll">` for "Back to home", and deleting that variant breaks the
category filter — nor `src/app/globals.css` or `tailwind.config.ts`. `globals.css:151-162` carries a
standing rule that a second viewport-scoped token value needs a design-intent justification.
Requests for these queue to the fan-in.

### Wave 2 — serial, needs Wave 0's attribution

Footer and providers height, scoped to the blocks Wave 0 actually named. **If Wave 0 does not close
the 231px, say so and stop** rather than editing toward a number.

### Wave 3 — fan-in, serial, integration checkout

Docs (§5), then the full gate once. The a11y surface is shared — A removes 3 glyphs from `mob-menu`,
B changes header target boxes on all four mobile states — so the nine-state axe pass runs here, once.

## 4. Verification

Every claim at **390×844, `isMobile: true`, `hasTouch: true`**. Desktop control at 1440.

**Presses are `page.tap()` or `mouse.move → down → up`. Never `element.click()`.** This cost time
twice in session 8: `.click()` does not move focus, so it made a working focus restoration look
broken, and it sets `:focus-visible` where a real press does not. Two findings were written down and
then killed by re-testing properly.

Hit areas are proven with `document.elementFromPoint(x, y)` at the target's corners and mid-edges —
a rect proves geometry, `elementFromPoint` proves what the finger reaches. For **B** the "before" is:
`elementFromPoint` at the shell's top+2 and bottom−2 over the balance label returns the shell
`<div>`; after, it must return the balance `<button>`, the shell's painted rect must not move by a
pixel, and the expanded box must not overlap the `+`.

**C** already has its number: at 1440, sample `range.getBoundingClientRect().width` of the `<time>`
text once a second for four seconds. The mobile equivalent swung **44.48 → 47.81px** before the fix;
after, the swing must be **0.00**.

Then the gate — `npm test` (64) · `npx tsc --noEmit` · `npx eslint src --max-warnings=0` ·
`npm run build:check` — plus `node scripts/a11y.mjs` over the nine states at zero. Commit, push,
watch the Pages run, and **re-check on the deployed site at 390**, not on localhost.

**Never** run `npm run build` or a static export while `next dev` is up; they share `.next` and every
route starts returning 500 with `ENOENT … _buildManifest.js.tmp.…` while the source is fine.

## 5. Docs at fan-in

Add a §13 to `docs/next-session.md` for whatever this session changes, and fold this file's
outcome into it. Record measurements, not adjectives.

## 6. Still open, not in this session

From `docs/audit-session-8.md`: the 11 inert `See All` pills, "More" opening a corner popover on a
phone, the provider filter's results riding a 40-second marquee and being clipped 25px by their own
container, the no-results copy pointing at categories that are not in the panel, four labels for two
auth buttons, and six SVGs still carrying the Figma footer artboard because `clean-svg.mjs`'s rule 2
only catches paths starting more than 1000 units outside the viewBox while those six start at −149
to −961.
