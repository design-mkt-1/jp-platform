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
 * Node 1:2657 stacks two `Slider-Track-Wrapper` frames, each holding a 1680px row of 140px badges
 * inside a 1280px clip — the design's way of drawing a marquee in a static file. There is no
 * keyframe in globals.css and this component may not add one, so the bands are user-scrollable
 * rails instead of self-animating tracks: same overflowing, edge-to-edge look, no motion nobody
 * asked for. See the change request in the phase report if the marquee is wanted.
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
      <SectionHeader title={section.title} icon={section.icon} action={searchButton} />

      <div className="flex flex-col">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex w-max">
            {list.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                {...(hrefForProvider ? { href: hrefForProvider(provider) } : {})}
              />
            ))}
          </div>
        </div>

        {/*
          The second band is the same twelve studios again — decoration that fills the row's width,
          not new information. Hidden from assistive tech and left unlinked so it adds neither a
          duplicate announcement nor a second set of tab stops.
        */}
        <div aria-hidden className="overflow-x-auto no-scrollbar">
          <div className="flex w-max">
            {rotate(list).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
