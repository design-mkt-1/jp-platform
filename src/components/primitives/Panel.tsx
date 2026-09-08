'use client'

import { createPortal } from 'react-dom'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react'

/**
 * The modal surface behind the Balance and Personal information overlays.
 *
 * A panel that only paints itself is not a panel: without a focus trap, Escape, an outside-click
 * target and focus restoration, a keyboard user tabs straight out of it into the page underneath
 * and a screen reader never learns the page went modal. All of that lives in
 * `useOverlayBehavior` below, which `Sheet` reuses so the two surfaces cannot drift apart.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

interface OverlayBehavior {
  /** Attach to the modal surface — it owns the trap, so the listener must sit on it. */
  surfaceRef: RefObject<HTMLDivElement | null>
  /** False until the first client render; `createPortal` has no document to target before that. */
  mounted: boolean
  /** Closes only when the press started on the backdrop itself, not on a child that moved. */
  onBackdropMouseDown: (event: ReactMouseEvent<HTMLDivElement>) => void
}

export function useOverlayBehavior(open: boolean, onClose: () => void): OverlayBehavior {
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return

    // Captured before anything inside is focused, so the caret goes back to the trigger and not
    // to the top of the document when the overlay closes.
    const opener = document.activeElement as HTMLElement | null
    const surface = surfaceRef.current

    const focusables = surface
      ? Array.from(surface.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : []
    // Falls back to the surface itself (tabIndex -1) so focus never stays on the page behind.
    ;(focusables[0] ?? surface)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !surfaceRef.current) return

      // Re-queried on every Tab: the panel's content can change while it is open (the balance
      // breakdown expands), and a list captured at open time would trap focus on stale nodes.
      const items = Array.from(
        surfaceRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((item) => item.offsetParent !== null || item === document.activeElement)

      if (items.length === 0) {
        event.preventDefault()
        surfaceRef.current.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !surfaceRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      opener?.focus?.()
    }
  }, [open, onClose])

  const onBackdropMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose],
  )

  return { surfaceRef, mounted, onBackdropMouseDown }
}

export type PanelAlign = 'right' | 'center'

export interface PanelProps {
  open: boolean
  onClose: () => void
  /** Rendered as the panel heading and used as its accessible name. */
  title: string
  children: ReactNode
  /** `right` is the header drop-down (Balance); `center` is a standalone dialog. */
  align?: PanelAlign
  /** Hide the heading visually while keeping it for assistive tech. */
  hideTitle?: boolean
  className?: string
}

const ALIGN_CLASSES: Record<PanelAlign, string> = {
  right: 'items-start justify-end p-4 pt-[88px]',
  center: 'items-center justify-center p-4',
}

export default function Panel({
  open,
  onClose,
  title,
  children,
  align = 'right',
  hideTitle = false,
  className,
}: PanelProps) {
  const titleId = useId()
  const { surfaceRef, mounted, onBackdropMouseDown } = useOverlayBehavior(open, onClose)

  if (!mounted || !open) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex bg-overlay ${ALIGN_CLASSES[align]}`}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'max-h-[calc(100vh-6rem)] w-full max-w-[360px] overflow-y-auto rounded-2xl',
          'border border-solid border-card bg-card p-5 shadow-[0_16px_40px_rgb(0_0_0/0.45)]',
          'outline-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
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
