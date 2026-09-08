import { promos } from '@/lib/data'
import type { PromoSectionSpec } from '@/lib/sections'
import type { PromoBannerData } from '@/lib/types'
import PromoBanner from '../cards/PromoBanner'
import PromoBannerMobile from '../cards/PromoBannerMobile'
import SectionHeader from './SectionHeader'

/**
 * The three promo rows of the homepage: CurrentTournamentsSection (1:3427), LotterySection
 * (1:3524) and WheelSection (1:3580).
 *
 * All three are the same 1280x302 shell — a 22px header over a 260px banner with a 20px column
 * gap — so this is one component, the sibling of ContentRow for `kind: 'promo'` specs. The banner
 * itself already branches on variant; this file only supplies the heading and the data.
 *
 * The header differs from the games rows in one way: nodes 1:3435, 1:3531 and 1:3586 all draw a
 * 160px rule pinned to the right margin with no "See All" pill after it, which is SectionHeader's
 * `fixed` rule and an omitted `total`.
 */

export interface PromoRowProps {
  section: PromoSectionSpec
  /** Defaults to the banners in tournaments.json; passed in by the screens harness. */
  promos?: PromoBannerData[]
  /** Set only if a promo row ever lands above the fold; all three sit mid-page today. */
  priority?: boolean
  className?: string
}

export default function PromoRow({
  section,
  promos: banners = promos,
  priority = false,
  className,
}: PromoRowProps) {
  // Id is the key the registry and the data file agree on. Variant is a second chance rather than
  // a rename guard: a row that loses its banner should degrade to the wrong copy, not to a hole
  // in the page — and only a missing variant is unrecoverable.
  const data =
    banners.find((banner) => banner.id === section.id) ??
    banners.find((banner) => banner.variant === section.variant)

  if (!data) return null

  return (
    <section
      aria-label={section.title}
      // 20px on desktop (1:3427); the mobile frame 1:6192 tightens it to 16px under a 24px header.
      className={['flex flex-col gap-5 mobile:gap-4', className].filter(Boolean).join(' ')}
    >
      <SectionHeader title={section.title} icon={section.icon} rule="fixed" />

      {/*
        Both banners are rendered and one is hidden, the same swap `page.tsx` makes for the game
        rows. Branching instead would need the viewport at render time, which a server component
        does not have; measuring it on the client would put the banner behind hydration and flash
        the wrong card. A hidden element is not a flex item, so the twin that loses contributes
        neither height nor gap.
      */}
      <PromoBanner data={data} priority={priority} className="mobile:hidden" />
      <PromoBannerMobile data={data} priority={priority} className="hidden mobile:flex" />
    </section>
  )
}
