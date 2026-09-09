/**
 * UserPromptSubmit hook — injects the project's skill triggers into every turn.
 *
 * Why a hook and not CLAUDE.md: `ui-ux-pro-max` was enabled in .claude/settings.json from the
 * first commit and session 8 ran a 49-control UI audit plus eight fixes without invoking it once.
 * A file on disk waits to be read. A hook fires. The owner's own two rules — "never assume" and
 * "explain, do not just report" — arrive this way and are visibly present on every turn, which is
 * the evidence this mechanism works where the passive one did not.
 *
 * Keep the text SHORT. A long injection on every turn becomes noise and gets skimmed, which is the
 * failure mode this is trying to fix.
 */
const TRIGGERS = [
  'PROJECT SKILLS (.claude/skills, committed) — invoke them, do not improvise:',
  '- Touching UI: ui-ux-pro-max:ui-ux-pro-max (the primary), then :ui-styling, plus make-interfaces-feel-better — BEFORE editing.',
  '- Before calling a UI change done: browser-qa (look at it) + click-path-audit (trace the states).',
  '- Explaining a bug or a decision: explica. Codebase questions: graphify. Writing code: ponytail.',
  '- Mobile 390px is the priority; 95% of traffic is a phone. Desktop must not regress.',
  '- Verify with real taps/clicks. element.click() does not move focus and has produced two false findings here.',
].join('\n')

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: TRIGGERS },
  }),
)
