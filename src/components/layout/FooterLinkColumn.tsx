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

      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] leading-4 text-secondary transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
