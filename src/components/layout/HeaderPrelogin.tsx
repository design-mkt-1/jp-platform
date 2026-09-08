'use client'

import Button from '../primitives/Button'
import { useAppStore } from '@/store/useAppStore'

/**
 * The right-hand cluster of the header for a visitor who has not signed in:
 * Figma node 1:4282 on desktop (LOGIN outline + REGISTER gold) and node 1:6994 on mobile
 * ("Log In" as bare type + "Sign In" gold).
 *
 * The two are not one layout at two sizes — the labels, the weights and the outline all differ —
 * so they are two blocks behind a breakpoint rather than one block with six responsive overrides.
 *
 * The demo has no authentication, no backend and no /login route. Rather than ship two dead links,
 * both controls flip the mocked account state, which is the only way to reach the post-login header
 * from the page itself.
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

const GHOST_PILL = [
  'inline-flex h-10 w-[95px] items-center justify-center rounded-[20px]',
  'text-sm font-semibold tracking-[-0.14px] text-primary',
  'transition-colors hover:bg-elevated',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

export default function HeaderPrelogin() {
  const setAuthMode = useAppStore((state) => state.setAuthMode)
  const signIn = () => setAuthMode('postlogin')

  return (
    <>
      {/* Desktop — node 1:4309 */}
      <div className="flex items-center gap-3.5 mobile:hidden">
        <button type="button" onClick={signIn} className={OUTLINE_PILL}>
          Login
        </button>
        {/* The primitive's gold variant is 16px; the header sets every label at 13px, and at 16px
            the two CTAs no longer fit beside the six nav items. `!` because a plain override would
            depend on which of the two font-size utilities Tailwind happens to emit last. */}
        <Button onClick={signIn} className="!h-9 !text-[13px] uppercase">
          Register
        </Button>
      </div>

      {/* Mobile — node 1:6994 */}
      <div className="hidden items-center mobile:flex">
        <button type="button" onClick={signIn} className={GHOST_PILL}>
          Log In
        </button>
        <Button onClick={signIn} className="!h-10 !w-[95px] !text-sm tracking-[-0.14px]">
          Sign In
        </Button>
      </div>
    </>
  )
}
