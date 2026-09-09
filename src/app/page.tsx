import { Fragment } from 'react'
import CategoryNavBar from '@/components/layout/CategoryNavBar'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import HeroBanner from '@/components/layout/HeroBanner'
import MobileShell from '@/components/layout/MobileShell'
import RecentWinsTicker from '@/components/layout/RecentWinsTicker'
import BalancePanel from '@/components/panels/BalancePanel'
import PersonalInfoPanel from '@/components/panels/PersonalInfoPanel'
import SearchOverlay from '@/components/search/SearchOverlay'
import CategoryView from '@/components/sections/CategoryView'
import SectionRenderer from '@/components/sections/SectionRenderer'
import UrlStateBridge from '@/components/UrlStateBridge'
import { desktopSections, mobileSections } from '@/lib/sections'
import type { SectionSpec } from '@/lib/sections'

/**
 * The homepage — Figma frames `desktop-main` (1:2431) and `mob main` (1:5720).
 *
 * The body of the page is `desktopSections.map()` and nothing else. There is no branch for
 * "Crash Games" or for any other row: what a row is called, which glyph it carries, what it
 * queries and how many grids it stacks are all fields of `SectionSpec`, so a new row is a commit
 * to `src/lib/sections.ts` alone.
 *
 * A Server Component. Every interactive part of the page — the header's account cluster, the
 * search field, the marquee row, the overlays — is a client island that reaches `useAppStore`
 * directly, precisely so this file never has to become one.
 *
 * ## Vertical rhythm
 *
 * Read off the two frames rather than guessed. Desktop (absolute y in 1:2431): header ends at 80,
 * the hero block starts at 128, the ticker frame at 480, the category bar at 608, the first
 * section at 758, and every following section starts exactly 48 after the previous one ends —
 * 758, 1118, 1478, 1866 … 6364 — with the footer at 6724, again 48 after the last row. So the
 * page is one uniform 48px gap, not per-row spacing. Mobile (1:5720) is the same shape at 20px:
 * 401, 789, 1185 … 5549, footer at 5979.
 *
 * The component paddings already carry part of those gaps (the ticker's own 12, the category bar's
 * 24), so the wrappers below add only the remainder.
 */

/**
 * Both registries describe the same fifteen rows; `mobileSections` differs only in that a games
 * row asking for two grids of six on desktop asks for one grid of six on mobile. Rendering both
 * unconditionally would duplicate thirteen identical rows into the DOM, so a row is only doubled
 * when the two specs would actually draw something different.
 *
 * Compared field by field rather than by serialising the filter: key order is an implementation
 * detail of how `mobileSections` is built, and a comparison that depends on it would start
 * silently doubling rows the day that changes.
 */
function rendersTheSame(desktop: SectionSpec, mobile: SectionSpec): boolean {
  if (desktop.kind !== 'games' || mobile.kind !== 'games') return desktop.kind === mobile.kind

  return (
    desktop.grids === mobile.grids &&
    desktop.filter.tag === mobile.filter.tag &&
    desktop.filter.category === mobile.filter.category &&
    desktop.filter.provider === mobile.filter.provider &&
    desktop.filter.limit === mobile.filter.limit
  )
}

/** A hidden element is not a flex item, so the swapped-out twin contributes no gap either. */
const DESKTOP_ONLY = 'mobile:hidden'
const MOBILE_ONLY = 'hidden mobile:flex'

function HomeSections() {
  return (
    <>
      {desktopSections.map((desktop, index) => {
        const mobile = mobileSections.find((section) => section.id === desktop.id)
        // Only the topmost row is above the fold on either viewport.
        const priority = index === 0

        if (!mobile || rendersTheSame(desktop, mobile)) {
          return <SectionRenderer key={desktop.id} section={desktop} priority={priority} />
        }

        // Neither twin gets `priority`. It preloads unconditionally, and one of these two is
        // always hidden, so marking both made every visitor fetch a card image they cannot see —
        // the same mistake the hero made with its two artworks. The hero is the element above the
        // fold that matters for the first paint, and it preloads itself by media query.
        return (
          <Fragment key={desktop.id}>
            <SectionRenderer section={desktop} className={DESKTOP_ONLY} />
            <SectionRenderer section={mobile} className={MOBILE_ONLY} />
          </Fragment>
        )
      })}
    </>
  )
}

export default function Home() {
  return (
    <MobileShell>
      <Header />

      <main className="flex flex-col">
        {/*
          The page's only `<h1>`. Every section title is an `<h2>`, so without it a screen reader
          opens the homepage with no page-level heading at all — axe's `page-has-heading-one`, the
          one moderate violation in the first accessibility pass. Visually hidden because the design
          has no text title: the wordmark in the header is an image, and node 1:2431 draws nothing
          else that could carry the name. Inside `main` rather than above it, because a heading in
          no landmark at all trades that violation for axe's `region` on every state.
        */}
        <h1 className="sr-only">Jackpot — Online Casino</h1>

        {/*
          Desktop stacks hero → ticker → category bar (1:2436, 1:2438, 1:2500). The mobile frame
          puts the category strip above the ticker instead (1:5799 at y=187 of the top block,
          1:5859 below it), so the two are swapped by `order` rather than rendered twice. DOM order
          follows the desktop frame; the only consequence on mobile is that the ticker is reached
          before the tabs by keyboard, which is the cheaper of the two costs.
        */}
        <HeroBanner className="pt-12 mobile:pt-4" />

        {/* 24px between the hero and the ticker card (468 → 492 in the frame): half of it is the
            gap between the two frames, half the ticker's own inset. The wrapper carries the first
            half rather than overriding `py-3`, so the two paddings cannot fight. */}
        <div className="pt-3 mobile:order-3 mobile:pt-0">
          <RecentWinsTicker />
        </div>

        {/* 24px below the ticker frame on desktop; 16px below the hero on mobile. */}
        <CategoryNavBar className="pt-6 mobile:order-2 mobile:pt-4" />

        <div className="w-full px-page-x pb-12 pt-12 mobile:px-4 mobile:pb-5 mobile:pt-2 mobile:order-4">
          {/*
            44px between rows on mobile, not 20. Figma's rebuilt mobile frames (node `21:2896`)
            build that gap out of two pieces: 20px between one row frame and the next, plus 24px of
            padding above the header inside each frame — `21:3297` puts its `section-header` at
            y=24 and its `grid-container` at y=68, and the frame ends flush with the grid. Nothing
            is drawn in either piece, so the two are one 44px gap here.

            Measured on the deployed build before this: grid bottom to the next header top was 24px
            against the design's 44, on all eleven rows and all three promos. It is why the phone
            page read as denser than the design — the single largest rhythm difference on mobile,
            and 95% of this product's traffic is a phone.
          */}
          <div className="mx-auto flex max-w-content flex-col gap-12 mobile:gap-11">
            {/*
              `HomeSections` stays a server render and is handed to the client wrapper as children,
              so choosing a tab does not push the fifteen rows into the browser bundle. On the
              Popular tab this renders exactly what it rendered before the tabs were wired up.
            */}
            <CategoryView>
              <HomeSections />
            </CategoryView>
          </div>
        </div>
      </main>

      <Footer />

      {/*
        The global overlays. Each one reads its own slice of `useAppStore` and renders `null` while
        that slice says it is closed, so mounting them here costs an empty component and removes
        the alternative: every trigger in the header, the category bar and the providers row owning
        a copy of the surface it opens. The fourth, `JackpotMenu`, is mounted by `MobileShell`
        alongside the tab bar that is the only control able to open it.
      */}
      <SearchOverlay />
      <BalancePanel />
      <PersonalInfoPanel />

      {/*
        Reads `?auth=`, `?panel=` and `?q=` once on mount and mirrors them back as the store changes.
        Without it a state like the VIP header with the balance panel open can only be reached by
        clicking, which makes both the design comparison and any bug report harder than it needs to be.
      */}
      <UrlStateBridge />
    </MobileShell>
  )
}
