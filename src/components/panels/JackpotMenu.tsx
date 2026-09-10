'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import Button from '../primitives/Button'
import Icon from '../primitives/Icon'
import IconButton from '../primitives/IconButton'
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
 * 13:2307 (post-login) and 13:2519 (VIP).
 *
 * The post-login and VIP frames were rebuilt in Figma on 2026-09-09 and carry new ids; the two they
 * replace, 1:8260 and 1:8503, no longer resolve. Nothing in the repo can notice that on its own —
 * `screens.test.ts` checks the shape of a node id, not whether Figma still has it.
 *
 * One component, not three. The three frames share every menu row, the legal strip, the support
 * button and the chrome; they differ only in the block under the header — two auth buttons versus
 * a profile card — in whether the header shows a balance, and in whether Sign out is drawn beside
 * Support. Splitting that into three files would triplicate the eight menu rows, and the copy that
 * drifts is always the one nobody opens.
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
}

/** Nodes 1:8781 / 1:8792 — the two category rows, spaced 8px apart from each other. */
const CATEGORY_ROWS: MenuRow[] = [
  { label: 'Sport', glyph: 'sport', href: '/sport' },
  { label: 'Casino', glyph: 'casino', href: '/' },
]

/** Nodes 1:8834 to 1:8875 — the account rows, spaced 6px apart. */
const ACCOUNT_ROWS: MenuRow[] = [
  { label: 'Referral program', glyph: 'referral', href: '/referral' },
  { label: 'My Bonuses', glyph: 'bonuses', href: '/bonuses' },
  { label: 'Promotions', glyph: 'promotions', href: '/promos' },
  { label: 'Cashback', glyph: 'cashback', href: '/cashback' },
  { label: 'Payments', glyph: 'payments', href: '/payments' },
  { label: 'Profile', glyph: 'profile', href: '/profile' },
]

/*
 * Node 13:2362 fills a row with a flat `#222431`, which is `bg-menu-row`.
 *
 * It used to be `bg-elevated` — white at 6% — and that was indistinguishable from the design while
 * the panel was `--bg-card`: 6% over #151624 composites to #232431, one unit off what Figma paints.
 * Moving the panel to #0D1420 would have dropped the same 6% to #1C222D and quietly broken a row
 * colour that was right. A translucent fill only ever matches by agreeing with the surface under
 * it; the opaque token is what the node actually specifies.
 */
const ROW_CLASSES = [
  'flex h-11 w-full items-center justify-between rounded-lg bg-menu-row px-3',
  'transition-colors hover:bg-white/10',
  FOCUS_RING,
].join(' ')

/** Roboto Flex medium 13 uppercase, leading 20 — the label spec shared by all eight rows. */
const ROW_LABEL_CLASSES = 'font-flex text-[13px] font-medium uppercase leading-5 text-primary'

function MenuLink({ row, onNavigate }: { row: MenuRow; onNavigate: () => void }) {
  return (
    <li>
      {/* Seven of the eight rows point at routes this demo does not have — only Casino's `/` is
          real — so Next's default prefetch asks the static export for seven pages that are not
          there. Measured on the deployed build: with the menu open the page accumulates one failed
          `<route>/index.txt?_rsc=` per dead link, twenty-two of them pre-login once `/login` and
          `/register` join in. The bar and the header already opt out the same way. */}
      <Link href={row.href} onClick={onNavigate} prefetch={false} className={ROW_CLASSES}>
        <span className="flex min-w-0 items-center gap-2.5">
          <MenuGlyph name={row.glyph} size={15} strokeWidth={1.8} className="shrink-0 text-label" />
          <span className={`truncate ${ROW_LABEL_CLASSES}`}>{row.label}</span>
        </span>
      </Link>
    </li>
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
    // Node 13:2333 sits at x=16, y=12 on the panel with no fill of its own; the `rounded-[10px]
    // bg-card` this used to carry is gone: the rebuilt frames paint nothing behind it.
    <div className="flex flex-col gap-2 px-4 pb-2 pt-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-3xl bg-elevated text-label"
        >
          <MenuGlyph name="user" size={24} />
        </span>

        {/*
         * Nodes 13:2338 (post-login) and 13:2550 (VIP).
         *
         * This block used to print the email above the name. That was the right call while it
         * lasted: the design had no username to show and the mock data had no account number, so
         * the email was the only identifier we had, and putting it here kept the line from simply
         * repeating the ID field below. The rebuilt frames have both — the name is now spelled out
         * as `luckytest1234567` and the ID field carries 23885 — so the stand-in is retired and the
         * email is gone from the menu.
         *
         * Post-login is one line: node 13:2338 is 173x17 with node 13:2339, the name, as its only
         * child. VIP is 173x44 and stacks the badge on its own line *above* the name (node 13:2552
         * at y=0, the name at y=27) rather than setting it beside it, which is what this drew
         * before. The type was already right: `text-sm font-bold text-primary` is the Inter Bold 14
         * white that node 13:2339 asks for.
         */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {vip ? (
            <span className="flex min-w-0">
              <VipBadge />
            </span>
          ) : null}
          <p className="truncate text-sm font-bold text-primary">{user.displayName}</p>
        </div>

        {/* Node 13:2340 repaints this button green — the rebuilt frames took it off the gold ramp
            — and fixes it at 113x38. The `deposit` variant carries the fill, the radius and the
            label colour; the size stays 12px extra-bold, where the variant's native `cta` metrics
            are 16. `!` because a plain override would depend on which font-size utility Tailwind
            emits last — the same call the header's deposit button already makes. */}
        <Button
          variant="deposit"
          onClick={() => openPanel('balance')}
          className="!h-[38px] !w-[113px] !text-xs uppercase"
        >
          Deposit
        </Button>
      </div>

      {/* Node 13:2342, 358x44, and the same flat `#222431` as a menu row — see ROW_CLASSES. The
          value comes from `src/data/user.json`, which now carries the `23885` node 13:2345 prints
          instead of the `user-luckytest` slug it held while the design had no account number to
          copy from. */}
      <div className="flex h-11 items-center justify-between rounded-lg bg-menu-row px-2">
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
    <Sheet
      open={open}
      onClose={closePanel}
      title="Jackpot menu"
      hideTitle
      anchor="top"
      // The three frames draw one dark screen from the top of the phone down to a lit tab bar with
      // `Menu` active. Sized by its content the sheet left 213px of live page showing pre-login and
      // 87px post-login, and its scrim greyed the bar out and ate the taps meant for it.
      clearsNavBar
      // Sampled from the frames: the panel, the strip below it and the tab bar are all #0D1420 —
      // one surface, which is why the design reads as full-screen. Our bar was already painted
      // that way (`bg-quaternary`, the file's one Figma variable); the panel was `--bg-card`
      // #151624 and is the piece that was out of step.
      surface="quaternary"
    >
      {/* Node 1:8753 — the panel keeps its own header rather than borrowing the page's. */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <Image
          src={LOGO}
          alt="Jackpot"
          width={73}
          height={36}
          unoptimized
          className="h-9 w-[73px]"
        />
        <div className="flex items-center gap-2">
          {/*
           * Node 13:2325: an 8/4-padded pill at radius 22, filled with a 4% green so faint it
           * reads as a shade of the panel, holding Inter Extra Bold 14 in #F0C775 — already our
           * `gold-light` — under a gold-dark 25% text shadow. That shadow goes through
           * `color-mix` the way `Button` tints its glows, rather than minting a fifth gold.
           *
           * Not a button, despite the layer being named "Emerald Outlined Button" in Figma. It
           * carries no affordance: the desktop header's balance pill has a chevron
           * (`PillAffordance` in HeaderPostlogin) and this has nothing, so it stays the label it
           * has always been rather than growing a click target the design does not draw. That
           * header pill is also filled `bg-card`, which would now stand out as a lighter block
           * against this panel — another reason not to reuse it here.
           */}
          {signedIn ? (
            <span className="rounded-[22px] bg-balance-chip px-2 py-1 text-sm font-extrabold tracking-[-0.14px] text-gold-light [text-shadow:0_4px_12px_color-mix(in_srgb,var(--gold-dark)_25%,transparent)]">
              {formatGbp(BALANCES[authMode].totalGbp)}
            </span>
          ) : null}
          <IconButton onClick={closePanel} aria-label="Close menu">
            <Icon name="close" width={20} height={20} className="size-5" />
          </IconButton>
        </div>
      </div>

      {/* Signed out, node 32:5279 has no auth pair inside the menu: Log In and Sign In are the strip
          on top of the tab bar, which this sheet stops above (`--mobile-auth-h`). */}
      {signedIn ? <ProfileCard vip={authMode === 'vip'} /> : null}

      <nav aria-label="Account menu" className="mt-1.5">
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
      <div className="flex h-[46px] items-center border-b border-solid border-strong px-3">
        <Link
          href="/terms"
          onClick={closePanel}
          prefetch={false}
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

      {/* Node 13:2486 — one row holding exactly two things, Sign out then Support, 8px apart. The
          rebuilt frames dropped the solid green *Vip Manager* button that used to sit beside
          Support and moved Sign out up off its own row. Pre-login draws the same row with the
          second slot marked `hidden` (node 1:8910) and Support centred at x=95 of 358, which is
          what `justify-center` gives once Sign out is absent — no second rule needed.

          `items-stretch` rather than a height on each button, because that is how Figma arrives at
          its own two numbers: Sign out is 22px of icon inside 10px padding, so 42, and Support is
          18px of label inside the same padding, so 38 on its own — but stretched to 42 when Sign
          out stands next to it. Node 13:2492 measures 168x42, node 1:8908 measures 168x38.

          `py-2` rather than the 16 node 13:2486 pads by. At 390x844 the box a top-anchored sheet
          gets is 760px and this menu came to 804, so Sign out fell outside it and was reachable
          only by scrolling. 28px came out of four paddings — this one, the header's `mb`, the
          nav's `mt` and the divider row's `mt` — and 20 more out of the sheet's own insets. The
          row heights and the 6px account-row gaps Figma sets are untouched. */}
      <div className="flex items-stretch justify-center gap-2 px-3 py-2">
        {/* Node 13:2487. `#FF787A` is the only red in the design and has no relative — it is
            `--text-signout`, added with this frame. 7.22:1 on the panel. */}
        {signedIn ? (
          <button
            type="button"
            onClick={() => setAuthMode('prelogin')}
            className={`flex items-center justify-center gap-2.5 rounded-full px-5 py-2.5 font-flex text-[13px] uppercase leading-5 text-signout transition-colors hover:bg-elevated ${FOCUS_RING}`}
          >
            <MenuGlyph name="signout" size={22} className="shrink-0" />
            Sign out
          </button>
        ) : null}

        {/* Nodes 13:2492 / 1:8908. The design paints this #10B981; `emerald` is the only token in
            that family and it is a far brighter mint. Keeping the design's green here is not part
            of this change — see docs/tokens.md.

            `py-[9px]` and not the 10 Figma pads by, because Figma leaves the 1px stroke outside the
            38 it measures and CSS puts it inside: 18 of label + 20 of padding + 2 of border renders
            40. Nine each side lands the pre-login pill on the design's 38 exactly, and post-login
            the row stretches it to 42 regardless — padding does not fight `align-self: stretch` the
            way a fixed height would. */}
        <Link
          href="/support"
          onClick={closePanel}
          prefetch={false}
          className={`flex w-[168px] items-center justify-center gap-1.5 rounded-full border border-solid border-emerald px-5 py-[9px] text-[13px] leading-[18px] text-emerald transition-colors hover:bg-elevated ${FOCUS_RING}`}
        >
          <MenuGlyph name="support" size={16} strokeWidth={1.8} />
          Support
        </Link>
      </div>
    </Sheet>
  )
}
