---
name: explica
description: "Explain a situation, a decision, or a bug so a non-programmer follows it — plain words, concrete named examples from this project, and an explicit line between what was measured and what is reasoning. Use when the user asks why something behaves the way it does, asks for an explanation in simpler terms, or when a status report needs to land with somebody who did not write the code."
---

# /explica

The owner asked for this shape on 2026-09-07, after an answer that named
`crest_image`, `rank_state` and `CREST_FEED_UNNAMED` and explained nothing.
The rewrite he kept used the same facts with none of the identifiers.

## The rule underneath

**A name is not an explanation.** Saying which function ran tells the reader
where to look, not what happened. What explains is: *what is this thing keyed
on, and what breaks when that key is wrong.*

The badge case, in one line: the crest store is filed **by club id**; when
nobody could confirm the id, looking in the store means asking the very
witness that is in doubt. That sentence needs no function names and it is the
whole bug.

## The shape

**1. Name the pieces in plain words, with their real trade-off.**
Not "the fallback chain". Say: *the studio has two places it can take a badge
from — its own cupboard, filed by club number, big and clean; and the picture
that came attached to the match, small but tied to this fixture.*

**2. Give the rule, then the reason the rule exists.**
The reason is almost always an incident. Find it — the comment above the code
usually names it, and this repo's CLAUDE.md exists to record them.

**3. Two or three real cases, named.** This is the part that does the work.
Use actual clubs, actual dates, actual outcomes. The three that landed:

| case | what it shows |
|---|---|
| Al-Qadisiyah, 2026-09-04 | why the rule exists — a stale alias put the wrong number on the match and the **Libyan** club's badge went to a client |
| Dortmund, until v27 | the rule firing wrongly — a spent quota looked like "nobody can name this club", so a **jersey** went out instead of the BVB shield |
| Rizespor, 2026-09-07 | the rule working, and costing something — right club, but 100x100 where the cupboard held 512x512 |

An invented example is worth nothing here. If no real case exists, say so.

**4. Close with the exit.** What ends this, and why it works — again in plain
terms. *A pin is a hand-written note filed under the club's NAME, so it does
not depend on the number that is in doubt, and it is read before everything
else.*

**5. Say what you do not know.** Separately, at the end, unhedged. Which part
was measured, which part was reasoning, and what you tried that failed.
*"I asked the machine twice and both attempts timed out because it was busy —
so I still do not know why Rizespor was unnamed."*

## Never fill a gap

The moment you notice a missing fact, stop and choose: verify it, or ask the
owner. Do not let a plausible sentence stand in for a measured one — that is
the defect class this whole project keeps producing (CLAUDE.md rule 1), and it
reads exactly the same in prose as it does in code.

Two traps that have already cost time here:

- **Absence is not evidence.** A field that is empty may mean the field did not
  exist yet. Twelve rounds carried no `crest_from` — not a gap in the guard,
  just rounds built before the field shipped. Check *when* before concluding
  *whether*.
- **Your own probe can be the bug.** A squad search returned zero players and
  it was not the app: the request was missing the club name the handler builds
  its lookup from. Suspect the instrument before reporting a defect.

## When NOT to use this

When the owner asks for brevity ("pe scurt"), a yes/no, a command to paste, or
a status line. The style is for explaining, not for every answer — an essay
where a sentence was asked for is its own failure.
