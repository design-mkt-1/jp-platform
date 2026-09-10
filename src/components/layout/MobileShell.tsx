import type { ReactNode } from 'react'
import MobileNavBar from './MobileNavBar'
import JackpotMenu from '../panels/JackpotMenu'

/**
 * The mobile chrome of frames 1:5720 and 1:6978: the bottom tab bar and the account menu it opens.
 *
 * Deliberately empty of content. Both mobile frames differ from each other only in the header, and
 * from the desktop frame only in layout — the sections themselves are the same fifteen — so this
 * wrapper owns the two pieces that exist *only* on mobile and leaves the page body to whoever
 * assembles it.
 *
 * A server component: it renders two client islands but reads nothing itself, so wrapping the page
 * in it does not push the sections client-side.
 *
 * `children` is optional. Phase 5 can either wrap the page (`<MobileShell>{sections}</MobileShell>`,
 * which gets the bottom spacer applied in the right place) or drop the chrome in on its own.
 */

export interface MobileShellProps {
  children?: ReactNode
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <>
      {children}

      {/* The bar is fixed, so it is outside the flow and would otherwise sit on top of the last
          section. This reserves its height — plus the home indicator inset — at the end of the
          document instead of putting padding on a wrapper the page does not control. Signed out,
          the Log In / Sign In strip on top of the bar adds its own through `--mobile-auth-h`. */}
      {/* Underscores are Tailwind's escape for the spaces `calc` requires around its operator, and
          `--mobile-nav-h` is the bar's height, declared once in globals.css — see the note there. */}
      <div
        aria-hidden
        className="hidden h-[calc(var(--mobile-nav-h)_+_var(--mobile-auth-h)_+_env(safe-area-inset-bottom))] mobile:block"
      />

      <MobileNavBar />
      <JackpotMenu />
    </>
  )
}
