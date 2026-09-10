import Image from 'next/image'
import { withBase } from '@/lib/assets'
import { gradientForId } from './GameCard'
import { formatGbpSuffix } from '@/lib/format'
import type { RecentWin } from '@/lib/types'

/**
 * One entry of the wins ticker: 46px thumbnail, amount, masked player, game title.
 * Desktop is node 1:2441, mobile is node 21:3036.
 *
 * The amount alternates green/amber down the row in the design. The last three entries in Figma
 * are byte-identical copies of the fifth, so the alternation is the intent and those three are
 * filler — hence the index-based rule rather than a value threshold.
 *
 * Only two things differ between the two frames, and both are scoped below: the amount is 14/18 on
 * desktop and 12/22 on the phone, and the text column's gap is 1px against 2px.
 *
 * The thumbnail's 8px radius and white-10% border are **not** desktop chrome. Session 11's plan
 * listed this line as a third unscoped desktop leak; measured against node 21:3037 on 2026-09-10,
 * the mobile thumbnail carries the identical radius and the identical border. Do not scope them.
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

        <div className="flex flex-col gap-px whitespace-nowrap font-flex mobile:gap-0.5">
          <p className={`text-sm font-bold leading-[18px] mobile:text-xs mobile:leading-[22px] ${amountClass}`}>
            {formatGbpSuffix(win.amountGbp)}
          </p>
          {/* Already masked in the data — never re-derive it here, and never render a full name. */}
          <p className="text-xs leading-[14px] text-secondary">{win.username}</p>
          {/*
           * The phone caps the title at 90px and ellipsises it — node 21:3042 carries `w-[90px]`,
           * `overflow-hidden` and `text-ellipsis`, and is the only one of the three mobile titles
           * that does. Read as a cap rather than a per-entry style because the other two,
           * 21:3050 and 21:3057, are both "in Yeti Quest" at 66 wide and never reach it. `max-w`
           * rather than a fixed width: the mobile entries are 147 and 141, not one size.
           * Desktop (1:2447) sets no cap and keeps the full title.
           */}
          <p
            className={[
              'text-[11px] font-semibold leading-[14px] text-tertiary',
              'mobile:max-w-[90px] mobile:overflow-hidden mobile:text-ellipsis',
            ].join(' ')}
          >
            in {win.gameTitle}
          </p>
        </div>
      </div>

      {withDivider ? <span aria-hidden className="h-10 w-px border-l border-strong" /> : null}
    </div>
  )
}
