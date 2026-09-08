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
        'footer-heading': 'var(--text-footer-heading)',
        legal: 'var(--text-legal)',

        // Accent & brand
        blue: 'var(--blue)',
        'blue-tint': 'var(--blue-tint)',
        amber: 'var(--amber)',
        'amber-tint': 'var(--amber-tint)',
        gold: 'var(--gold)',
        green: 'var(--green)',
        emerald: 'var(--emerald)',
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
