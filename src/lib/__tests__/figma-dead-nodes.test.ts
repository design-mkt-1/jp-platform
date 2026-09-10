import { describe, expect, it } from 'vitest'
import { ACCEPTED_CITATIONS, DEAD_NODE_IDS } from '@/lib/figma-dead-nodes'
// The scan lives with the generator so the guard and the baseline read the tree the same way.
// Two copies of that regex would drift, and this repo has already paid for one rule living in two
// places: the `<Link>` prefetch bug was fixed three times because each fix stopped where the bug
// was noticed.
import { citations } from '../../../scripts/dead-nodes.mjs'

/**
 * `screens.test.ts` checks that a Figma node id matches `^\d+:\d+$`. A deleted node matches that
 * shape perfectly, which is why `screens.ts` carried `21:2896`, `13:2307` and `13:2519` — all three
 * confirmed deleted — through every green run. `CategoryPill.tsx` sized the mobile chip from
 * `1:5799` the same way.
 *
 * A test has no network, so it cannot ask Figma whether a node exists. It can hold the answers the
 * ledger already paid for and refuse to let a new citation of one of them in.
 *
 * Scope, stated rather than assumed: the scan covers `src/`, `docs/` and `public/`. Files at the
 * repository root are outside it, which is deliberate — `CLAUDE.md` has to name deleted ids to
 * explain why this guard exists, and a guard that fought the document describing it would be
 * removed within a session.
 */

describe('citations of deleted Figma nodes', () => {
  const dead = new Set(DEAD_NODE_IDS)
  const accepted = new Set(ACCEPTED_CITATIONS)

  it('lets no new one into src/, docs/ or public/', () => {
    const offences: string[] = []

    for (const [id, files] of citations()) {
      if (!dead.has(id)) continue
      for (const file of files) {
        const citation = `${id} ${file}`
        if (!accepted.has(citation)) offences.push(citation)
      }
    }

    expect(
      offences.sort(),
      'These node ids were deleted from the Figma file. Cite a live node, or if the id is right and ' +
        'the ledger is stale, re-probe it with get_screenshot and regenerate: node scripts/dead-nodes.mjs',
    ).toEqual([])
  })

  it('knows more than one dead id, since a one-id list would pass by accident', () => {
    // Session 13 deliberately shipped no guard because the ledger held exactly one dead id then.
    expect(DEAD_NODE_IDS.length).toBeGreaterThan(1)
  })
})
