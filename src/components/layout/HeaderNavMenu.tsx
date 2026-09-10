'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { pressLandsOnAControl } from '../primitives/Panel'

/**
 * The primary nav, collapsed behind a burger between 768 and 1279 px.
 *
 * ## Why this exists
 *
 * The Figma file draws 390 and 1440 and nothing between, so the range in the middle — a tablet in
 * landscape, a small laptop, a desktop window that is not maximised — ran the desktop header
 * squeezed. Session 5 stopped it overflowing by letting the nav scroll inside itself. That made
 * the page correct and the menu unusable: measured on the deployed build on 2026-09-09, the nav
 * was a **33px window onto 569px of links** at 768 (the header rendered `CAS`, clipped mid-word),
 * 289px at 1024 and 544px at 1279. All six links were reachable by dragging a strip nothing
 * signalled was draggable.
 *
 * Four treatments were rendered and measured against each other at all three widths — accept it,
 * thin the 80px page gutter, drop two links, or wrap onto a second row. Only wrapping showed all
 * six at 768, and it cost 91px of header height. The owner's decision of 2026-09-09 is the
 * treatment none of the four were: **a burger**, which is what an online casino actually does at
 * this width, keeps all six links, and costs no height at all.
 *
 * ## Why not reuse `Sheet` or `Panel`
 *
 * Both are full-screen modal surfaces with a scrim, built for the phone menu and the header
 * popovers. A nav dropdown at 1024 is neither modal nor full-screen — dimming the whole page to
 * offer six links reads as an error state. It borrows `useOverlayBehavior`'s siblings instead:
 * Escape, an outside click, and focus restoration, which are the three things a dropdown must do
 * and the only three.
 */

export interface HeaderNavItem {
  label: string
  href: string
}

export interface HeaderNavMenuProps {
  items: HeaderNavItem[]
  className?: string
}

const TRIGGER_CLASSES = [
  'flex size-10 shrink-0 items-center justify-center rounded-full',
  'bg-elevated text-primary transition-colors hover:brightness-125',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

const ROW_CLASSES = [
  'block rounded-xl px-3 py-2.5 font-display text-sm uppercase tracking-[0.6px]',
  'transition-colors hover:bg-elevated',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

export default function HeaderNavMenu({ items, className }: HeaderNavMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()

  // Escape and outside-click, plus focus back to the burger. A dropdown that traps focus would be
  // lying — the page behind it is still live — so this deliberately does not trap.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return

      /*
       * Closing only strands focus when focus is inside the panel that is about to go. Opening the
       * menu with the mouse leaves focus on the burger, which survives, and a press on empty page
       * chrome should blur it the way pressing empty space always does.
       *
       * Measured at 1024 on 2026-09-10: press the burger, Tab once so focus sits on the "Casino"
       * link inside the panel, then press the header's own flex container — the menu closed and
       * focus landed on `<body>`. This branch used to call `setOpen(false)` and nothing else, while
       * the Escape branch above restored correctly, which is why only the mouse path was broken.
       */
      const stranded = !!panelRef.current?.contains(document.activeElement)

      setOpen(false)

      // `pressLandsOnAControl` carries the why: without the cancel, the browser's own default
      // action for this press clears focus to `<body>` after we have already restored it.
      if (!stranded || pressLandsOnAControl(event)) return
      event.preventDefault()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    // `mobile:hidden` because below 768 the bottom tab bar and the jackpot menu already own
    // navigation; `xl:hidden` because at 1280 and up all six links fit in the bar as designed.
    <div className={['relative shrink-0 xl:hidden mobile:hidden', className].filter(Boolean).join(' ')}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Main menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={TRIGGER_CLASSES}
      >
        {/* Three bars, drawn rather than imported: every file in public/images/icons is a
            flattened export with a baked fill and could not take the header's text colour. */}
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className={[
            'absolute left-0 top-full z-50 mt-3 w-[200px] rounded-2xl p-2',
            'border border-solid border-card bg-card shadow-[0_16px_40px_rgb(0_0_0/0.45)]',
          ].join(' ')}
        >
          <nav aria-label="Primary">
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      // This demo has three routes; every other href is dead by design and Next
                      // prefetches `<Link>`s by default. Forgetting this is silent — the page
                      // renders and 404s in the background — and it is the fourth place in this
                      // codebase the same bug would have appeared.
                      prefetch={false}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={`${ROW_CLASSES} ${active ? 'text-gold' : 'text-nav'}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
