'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * The bottom tab bar of Figma node 1:8235 (390x84): four routes around a raised centre action that
 * opens the Jackpot menu.
 *
 * Mobile only. The desktop frames have no equivalent — navigation there lives in the header — so
 * the whole bar is behind the `mobile:` breakpoint rather than being hidden by a page-level wrapper.
 *
 * Client-side because the active tab follows the route and the centre action dispatches into the
 * store.
 *
 * ## Why the glyphs are drawn here instead of imported
 *
 * None of the five tab marks, and none of the eight menu marks, were exported to
 * `public/images/icons/` in wave 1, and this component may not add files under `public/`. The two
 * that do have a near match (`slots.svg`, `live-casino.svg`) are unusable anyway: they were
 * exported as flattened fills — `slots.svg` even carries the Figma artboard rectangle — so they
 * cannot take the amber tint the active tab needs. The project already answers this the same way
 * in `HeaderPostlogin` (chevron, plus) and `CategoryNavBar` (the cyan light), so the marks are
 * redrawn on `currentColor` and the missing exports are raised as a change request.
 *
 * `MenuGlyph` is exported because `JackpotMenu` draws from the same set. One source of truth beats
 * two files whose stroke weights drift apart; it lives here because this is the smaller of the two.
 */

export type MenuGlyphName =
  | 'casino'
  | 'live-casino'
  | 'sport'
  | 'promotions'
  | 'burger'
  | 'referral'
  | 'bonuses'
  | 'cashback'
  | 'payments'
  | 'profile'
  | 'terms'
  | 'signout'
  | 'copy'
  | 'chevron-down'
  | 'user'
  | 'support'
  | 'whatsapp'

/** Head and shoulders, shared by the avatar disc and the referral row. */
const PERSON = (
  <>
    <circle cx="12" cy="8.7" r="3.5" />
    <path d="M5.4 19.6c0-3.35 2.95-5.7 6.6-5.7s6.6 2.35 6.6 5.7" />
  </>
)

const GLYPHS: Record<MenuGlyphName, ReactNode> = {
  // Slot cabinet: body, window, two reel dividers, top panel and side lever.
  casino: (
    <>
      <path d="M5.2 9h13.6a1.2 1.2 0 0 1 1.2 1.2v7.6a1.2 1.2 0 0 1-1.2 1.2H5.2A1.2 1.2 0 0 1 4 17.8v-7.6A1.2 1.2 0 0 1 5.2 9Z" />
      <path d="M6.8 11.4h10.4v4.2H6.8z" />
      <path d="M10.27 11.4v4.2M13.73 11.4v4.2" />
      <path d="M7.6 9V6.6a1.2 1.2 0 0 1 1.2-1.2h6.4a1.2 1.2 0 0 1 1.2 1.2V9" />
      <path d="M20 11.6h1.4a.6.6 0 0 1 .6.6v2a.6.6 0 0 1-.6.6H20" />
    </>
  ),
  'live-casino': (
    <>
      <path d="M10 5.6h7.2a1.8 1.8 0 0 1 1.8 1.8v9.8a1.8 1.8 0 0 1-1.8 1.8H10a1.8 1.8 0 0 1-1.8-1.8V7.4A1.8 1.8 0 0 1 10 5.6Z" />
      <path d="M5.7 8.7a1.8 1.8 0 0 0-1.15 2.25l1.9 5.85" />
      <path d="M13.6 9.9c-.75-.86-2.1-.35-2.1.7 0 1.05 1.4 2.05 2.1 2.6.7-.55 2.1-1.55 2.1-2.6 0-1.05-1.35-1.56-2.1-.7Z" />
    </>
  ),
  sport: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 8.05l3.28 2.38-1.25 3.85h-4.06L8.72 10.43Z" />
      <path d="M12 8.05V3.8M14.03 14.28l2.5 3.45M9.97 14.28l-2.5 3.45M15.28 10.43l4.05-1.32M8.72 10.43 4.67 9.11" />
    </>
  ),
  promotions: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M15.2 8.8 8.8 15.2" />
      <circle cx="9.9" cy="9.9" r="1.35" />
      <circle cx="14.1" cy="14.1" r="1.35" />
    </>
  ),
  /** Node 1:8239: three 2px bars in a 20x18 box. Pass `strokeWidth={2.6}` to match. */
  burger: <path d="M2 3h20M2 12h20M2 21h20" />,
  referral: PERSON,
  bonuses: (
    <>
      <path d="M4.6 10.4h14.8v3.2H4.6z" />
      <path d="M6.2 13.6v5.2a1 1 0 0 0 1 1h9.6a1 1 0 0 0 1-1v-5.2" />
      <path d="M12 10.4v9.4" />
      <path d="M12 10.4S10.9 6.4 8.9 6.4a2 2 0 1 0 0 4M12 10.4s1.1-4 3.1-4a2 2 0 1 1 0 4" />
    </>
  ),
  cashback: (
    <path d="M4.4 8.6 7.6 13.2 12 6.4l4.4 6.8 3.2-4.6v8.6a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4Z" />
  ),
  payments: (
    <>
      <path d="M4.6 8.4a2 2 0 0 1 2-2h10.8a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H6.6a2 2 0 0 1-2-2Z" />
      <path d="M15 11.9h4.4v3.4H15a1.7 1.7 0 0 1 0-3.4Z" />
    </>
  ),
  profile: (
    <>
      <circle cx="10.4" cy="8.4" r="3.4" />
      <path d="M4 19.4c0-3.3 2.87-5.6 6.4-5.6 1.1 0 2.14.22 3.03.62" />
      <path d="M16.2 15.6H21M16.2 19h4.8" />
    </>
  ),
  terms: (
    <>
      <path d="M6.6 3.8h7.6l4 4v12.4a1.4 1.4 0 0 1-1.4 1.4H6.6a1.4 1.4 0 0 1-1.4-1.4V5.2a1.4 1.4 0 0 1 1.4-1.4Z" />
      <path d="M14.2 3.8v4.2h4" />
      <path d="M8.4 13h7.2M8.4 16.4h4.8" />
    </>
  ),
  signout: (
    <>
      <path d="M10.2 4.6H6.6a1.6 1.6 0 0 0-1.6 1.6v11.6a1.6 1.6 0 0 0 1.6 1.6h3.6" />
      <path d="M19.4 12H9.6M12.6 8.6 9.2 12l3.4 3.4" />
    </>
  ),
  copy: (
    <>
      <path d="M9.8 8.4h7.4a1.6 1.6 0 0 1 1.6 1.6v7.4a1.6 1.6 0 0 1-1.6 1.6H9.8a1.6 1.6 0 0 1-1.6-1.6V10a1.6 1.6 0 0 1 1.6-1.6Z" />
      <path d="M15.2 8.4V6.6A1.6 1.6 0 0 0 13.6 5H6.8a1.6 1.6 0 0 0-1.6 1.6v6.8a1.6 1.6 0 0 0 1.6 1.6h1.4" />
    </>
  ),
  'chevron-down': <path d="M6.5 9.75 12 15.25l5.5-5.5" />,
  user: PERSON,
  support: (
    <>
      <path d="M5.2 13.4v-1.2a6.8 6.8 0 0 1 13.6 0v1.2" />
      <path d="M5.2 13.4h1.5a1.4 1.4 0 0 1 1.4 1.4v2.2a1.4 1.4 0 0 1-1.4 1.4H5.2Z" />
      <path d="M18.8 13.4h-1.5a1.4 1.4 0 0 0-1.4 1.4v2.2a1.4 1.4 0 0 0 1.4 1.4h1.5Z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20 11.8a8 8 0 0 1-11.94 6.95L4.2 19.8l1.1-3.8A8 8 0 1 1 20 11.8Z" />
      <path d="M9.6 9.4c.2-.45.4-.45.66-.46h.45c.15 0 .35 0 .53.42l.58 1.36c.1.2.02.4-.1.55l-.36.44c-.12.15-.2.28-.1.47.28.65 1.1 1.47 1.75 1.75.2.1.32.02.47-.1l.44-.36c.15-.12.35-.2.55-.1l1.36.58c.42.18.42.38.42.53v.45c-.01.26-.01.46-.46.66-.38.17-.94.25-1.4.17-.94-.16-2.2-.9-3.13-1.83-.93-.93-1.67-2.19-1.83-3.13-.08-.46 0-1.02.17-1.4Z" />
    </>
  ),
}

export interface MenuGlyphProps {
  name: MenuGlyphName
  /** Rendered box in px. Every glyph is authored in the same 24-unit grid so sizes stay honest. */
  size?: number
  strokeWidth?: number
  className?: string
}

export function MenuGlyph({ name, size = 22, strokeWidth = 1.6, className }: MenuGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {GLYPHS[name]}
    </svg>
  )
}

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

/** Node 1:8244 and siblings: a 64px column, 22px mark, 4px gap, 10px label. */
const TAB_CLASSES = `relative flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg py-1 ${FOCUS_RING}`

interface Tab {
  label: string
  href: string
  glyph: MenuGlyphName
}

/** Hrefs match `Header`'s primary nav so the two never disagree about where a section lives. */
const TABS: readonly [Tab, Tab, Tab, Tab] = [
  { label: 'Casino', href: '/', glyph: 'casino' },
  { label: 'Live Casino', href: '/live-casino', glyph: 'live-casino' },
  { label: 'Sport', href: '/sport', glyph: 'sport' },
  { label: 'Promos', href: '/promos', glyph: 'promotions' },
]

function NavTab({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      // The amber tint is the only visual cue for the current tab, and colour alone never
      // reaches a screen reader.
      aria-current={active ? 'page' : undefined}
      className={`${TAB_CLASSES} ${active ? 'text-amber' : 'text-primary opacity-50'}`}
    >
      <MenuGlyph name={tab.glyph} size={22} />
      <span
        className={`text-[10px] tracking-[0.2px] ${active ? 'font-semibold' : 'font-medium'} whitespace-nowrap`}
      >
        {tab.label}
      </span>
      {/* Node 1:8247: a 4px dot 18px below the column, outside the tab's own box. */}
      {active ? (
        <span
          aria-hidden
          className="absolute -bottom-[18px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-amber"
        />
      ) : null}
    </Link>
  )
}

export default function MobileNavBar() {
  const pathname = usePathname()
  const panel = useAppStore((state) => state.panel)
  const openPanel = useAppStore((state) => state.openPanel)
  const closePanel = useAppStore((state) => state.closePanel)

  const menuOpen = panel === 'jackpotMenu'

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 hidden pb-[env(safe-area-inset-bottom)] mobile:block"
    >
      {/* `bg-quaternary` is the design's own value here — node 1:8235 resolves to BG/Quaternary,
          the one Figma variable in the file. */}
      <div className="relative flex h-[84px] w-full items-center justify-between rounded-t-3xl bg-quaternary px-4">
        {TABS.slice(0, 2).map((tab) => (
          <NavTab key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}

        {/* Node 1:8236. The raised disc is a child of this column rather than a sibling of the
            bar, so the label below it lands on the same baseline as the other four labels and the
            whole 64px slot — disc included — is one hit target. */}
        <button
          type="button"
          onClick={() => (menuOpen ? closePanel() : openPanel('jackpotMenu'))}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          className={`${TAB_CLASSES} text-amber`}
        >
          <span
            aria-hidden
            className={[
              // Explicit centring rather than relying on the flex parent's static position for an
              // absolutely positioned child — the rule holds, but not obviously enough to read.
              'absolute -top-[42px] left-1/2 -translate-x-1/2 flex size-[54px] items-center justify-center rounded-[27px] text-page',
              'border border-solid border-white/20',
              // The design's #FFD182 -> #F59E0B is the gold highlight falling into amber. Both
              // ends already exist as tokens, so the ramp is built from them rather than minting
              // two more. `image:` keeps Tailwind from reading the value as a colour.
              'bg-[image:linear-gradient(180deg,var(--gold-light),var(--amber))]',
              'shadow-[0_2px_4px_color-mix(in_srgb,var(--amber)_20%,transparent),0_10px_12px_color-mix(in_srgb,var(--amber)_40%,transparent)]',
              'transition-transform active:scale-95',
            ].join(' ')}
          >
            <MenuGlyph name="burger" size={20} strokeWidth={2.6} />
          </span>
          {/* Occupies the mark's slot so "Menu" sits level with the other labels (node 1:8259). */}
          <span aria-hidden className="size-[22px]" />
          <span className="whitespace-nowrap text-[10px] font-medium capitalize tracking-[0.2px]">
            Menu
          </span>
        </button>

        {TABS.slice(2).map((tab) => (
          <NavTab key={tab.href} tab={tab} active={pathname === tab.href} />
        ))}
      </div>
    </nav>
  )
}
