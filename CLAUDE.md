# jp-platform — working rules

Next.js 15 + Tailwind jackpot/casino platform, built against Figma. Static export (`out/`), Vitest for tests.

## Skills are in this repo — use them, don't improvise

Project skills live in `.claude/skills/` and are committed, so every clone has them.
Plugins are declared in `.claude/settings.json` and resolve from the marketplaces in `~/.claude/plugins`.

The rules below are not suggestions. Invoke the named skill before doing the work, not after.

### Always, before touching UI

| Trigger | Skill |
| --- | --- |
| Any new page, component, colour, type scale, or layout | `ui-ux-pro-max:design`, then `ui-ux-pro-max:ui-styling` |
| Changing shared tokens or `tailwind.config.ts` | `design-system` |
| Spacing, borders, shadows, hit areas, hover/focus states | `make-interfaces-feel-better` |
| Anything animated | `motion-foundations` first, then `motion-ui` |
| Any interactive control | `accessibility` and `frontend-a11y` |

### Always, before saying a UI change is done

| Trigger | Skill |
| --- | --- |
| Visual change of any kind | `browser-qa` — confirm it in a real browser, don't reason about it |
| Buttons, menus, tabs, drawers | `click-path-audit` — trace the whole state sequence, not just the click handler |
| Closing out a task | `verification-loop` |

Do not report a UI change as working on the strength of the diff alone. This repo has a
history of that failing: the mobile jackpot menu and the tab bar were each "fixed" and had
to be fixed again once someone actually pressed the buttons.

### Always, when answering questions about the codebase

- Architecture, file relationships, "where does X live", "how does Y work" → `graphify` first.
- Explaining a bug, a decision, or why something behaves as it does → `explica`.
  Plain words, at least one concrete named example from this project, and an explicit line
  between what was measured and what is reasoning.
- Never fill a gap with a plausible guess. Name what you don't know and ask.

### Always, when writing code

- `ponytail` — simplest thing that works. YAGNI, stdlib first, no unrequested abstractions.
- `react-patterns` / `react-performance` for component work, `react-testing` for tests.
- `no-ai-slop` and `taste` before shipping copy or visual design.

### Bug fixes

Understand why the bug exists and where it came from, then grep for every other place the
same pattern appears. The same bug has been fixed repeatedly in different files here — fix
the class, not the instance.

## Language

Conversation with the owner is in Romanian. Everything that lands in a file — code,
comments, commit messages, docs, this file — is English.

## caveman and explica run together

Both are on. They govern different things, and the order between them is fixed.

`caveman` is pinned to **lite** in `.caveman/config.json` — committed, so it applies to
everyone who clones. At lite it drops filler and hedging but keeps articles and full
sentences. It does not shorten explanations; it removes the padding around them.

`explica` decides *what must be present*. `caveman` decides *how tightly it is written*.
On any conflict, `explica` wins:

- The concrete named example from this project is content, not filler. It is never cut.
- The line between what was measured and what is reasoning is content. Never cut.
- Naming what is unknown, instead of guessing, is content. Never cut.
- Cut instead: pleasantries, hedging, tool-call narration, restating the question,
  decorative tables, summaries of what was just said.

caveman's own rules already agree with this — its Auto-Clarity section drops compression
for security warnings, irreversible actions, multi-step sequences where order could be
misread, and any point where compressing creates ambiguity. Its Boundaries section keeps
normal prose in everything that outlives the chat: code, comments, commits, docs, PR text
and memory files. So this file, the commit messages and `docs/` stay in full English no
matter what mode the session is in.

Per-session override when you want something different: `/caveman full`, `/caveman ultra`,
`/caveman off`. The level resets to lite next session.
