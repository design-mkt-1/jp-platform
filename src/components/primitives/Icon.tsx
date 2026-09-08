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
 */

export interface IconProps {
  name: IconName
  /** Figma draws most glyphs in a 20x20 box; the section-header flame is 14x20. */
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
