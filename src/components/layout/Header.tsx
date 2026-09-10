'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { ComponentType } from 'react'
import { LOGO } from '@/lib/assets'
import Icon from '../primitives/Icon'
import IconButton from '../primitives/IconButton'
import HeaderNavMenu from './HeaderNavMenu'
import HeaderPostlogin from './HeaderPostlogin'
import HeaderPrelogin from './HeaderPrelogin'
import HeaderVip from './HeaderVip'
import { useAppStore } from '@/store/useAppStore'
import type { AuthMode } from '@/lib/types'

/**
 * The top bar of Figma nodes 1:2432 / 1:4244 (desktop, 1440x80) and 1:5722 / 1:6980
 * (mobile, 390x60).
 *
 * Brand, primary navigation and the mobile search control are byte-identical in all three account
 * states, so they live here once. Only the right-hand cluster changes with `authMode`, and that is
 * what the three variant components own — which is why this file has no nested state branches.
 * The variant is looked up in a record rather than chosen by a ternary chain so adding a fourth
 * account state is a data change, not a rewrite of this component.
 *
 * Client-side because it reads `authMode` and the current path, and because the mobile search
 * control dispatches into the store.
 */

const VARIANTS: Record<AuthMode, ComponentType> = {
  prelogin: HeaderPrelogin,
  postlogin: HeaderPostlogin,
  vip: HeaderVip,
}

interface NavItem {
  label: string
  href: string
}

/**
 * Node 1:4259. Only `/` is implemented in the demo; the other five carry the path the design
 * implies so the markup does not have to be rewritten once those routes land.
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Casino', href: '/' },
  { label: 'Live Casino', href: '/live-casino' },
  { label: 'Sport', href: '/sport' },
  { label: 'Promos', href: '/promos' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Cashback', href: '/cashback' },
]

const NAV_ITEM_BASE =
  'block whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] leading-4 uppercase transition-colors'
const NAV_ITEM_ACTIVE = 'font-bold text-gold'
const NAV_ITEM_IDLE = 'font-semibold text-nav hover:text-primary'

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

/**
 * The exported wordmark. `src/lib/assets.ts` is frozen and has no slot for it, and the Icon
 * primitive is scoped to `images/icons/` on purpose, so the path is named once here rather than
 * inlined at the use site. See the report's change request for moving it into assets.ts.
 */
const LOGO_SRC = LOGO

/**
 * Node 1:4250. Figma draws the 113.38x56.001 wordmark inside a 120.003x56.001 box, so the box and
 * the drawing stay two elements: collapsing them would pull the nav 6.6px left of the design.
 *
 * `unoptimized` because Next's optimizer refuses SVG sources unless the project opts into
 * `images.dangerouslyAllowSVG` — the same call the Icon primitive makes and for the same reason.
 * `priority` because the mark is the first thing painted above the fold.
 */
function Brand({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Jackpot — home"
      className={`flex h-14 w-[120px] shrink-0 items-center mobile:h-9 mobile:w-[77px] ${FOCUS_RING} ${className}`}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={113}
        height={56}
        unoptimized
        priority
        className="h-14 w-[113.38px] object-contain mobile:h-9 mobile:w-[72.87px]"
      />
    </Link>
  )
}

/**
 * Node 1:5743 / 1:7000. Desktop has no search control in the bar — there the field belongs to the
 * category strip below it — so this is the one part of the chrome that is mobile-only.
 */
function MobileSearchButton() {
  const openSearch = useAppStore((state) => state.openSearch)

  // `hidden` beats the primitive's own `flex` (Tailwind emits `.hidden` after `.flex`), and the
  // `mobile:` variant beats both, so the button exists under 768px and is absent above it.
  //
  // `disc={false}`: node 21:2919 is a bare magnifier. Its asset, `search_header.svg`, is a single
  // white `<path>` — no rect, no radius — with the glyph filling 18 of a 40x40 box. Owner's
  // decision of 2026-09-10. The 40x40 box is unchanged, so the touch target does not shrink.
  //
  // The disc went but the glyph stayed `search`, the grey #A2A2A6 16px outline of the search
  // fields, drawn at 20. The live frames `32:1838` (signed in) and `32:3536` (signed out) both
  // export that same white 40x40 file, so it is served as it is, box and all.
  return (
    <IconButton
      onClick={openSearch}
      aria-label="Search games"
      disc={false}
      className="hidden mobile:flex"
    >
      <Icon name="search-header" width={40} height={40} className="size-10" />
    </IconButton>
  )
}

export default function Header() {
  const authMode = useAppStore((state) => state.authMode)
  const pathname = usePathname()
  const Variant = VARIANTS[authMode]

  /*
   * Where focus goes after a sign out.
   *
   * `PersonalInfoPanel`'s Sign out row calls `setAuthMode('prelogin')`, and that one state change
   * both closes the panel and swaps this cluster. The username pill the panel hung off is gone by
   * the time `useOverlayBehavior` tries to hand focus back, so its `isConnected` test finds nothing
   * on either the early or the late capture and focus falls to `<body>` — measured at 1440 on
   * 2026-09-10. Nothing inside the panel can fix it: the replacement does not exist until React has
   * committed. This component spans both sides of the swap, so it is the one that can.
   *
   * Owner's decision of 2026-09-10: the log-in control. Picked by `offsetParent` because
   * `HeaderPrelogin` renders two of them behind a breakpoint and `focus()` on the hidden one would
   * do nothing at all, quietly.
   *
   * Arriving straight on `?auth=prelogin` must not count as a sign out. The first render cannot
   * say so: the store starts signed in and `UrlStateBridge` flips it one commit later, which read
   * as signed-in -> signed-out and put a focus ring on Log In on every such load (seen on the
   * deployed build, 2026-09-10). So the first run takes the starting state from the URL instead.
   */
  const wasSignedIn = useRef<boolean | null>(null)

  useEffect(() => {
    const signedIn = authMode !== 'prelogin'
    if (wasSignedIn.current === null) {
      wasSignedIn.current = new URLSearchParams(window.location.search).get('auth') !== 'prelogin'
      return
    }
    const justSignedOut = wasSignedIn.current && !signedIn
    wasSignedIn.current = signedIn
    if (!justSignedOut) return

    const controls = document.querySelectorAll<HTMLElement>('[data-login-control]')
    for (const control of controls) {
      if (control.offsetParent === null) continue
      control.focus()
      return
    }
  }, [authMode])

  return (
    // Node 1:4245: the bar is painted darker than the page behind it and closed with its own rule,
    // both of which now have tokens of their own. `1:4245` lives under the *desktop* header board
    // `1:4244` (1440x200), so only the fill crosses the breakpoint — the mobile header `21:2898` is
    // 390x60 with no bottom rule at all. Measured on the static export against the render of
    // `21:2897`: Figma row y=60 is a single `#0f121d` across all 390 (the page), and row y=59 at
    // x=8 is the header's own `#080814`, so there is no rule tucked inside the 60 either. Ours
    // painted `#18273a` at y=60 and the `<header>` measured 61 against the design's 60.
    //
    // One `mobile:` utility per Tailwind family, the same shape the category capsule uses:
    // `mobile:border-0` is the *width* family, so it never competes with `border-solid` (style).
    // Against the unprefixed `border-b` the order is defined — verified here with
    // `getComputedStyle` and by sampling row y=60, not by reading the diff.
    <header className="w-full border-b border-solid border-header bg-header mobile:border-0">
      {/*
        `mobile:px-4` is 16 on both sides, and the design is not: container `21:2899` starts at
        x=16 and its logo child sits at a further x=10, while the right-hand cluster ends 10 short
        of the container's own edge — an effective 26 left / 10 right. Measured 2026-09-10.

        Kept symmetric by the owner's decision of the same day, and it is a decision rather than an
        oversight: whether that x=10 is intent or an auto-layout child nobody moved is **unknown**,
        and 16 is what the category track and the hero card below already use. Adopting 26/10 on the
        strength of one node would put the header out of line with every row under it.
      */}
      <div className="relative mx-auto flex h-20 max-w-shell items-center justify-between gap-4 px-page-x mobile:h-[60px] mobile:gap-0 mobile:px-4">
        {/*
          `min-w-0` so this group is allowed to shrink. Between 768 and 1279 px — a range the Figma
          file has no frame for, since it draws only 390 and 1440 — the bar needed 1191 px and
          neither side gave way, so the whole document grew a horizontal scrollbar and the account
          controls sat off the right edge: at 768 the balance, Deposit and the account menu were
          simply unreachable. Nothing here changes at 1440; the design's own width still fits.
        */}
        <div className="flex min-w-0 items-center gap-4 xl:gap-10">
          {/* Signed out, the phone header `32:3532` centres the logo (`32:3538`, 77x36 at
              `left: 50%`) and carries nothing on the left: the auth pair moved to the strip above
              the tab bar. Signed in, `32:1815` keeps it on the left beside the balance. */}
          <Brand
            className={
              authMode === 'prelogin' ? 'mobile:absolute mobile:left-1/2 mobile:-translate-x-1/2' : ''
            }
          />

          {/*
            The nav is what yields. It scrolls sideways inside the header rather than pushing the
            money controls out of the viewport — the links are all reachable either way, the
            balance and Deposit are not. `scrollbar-width: none` keeps the strip looking the same
            at widths where it does not scroll at all.
          */}
          {/*
            Between 768 and 1279 the six links collapse into a burger. The scroller below stayed
            correct — nothing overflowed — but it was unusable: measured on the deployed build at
            768 it was a 33px window onto 569px of links, so the header rendered `CAS`, clipped
            mid-word, and nothing signalled that the strip could be dragged. Owner's decision,
            2026-09-09, after four treatments were rendered side by side at 768, 1024 and 1279.
          */}
          <HeaderNavMenu items={NAV_ITEMS} />

          <nav
            aria-label="Primary"
            className="hidden min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:block"
          >
            <ul className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      // Four of the five secondary sections have no screen in the design, so
                      // prefetching them only fills the console with 404s on the static build.
                      // They still resolve — to the demo's own not-found page.
                      prefetch={false}
                      // The gold tint is the only cue for the current section, and colour alone
                      // never reaches a screen reader.
                      aria-current={active ? 'page' : undefined}
                      className={`${NAV_ITEM_BASE} ${active ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE} ${FOCUS_RING}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* `shrink-0`: the balance, Deposit and account menu keep their full size at every width. */}
        <div className="flex shrink-0 items-center gap-3.5 mobile:gap-0.5">
          <Variant />
          <MobileSearchButton />
        </div>
      </div>
    </header>
  )
}
