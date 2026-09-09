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

## Notes

- `caveman` is installed but disabled in `.claude/settings.json`. It compresses output ~65%
  and would directly undercut the `explica` rule above. Flip it to `true` only if you want
  terse output more than you want explanations.
