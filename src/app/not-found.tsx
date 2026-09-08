import Link from 'next/link'

/**
 * The demo implements one page: the casino homepage of Figma frame `desktop-main` (1:2431).
 *
 * The header's secondary links — Sport, Promos, Live Casino, Tournaments, Cashback — are drawn in
 * the design but have no screens behind them, so they land here. Without this the review build
 * would answer them with the host's own 404, which reads as a broken deploy rather than as a
 * section that was never in scope.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-shell flex-col items-center justify-center px-page-x text-center mobile:px-4">
      <p className="text-xs uppercase tracking-[2px] text-gold">Jackpot — design review</p>

      <h1 className="mt-4 font-display text-3xl font-extrabold text-primary">
        This section is not part of the demo
      </h1>

      <p className="mt-4 max-w-prose text-secondary">
        The header links are reproduced from the Figma file, but only the casino homepage has a
        screen behind it. Everything that was designed is on the home page and on the screens list.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-blue px-5 py-2.5 text-sm font-semibold text-primary transition-[filter] hover:brightness-110"
        >
          Back to the casino
        </Link>
        <Link
          href="/dev/screens"
          className="rounded-full border border-solid border-strong px-5 py-2.5 text-sm font-semibold text-label transition-colors hover:bg-elevated"
        >
          All screens
        </Link>
      </div>
    </main>
  )
}
