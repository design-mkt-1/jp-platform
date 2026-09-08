import type { NextConfig } from 'next'

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
}

export default nextConfig
