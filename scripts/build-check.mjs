import { spawnSync } from 'node:child_process'

/**
 * Runs a production build into its own directory so it cannot collide with a running `next dev`.
 *
 * Both commands own `.next` by default. Running them together corrupts it: the dev server begins
 * failing with `ENOENT ... _buildManifest.js.tmp.<random>` and returns 500 for every route while
 * the source is perfectly fine — a failure that looks like a code bug and is not one.
 *
 * next.config.ts reads NEXT_DIST_DIR, so setting it here is enough. Spawned rather than set inline
 * because `NEXT_DIST_DIR=... next build` is not portable to the Windows shell this project is
 * developed on.
 */
const result = spawnSync('npx', ['next', 'build', '--turbopack'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: '.next-build' },
})

process.exit(result.status ?? 1)
