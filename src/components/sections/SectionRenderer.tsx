import type { SectionSpec } from '@/lib/sections'
import ContentRow from './ContentRow'
import PromoRow from './PromoRow'
import ProviderRow from './ProviderRow'

/**
 * The one place that maps a `SectionSpec` to the component that draws it.
 *
 * The homepage is a list of fifteen specs, not fifteen hand-placed rows, so the page itself must
 * never name a section. Everything section-specific — the glyph, the title, the query, the banner
 * variant — already lives in `src/lib/sections.ts`; all that is left is choosing between three
 * renderers by `kind`, and that choice belongs here rather than being inlined in two pages.
 *
 * Adding a fourth kind is a change to `SectionSpec` plus one branch below. Adding a *section* is a
 * change to the registry and nothing else — which is the property this file exists to protect.
 */

export interface SectionRendererProps {
  section: SectionSpec
  /** Set on the first row of a page so its artwork is fetched eagerly. */
  priority?: boolean
  /** Passed straight through to the row — the page uses it for the viewport switches. */
  className?: string
}

export default function SectionRenderer({
  section,
  priority = false,
  className,
}: SectionRendererProps) {
  if (section.kind === 'games') {
    return <ContentRow section={section} priority={priority} className={className} />
  }

  if (section.kind === 'providers') {
    return <ProviderRow section={section} className={className} />
  }

  return <PromoRow section={section} priority={priority} className={className} />
}
