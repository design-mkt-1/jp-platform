'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import Button from '../primitives/Button'
import Icon from '../primitives/Icon'
import Sheet from '../primitives/Sheet'
import { VipBadge } from '../layout/HeaderPostlogin'
import { MenuGlyph } from '../layout/MobileNavBar'
import type { MenuGlyphName } from '../layout/MobileNavBar'
import { balances as BALANCES, profile as PROFILE, vipProfile as VIP_PROFILE } from '@/lib/data'
import { LOGO, languageFlag } from '@/lib/assets'
import { formatGbp } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'

/**
 * The account menu behind the centre action of the mobile tab bar: Figma nodes 1:8751 (pre-login),
 * 1:8260 (post-login) and 1:8503 (VIP).
 *
 * One component, not three. The three frames share every menu row, the legal strip, the two
 * support buttons and the chrome; they differ only in the block under the header — two auth
 * buttons versus a profile card — in whether the header shows a balance, and in whether a sign-out
 * row is drawn. Splitting that into three files would triplicate the eight menu rows, and the copy
 * that drifts is always the one nobody opens.
 *
 * Presented through `Sheet` so the focus trap, Escape, backdrop dismissal and focus restoration
 * come from the same implementation the desktop panels use.
 */

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

interface MenuRow {
  label: string
  glyph: MenuGlyphName
  href: string
  /** Nodes 1:8783, 1:8794 and 1:8867 carry a disclosure arrow; the other five do not. */
  chevron?: boolean
}

/** Nodes 1:8781 / 1:8792 — the two category rows, spaced 8px apart from each other. */
const CATEGORY_ROWS: MenuRow[] = [
  { label: 'Sport', glyph: 'sport', href: '/sport', chevron: true },
  { label: 'Casino', glyph: 'casino', href: '/', chevron: true },
]

/** Nodes 1:8834 to 1:8875 — the account rows, spaced 6px apart. */
const ACCOUNT_ROWS: MenuRow[] = [
  { label: 'Referral program', glyph: 'referral', href: '/referral' },
  { label: 'My Bonuses', glyph: 'bonuses', href: '/bonuses' },
  { label: 'Promotions', glyph: 'promotions', href: '/promos' },
  { label: 'Cashback', glyph: 'cashback', href: '/cashback' },
  { label: 'Payments', glyph: 'payments', href: '/payments', chevron: true },
  { label: 'Profile', glyph: 'profile', href: '/profile' },
]

const ROW_CLASSES = [
  'flex h-11 w-full items-center justify-between rounded-lg bg-elevated px-3',
  'transition-colors hover:bg-white/10',
  FOCUS_RING,
].join(' ')

/** Roboto Flex medium 13 uppercase, leading 20 — the label spec shared by all eight rows. */
const ROW_LABEL_CLASSES = 'font-flex text-[13px] font-medium uppercase leading-5 text-primary'

function MenuLink({ row, onNavigate }: { row: MenuRow; onNavigate: () => void }) {
  return (
    <li>
      <Link href={row.href} onClick={onNavigate} className={ROW_CLASSES}>
        <span className="flex min-w-0 items-center gap-2.5">
          <MenuGlyph name={row.glyph} size={15} strokeWidth={1.8} className="shrink-0 text-label" />
          <span className={`truncate ${ROW_LABEL_CLASSES}`}>{row.label}</span>
        </span>
        {row.chevron ? (
          <MenuGlyph name="chevron-down" size={20} className="shrink-0 text-secondary" />
        ) : null}
      </Link>
    </li>
  )
}

/**
 * Node 1:8772. The pre-login block. Written out rather than assembled from `Button` because the
 * design's neutral pill has no matching variant — the primitive's `outline` is a hairline on a
 * transparent fill — and forcing it would put two utilities of the same Tailwind family in one
 * class attribute, where the winner is decided by stylesheet order. See the change request.
 */
function AuthActions({ onNavigate }: { onNavigate: () => void }) {
  const base = `flex h-[38px] flex-1 items-center justify-center rounded-[20px] px-6 text-sm tracking-[-0.14px] transition-[filter] ${FOCUS_RING}`

  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-card px-4 py-3">
      <Link
        href="/login"
        onClick={onNavigate}
        className={`${base} bg-elevated font-semibold text-primary hover:brightness-150`}
      >
        Log In
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className={[
          base,
          'bg-gradient-gold font-bold text-page hover:brightness-110',
          'shadow-[0_4px_6px_color-mix(in_srgb,var(--gold-dark)_25%,transparent)]',
        ].join(' ')}
      >
        Sign In
      </Link>
    </div>
  )
}

/** Node 1:8285 (and 1:8528 in the VIP frame): avatar, identity, deposit, the ID field, "More". */
function ProfileCard({ vip }: { vip: boolean }) {
  const user = vip ? VIP_PROFILE : PROFILE
  const openPanel = useAppStore((state) => state.openPanel)
  const [copied, setCopied] = useState(false)

  // The confirmation is transient; without the reset a second copy would announce nothing.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyId = useCallback(() => {
    // Absent over plain http and in older browsers; failing quietly beats throwing at the user.
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(user.id).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }, [user.id])

  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-card px-4 pb-2 pt-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-3xl bg-elevated text-label"
        >
          <MenuGlyph name="user" size={24} />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {vip ? <VipBadge /> : null}
            {/* The design prints an account number here that the mock data does not carry; the
                email is the identifier it does have, and it keeps this line distinct from the ID
                field below instead of repeating it. See the change request. */}
            <span className="truncate text-[11px] font-medium text-caption">{user.email}</span>
          </div>
          <p className="truncate text-sm font-bold text-primary">{user.displayName}</p>
        </div>

        {/* The primitive's gold variant is 16px extra-bold; node 1:8295 is 12px. `!` because a
            plain override would depend on which font-size utility Tailwind emits last — the same
            call the header's deposit button already makes. */}
        <Button
          onClick={() => openPanel('balance')}
          className="!h-[38px] !w-[113px] !text-xs uppercase"
        >
          Deposit
        </Button>
      </div>

      {/* Node 1:8296 */}
      <div className="flex h-11 items-center justify-between rounded-lg bg-elevated px-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[17px] leading-[22px]">
          <span className="text-caption">ID:</span>
          <span className="truncate text-primary">{user.id}</span>
        </p>
        <button
          type="button"
          onClick={copyId}
          aria-label="Copy account ID"
          className={`flex size-[34px] shrink-0 items-center justify-center rounded-md bg-subtle text-label transition-colors hover:bg-white/10 ${FOCUS_RING}`}
        >
          <MenuGlyph name="copy" size={17} strokeWidth={1.7} />
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? 'Account ID copied' : ''}
      </span>

      {/* Node 1:8305. The design's disclosure has no second level in the data, so it opens the
          personal-information panel — the surface that actually holds "more". */}
      <button
        type="button"
        onClick={() => openPanel('personalInfo')}
        className={`mx-auto flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold text-gold-light hover:brightness-110 ${FOCUS_RING}`}
      >
        <MenuGlyph name="chevron-down" size={16} strokeWidth={2} />
        More
      </button>
    </div>
  )
}

export default function JackpotMenu() {
  const authMode = useAppStore((state) => state.authMode)
  const open = useAppStore((state) => state.panel === 'jackpotMenu')
  const closePanel = useAppStore((state) => state.closePanel)
  const setAuthMode = useAppStore((state) => state.setAuthMode)

  const signedIn = authMode !== 'prelogin'

  return (
    <Sheet open={open} onClose={closePanel} title="Jackpot menu" hideTitle anchor="top">
      {/* Node 1:8753 — the panel keeps its own header rather than borrowing the page's. */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <Image
          src={LOGO}
          alt="Jackpot"
          width={73}
          height={36}
          unoptimized
          className="h-9 w-[73px]"
        />
        <div className="flex items-center gap-2">
          {signedIn ? (
            <span className="text-sm font-bold text-gold-light">
              {formatGbp(BALANCES[authMode].totalGbp)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close menu"
            className={`flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-elevated ${FOCUS_RING}`}
          >
            <Icon name="close" width={20} height={20} className="size-5" />
          </button>
        </div>
      </div>

      {signedIn ? <ProfileCard vip={authMode === 'vip'} /> : <AuthActions onNavigate={closePanel} />}

      <nav aria-label="Account menu" className="mt-2.5">
        <ul className="flex flex-col gap-2">
          {CATEGORY_ROWS.map((row) => (
            <MenuLink key={row.href} row={row} onNavigate={closePanel} />
          ))}
        </ul>

        <ul className="mt-2 flex flex-col gap-1.5">
          {ACCOUNT_ROWS.map((row) => (
            <MenuLink key={row.href} row={row} onNavigate={closePanel} />
          ))}
        </ul>
      </nav>

      {/* Node 1:8885 */}
      <div className="mt-1 flex h-[46px] items-center border-b border-solid border-strong px-3">
        <Link
          href="/terms"
          onClick={closePanel}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded ${FOCUS_RING}`}
        >
          <MenuGlyph name="terms" size={22} className="shrink-0 text-label opacity-50" />
          <span className="font-flex text-[13px] font-medium uppercase leading-5 text-footer-heading">
            Terms of Use
          </span>
        </Link>

        {/* Language is fixed in the demo — the data is English/GBP throughout — so this is a
            statement of the current locale, not a switcher. */}
        <p className="flex flex-1 items-center justify-center gap-2.5">
          <Image
            src={languageFlag('gb')}
            alt=""
            width={24}
            height={24}
            unoptimized
            className="size-6 shrink-0 rounded-full border border-solid border-flag"
          />
          <span className="font-flex text-[13px] font-medium uppercase leading-5 text-footer-heading">
            English
          </span>
        </p>
      </div>

      {/* Nodes 1:8908 / 1:8910. The design paints these #10B981; `emerald` is the only token in
          that family. Its label is `text-page` rather than white because the token is a far
          brighter mint than the design's green and white on it is unreadable. */}
      <div className="flex items-center justify-center gap-2 px-3 py-4">
        <Link
          href="/support"
          onClick={closePanel}
          className={`flex h-[38px] w-[168px] items-center justify-center gap-1.5 rounded-full border border-solid border-emerald text-[13px] leading-[18px] text-emerald transition-colors hover:bg-elevated ${FOCUS_RING}`}
        >
          <MenuGlyph name="support" size={16} strokeWidth={1.8} />
          Support
        </Link>
        <Link
          href="/vip-manager"
          onClick={closePanel}
          className={`flex h-[38px] w-[168px] items-center justify-center gap-1.5 rounded-full bg-emerald text-[13px] leading-[18px] text-page transition-[filter] hover:brightness-110 ${FOCUS_RING}`}
        >
          <MenuGlyph name="whatsapp" size={16} strokeWidth={1.8} />
          Vip Manager
        </Link>
      </div>

      {/* Node 1:8473. Pre-login has nothing to sign out of, so the row is absent there. */}
      {signedIn ? (
        <button
          type="button"
          onClick={() => setAuthMode('prelogin')}
          className={`flex h-10 items-center gap-2.5 rounded px-6 ${FOCUS_RING}`}
        >
          <MenuGlyph name="signout" size={22} className="shrink-0 text-label" />
          <span className="font-flex text-[13px] font-medium uppercase leading-5 text-footer-heading">
            Sign out
          </span>
        </button>
      ) : null}
    </Sheet>
  )
}
