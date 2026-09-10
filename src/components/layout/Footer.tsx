import Image from 'next/image'
import FooterBottom from './FooterBottom'
import FooterLinkColumn from './FooterLinkColumn'
import { LANGUAGE_FLAGS, languageFlag, partnerLogo, paymentLogo, withBase } from '@/lib/assets'
import { footer } from '@/lib/data'
import type { FooterLogo } from '@/lib/types'

/**
 * The page footer (Figma node 1:3666, 1440x729).
 *
 * Six rows stacked with one uniform 40px gap — payment logos, partners, two rules, the navigation
 * and language block, then the legal strip. The Figma y-coordinates (198→238→372→412→452→657)
 * confirm the single gap, so the frame is a plain flex column rather than six positioned blocks.
 *
 * Logo paths come from `footer.json`, which now carries every one of the fourteen files. The
 * helpers in `src/lib/assets.ts` stay as a backstop for ids the data leaves at `null` — that map
 * predates the Deutschland Casinos export and no longer covers the full set. A slot with neither
 * falls back to its label, the same way `ProviderCard` falls back to initials: a hole in the row
 * is more noticeable than a wordmark.
 */

/**
 * Inner artwork size per payment slot, read off the Figma `image` frames. The tile is always
 * 160x52, but the logos inside it are not a single size: Ethereum is a 32px square where the rest
 * are ~110x32 lockups, so one shared size would stretch four of the seven.
 */
const PAYMENT_ART: Record<string, { width: number; height: number }> = {
  'cascading-gbp': { width: 110, height: 32 },
  'gateway-crypto': { width: 89, height: 32 },
  'bitcoin-cash': { width: 110, height: 32 },
  bitcoin: { width: 110, height: 32 },
  ethereum: { width: 32, height: 32 },
  tether: { width: 110, height: 32 },
  'visa-mastercard': { width: 120, height: 30 },
}

const DEFAULT_PAYMENT_ART = { width: 110, height: 32 }

/**
 * Partner slots. `slotClass` is written out rather than composed, because Tailwind only sees class
 * names that appear literally in the source. Casinostest is the odd one: a 110x55 mark inside a
 * 48px-tall slot, which Figma clips top and bottom — hence `overflow-hidden` on the slot.
 */
const PARTNER_ART: Record<string, { slotClass: string; width: number; height: number }> = {
  casinostest: { slotClass: 'w-44 mobile:h-8', width: 110, height: 55 },
  gamblersbet: { slotClass: 'w-[150px] mobile:h-8', width: 100, height: 32 },
  'casino-bonus-now': { slotClass: 'w-[150px] mobile:h-8', width: 100, height: 50 },
  'no-deposit': { slotClass: 'w-[150px] mobile:h-8', width: 100, height: 24 },
  'casino-bonus-club': { slotClass: 'w-[150px] mobile:h-8', width: 100, height: 28 },
  zamsino: { slotClass: 'w-[150px] mobile:h-8', width: 150, height: 48 },
  // Node 1:3993 was an empty frame in wave 1; the export is a 108x48 raster that fills the slot
  // exactly, so it is measured rather than scaled.
  // The seventh slot (node 21:4020) is the one Figma draws 40 tall on the phone, not 32.
  'deutschland-casinos': { slotClass: 'w-[150px] mobile:h-10', width: 108, height: 48 },
}

const DEFAULT_PARTNER_ART = { slotClass: 'w-[150px] mobile:h-8', width: 100, height: 32 }

/**
 * Figma named all ten switcher layers `en`; the codes come from `LANGUAGE_FLAGS`, which was read
 * off the flags themselves. Without a name here the only accessible label would be the file name.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  gb: 'English',
  ru: 'Russian',
  de: 'German',
  bg: 'Bulgarian',
  nl: 'Dutch',
  tr: 'Turkish',
  no: 'Norwegian',
  it: 'Italian',
  dk: 'Danish',
  se: 'Swedish',
}

const HEADING_CLASSES =
  'w-full text-center font-flex text-lg font-bold uppercase leading-[22px] text-footer-heading'

/** Shared by both fallbacks: a wordmark that holds the slot without shouting. */
const FALLBACK_CLASSES =
  'px-2 text-center text-[11px] font-bold uppercase leading-tight tracking-[0.6px] text-label'

function PaymentTile({ logo }: { logo: FooterLogo }) {
  // logo.src comes straight from footer.json, so it has to be prefixed here; paymentLogo()
  // already is. Without this the deployed sub-path build shows seven empty payment tiles.
  const src = logo.src ? withBase(logo.src) : paymentLogo(logo.id)
  const art = PAYMENT_ART[logo.id] ?? DEFAULT_PAYMENT_ART

  return (
    <li className="flex h-[52px] w-40 flex-col items-center justify-center rounded-[10px] border border-solid border-medium bg-overlay px-4 py-2 mobile:w-[calc(50%-6px)]">
      {src ? (
        <Image
          src={src}
          alt={logo.label}
          width={art.width}
          height={art.height}
          unoptimized
          className="object-contain"
        />
      ) : (
        <span className={FALLBACK_CLASSES}>{logo.label}</span>
      )}
    </li>
  )
}

function PartnerSlot({ logo }: { logo: FooterLogo }) {
  const src = logo.src ? withBase(logo.src) : partnerLogo(logo.id)
  const art = PARTNER_ART[logo.id] ?? DEFAULT_PARTNER_ART

  const content = src ? (
    <Image
      src={src}
      alt={logo.label}
      width={art.width}
      height={art.height}
      unoptimized
      className="max-w-none object-contain mobile:h-auto mobile:max-w-full"
    />
  ) : (
    <span className={FALLBACK_CLASSES}>{logo.label}</span>
  )

  return (
    <li
      // The phone height lives in slotClass with the width: node 21:3785 lays the slots out 32
      // high, the seventh 40, and two competing mobile:h-* on one element resolved differently in
      // dev (40) and in the Pages build (32).
      className={`flex h-12 ${art.slotClass} shrink-0 items-center justify-center overflow-hidden mobile:w-[calc(33.333%-11px)]`}
    >
      {logo.href ? (
        <a
          href={logo.href}
          rel="noreferrer"
          className="flex size-full items-center justify-center transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  )
}

export default function Footer() {
  return (
    // `bg-footer` (node 1:3666), not `bg-page`: the footer is painted a shade below the page.
    <footer className="flex w-full flex-col items-center gap-10 border-t border-solid border-separator bg-footer px-page-x pb-10 pt-[60px] mobile:gap-8 mobile:px-2 mobile:pt-10">
      <div className="flex w-full max-w-content flex-col items-center gap-10 mobile:gap-8">
        <section
          aria-labelledby="footer-payments"
          className="flex w-full max-w-[1244px] flex-col items-start gap-4 rounded-2xl border border-solid border-divider bg-quaternary px-5 py-6"
        >
          <h2 id="footer-payments" className={HEADING_CLASSES}>
            Secure Payment Methods
          </h2>

          <ul className="flex w-full flex-wrap items-center justify-center gap-3">
            {footer.paymentLogos.map((logo) => (
              <PaymentTile key={logo.id} logo={logo} />
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="footer-partners"
          className="flex w-full max-w-[1244px] flex-col items-center gap-6 px-2"
        >
          <h2 id="footer-partners" className={HEADING_CLASSES}>
            Our Partners
          </h2>

          <ul className="flex w-full flex-wrap items-center justify-center gap-4">
            {footer.partnerLogos.map((logo) => (
              <PartnerSlot key={logo.id} logo={logo} />
            ))}
          </ul>
        </section>

        {/* Figma ships both rules as a 1280x1 raster of a dashed gradient. Redrawn as hairlines so
            they stay crisp at any width, the same call SectionHeader makes for its own rule.

            Desktop (1:3666) stacks the pair here, at y=372 and y=412. The rebuilt phone frame
            (21:3693) does not: it draws one rule above the link columns and the second between the
            links and the flag row. Only the second one moves, and only below 768 — hence
            `mobile:hidden` on this copy and a `hidden mobile:block` twin inside the row below.
            The row below is `flex-row` above 767px, so moving this span into it unconditionally
            would lay a full-width rule out as a third column beside the links and the flags
            (measured: that container is `row` with an 80px gap and the flag list starts at x=760).
            A hidden element is not a flex item, so neither copy costs the other viewport anything. */}
        <span aria-hidden className="w-full border-t border-dotted border-separator" />
        <span aria-hidden className="w-full border-t border-dotted border-separator mobile:hidden" />

        <div className="flex w-full items-start justify-center gap-20 mobile:flex-col mobile:items-center mobile:gap-8">
          <div className="flex flex-1 items-start justify-center mobile:w-full mobile:gap-8 mobile:px-[21.5px]">
            {footer.columns.map((column) => (
              <FooterLinkColumn
                key={column.title}
                title={column.title}
                links={column.links}
                className="w-[300px] mobile:w-auto mobile:flex-1"
              />
            ))}
          </div>

          {/* The phone's second rule (21:3693). Lives inside this container rather than above it so
              it sits between the links and the flags; `hidden` above 767px keeps it out of the
              horizontal row entirely. It replaces, rather than adds to, the stacked copy above: the
              outer column and this one both use a 32px mobile gap, so the move is height-neutral. */}
          <span
            aria-hidden
            className="hidden w-full border-t border-dotted border-separator mobile:block"
          />

          {/* No language state exists in the demo store, so the switcher renders as a labelled list
              rather than as ten links that would navigate nowhere. The first entry is the one
              Figma paints with the gold ring. */}
          <ul
            aria-label="Available languages"
            className="flex flex-1 flex-wrap items-center justify-center gap-2 pb-[15px] pt-2.5 mobile:max-w-[193px]"
          >
            {LANGUAGE_FLAGS.map((code, index) => (
              <li
                key={code}
                aria-current={index === 0 ? 'true' : undefined}
                className={`flex h-11 w-[44.694px] items-center justify-center rounded-full px-[2.082px] py-[1.735px] mobile:h-[31.7px] mobile:w-[32.2px] mobile:px-[1.5px] mobile:py-[1.25px] ${
                  index === 0 ? 'bg-gradient-gold' : ''
                }`}
              >
                {/* `border-flag` (node 1:4016) is the near-black ring Figma draws between the gold
                    selection and the flag itself; `border-card` was a stand-in for it. */}
                <span className="flex size-[40.53px] items-center justify-center overflow-hidden rounded-full border-[1.388px] border-solid border-flag mobile:size-[29.2px]">
                  <Image
                    src={languageFlag(code)}
                    alt={LANGUAGE_NAMES[code] ?? code}
                    width={39}
                    height={39}
                    unoptimized
                    className="size-[38.85px] rounded-full object-cover mobile:size-[27.99px]"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop 1:4114 draws the licensing strip; the rebuilt phone frame 21:3693 does not draw
            it at all. `FooterBottom` has exactly one call site, so hiding it here is the whole
            change — the same `mobile:hidden` switch `page.tsx` uses for its desktop-only rows.
            Worth 112px on the phone: the paragraph wraps to 80px and, being a flex item, it also
            carries the column's 32px gap. */}
        <FooterBottom legal={footer.legal} className="mobile:hidden" />
      </div>
    </footer>
  )
}
