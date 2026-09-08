/**
 * The legal strip that closes the page (Figma node 1:4114, 1280x32).
 *
 * `text-legal` is that near-black grey (node 1:4115). It reads deliberately quieter than
 * `text-secondary`: the strip is licensing boilerplate, and in the design it sits well below the
 * footer links rather than beside them.
 */

export interface FooterBottomProps {
  /** The full licensing paragraph, from `footer.json`. */
  legal: string
  className?: string
}

export default function FooterBottom({ legal, className }: FooterBottomProps) {
  return (
    <div className={['flex w-full flex-col items-center', className].filter(Boolean).join(' ')}>
      <p className="w-full text-center text-[11px] leading-4 text-legal">{legal}</p>
    </div>
  )
}
