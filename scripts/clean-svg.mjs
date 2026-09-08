import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

/**
 * Strips the Figma page frame out of exported SVGs.
 *
 * Figma's asset export sometimes wraps a glyph in the geometry of the canvas it was sitting on: a
 * solid #1E1E1E rectangle the size of the viewBox, plus one or two paths whose coordinates run to
 * five digits (the outline of the whole 10259x7788 page). The root viewBox clips all of it, so the
 * icons still render correctly — but bonus-buy.svg carried 17.8 KB for a 20px glyph.
 *
 * Only two shapes are removed, both of which are provably not the artwork:
 *   1. a <rect> filling the whole viewBox with the canvas grey
 *   2. a <path> whose first coordinate lies far outside the viewBox
 *
 * Anything else is left alone. Run with --dry to see what would change.
 */

const ROOT = process.argv[2] ?? 'public/images'
const DRY = process.argv.includes('--dry')

/** How far outside the viewBox a coordinate has to be before it is page furniture, not a glyph. */
const OUTSIDE = 1000

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : extname(full) === '.svg' ? [full] : []
  })
}

function firstCoordinate(d) {
  const match = d.match(/-?\d+(?:\.\d+)?/g)
  if (!match) return null
  return [Number(match[0]), Number(match[1] ?? 0)]
}

let totalBefore = 0
let totalAfter = 0
const changed = []

for (const file of walk(ROOT)) {
  const original = readFileSync(file, 'utf8')
  let out = original

  const viewBox = out.match(/viewBox="([\d.\s-]+)"/)
  const [, , vw = 0, vh = 0] = viewBox ? viewBox[1].trim().split(/\s+/).map(Number) : []

  // 1. the canvas backdrop
  out = out.replace(/\s*<rect\b[^>]*fill="#1E1E1E"[^>]*\/>/gi, '')

  // 2. paths that start far outside the box
  out = out.replace(/\s*<path\b[^>]*\bd="([^"]+)"[^>]*\/>/gi, (tag, d) => {
    const point = firstCoordinate(d)
    if (!point) return tag
    const [x, y] = point
    const far =
      x < -OUTSIDE || y < -OUTSIDE || x > Number(vw) + OUTSIDE || y > Number(vh) + OUTSIDE
    return far ? '' : tag
  })

  // Groups left empty by the removals carry nothing.
  out = out.replace(/\s*<g\b[^>]*>\s*<\/g>/g, '')

  totalBefore += Buffer.byteLength(original)
  totalAfter += Buffer.byteLength(out)

  if (out !== original) {
    changed.push({
      file,
      before: Buffer.byteLength(original),
      after: Buffer.byteLength(out),
    })
    if (!DRY) writeFileSync(file, out)
  }
}

for (const c of changed) {
  console.log(`${c.before.toString().padStart(6)} -> ${c.after.toString().padStart(6)}  ${c.file}`)
}
console.log(
  `\n${changed.length} fisiere ${DRY ? 'ar fi' : ''} modificate. ` +
    `Total ${totalBefore} -> ${totalAfter} octeti ` +
    `(${Math.round((1 - totalAfter / totalBefore) * 100)}% mai putin).`,
)
