import type { Config } from 'tailwindcss'

/**
 * Theme derived from the Figma UI Kits — see docs/tokens.md for the name-by-name mapping.
 *
 * Every colour resolves to a CSS variable declared in src/app/globals.css. Components must use
 * these token names; raw hex literals under src/components/ are rejected by eslint.
 */
export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        section: 'var(--bg-section)',
        overlay: 'var(--bg-overlay)',
        subtle: 'var(--bg-subtle)',
        elevated: 'var(--bg-elevated)',
        // Icon Button hover/active, node 1:5687 — the rest fill is `elevated` above.
        'icon-btn-hover': 'var(--bg-icon-btn-hover)',
        'icon-btn-active': 'var(--bg-icon-btn-active)',
        quaternary: 'var(--bg-quaternary)',
        header: 'var(--bg-header)',
        footer: 'var(--bg-footer)',
        field: 'var(--bg-field)',

        // Text
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        muted: 'var(--text-muted)',
        caption: 'var(--text-caption)',
        nav: 'var(--text-nav)',
        label: 'var(--text-label)',
        subtitle: 'var(--text-subtitle)',
        'footer-heading': 'var(--text-footer-heading)',
        legal: 'var(--text-legal)',

        // Accent & brand
        blue: 'var(--blue)',
        'blue-tint': 'var(--blue-tint)',
        // Text on a blue tint, where the solid blue does not reach AA — see globals.css.
        'blue-text': 'var(--blue-text)',
        'see-all': 'var(--see-all-bg)',
        'see-all-hover': 'var(--see-all-bg-hover)',
        'see-all-active': 'var(--see-all-bg-active)',
        amber: 'var(--amber)',
        'amber-tint': 'var(--amber-tint)',
        'amber-soft': 'var(--amber-soft)',
        // The mobile hero's wager badge, nodes 21:2934 / 21:2935 — its own amber, so that
        // `amber-tint` stays bound to the desktop promo pills it was measured from.
        'wager-tint': 'var(--wager-tint)',
        'wager-amber': 'var(--wager-amber)',
        ink: 'var(--ink)',
        gold: 'var(--gold)',
        green: 'var(--green)',
        emerald: 'var(--emerald)',
        // The jackpot menu's deposit fill (node 13:2340), its sign-out label (node 13:2491), the
        // flat fill of its rows and ID field (13:2362 / 13:2342) and its balance pill (13:2325).
        'deposit-green': 'var(--deposit-green)',
        signout: 'var(--text-signout)',
        'menu-row': 'var(--bg-menu-row)',
        'balance-chip': 'var(--bg-balance-chip)',
        cyan: 'var(--cyan)',

        // Gradient stops
        'gold-light': 'var(--gold-light)',
        'gold-dark': 'var(--gold-dark)',
        'orange-start': 'var(--orange-start)',
        'orange-end': 'var(--orange-end)',
      },

      borderColor: {
        card: 'var(--border-card)',
        divider: 'var(--border-divider)',
        medium: 'var(--border-medium)',
        strong: 'var(--border-strong)',
        separator: 'var(--border-separator)',
        header: 'var(--border-header)',
        flag: 'var(--border-flag)',
        emphasis: 'var(--border-emphasis)',
        chip: 'var(--border-chip)',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'var(--font-inter)', 'sans-serif'],
        flex: ['var(--font-roboto-flex)', 'var(--font-inter)', 'sans-serif'],
      },

      // Fixed geometry taken from the desktop frames.
      spacing: {
        'page-x': '80px', // desktop content inset: 1440 − 1280 grid, split
        'card-w': '203px', // GameCard, node 1:2602
        'card-h': '264px',
      },

      maxWidth: {
        content: '1280px', // GridContainer width on desktop
        shell: '1440px', // desktop-main frame width
      },

      screens: {
        // The mobile frames are 390 wide; desktop frames are 1440.
        mobile: { max: '767px' },
      },
    },
  },
  plugins: [],
} satisfies Config
