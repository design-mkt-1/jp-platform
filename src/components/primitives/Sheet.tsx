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
  className?: string
}

export default function Sheet({
  open,
  onClose,
  title,
  children,
  hideTitle = false,
  className,
}: SheetProps) {
  const titleId = useId()
  const { surfaceRef, mounted, onBackdropMouseDown } = useOverlayBehavior(open, onClose)

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay"
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'max-h-[85vh] w-full overflow-y-auto rounded-t-3xl outline-none',
          'border-t border-solid border-card bg-card px-5 pb-8 pt-3',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Grab handle. Decorative — the sheet is dismissed with Escape, the backdrop or a
            close control, never by dragging this. */}
        <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-elevated" />
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
