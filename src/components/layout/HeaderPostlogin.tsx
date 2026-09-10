'use client'

import Button from '../primitives/Button'
import Icon from '../primitives/Icon'
import { balances as BALANCES, profile as PROFILE, vipProfile as VIP_PROFILE } from '@/lib/data'
import { formatGbp } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import type { AuthMode } from '@/lib/types'

/**
 * The right-hand cluster of the header for a signed-in player: Figma node 1:4272 on desktop
 * (balance pill, DEPOSIT, profile pill) and node 32:1829 on mobile (one navy balance button with
 * a blue add mark).
 *
 * `AccountCluster` is exported because the VIP header is this cluster plus a tier badge and a
 * different balance — two files rendering the same widget from one source beats two files that
 * drift apart the first time the pill changes radius.
 *
 * None of the overlays live here. The balance and profile controls only call `openPanel`; the
 * panels themselves are built elsewhere.
 */

/** The two signed-in states. `prelogin` has no cluster to render. */
export type AccountTier = Extract<AuthMode, 'postlogin' | 'vip'>

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

/**
 * The disc that closes both desktop pills (nodes 1:4280, 1:48).
 *
 * `chevron-down.svg` is the whole 32x32 control: the white-6% circle and the #9E9FAB chevron are
 * both inside the export, so there is no wrapper here to draw a second circle behind it.
 */
function PillAffordance() {
  return <Icon name="chevron-down" width={32} height={32} className="size-8 shrink-0" />
}

/** Node 1:8536. The design's three-stop yellow is the brand gold gradient at a smaller radius. */
export function VipBadge() {
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1',
        // 14px is `line-height: normal` for Inter at 11px, measured. The node this badge was
        // taken from, `1:8536`, is deleted, so the design has no height to check against.
        'bg-gradient-gold text-[11px] leading-[14px] font-bold uppercase tracking-[1.5px] text-page',
        'shadow-[0_0_8px_color-mix(in_srgb,var(--gold-light)_50%,transparent)]',
      ].join(' ')}
    >
      <span aria-hidden className="text-xs leading-none">
        ★
      </span>
      VIP
    </span>
  )
}

export interface AccountClusterProps {
  tier: AccountTier
}

export function AccountCluster({ tier }: AccountClusterProps) {
  const openPanel = useAppStore((state) => state.openPanel)

  const isVip = tier === 'vip'
  const user = isVip ? VIP_PROFILE : PROFILE
  const total = formatGbp(BALANCES[tier].totalGbp)

  // Deposit is a step inside the balance overlay in the design (frame 1:4116), not a route of its
  // own, so every deposit affordance in the header opens that overlay.
  const openBalance = () => openPanel('balance')

  return (
    <>
      {/* Desktop — node 1:4272 */}
      <div className="flex items-center gap-3.5 mobile:hidden">
        <button
          type="button"
          onClick={openBalance}
          aria-label={`Balance ${total} — open balance details`}
          className={`flex h-10 items-center gap-2 rounded-[20px] bg-card px-2 transition-colors hover:brightness-125 ${FOCUS_RING}`}
        >
          <span className="text-[13px] font-semibold tabular-nums text-primary">{total}</span>
          <PillAffordance />
        </button>

        {isVip ? <VipBadge /> : null}

        {/* The primitive's gold variant is 16px; the header sets every label at 13px. `!` because a
            plain override would depend on which font-size utility Tailwind emits last. */}
        <Button onClick={openBalance} className="!h-9 !text-[13px] uppercase">
          Deposit
        </Button>

        <button
          type="button"
          onClick={() => openPanel('personalInfo')}
          aria-label={`${user.displayName} — open personal information`}
          className={`flex h-9 items-center gap-2 rounded-[20px] bg-elevated px-2 transition-colors hover:brightness-150 ${FOCUS_RING}`}
        >
          <span className="max-w-[140px] truncate text-[13px] font-semibold text-primary">
            {user.displayName}
          </span>
          <PillAffordance />
        </button>
      </div>

      {/* Mobile — node 32:1829. One control, not two: the design draws the amount and the add mark
          in a single box (32:1830), and both used to open the same balance overlay anyway. The
          design writes `$ 140.00`; the amount stays ours, in GBP, by the owner's decision of
          2026-09-10. */}
      <button
        type="button"
        onClick={openBalance}
        aria-label={`Balance ${total} — deposit or open balance details`}
        className={[
          'hidden h-10 shrink-0 items-center gap-1 rounded-lg bg-balance-btn px-2 mobile:flex',
          'font-flex text-sm leading-[18px] font-semibold tabular-nums text-primary',
          'transition-[filter] hover:brightness-125 active:brightness-90',
          FOCUS_RING,
        ].join(' ')}
      >
        {total}
        {/* `balance-add.svg` is the 24x24 frame 32:1833 with its 23.25 glyph at the frame's own
            0.375 inset, so the file carries both boxes and nothing here pads it. */}
        <Icon name="balance-add" width={24} height={24} className="size-6 shrink-0" />
      </button>
    </>
  )
}

export default function HeaderPostlogin() {
  return <AccountCluster tier="postlogin" />
}
