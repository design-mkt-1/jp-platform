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
   * rather than a card — the jackpot menu (node 1:8504) is 782 of the 874-tall frame, anchored at
   * y=0, and carries its own header. Docking that one to the bottom left a strip of the page showing
   * above it and pushed its last row, Sign out, below the fold.
   */
  anchor?: 'bottom' | 'top'
  className?: string
}

export default function Sheet({
  open,
  onClose,
  title,
  children,
  hideTitle = false,
  anchor = 'bottom',
  className,
}: SheetProps) {
  const titleId = useId()
  const { surfaceRef, mounted, onBackdropMouseDown } = useOverlayBehavior(open, onClose)

  if (!mounted || !open) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-overlay ${
        anchor === 'top' ? 'items-start' : 'items-end'
      }`}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'w-full overflow-y-auto outline-none bg-card px-5',
          anchor === 'top'
            ? // 782 of 874 in node 1:8503, leaving the tab bar visible beneath it.
              'max-h-[90vh] rounded-b-3xl border-b border-solid border-card pb-6 pt-3'
            : 'max-h-[85vh] rounded-t-3xl border-t border-solid border-card pb-8 pt-3',
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
