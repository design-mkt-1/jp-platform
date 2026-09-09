'use client'

import { createPortal } from 'react-dom'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { useOverlayBehavior } from './Panel'

/**
 * The mobile form of `Panel`: same dialog semantics, docked to the bottom of the viewport.
 *
 * It shares `useOverlayBehavior` with Panel rather than re-implementing the trap. Two copies of
 * focus management drift within a week, and the copy that drifts is always the one nobody opens
 * on a keyboard.
 */

export interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Hide the heading visually while keeping it as the dialog's accessible name. */
  hideTitle?: boolean
  /**
   * `bottom` is the usual card that rises from the bottom edge.
   *
   * `top` starts at the top of the viewport instead, for surfaces the design draws as a full panel
   * rather than a card — the jackpot menu (node 13:2307) is 750 of the 874-tall frame, anchored at
   * y=0, and carries its own header. Docking that one to the bottom left a strip of the page showing
   * above it and pushed its last row, Sign out, below the fold.
   */
  anchor?: 'bottom' | 'top'
  /**
   * Ends the sheet at the top edge of the mobile tab bar instead of over it, and stretches the
   * surface to fill what is left.
   *
   * Opt-in, because the two surfaces that take this shape want opposite things. The jackpot menu
   * is drawn by Figma as one dark screen running down to a *lit* tab bar with `Menu` active
   * (nodes 1:8751 / 13:2307 / 13:2519), so a full-bleed scrim over the bar is wrong twice: it greys
   * out a bar the design shows switched on, and it swallows taps meant for it — pressing `Casino`
   * hit the backdrop and closed the menu instead of navigating. Sizing the sheet by its content
   * left the rest of the box as live page: 213px of it pre-login, 87px post-login, measured at
   * 390x844. The mobile search sheet has no Figma frame at all, so its relationship to the bar is
   * our own decision and is deliberately left as it was.
   *
   * The clearance is scoped to the `mobile:` breakpoint because that is where the bar exists at
   * all — above 767px `MobileNavBar` renders nothing, and reserving 84px there would leave an
   * undimmed strip of page with no bar in it.
   */
  clearsNavBar?: boolean
  /**
   * Which token fills the surface. `card` is the sheet's own step off the page; `quaternary` is the
   * darker `#0D1420` the jackpot-menu frames paint their panel, the strip under it and the tab bar
   * with — the same value `MobileNavBar` and `Footer` already use.
   *
   * A prop rather than a `className` override, even though `SheetProps.className` is appended last
   * below. Two `bg-*` utilities in one class attribute are resolved by their order in the generated
   * stylesheet, not by the order they were written in, so the override would work or not depending
   * on how Tailwind happened to sort that build. `Button` and `JackpotMenu` both carry the same
   * warning.
   *
   * Opt-in, because `SearchOverlay` is the other consumer of this component and its rows are
   * `bg-card` too: they read flush with the sheet today, and would become visibly lighter cards if
   * the surface moved under them. Figma has no mobile search frame, so nothing says it should.
   */
  surface?: 'card' | 'quaternary'
  className?: string
}

const SURFACE_CLASSES: Record<NonNullable<SheetProps['surface']>, string> = {
  card: 'bg-card',
  quaternary: 'bg-quaternary',
}

export default function Sheet({
  open,
  onClose,
  title,
  children,
  hideTitle = false,
  anchor = 'bottom',
  clearsNavBar = false,
  surface = 'card',
  className,
}: SheetProps) {
  const titleId = useId()
  const { surfaceRef, mounted, onBackdropMouseDown } = useOverlayBehavior(open, onClose)

  if (!mounted || !open) return null

  return createPortal(
    <div
      className={[
        'fixed z-50 flex justify-center bg-overlay',
        // `--mobile-nav-h` is the bar's own height, declared once in globals.css and read by the
        // bar, by MobileShell's end-of-document spacer and here. The safe-area inset is added
        // because the bar pads itself by it, so the two together are what it actually occupies.
        // Underscores are Tailwind's escape for the spaces `calc` requires around its operator.
        clearsNavBar
          ? 'inset-x-0 top-0 bottom-0 mobile:bottom-[calc(var(--mobile-nav-h)_+_env(safe-area-inset-bottom))]'
          : 'inset-0',
        anchor === 'top' ? 'items-start' : 'items-end',
      ].join(' ')}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'w-full overflow-y-auto outline-none px-5',
          SURFACE_CLASSES[surface],
          // The insets are 8 rather than the 12/24 they were, because at 390x844 the box available
          // to a top-anchored sheet is 760px and the jackpot menu's own content came to 804: the
          // last row, Sign out, fell outside the sheet and could only be reached by scrolling. The
          // bar was never what covered it — the sheet was simply 45px shorter than what it held, so
          // the space had to come out of the paddings rather than out of the rows Figma sizes.
          anchor === 'top'
            ? 'pb-2 pt-2'
            : 'max-h-[85vh] rounded-t-3xl border-t border-solid border-card pb-8 pt-3',
          // Filling the box is the whole point of `clearsNavBar`: capped at its content the sheet
          // left whatever it did not use as live page. The bottom edge loses its radius and rule
          // with it — it is now flush against the bar's own `rounded-t-3xl` rather than floating
          // above the page, and two sets of opposing corners meeting would read as a pinch.
          //
          // Without the prop, 750 of 874 in node 13:2307, leaving the tab bar visible beneath it.
          anchor === 'top'
            ? clearsNavBar
              ? 'h-full'
              : 'max-h-[90vh] rounded-b-3xl border-b border-solid border-card'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Grab handle. Decorative — the sheet is dismissed with Escape, the backdrop or a
            close control, never by dragging this. Only the bottom form has one: a panel anchored
            at the top has no edge to pull from. */}
        {anchor === 'bottom' && (
          <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-elevated" />
        )}
        <h2
          id={titleId}
          className={
            hideTitle
              ? 'sr-only'
              : 'mb-4 font-display text-base font-bold uppercase tracking-[0.6px] text-primary'
          }
        >
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
