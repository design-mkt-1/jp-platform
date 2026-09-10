import Image from 'next/image'
import { sectionIcon } from '@/lib/assets'
import type { IconName } from '@/lib/types'

/**
 * A single exported glyph from `public/images/icons/`.
 *
 * `unoptimized` is not an oversight: every icon in this set is an SVG, and Next's image optimizer
 * rejects SVG sources unless `images.dangerouslyAllowSVG` is enabled in next.config.ts. Enabling
 * that is a project-wide security decision, so the primitive opts out of the optimizer instead and
 * serves the file exactly as it was exported.
 *
 * Scope: the small glyphs only. `public/images/logo.svg` is the 113x56 Jackpot wordmark and is
 * deliberately not reachable from here — `IconName` cannot name it, and `sectionIcon()` only ever
 * builds paths under `images/icons/`. The layout renders the wordmark directly.
 *
 * Each file is a flat exported fill, not a `currentColor` outline, so `text-*` on the caller does
 * nothing. A glyph that has to change colour on hover needs its chrome moved instead.
 */

export interface IconProps {
  name: IconName
  /**
   * Figma draws most glyphs in a 20x20 box; the section-header flame is 14x20, `close` (1:4319)
   * is 16x16, `balance-add` (32:1833) is 24x24, `search-header` (32:1838) is 40x40 with the glyph
   * already centred in it, and `chevron-down` (1:4280) is a 32x32 disc with the chevron already
   * inside it — pass its own size rather than scaling it to 20.
   */
  width?: number
  height?: number
  className?: string
  /** Icons here sit next to their own label, so they default to decorative. */
  alt?: string
}

export default function Icon({ name, width = 20, height = 20, className, alt = '' }: IconProps) {
  return (
    <Image
      src={sectionIcon(name)}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      aria-hidden={alt === '' || undefined}
    />
  )
}
