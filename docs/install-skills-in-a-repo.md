# Prompt: install the jp-platform skill set in another repo

Paste the block below into a Claude Code session opened **in the target repo**.
It reproduces what jp-platform has: skills committed to the repo, plugins declared
in settings, and a `CLAUDE.md` that makes them fire automatically instead of being
optional.

Two things to adjust before you paste it, explained under the block.

---

```
Install the same skill and plugin set this repo's sibling jp-platform uses, and wire
them so they are always used, not optional.

1. SKILLS, COMMITTED TO THE REPO

Create .claude/skills/ and copy these 20 skills into it:

  graphify, explica, ro-scurt, design-system, make-interfaces-feel-better,
  frontend-design-direction, accessibility, frontend-a11y, react-patterns,
  react-performance, react-testing, frontend-patterns, motion-foundations,
  motion-ui, browser-qa, click-path-audit, verification-loop, taste,
  no-ai-slop, nextjs-turbopack

Source, in order of preference:
  a) ~/.claude/skills/<name>          (present on the owner's machine)
  b) .claude/skills/<name> from https://github.com/design-mkt-1/jp-platform

After copying, verify every skill has a SKILL.md, and verify .gitignore is not
swallowing the directory:

  git check-ignore -v .claude/skills/graphify/SKILL.md

Empty output means it is tracked. Any output means .gitignore needs a negation
rule, otherwise the whole set silently never reaches the team.

2. PLUGINS

In .claude/settings.json, under "enabledPlugins":

  "ui-ux-pro-max@ui-ux-pro-max-skill": true
  "ponytail@ponytail": true
  "caveman@caveman": true

These three are plugins, not loose skills: each ships a .claude-plugin/plugin.json
and activates through SessionStart hooks that run Node scripts. Do NOT copy their
skills/ folders into the repo. You would get the slash commands, silently lose the
automatic activation that is the whole point, and add roughly 45 MB.

Also create .caveman/config.json containing {"defaultMode": "lite"} and commit it.
caveman resolves its level as: CAVEMAN_DEFAULT_MODE env var, then repo-local
.caveman/config.json or .caveman.json walking up to the filesystem root, then the
user config, then "full". Pinning lite in the repo is what lets caveman and the
explain-in-plain-words rule coexist: lite drops filler and hedging but keeps articles
and full sentences, so it tightens explanations instead of truncating them.

3. CLAUDE.md

Write CLAUDE.md at the repo root, in English, as trigger rules rather than advice.
Cover:

  - Before any UI work: ui-ux-pro-max:ui-ux-pro-max then ui-ux-pro-max:ui-styling;
    design-system when touching shared tokens or the Tailwind config;
    make-interfaces-feel-better for spacing, borders, shadows, hit areas and
    hover/focus states; motion-foundations before motion-ui; accessibility and
    frontend-a11y for every interactive control.

  - Before calling a UI change done: browser-qa, confirmed in a real browser rather
    than reasoned from the diff; click-path-audit for buttons, menus, tabs and
    drawers, tracing the whole state sequence and not just the click handler;
    verification-loop when closing out.

  - Answering questions about the codebase: graphify first. Explaining a bug or a
    decision: explica — plain words, at least one concrete named example from THIS
    project, and an explicit line between what was measured and what is reasoning.
    Never fill a gap with a plausible guess; name what is unknown and ask.

  - Writing code: ponytail (simplest thing that works, YAGNI, stdlib first, no
    unrequested abstractions), react-patterns, react-performance, react-testing,
    no-ai-slop, taste.

  - Bug fixes: understand why the bug exists and where it came from, then grep for
    every other place the same pattern appears. Fix the class, not the instance.

  - Language: conversation with the owner is Romanian; everything landing in a file
    is English.

  - caveman and explica together: explica decides what must be present, caveman decides
    how tightly it is written, and explica wins any conflict. The concrete example, the
    measured-versus-reasoning line, and naming what is unknown are all content and are
    never cut. Filler, hedging, tool-call narration and restating the question are.

Adapt the examples to THIS repo. Read its README, its git log and its src/ layout,
and cite a real incident from its own history. Do not copy jp-platform's examples.

4. Do not commit anything. Show me git status and what you wrote, then wait for my
   confirmation.

5. At the end, tell me explicitly what you could not verify.
```

---

## Adjust before pasting

**Trim the skill list to the target repo.** The 20 above are tuned for a Next.js
frontend. In a repo like `repo1-reports`, which is report automation, `motion-ui`,
`react-performance` and `nextjs-turbopack` are dead weight. Cut them from the list
before you paste, rather than installing and ignoring them.

**Point (a) only works on the owner's machine.** `~/.claude/skills/` is local and is
not in any repo. On a colleague's machine or a fresh laptop, only source (b) works,
and only because this repo now carries the set.

## Answered, 2026-09-10: `enabledPlugins` alone is not enough

This section used to ask whether `ponytail` and `caveman` load from `enabledPlugins` alone
or still need an install inside the target project. Measured: **they need the install.**

`~/.claude/plugins/installed_plugins.json` records one entry per install, each carrying the
`projectPath` it was installed for. A plugin loads in a checkout only when a record's
`projectPath` is that checkout — or the record is `scope: "user"`. Declaring it in
`.claude/settings.json` does nothing on its own. Before the fix, this repo declared seventeen
plugins and one had a record for `D:\jp-platform`; after `claude plugin install <id> --scope
project` for the other sixteen, all seventeen did.

**Do not verify with `claude plugin list`.** Its "enabled" column is machine-wide: it prints the
current project's enabled flag beside a record that may belong to a different project. On
2026-09-10 it reported fifteen plugins as enabled here while none of them was installed here. Use
`npm run plugins`, which compares the two files directly, or `claude plugin list --json` and read
`projectPath` per record.

`/ponytail-help` is still a fine ten-second behavioural probe of one plugin after a restart. It
does not scale to seventeen, and it has to be typed by hand.
