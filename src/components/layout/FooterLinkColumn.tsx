import Link from 'next/link'
import type { FooterLink } from '@/lib/types'

/**
 * One column of the footer navigation (Figma nodes 1:3998 and 1:4007, 300x165 each).
 *
 * Figma paints the heading and the links in a single inherited colour. They are split here into
 * `text-footer-heading` and `text-secondary` so the column reads as a heading plus a list even
 * after the token decision collapsed `text-secondary` and `text-tertiary` onto one value.
 */

export interface FooterLinkColumnProps {
  title: string
  links: FooterLink[]
  className?: string
}

export default function FooterLinkColumn({ title, links, className }: FooterLinkColumnProps) {
  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      <h3 className="text-sm font-extrabold uppercase text-footer-heading">{title}</h3>

      {/* The 8px gap is desktop-only. On the phone each row becomes a 44px box and the rows sit
          flush, which is where the recorded "32 → 44, +80 over six rows" comes from: 6×44 = 264
          against 6×24 + 5×8 = 184. Keeping the gap as well would cost 120 and buy nothing — at
          44 tall the rows are already unambiguous to a thumb. */}
      <ul className="flex flex-col gap-2 mobile:gap-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              // Eleven of the twelve hrefs in footer.json are routes this demo does not have, and
              // the twelfth is a `mailto:` — so Next's default prefetch can only ever ask the
              // static export for pages that are not there. Tapping one still lands on
              // `not-found.tsx`, which is intended; a background 404 for a page nobody asked for
              // is not. The same opt-out is on `Header` and `MobileNavBar`.
              prefetch={false}
              // The anchor is inline on desktop, so its box is the 16px line and nothing more.
              // On the phone it becomes a 44-tall flex box that fills the column, which is the
              // whole point: the tap target was 16px, not the 32 the backlog recorded — 32 was
              // the row pitch. Desktop keeps the inline box, so its footer is byte-identical.
              className="text-[13px] leading-4 text-secondary transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue mobile:flex mobile:min-h-11 mobile:items-center"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
