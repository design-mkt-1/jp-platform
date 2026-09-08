import type { ButtonHTMLAttributes } from 'react'

/**
 * Node 1:5687, `Icon Button (Search)` — a fixed 40x40 circle (`Border Radius: 20px (circle)`,
 * `Padding: N/A — fixed 40x40`) that carries a real background: white 6% at rest, white 12% on
 * hover, white 4% while pressed, no shadow in any of the three.
 *
 * The circle used to be baked into the exported asset — `search-btn.svg` shipped its own
 * `<rect width="40" height="40" rx="20" fill="white" fill-opacity="0.0588"/>` — so hover and
 * active had nothing they could move, and the two other icon buttons in the chrome were left
 * painting only a hover with no rest fill under it. The circle is CSS here and the asset is the
 * bare glyph, which is what makes the three states possible at all.
 *
 * The glyph is the caller's child, at whatever size that glyph was exported: the node fixes the
 * button box, not the icon inside it.
 */
const ICON_BUTTON_CLASSES = [
  'flex size-10 shrink-0 items-center justify-center rounded-full',
  'bg-elevated transition-colors hover:bg-icon-btn-hover active:bg-icon-btn-active',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

export default function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[ICON_BUTTON_CLASSES, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
