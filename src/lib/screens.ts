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
    id: 'empty-search',
    label: 'Search — empty state',
    viewport: 1440,
    figmaNodeId: '1:4321',
    description: 'Search surface before any interaction.',
  },
  {
    id: 'mob-main',
    label: 'Mobile — main',
    viewport: 390,
    figmaNodeId: '1:5720',
    description: 'The mobile homepage: bonus carousel, category tabs, wins ticker, the same 15 sections, footer.',
  },
  {
    id: 'mobile-nav',
    label: 'Mobile — navigation',
    viewport: 390,
    figmaNodeId: '1:8235',
    description: 'Mobile navigation drawer.',
  },
  {
    id: 'jackpot-menu-prelogin',
    label: 'Jackpot menu — pre-login',
    viewport: 390,
    figmaNodeId: '1:8751',
    description: 'Account menu for a visitor who has not signed in.',
  },
  {
    id: 'jackpot-menu-postlogin',
    label: 'Jackpot menu — post-login',
    viewport: 390,
    figmaNodeId: '1:8260',
    description: 'Account menu for a signed-in standard player.',
  },
  {
    id: 'jackpot-menu-vip',
    label: 'Jackpot menu — VIP',
    viewport: 390,
    figmaNodeId: '1:8503',
    description: 'Account menu for a VIP player.',
  },
]

export function getScreen(id: string): ScreenSpec | undefined {
  return screens.find((screen) => screen.id === id)
}
