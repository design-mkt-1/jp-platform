import { readdirSync, statSync, unlinkSync } from 'node:fs'
import { extname, join } from 'node:path'
import sharp from 'sharp'

/**
 * Re-encodes the exported PNGs under public/images as WebP.
 *
 * The Figma exports are the raw bitmaps: the desktop hero alone is 575 KB, and the Pages build
 * serves them untouched — `images: { unoptimized: true }` in next.config.ts, because a static
 * export has no server to resize anything. WebP at quality 90 is indistinguishable at these sizes
 * and roughly a third of the bytes.
 *
 * Only public/images is walked. public/review holds the design-vs-implementation screenshots,
 * which are the report itself and must stay byte-for-byte what the comparison was made from.
 *
 * A file is replaced only when the WebP is actually smaller — a small flat PNG occasionally is
 * not, and swapping it would cost bytes and a reference change for nothing.
 *
 * Run with --dry to see the plan without writing anything.
 */

const ROOT = process.argv[2] ?? 'public/images'
const DRY = process.argv.includes('--dry')

/** Visually lossless for this artwork; below ~85 the hero's navy gradient starts to band. */
const QUALITY = 90

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : extname(full) === '.png' ? [full] : []
  })
}

const results = []

for (const file of walk(ROOT)) {
  const before = statSync(file).size
  const target = file.replace(/\.png$/, '.webp')

  // `effort: 6` is the slowest setting that still finishes in milliseconds here, and it is the
  // encoder's search depth, not a quality knob — the output is deterministic either way.
  const encoded = await sharp(file).webp({ quality: QUALITY, effort: 6 }).toBuffer()
  const after = encoded.length

  if (after >= before) {
    results.push({ file, before, after, kept: true })
    continue
  }

  if (!DRY) {
    await sharp(encoded).toFile(target)
    unlinkSync(file)
  }

  results.push({ file, target, before, after, kept: false })
}

let totalBefore = 0
let totalAfter = 0

for (const result of results) {
  totalBefore += result.before
  totalAfter += result.kept ? result.before : result.after

  const note = result.kept ? '  (PNG kept, WebP would have been larger)' : ''
  console.log(
    `${(result.before / 1024).toFixed(0).padStart(6)} KB -> ` +
      `${(result.after / 1024).toFixed(0).padStart(6)} KB  ${result.file}${note}`,
  )
}

const converted = results.filter((result) => !result.kept).length

console.log(
  `\n${converted} of ${results.length} file(s) ${DRY ? 'would be ' : ''}converted. ` +
    `Total ${(totalBefore / 1024).toFixed(0)} KB -> ${(totalAfter / 1024).toFixed(0)} KB ` +
    `(${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller).`,
)

if (converted > 0) {
  console.log(
    '\nThe references do not update themselves: src/lib/assets.ts and the .png paths in src/data/*.json.\n' +
      'src/lib/__tests__/assets.test.ts fails until every one of them has been updated.',
  )
}
