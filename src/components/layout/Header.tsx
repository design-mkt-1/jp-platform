'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
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
 * The design's wordmark is a vector that was never exported to `public/images/`, and this component
 * may not add files there. It is drawn as type in the display face over the brand gradient instead
 * of shipping a screenshot — see the report's change request for the missing asset.
 */
function Brand() {
  return (
    <Link
      href="/"
      aria-label="Jackpot — home"
      className={`flex h-14 w-[120px] shrink-0 items-center mobile:h-9 mobile:w-[77px] ${FOCUS_RING}`}
    >
      <span
        aria-hidden
        className={[
          'bg-gradient-gold bg-clip-text text-transparent',
          'font-display text-[26px] font-extrabold uppercase leading-none tracking-[0.5px]',
          'mobile:text-[17px]',
        ].join(' ')}
      >
        Jackpot
      </span>
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
    // `bg-quaternary` rather than `bg-page`: the design paints the bar a shade darker than the page
    // behind it, and quaternary is the only token in that range. See the report's deviations.
    <header className="w-full border-b border-solid border-card bg-quaternary">
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
