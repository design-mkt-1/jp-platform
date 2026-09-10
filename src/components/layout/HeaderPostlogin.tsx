'use client'

import Button from '../primitives/Button'
import Icon from '../primitives/Icon'
import { balances as BALANCES, profile as PROFILE, vipProfile as VIP_PROFILE } from '@/lib/data'
import { formatGbp } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import type { AuthMode } from '@/lib/types'

/**
 * The right-hand cluster of the header for a signed-in player: Figma node 1:4272 on desktop
 * (balance pill, DEPOSIT, profile pill) and node 1:5736 on mobile (emerald balance pill with its
 * own deposit action).
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
        'bg-gradient-gold text-[11px] font-bold uppercase tracking-[1.5px] text-page',
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

      {/* Mobile — node 1:5736. Two controls inside one outlined shell: a button cannot nest inside
          a button, so the shell is a plain element and the label and the action are siblings. */}
      <div
        className={[
          'hidden h-10 items-center gap-3 rounded-[22px] px-2 py-1 mobile:flex',
          'border-[1.5px] border-solid border-[color:color-mix(in_srgb,var(--emerald)_50%,transparent)]',
          'bg-[color:color-mix(in_srgb,var(--emerald)_4%,transparent)]',
          'shadow-[0_2px_8px_color-mix(in_srgb,var(--emerald)_12%,transparent)]',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={openBalance}
          aria-label={`Balance ${total} — open balance details`}
          // The label's own box is only the 20px line box; the padding gives it the shell's full
          // 40px height as hit area and the negative margin hands the 10px back to the flex row,
          // so the painted shell does not move. Same idiom as the search field's clear button.
          className={`-my-2.5 rounded-full px-1 py-2.5 text-sm font-extrabold tabular-nums tracking-[-0.14px] text-emerald ${FOCUS_RING}`}
        >
          {total}
        </button>

        <button
          type="button"
          onClick={openBalance}
          aria-label="Deposit"
          className={[
            // No text colour: `plus.svg` is a flat white stroke (node 1:5741), not a currentColor
            // outline, so nothing here can tint it.
            'flex size-8 shrink-0 items-center justify-center rounded-[20px]',
            'border border-solid border-[color:color-mix(in_srgb,var(--text-primary)_40%,transparent)]',
            // Explicit `image:` hint so Tailwind cannot mistake the gradient for a colour.
            'bg-[image:linear-gradient(90deg,var(--emerald),var(--action-blue))]',
            // Node 21:2916 casts two shadows, not one: a blue at 6/14 under an emerald at 10/18.
            // Only the emerald was here, so the button sat on half its designed glow. Both are the
            // design's own colours at 20%; see `--action-blue` in globals.css for why the blue is
            // its own value rather than `--blue`. Owner's decision 2026-09-10.
            'shadow-[0_6px_14px_color-mix(in_srgb,var(--action-blue)_20%,transparent),0_10px_18px_color-mix(in_srgb,var(--emerald)_20%,transparent)]',
            FOCUS_RING,
          ].join(' ')}
        >
          <Icon name="plus" width={16} height={16} className="size-4" />
        </button>
      </div>
    </>
  )
}

export default function HeaderPostlogin() {
  return <AccountCluster tier="postlogin" />
}
