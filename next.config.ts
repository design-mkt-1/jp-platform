import type { NextConfig } from 'next'

/*
 * GitHub Pages serves this repo at https://design-mkt-1.github.io/jp-platform/, so every asset and
 * link needs that prefix. It is applied only when the Pages workflow sets GITHUB_PAGES=true —
 * turning it on locally would move the dev server to localhost:3000/jp-platform and break the
 * screenshot scripts, which address the root.
 */
const isPages = process.env.GITHUB_PAGES === 'true'
const basePath = isPages ? '/jp-platform' : undefined

const nextConfig: NextConfig = {
  /*
   * `next dev` and `next build` both own `.next`, and running them at the same time corrupts it:
   * the dev server starts failing with `ENOENT ... _buildManifest.js.tmp.<random>` and serves 500
   * for every route, while the code itself is fine. It happened here — a production build was run
   * to verify a change while the review server was still up.
   *
   * Rather than rely on remembering, `npm run build:check` points the build at its own directory
   * so it can never touch the running server's. Plain `npm run build` is unchanged for CI and for
   * real production builds, where no dev server is around.
   */
  distDir: process.env.NEXT_DIST_DIR ?? '.next',

  // Next applies `basePath` to links and to its own bundles, but not to an image `src`.
  // src/lib/assets.ts reads this to prefix everything under public/.
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? '' },

  // The demo has no server: every route is prerendered, so Pages can host the output directly.
  ...(isPages
    ? {
        output: 'export' as const,
        basePath,
        // Next's image optimiser needs a server. A static export has none, so the files are served
        // as they are — which is why the hero was exported at a sane size in the first place.
        images: { unoptimized: true },
        // Pages serves /route/ as /route/index.html.
        trailingSlash: true,
      }
    : {}),
}

export default nextConfig
