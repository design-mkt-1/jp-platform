import Image from 'next/image'
import { withBase } from '@/lib/assets'
import { gradientForId } from './GameCard'
import { formatGbpSuffix } from '@/lib/format'
import type { RecentWin } from '@/lib/types'

/**
 * One entry of the wins ticker (Figma node 1:2441): 46px thumbnail, amount, masked player,
 * game title.
 *
 * The amount alternates green/amber down the row in the design. The last three entries in Figma
 * are byte-identical copies of the fifth, so the alternation is the intent and those three are
 * filler — hence the index-based rule rather than a value threshold.
 */

export interface RecentWinItemProps {
  win: RecentWin
  /** Position in the ticker; drives the green/amber alternation. */
  index?: number
  /** The 40px hairline that separates entries in the design (node 1:2448). */
  withDivider?: boolean
  className?: string
}

export default function RecentWinItem({
  win,
  index = 0,
  withDivider = false,
  className,
}: RecentWinItemProps) {
  const amountClass = index % 2 === 0 ? 'text-green' : 'text-amber'

  return (
    <div className={['flex shrink-0 items-center gap-3.5', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-3">
        <div className="relative size-[46px] shrink-0 overflow-hidden rounded-lg border border-solid border-strong bg-page">
          {win.thumb ? (
            <Image
              src={withBase(win.thumb)}
              alt=""
              fill
              sizes="46px"
              className="object-cover"
            />
          ) : (
            // Same deterministic palette pick as the game grid, so a title without artwork looks
            // the same colour wherever it appears on the page.
            <div className={`size-full ${gradientForId(win.gameId)}`} />
          )}
        </div>

        <div className="flex flex-col gap-px whitespace-nowrap font-flex">
          <p className={`text-sm font-bold leading-[18px] ${amountClass}`}>
            {formatGbpSuffix(win.amountGbp)}
          </p>
          {/* Already masked in the data — never re-derive it here, and never render a full name. */}
          <p className="text-xs leading-[14px] text-secondary">{win.username}</p>
          <p className="text-[11px] font-semibold leading-[14px] text-tertiary">
            in {win.gameTitle}
          </p>
        </div>
      </div>

      {withDivider ? <span aria-hidden className="h-10 w-px border-l border-strong" /> : null}
    </div>
  )
}
