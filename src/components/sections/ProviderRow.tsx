'use client'

import Image from 'next/image'
import providersData from '@/data/providers.json'
import { SEARCH_BUTTON_ICON } from '@/lib/assets'
import type { ProvidersSectionSpec } from '@/lib/sections'
import type { Provider } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'
import ProviderCard from '../cards/ProviderCard'
import SectionHeader from './SectionHeader'

/**
 * The Leading Providers row of Figma node 1:2649 (1280x340).
 *
 * Node 1:2657 stacks two `Slider-Track-Wrapper` frames (1:2658 and 1:2919), each holding a 1680px
 * row of 140px badges inside a 1280px clip — the design's way of drawing a marquee in a static
 * file. `.animate-marquee` / `.animate-marquee-reverse` in globals.css are those two bands; both
 * stop under `prefers-reduced-motion`.
 *
 * Each track renders its badges twice. The keyframe translates by -50%, which is exactly one copy,
 * so the moment the first copy leaves the clip the second is sitting where it started and the loop
 * has no visible seam. Halving the copies would tear it every 40 seconds.
 *
 * Client because of one control: the 40px search button in the header opens the global search.
 * The store is deliberately provider-less, so this island can reach it directly.
 */

const providers = providersData as Provider[]

export interface ProviderRowProps {
  section: ProvidersSectionSpec
  providers?: Provider[]
  /** Builds the per-badge link. Omit to render non-interactive badges. */
  hrefForProvider?: (provider: Provider) => string
  className?: string
}

/**
 * The second band starts halfway through the list so the two rows do not line up into one wide
 * column of identical badges — the design shows two visibly different sequences.
 */
function rotate<T>(items: T[]): T[] {
  const offset = Math.floor(items.length / 2)
  return [...items.slice(offset), ...items.slice(0, offset)]
}

export default function ProviderRow({
  section,
  providers: list = providers,
  hrefForProvider,
  className,
}: ProviderRowProps) {
  const openSearch = useAppStore((state) => state.openSearch)
  const secondBand = rotate(list)

  const searchButton = (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search providers"
      className="shrink-0 rounded-full transition-[filter] duration-150 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      {/* The exported asset is the whole 40x40 control, circle included — no background here. */}
      <Image src={SEARCH_BUTTON_ICON} alt="" width={40} height={40} unoptimized className="size-10" />
    </button>
  )

  return (
    <section
      aria-label={section.title}
      className={['flex flex-col gap-5', className].filter(Boolean).join(' ')}
    >
      {/* Node 1:2650 fixes its rule at 160px and pushes the search button to the margin, unlike
          the games rows whose rule stretches to meet the See All pill. */}
      <SectionHeader title={section.title} icon={section.icon} action={searchButton} rule="fixed" />

      <div className="flex flex-col overflow-hidden">
        {/* Band one, node 1:2658. Only the first copy of the badges is announced and focusable;
            the second exists so the wrap has no seam, which is decoration, not information. */}
        <div className="flex w-max animate-marquee">
          <div className="flex">
            {list.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                {...(hrefForProvider ? { href: hrefForProvider(provider) } : {})}
              />
            ))}
          </div>
          <div aria-hidden className="flex">
            {list.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>

        {/*
          Band two, node 1:2919, travelling the other way. It is the same studios a third and
          fourth time — decoration that fills the row's height, not new information — so the whole
          band is hidden from assistive tech and left unlinked: no duplicate announcement, no
          second set of tab stops.
        */}
        <div aria-hidden className="flex w-max animate-marquee-reverse">
          <div className="flex">
            {secondBand.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
          <div className="flex">
            {secondBand.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
