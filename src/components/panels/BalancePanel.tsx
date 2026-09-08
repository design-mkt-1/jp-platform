'use client'

import type { ReactNode } from 'react'
import Button from '../primitives/Button'
import Panel from '../primitives/Panel'
import { balances as BALANCES } from '@/lib/data'
import { formatGbp } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'

/**
 * The balance breakdown that drops out of the header pill — frame `Balance Opened` (1:4116),
 * popover node 1:4124.
 *
 * It renders the modal behaviour of `Panel` rather than its own: the trap, Escape, the backdrop
 * and focus restoration already live there and a second copy would drift. Only the geometry the
 * design asks for is overridden — 320px wide instead of the primitive's 360, radius 24 instead
 * of 16 — and those overrides carry `!` because two utilities of the same Tailwind family in one
 * class attribute are resolved by stylesheet order, not by the order they were written in.
 *
 * The backdrop is markedly darker than the Figma frame. That is the tokens decision
 * (`bg-overlay` = `#161625 @ 80%`, not black at 20%) recorded in docs/tokens.md §1, not a bug,
 * and it is deliberately not compensated for here.
 */

/** Roboto at 14/16 — the `Footnote_m` style the design reports for every row of the stack. */
const ROW = 'flex items-center justify-between p-4 font-flex text-sm'

/** Nodes 1:4140, 1:4145, 1:4149: an 8px-radius navy chip holding a two-digit count. */
const PILL = 'rounded-lg px-2 py-0.5 font-flex text-xs font-bold'

function Row({ children, first = false }: { children: ReactNode; first?: boolean }) {
  // The design draws the stack as rows on `#25252f` with a 1px gap, i.e. hairlines between them.
  // A top border on every row but the first is the same picture with one element per row.
  return (
    <div className={first ? ROW : `${ROW} border-t border-solid border-separator`}>{children}</div>
  )
}

export default function BalancePanel() {
  const open = useAppStore((state) => state.panel === 'balance')
  const closePanel = useAppStore((state) => state.closePanel)
  const authMode = useAppStore((state) => state.authMode)

  const balance = BALANCES[authMode]

  return (
    <Panel
      open={open}
      onClose={closePanel}
      title="Balance"
      hideTitle
      className="!max-w-[320px] !rounded-3xl"
    >
      {/* Node 1:4124: 16px between the breakdown and the call to action. */}
      <div className="flex flex-col gap-4">
        {/* Node 1:4125 — the rounded clip is what turns six flat rows into one block. */}
        <div className="overflow-hidden rounded-2xl">
          <Row first>
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 shrink-0 rounded-[3px] bg-green" />
              <span className="font-medium text-primary">Total Balance</span>
            </span>
            <span className="font-bold text-green">{formatGbp(balance.totalGbp)}</span>
          </Row>

          <Row>
            <span className="text-muted">Real balance</span>
            <span className="font-medium text-primary">{formatGbp(balance.cashGbp)}</span>
          </Row>

          <Row>
            <span className="text-muted">Your bonus balance</span>
            <span className="font-medium text-primary">{formatGbp(balance.bonusGbp)}</span>
          </Row>

          {/* Free spins, free bets and the bonus queue are counts, not money, and `Balance` has no
              field for them. The design shows a zero in all three; rather than invent a number the
              data cannot back, they render the zero the frame draws. See the report. */}
          <Row>
            <span className="text-muted">Free spins</span>
            <span className={`${PILL} bg-blue-tint text-amber`}>0</span>
          </Row>

          <Row>
            <span className="text-muted">Free bets</span>
            <span className={`${PILL} bg-blue-tint text-amber`}>0</span>
          </Row>

          <Row>
            <span className="text-muted">Bonuses queue</span>
            <span className={`${PILL} bg-blue-tint text-muted`}>0</span>
          </Row>
        </div>

        {/* Node 1:4151. The demo has no deposit destination, so the control is inert — but it is
            still a real focusable button, which is also what keeps the dialog's focus trap from
            having nothing to hold. */}
        <Button className="h-11 w-full !text-[15px] uppercase">Deposit</Button>
      </div>
    </Panel>
  )
}
