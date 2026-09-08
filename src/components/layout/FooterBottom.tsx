/**
 * The legal strip that closes the page (Figma node 1:4114, 1280x32).
 *
 * Figma sets this text to a near-black grey that has no token. Over the footer background
 * `text-secondary` resolves to within a few levels of it, so the strip stays a token instead of
 * minting a colour used exactly once.
 */

export interface FooterBottomProps {
  /** The full licensing paragraph, from `footer.json`. */
  legal: string
  className?: string
}

export default function FooterBottom({ legal, className }: FooterBottomProps) {
  return (
    <div className={['flex w-full flex-col items-center', className].filter(Boolean).join(' ')}>
      <p className="w-full text-center text-[11px] leading-4 text-secondary">{legal}</p>
    </div>
  )
}
