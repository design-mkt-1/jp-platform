'use client'

import Button from '../primitives/Button'
import { useAppStore } from '@/store/useAppStore'

/**
 * The right-hand cluster of the header for a visitor who has not signed in: Figma node 1:4282,
 * desktop only (LOGIN outline + REGISTER gold). The phone header `32:3532` carries no auth
 * controls at all — the logo is centred and the pair lives in the strip above the tab bar
 * (`AuthStrip` in MobileNavBar, node 32:4823), so this renders nothing below 768.
 *
 * Both now say "Log In". Owner decision 2026-09-10: the desktop control said `Login` and the phone
 * said `Log In` — one label in two spellings, which is the half of the auth-label item session 10
 * left open. The phone is the priority surface, so the phone's spelling won and only the desktop
 * string changed. `uppercase` renders it LOG IN, so the desktop pill grows 90.48 → 93.33; measured
 * at 768, 1024 and 1440, `header.scrollWidth` equals `clientWidth` at all three, so nothing wraps
 * or overflows. That check is not ceremony: this file already carries a note about the two CTAs no
 * longer fitting beside the six nav items once the label grows.
 *
 * The gold control reads "Register" here because desktop node 1:4312 says so. The phone strip says
 * "Sign In", which is its own frame's word (owner's decision, 2026-09-10).
 *
 * The demo has no authentication, no backend and no /login route. Rather than ship two dead links,
 * both controls flip the mocked account state, which is the only way to reach the post-login header
 * from the page itself.
 *
 * This log-in control and the strip's both carry `data-login-control`. `Header` puts focus on one
 * of them after a sign out, because the control that was focused a moment earlier — the username
 * pill — is unmounted by the same state change. Only one is ever on screen, so `Header` picks by
 * `offsetParent` rather than by document order: focusing the `display: none` one would be a silent
 * no-op, which is exactly how the provider search lost focus at 390.
 */

/**
 * The outline pill of node 1:4310. `border-strong` is white at 10%; the design asks for 30%, so the
 * stroke is mixed from the primary text token instead of minting a colour that is used exactly once.
 * Same technique the Button primitive uses for its glows.
 */
const OUTLINE_PILL = [
  'inline-flex h-9 items-center justify-center rounded-[20px] px-6',
  'border border-solid border-[color:color-mix(in_srgb,var(--text-primary)_30%,transparent)]',
  'text-[13px] font-extrabold uppercase text-primary',
  'transition-colors hover:bg-elevated',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

export default function HeaderPrelogin() {
  const setAuthMode = useAppStore((state) => state.setAuthMode)
  const signIn = () => setAuthMode('postlogin')

  return (
    // Desktop — node 1:4309
    <div className="flex items-center gap-3.5 mobile:hidden">
      <button type="button" onClick={signIn} className={OUTLINE_PILL} data-login-control>
        Log In
      </button>
      {/* The primitive's gold variant is 16px; the header sets every label at 13px, and at 16px
          the two CTAs no longer fit beside the six nav items. `!` because a plain override would
          depend on which of the two font-size utilities Tailwind happens to emit last. */}
      <Button onClick={signIn} className="!h-9 !text-[13px] uppercase">
        Register
      </Button>
    </div>
  )
}
