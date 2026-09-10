'use client'

import { createPortal } from 'react-dom'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react'

/**
 * The modal surface behind the Balance and Personal information overlays.
 *
 * A panel that only paints itself is not a panel: without a focus trap, Escape, an outside-click
 * target and focus restoration, a keyboard user tabs straight out of it into the page underneath
 * and a screen reader never learns the page went modal. All of that lives in
 * `useOverlayBehavior` below, which `Sheet` reuses so the two surfaces cannot drift apart.
 *
 * The `right` alignment is a *popover*, not a corner: Figma draws both header drop-downs hanging
 * off the control that opens them (nodes 1:4118 and 1:4155 both place the popover at x=0 of the
 * trigger, y=48 of a 40px-tall trigger — left edges flush, 8px of air below). Pinning them to the
 * viewport corner instead put the balance breakdown 45px to the right of its own pill, underneath
 * the DEPOSIT button and the username. `useTriggerAnchor` measures the trigger at open time and
 * places the surface against it; see the comment on that hook for what happens when there is no
 * trigger to measure.
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

  /*
   * The trigger, recorded while the overlay is still closed — so it predates the commit that opens
   * it. The capture at the top of the effect below is a passive one, and by the time a passive
   * effect runs the opening commit is over: React has applied `autoFocus` on anything inside the
   * surface (`ProviderSearch`'s field is exactly that) and React has unmounted anything the same
   * state change removed (`CategoryNavBar`'s trigger, the jackpot menu's "More" row). Both leave
   * the late capture pointing at the wrong node, and `focus()` on a detached node is a silent
   * no-op that leaves the caret on `<body>`.
   *
   * `pointerdown`/`keydown` in the capture phase rather than `focusin`: these are the events that
   * *cause* the open, so they are the last thing that happens before React's state update, whereas
   * `focusin` also fires from inside the commit — `autoFocus` reaches it before this effect's
   * cleanup can detach the listener, and the ref ends up holding the panel's own input again.
   * Measured on `ProviderSearch` at 1440: with `focusin` the magnifier was still not restored.
   */
  const earlyTriggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) return

    const remember = (event: Event) => {
      const target = event.target
      earlyTriggerRef.current =
        target instanceof Element ? asTrigger(target.closest(FOCUSABLE_SELECTOR)) : null
    }

    document.addEventListener('pointerdown', remember, true)
    document.addEventListener('keydown', remember, true)
    return () => {
      document.removeEventListener('pointerdown', remember, true)
      document.removeEventListener('keydown', remember, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    // The fallback: whatever held focus once the overlay was already open. It is still the right
    // answer where the early capture cannot be — a nested overlay hands focus back to its own
    // trigger during this same commit, and that happens after the press this hook saw.
    const lateTrigger = asTrigger(document.activeElement)
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

      // The early capture wins when it is still in the document, the late one when it is not.
      // Testing `isConnected` on both is what makes this the class fix rather than a third local
      // patch: `CategoryNavBar` and `HeaderNavMenu` each already work around one half of it.
      const early = earlyTriggerRef.current
      ;(early?.isConnected ? early : lateTrigger?.isConnected ? lateTrigger : null)?.focus()
    }
  }, [open, onClose])

  const onBackdropMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return

      /*
       * Without this, dismissing by the backdrop leaves focus on `<body>` while Escape returns it
       * to the trigger — and the cleanup above is not what differs. Both paths run `opener.focus()`
       * on line 96; the backdrop path then hands control back to the browser, which performs the
       * uncancelled default action of `mousedown`: focus the nearest focusable ancestor of the
       * press target. That target is this backdrop — not focusable, and detached by then — so
       * focus is cleared to the body, overwriting a restoration that had already succeeded.
       * `keydown` has no such default action, which is the whole of the difference.
       *
       * It has to stay inside the guard. In both `Panel` and `Sheet` the surface is a child of this
       * element, so presses inside the surface bubble here too; cancelling their default action
       * would stop a mouse click from focusing the search field. Guarded, only the press that
       * actually dismisses is affected, and there is nothing left to focus after it.
       */
      event.preventDefault()
      onClose()
    },
    [onClose],
  )

  return { surfaceRef, mounted, onBackdropMouseDown }
}

/**
 * The `mobile:` variant is `max-width: 767px` and `md:` is its exact complement, so this constant
 * and the two Tailwind variants below always agree on where the breakpoint is.
 */
const MOBILE_MAX_WIDTH = 767

/** Figma's gap between a trigger's bottom edge and its popover (y=48 under a 40px control). */
const ANCHOR_GAP = 8

/** The popover never touches a viewport edge, whether it is clamped or not. */
const VIEWPORT_MARGIN = 16

interface AnchorPosition {
  left: number
  top: number
  /** Recomputed from the anchored top so a popover low on a short viewport scrolls, not overflows. */
  maxHeight: number
}

/**
 * `useLayoutEffect` warns when React renders it on the server, and this component is rendered
 * there — it returns null until `mounted`, but the hook still runs. The position has to be read
 * before paint, so the effect cannot simply be a passive one.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** `document.activeElement` is never null in practice, but `body` is not a trigger. */
function asTrigger(candidate: Element | null): HTMLElement | null {
  if (!(candidate instanceof HTMLElement)) return null
  if (candidate === document.body || candidate === document.documentElement) return null
  return candidate
}

function measureAnchor(
  trigger: HTMLElement | null,
  surface: HTMLElement | null,
): AnchorPosition | null {
  if (!trigger || !surface || !trigger.isConnected) return null

  const rect = trigger.getBoundingClientRect()
  // A display:none trigger measures 0x0 — anchoring to it would put the panel at the origin.
  if (rect.width === 0 && rect.height === 0) return null

  const { width } = surface.getBoundingClientRect()
  const top = rect.bottom + ANCHOR_GAP

  // Figma aligns the left edges. Clamping only ever pulls the panel back inland, so a trigger near
  // the right edge keeps its whole popover on screen instead of losing the end of it.
  const rightmost = window.innerWidth - width - VIEWPORT_MARGIN
  const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, rightmost))

  return { left, top, maxHeight: window.innerHeight - top - VIEWPORT_MARGIN }
}

/**
 * Places the surface under the control that opened it.
 *
 * The trigger is read from `document.activeElement`, which is a layout effect and not a passive
 * one for two reasons: every layout effect of a commit runs before any passive effect, so this
 * still sees the pressed control rather than the first field inside the panel that
 * `useOverlayBehavior` is about to focus; and a position set in a passive effect would be applied
 * after the browser had already painted the panel in its fallback place, i.e. a visible jump.
 * (`useOverlayBehavior` captures the same element separately for focus restoration. That capture
 * is deliberately left where it is — restoring focus wants whatever was focused, including the
 * cases below where it is nothing this hook can hang a panel off.)
 *
 * Returns null — meaning "use the fallback corner" — in three cases:
 *  - the panel was opened with nothing focused: a deep link (`?panel=balance`), or the jackpot
 *    menu's "More" row, whose trigger is unmounted by the same commit that opens this panel;
 *  - the alignment is `center`, which is a standalone dialog and has no trigger by definition;
 *  - the viewport is a phone, where the fallback is a centred dialog rather than a corner. There
 *    is no "beside the trigger" on a 390px screen — the balance popover is 320 of those 390 and
 *    the account menu's trigger does not exist below 768 at all.
 */
function useTriggerAnchor(
  open: boolean,
  enabled: boolean,
  surfaceRef: RefObject<HTMLDivElement | null>,
): AnchorPosition | null {
  const [anchor, setAnchor] = useState<AnchorPosition | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!open || !enabled) {
      triggerRef.current = null
      setAnchor(null)
      return
    }

    triggerRef.current = asTrigger(document.activeElement)

    const place = () => {
      setAnchor(
        window.innerWidth <= MOBILE_MAX_WIDTH
          ? null
          : measureAnchor(triggerRef.current, surfaceRef.current),
      )
    }

    place()

    // The page cannot scroll while the overlay is open — `useOverlayBehavior` locks it — so a
    // resize is the only thing that can move the trigger out from under an open panel. Crossing
    // the breakpoint is handled by the same call.
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open, enabled, surfaceRef])

  return anchor
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

/**
 * Where the surface lands when there is no trigger to hang it off.
 *
 * `right` keeps the old top-right corner on desktop — `md:pt-[88px]` still clears the 81px header,
 * which is the whole point of that number — but below 768 it centres instead. A 320px card pinned
 * to the corner of a 390px phone, opened from a control that is no longer on screen, reads as a
 * fragment of something rather than as the modal dialog it actually is.
 *
 * Written as `p-4` plus `md:` overrides rather than `pt-[88px]` plus `mobile:` overrides so the two
 * padding utilities never collide: the responsive one is emitted after the base one either way.
 */
const ALIGN_CLASSES: Record<PanelAlign, string> = {
  right: 'items-center justify-center p-4 md:items-start md:justify-end md:pt-[88px]',
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
  const anchor = useTriggerAnchor(open, align === 'right', surfaceRef)

  if (!mounted || !open) return null

  // The scrim stays a full-viewport layer either way — it is the dismissal target and the thing
  // that dims the page — so anchoring only swaps how the surface is placed inside it. Absolute
  // against a `fixed inset-0` parent is viewport coordinates, which is what the trigger rect is in.
  const anchorStyle: CSSProperties | undefined = anchor
    ? { left: anchor.left, top: anchor.top, maxHeight: anchor.maxHeight }
    : undefined

  return createPortal(
    <div
      className={`fixed inset-0 z-50 bg-overlay ${anchor ? '' : `flex ${ALIGN_CLASSES[align]}`}`}
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={anchorStyle}
        className={[
          'max-h-[calc(100vh-6rem)] w-full max-w-[360px] overflow-y-auto rounded-2xl',
          'border border-solid border-card bg-card p-5 shadow-[0_16px_40px_rgb(0_0_0/0.45)]',
          'outline-none',
          anchor ? 'absolute' : '',
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
