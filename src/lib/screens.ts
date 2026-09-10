/**
 * Registry of the stand-alone frames in the Figma file. `/dev/screens` renders this list so the
 * states that never appear on the happy path — empty search, VIP menu, opened panels — stay
 * reachable and reviewable without hunting for a URL.
 */

export type ScreenViewport = 1440 | 390

export interface ScreenSpec {
  id: string
  label: string
  viewport: ScreenViewport
  figmaNodeId: string
  description: string
}

export const screens: ScreenSpec[] = [
  {
    id: 'desktop-main',
    label: 'Desktop — main',
    viewport: 1440,
    figmaNodeId: '1:2431',
    description: 'The full desktop homepage: header, hero, wins ticker, category bar, 15 sections, footer.',
  },
  {
    id: 'balance-opened',
    label: 'Balance panel opened',
    viewport: 1440,
    figmaNodeId: '1:4116',
    description: 'Header balance widget with its breakdown popover: total, real, bonus, free spins, bonus queue.',
  },
  {
    id: 'personal-info-opened',
    label: 'Personal info opened',
    viewport: 1440,
    figmaNodeId: '1:4153',
    description: 'Profile panel showing the account details of the logged-in user.',
  },
  {
    id: 'search-popular-recent',
    label: 'Search — popular & recent',
    viewport: 1440,
    figmaNodeId: '1:4334',
    description: 'Search field focused with an empty query: popular search tags plus removable recent searches.',
  },
  {
    id: 'search-typing',
    label: 'Search — typing',
    viewport: 1440,
    figmaNodeId: '1:4479',
    description: 'Matching suggestions while typing: thumbnail, title, provider and a category badge per row.',
  },
  {
    id: 'search-no-results',
    label: 'Search — no results',
    viewport: 1440,
    figmaNodeId: '1:4611',
    description: 'Query that matches nothing.',
  },
  {
    id: 'providers-no-results-desktop',
    label: 'Provider search — no results',
    viewport: 1440,
    figmaNodeId: '1:4321',
    description:
      'The Leading Providers filter as a 720px popover under the magnifier of the providers row, on a query no studio matches: `?pq=xyzgame`.',
  },
  {
    id: 'mob-main',
    label: 'Mobile — main',
    viewport: 390,
    // The mobile frames have been rebuilt in Figma twice; every id this entry carried before is
    // deleted. The live pair is `32:1813` post-login and `32:3530` pre-login, both 390x7159 and
    // structurally identical. This entry shows the post-login header — `32:1813` is the one whose
    // header carries the `$ 140.00` balance — so it takes that one.
    figmaNodeId: '32:1813',
    description: 'The mobile homepage: bonus carousel, category tabs, wins ticker, the same 15 sections, footer.',
  },
  {
    id: 'mobile-providers-no-results',
    label: 'Provider search — no results (mobile)',
    viewport: 390,
    figmaNodeId: '1:2218',
    description:
      'The Leading Providers filter inline under the section header, on a query no studio matches: `?pq=xyzgame`. The magnifier is gone while the field is up.',
  },
  {
    id: 'mobile-nav',
    label: 'Mobile — navigation',
    viewport: 390,
    // `mobile-navigation-bar postlog`, the standalone 390x84 frame. `32:3284` is a copy of it
    // placed inside the post-login homepage.
    figmaNodeId: '32:4828',
    description:
      'The tab bar fixed to the bottom of every mobile page: Casino, Live Casino, the raised Menu disc, Sport, Promos.',
  },
  {
    id: 'jackpot-menu-prelogin',
    label: 'Jackpot menu — pre-login',
    viewport: 390,
    figmaNodeId: '32:5279',
    description: 'Account menu for a visitor who has not signed in.',
  },
  {
    id: 'jackpot-menu-postlogin',
    label: 'Jackpot menu — post-login',
    viewport: 390,
    figmaNodeId: '32:4852',
    description: 'Account menu for a signed-in standard player.',
  },
  {
    id: 'jackpot-menu-vip',
    label: 'Jackpot menu — VIP',
    viewport: 390,
    figmaNodeId: '32:5063',
    description: 'Account menu for a VIP player.',
  },
]

export function getScreen(id: string): ScreenSpec | undefined {
  return screens.find((screen) => screen.id === id)
}
