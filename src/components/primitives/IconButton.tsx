import type { ComponentPropsWithRef } from 'react'

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
 *
 * The mobile header's magnifier is the one instance with no disc. Node `21:2919` is a 40x40 frame
 * holding `search_header.svg`, and that file is a single white `<path>` — no `<rect>`, no radius,
 * an 18x18 glyph centred in a 40x40 box. Checked in the bytes rather than inferred from the frame,
 * because `search-btn.svg` is exactly the file that once carried its own circle. Owner's decision
 * of 2026-09-10: drop the disc there. Hover and pressed stay — the design specifies the resting
 * appearance, and a button that answers a press with nothing at all is a different defect.
 */
const ICON_BUTTON_CLASSES = [
  'flex size-10 shrink-0 items-center justify-center rounded-full',
  'transition-colors hover:bg-icon-btn-hover active:bg-icon-btn-active',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
].join(' ')

/**
 * The resting disc, node `1:5687`. It is a prop rather than something a caller switches off with
 * another `bg-` utility, because two utilities of the same Tailwind family on one element are
 * resolved by stylesheet order and not by the order they were written — the trap that made
 * `border-none` lose to `border-solid` elsewhere in this codebase. A boolean cannot tie.
 */
const REST_FILL = 'bg-elevated'

/*
 * `ComponentPropsWithRef` rather than `ButtonHTMLAttributes` so a caller can hold the button and
 * put focus back on it. `ProviderRow` needs exactly that: the magnifier is the thing its search
 * field returns to. React 19 passes `ref` through as an ordinary prop, so the spread below already
 * delivers it and no `forwardRef` is involved.
 */
export interface IconButtonProps extends ComponentPropsWithRef<'button'> {
  /** The resting disc of node `1:5687`. Node `21:2919`, the mobile magnifier, has none. */
  disc?: boolean
}

export default function IconButton({ className, disc = true, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={[ICON_BUTTON_CLASSES, disc ? REST_FILL : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
