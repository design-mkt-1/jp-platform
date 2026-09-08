'use client'

import Image from 'next/image'
import providersData from '@/data/providers.json'
import { SEARCH_BUTTON_ICON } from '@/lib/assets'
import type { ProvidersSectionSpec } from '@/lib/sections'
import type { Provider } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'
import ProviderCard from '../cards/ProviderCard'
import ProviderSearch from '../search/ProviderSearch'
import SearchNoResults from '../search/SearchNoResults'
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
 * Client because of one control: the search button in the header (node 1:5936) opens the row's own
 * filter — `ProviderSearch`, nodes 1:2220 and 1:4321 — and the badges below are then the studios
 * whose name contains what was typed. It used to open the *games* search, which shares nothing with
 * this row but the glyph. The store is deliberately provider-less, so this island can reach it
 * directly.
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
  const openProviderSearch = useAppStore((state) => state.openProviderSearch)
  const query = useAppStore((state) => state.providerQuery)

  const term = (query ?? '').trim().toLowerCase()
  const matches = term ? list.filter((provider) => provider.name.toLowerCase().includes(term)) : list
  const secondBand = rotate(matches)
  const empty = matches.length === 0

  const noResults = (
    <SearchNoResults size="sm" title="No providers found" description="Try a different search term" />
  )

  const searchButton = (
    // `relative` is the popover's anchor: node 1:4321 hangs off this button's right edge, and the
    // button is the only element on the page that knows where that edge is. At 390 the button goes
    // away while the field is up — node 1:2222 has nothing left in this slot.
    <div className={`relative shrink-0 ${query === null ? '' : 'mobile:hidden'}`}>
      <button
        type="button"
        onClick={openProviderSearch}
        aria-label="Search providers"
        aria-expanded={query !== null}
        className="rounded-full transition-[filter] duration-150 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {/* The exported asset is the whole 40x40 control, circle included — no background here. */}
        <Image src={SEARCH_BUTTON_ICON} alt="" width={40} height={40} unoptimized className="size-10" />
      </button>

      {/* Node 1:4321 is the field and the message in one card. `-my-8` hands back the 32px of
          padding `sm` carries of its own, which the card's 32px gap has already spent — the same
          trick, for the same reason, as the `-my-4` in SearchOverlay. */}
      <ProviderSearch variant="popover">
        {empty ? <div className="-my-8">{noResults}</div> : null}
      </ProviderSearch>
    </div>
  )

  return (
    <section
      aria-label={section.title}
      className={['flex flex-col gap-5', className].filter(Boolean).join(' ')}
    >
      <div className="flex flex-col gap-4">
        {/* Node 1:2650 fixes its rule at 160px and pushes the search button to the margin, unlike
            the games rows whose rule stretches to meet the See All pill. */}
        <SectionHeader title={section.title} icon={section.icon} action={searchButton} rule="fixed" />

        {/* Node 1:2221 stacks the field under the header at 390 and gives it the row's full width.
            Above 767px the field is the popover anchored to the button, and this renders nothing. */}
        <ProviderSearch variant="inline" />
      </div>

      {empty ? (
        // Node 1:2218 draws the badge bands under this message. With nothing matching there are no
        // badges left to draw, so the message is the whole state — recorded in the README as a
        // deliberate difference. The section's 20px gap plus the 32px `sm` carries would sit the
        // glyph 52px under the field where node 1:2245 puts it 8; -44px is that difference.
        <div className="-mt-11 hidden mobile:block">{noResults}</div>
      ) : (
        <div className="flex flex-col overflow-hidden">
          {/* Band one, node 1:2658. Only the first copy of the badges is announced and focusable;
              the second exists so the wrap has no seam, which is decoration, not information. */}
          <div className="flex w-max animate-marquee">
            <div className="flex">
              {matches.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  {...(hrefForProvider ? { href: hrefForProvider(provider) } : {})}
                />
              ))}
            </div>
            <div aria-hidden className="flex">
              {matches.map((provider) => (
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
      )}
    </section>
  )
}
