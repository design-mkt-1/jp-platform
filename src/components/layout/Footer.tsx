import Image from 'next/image'
import FooterBottom from './FooterBottom'
import FooterLinkColumn from './FooterLinkColumn'
import { LANGUAGE_FLAGS, languageFlag, partnerLogo, paymentLogo } from '@/lib/assets'
import footerJson from '@/data/footer.json'
import type { FooterData, FooterLogo } from '@/lib/types'

/**
 * The page footer (Figma node 1:3666, 1440x729).
 *
 * Six rows stacked with one uniform 40px gap — payment logos, partners, two rules, the navigation
 * and language block, then the legal strip. The Figma y-coordinates (198→238→372→412→452→657)
 * confirm the single gap, so the frame is a plain flex column rather than six positioned blocks.
 *
 * Every logo comes from `src/lib/assets.ts`, which resolves to `null` rather than to a missing
 * file. A slot with no exported asset falls back to its label, the same way `ProviderCard` handles
 * the seven providers Figma never drew — a hole in the row is more noticeable than a wordmark.
 */

const footer: FooterData = footerJson

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
  casinostest: { slotClass: 'w-44', width: 110, height: 55 },
  gamblersbet: { slotClass: 'w-[150px]', width: 100, height: 32 },
  'casino-bonus-now': { slotClass: 'w-[150px]', width: 100, height: 50 },
  'no-deposit': { slotClass: 'w-[150px]', width: 100, height: 24 },
  'casino-bonus-club': { slotClass: 'w-[150px]', width: 100, height: 28 },
  zamsino: { slotClass: 'w-[150px]', width: 150, height: 48 },
}

const DEFAULT_PARTNER_ART = { slotClass: 'w-[150px]', width: 100, height: 32 }

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
  const src = paymentLogo(logo.id)
  const art = PAYMENT_ART[logo.id] ?? DEFAULT_PAYMENT_ART

  return (
    <li className="flex h-[52px] w-40 flex-col items-center justify-center rounded-[10px] border border-solid border-medium bg-overlay px-4 py-2">
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
  const src = partnerLogo(logo.id)
  const art = PARTNER_ART[logo.id] ?? DEFAULT_PARTNER_ART

  const content = src ? (
    <Image
      src={src}
      alt={logo.label}
      width={art.width}
      height={art.height}
      unoptimized
      className="max-w-none object-contain"
    />
  ) : (
    <span className={FALLBACK_CLASSES}>{logo.label}</span>
  )

  return (
    <li
      className={`flex h-12 ${art.slotClass} shrink-0 items-center justify-center overflow-hidden`}
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
    <footer className="flex w-full flex-col items-center gap-10 border-t border-solid border-separator bg-page px-page-x pb-10 pt-[60px] mobile:gap-8 mobile:px-4 mobile:pt-10">
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
            they stay crisp at any width, the same call SectionHeader makes for its own rule. */}
        <span aria-hidden className="w-full border-t border-dotted border-separator" />
        <span aria-hidden className="w-full border-t border-dotted border-separator" />

        <div className="flex w-full items-start justify-center gap-20 mobile:flex-col mobile:items-center mobile:gap-8">
          <div className="flex flex-1 items-start justify-center mobile:w-full mobile:flex-col mobile:items-start mobile:gap-8">
            {footer.columns.map((column) => (
              <FooterLinkColumn
                key={column.title}
                title={column.title}
                links={column.links}
                className="w-[300px] mobile:w-full"
              />
            ))}
          </div>

          {/* No language state exists in the demo store, so the switcher renders as a labelled list
              rather than as ten links that would navigate nowhere. The first entry is the one
              Figma paints with the gold ring. */}
          <ul
            aria-label="Available languages"
            className="flex flex-1 flex-wrap items-center justify-center gap-2 pb-[15px] pt-2.5"
          >
            {LANGUAGE_FLAGS.map((code, index) => (
              <li
                key={code}
                aria-current={index === 0 ? 'true' : undefined}
                className={`flex h-11 w-[44.694px] items-center justify-center rounded-full px-[2.082px] py-[1.735px] ${
                  index === 0 ? 'bg-gradient-gold' : ''
                }`}
              >
                <span className="flex size-[40.53px] items-center justify-center overflow-hidden rounded-full border-[1.388px] border-solid border-card">
                  <Image
                    src={languageFlag(code)}
                    alt={LANGUAGE_NAMES[code] ?? code}
                    width={39}
                    height={39}
                    unoptimized
                    className="size-[38.85px] rounded-full object-cover"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <FooterBottom legal={footer.legal} />
      </div>
    </footer>
  )
}
