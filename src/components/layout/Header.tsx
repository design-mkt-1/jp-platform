'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { LOGO } from '@/lib/assets'
import Icon from '../primitives/Icon'
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

const NAV_ITEM_BASE = 'rounded-md px-2.5 py-2 text-[13px] uppercase transition-colors'
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
function Brand() {
  return (
    <Link
      href="/"
      aria-label="Jackpot — home"
      className={`flex h-14 w-[120px] shrink-0 items-center mobile:h-9 mobile:w-[77px] ${FOCUS_RING}`}
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

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search games"
      className={`hidden size-10 shrink-0 items-center justify-center rounded-full hover:bg-elevated mobile:flex ${FOCUS_RING}`}
    >
      <Icon name="search" width={20} height={20} className="size-5" />
    </button>
  )
}

export default function Header() {
  const authMode = useAppStore((state) => state.authMode)
  const pathname = usePathname()
  const Variant = VARIANTS[authMode]

  return (
    // Node 1:4245: the bar is painted darker than the page behind it and closed with its own rule,
    // both of which now have tokens of their own.
    <header className="w-full border-b border-solid border-header bg-header">
      <div className="mx-auto flex h-20 max-w-shell items-center justify-between px-page-x mobile:h-[60px] mobile:px-4">
        <div className="flex items-center gap-10">
          <Brand />

          <nav aria-label="Primary" className="mobile:hidden">
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

        <div className="flex items-center gap-3.5 mobile:gap-0.5">
          <Variant />
          <MobileSearchButton />
        </div>
      </div>
    </header>
  )
}
