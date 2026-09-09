import Image from 'next/image'
import Link from 'next/link'
import { gameThumbOrNull } from '@/lib/assets'
import type { Game } from '@/lib/types'

/**
 * The 203x264 card of Figma node 1:2602.
 *
 * The Figma card has no text layer — every instance carries the same baked artwork, so the design
 * file contains no per-game art and no per-game title. Only three slugs were ever exported. The
 * rest therefore render a brand gradient with the title and provider drawn on top: the point is
 * that a card without artwork must look like a decision, not like a 404.
 */

/**
 * Stable across renders, machines and deploys — the same game always gets the same gradient.
 * A random pick would reshuffle the whole grid on every navigation, and a hash of the array index
 * would reshuffle it whenever a row's filter changed.
 */
export function gradientForId(id: string): 'bg-gradient-gold' | 'bg-gradient-orange' {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    // FNV-style mixing kept in 32-bit range so the result does not depend on float precision.
    hash = (hash * 31 + id.charCodeAt(index)) | 0
  }
  return (hash & 1) === 0 ? 'bg-gradient-gold' : 'bg-gradient-orange'
}

export interface GameCardProps {
  game: Game
  /** Display name resolved from `providers.json`; falls back to the raw id when omitted. */
  providerName?: string
  /** Wraps the card in a link when supplied. */
  href?: string
  /** Set on the first row so its images are not lazy-loaded below the fold. */
  priority?: boolean
  className?: string
}

const CARD_CLASSES = [
  'relative block aspect-[203/264] w-full overflow-hidden rounded-2xl',
  'border border-solid border-card bg-card shadow-[0_4px_8px_rgb(0_0_0/0.25)]',
  // The phone frames draw their own shadow — node 1:6179 "Overlay+Shadow" carries
  // -2px 2px 12px rgba(8,8,20,0.75): offset to the left, three times the blur, and near-opaque
  // where the desktop one is a quarter-black drop. It has no token because the theme carries no
  // shadow colours; docs/tokens.md §2b records it with its node.
  'mobile:shadow-[-2px_2px_12px_rgb(8_8_20/0.75)]',
].join(' ')

export default function GameCard({
  game,
  providerName,
  href,
  priority = false,
  className,
}: GameCardProps) {
  // `game.thumb` is trusted only when the file is known to exist: the data files name a PNG for
  // every game, but only three were exported.
  const thumb = gameThumbOrNull(game.slug)
  const provider = providerName ?? game.provider

  const body = thumb ? (
    <Image
      src={thumb}
      alt={game.title}
      fill
      priority={priority}
      // Node 1:5888 makes the mobile card 114px inside a 3-column grid, so a third of the
      // viewport minus the page inset is closer than any fixed pixel width.
      sizes="(max-width: 767px) 33vw, 203px"
      className="object-cover"
    />
  ) : (
    <div className={`flex size-full flex-col justify-end p-3 mobile:p-2 ${gradientForId(game.id)}`}>
      {/*
        Dark text on the gold/orange gradient, matching the JOIN NOW button's black label.

        Clamped, because the card is a fixed 203/264 box with `overflow-hidden` and the block is
        bottom-aligned: a title that needs a third line grows upward and is cut off at the top edge
        rather than pushing the card taller. It showed on the 114px mobile card, where "Golden Koi
        Rising" and "Frost Fangs" both lost their first line.
      */}
      {/* `break-words` for the tablet range the Figma file has no frame for: at 1024 the desktop
          six-column grid squeezes a 203px card down to about 120px, and a single long word — the
          catalogue's worst case is "Starburst" — is wider than that. Without it the word is cut
          mid-letter with no ellipsis, because a clamp has nothing to ellipsise when there is no
          second word. Nothing changes at 1440, where every title fits. */}
      <p className="line-clamp-2 break-words font-display text-base font-extrabold leading-tight text-page mobile:text-[13px]">
        {game.title}
      </p>
      <p className="mt-1 line-clamp-1 text-[11px] font-bold uppercase tracking-[0.6px] text-page opacity-70 mobile:text-[10px]">
        {provider}
      </p>
    </div>
  )

  const classes = [CARD_CLASSES, className].filter(Boolean).join(' ')

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`}
        aria-label={`${game.title} by ${provider}`}
      >
        {body}
      </Link>
    )
  }

  return <article className={classes}>{body}</article>
}
