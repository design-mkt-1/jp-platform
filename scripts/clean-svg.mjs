import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

/**
 * Strips the Figma page frame out of exported SVGs.
 *
 * Figma's asset export sometimes wraps a glyph in the geometry of the canvas it was sitting on: a
 * solid rectangle the size of the page, plus one or two paths whose coordinates run to five digits
 * (the outline of the whole 10259x7788 canvas). The root viewBox clips all of it, so the icons
 * still render correctly — but bonus-buy.svg carried 17.8 KB for a 20px glyph.
 *
 * Three shapes are removed, all of which are provably not the artwork:
 *   1. a <rect> filling the whole viewBox with the canvas grey #1E1E1E
 *   2. a <path> whose first coordinate lies far outside the viewBox
 *   3. any <rect> or <foreignObject> outside <defs> that dwarfs the viewBox — see FURNITURE_SCALE
 *
 * ## Why rule 3 is geometric and not a list of fills
 *
 * Rule 1 matched one hard-coded colour, and the ten section icons re-exported later carry
 * `fill="#0F121D"` instead — the page background, not the canvas grey. Extending the fill list
 * would have fixed nine of them and missed the tenth: slots.svg carries the category bar's glass
 * capsule (`#151624`) and an inactive tab chip (white 2%) as well, and those are perfectly ordinary
 * colours that appear all over the real artwork. What they are not is *small*. A 1440x7453 rect, a
 * 1280x78 capsule and a 117x54 chip inside a `0 0 20 20` viewBox can only be the page behind the
 * glyph: anything that wide is either clipped away or paints a full-bleed block over the icon.
 *
 * <foreignObject> is measured the same way and for the same reason — slots.svg wraps its tab chip
 * in a 133x70 backdrop-filter layer, which is page furniture that no rect rule would ever reach.
 *
 * Shapes inside <defs> are left alone. The rects in there are clip paths and masks, and they are
 * *supposed* to be the size of what they clip: drops-wins.svg's only rect is the 20x20 inside its
 * clipPath, and deleting it would break the clip rather than clean the file.
 *
 * Anything else is left alone. Run with --dry to see what would change.
 */

const ROOT = process.argv[2] ?? 'public/images'
const DRY = process.argv.includes('--dry')

/** How far outside the viewBox a coordinate has to be before it is page furniture, not a glyph. */
const OUTSIDE = 1000

/**
 * How many times the viewBox a <rect> has to span before rule 3 calls it page furniture.
 *
 * Not a taste setting — it is read off the files. Measured across all 62 SVGs under public/images,
 * every shape sorts into one of two groups with a wide gap between them:
 *
 *   kept, at most 1.63x   the ring around each flag (39.142 in a 39 box — `--border-flag`, node
 *                         1:4016, and a documented part of the design), gb.svg's gradient backing
 *                         (44.694), the provider badge disc (110.833 in 69) and the payment chip
 *                         (160x52 in 110x32)
 *   removed, at least 2.7x  the 1440x7453 page rect in twenty-seven files, the footer panel behind
 *                         the payment logos (1244x138), and the category bar slots.svg drags along
 *                         — a 1280x78 capsule and a 117x54 tab chip inside a 20x20 box
 *
 * A plain "bigger than the viewBox" test would have deleted the flag rings, which are 0.14px
 * larger than the box and are the design. Three sits in the empty middle of the two groups.
 */
const FURNITURE_SCALE = 3

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

/** Reads one numeric attribute off an opening tag; null when absent or not a plain number. */
function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="(-?[\\d.]+)"`, 'i'))
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

/** True when the shape dwarfs the icon's own box, i.e. it is the page and not the artwork. */
function isPageFurniture(tag, vw, vh) {
  const w = attr(tag, 'width')
  const h = attr(tag, 'height')
  if (w === null && h === null) return false
  return (w !== null && w > vw * FURNITURE_SCALE) || (h !== null && h > vh * FURNITURE_SCALE)
}

/**
 * Applies `clean` to everything except the <defs> blocks.
 *
 * The capturing group makes `split` keep the delimiters, so the odd indices are the <defs> blocks
 * themselves and are passed through untouched. This does not assume where Figma puts <defs>.
 */
function outsideDefs(svg, clean) {
  return svg
    .split(/(<defs\b[\s\S]*?<\/defs>)/gi)
    .map((part, index) => (index % 2 === 1 ? part : clean(part)))
    .join('')
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

  // 3. rects and blur layers bigger than the icon itself — the page behind the glyph
  if (Number(vw) > 0 && Number(vh) > 0) {
    out = outsideDefs(out, (part) =>
      part
        .replace(/\s*<rect\b[^>]*\/>/gi, (tag) =>
          isPageFurniture(tag, Number(vw), Number(vh)) ? '' : tag,
        )
        .replace(/\s*<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, (tag) =>
          isPageFurniture(tag, Number(vw), Number(vh)) ? '' : tag,
        ),
    )
  }

  // Groups left empty by the removals carry nothing. Repeated, because a group that only held
  // another empty group is itself only empty after that inner one has gone.
  let collapsed
  do {
    collapsed = out
    out = collapsed.replace(/\s*<g\b[^>]*>\s*<\/g>/g, '')
  } while (out !== collapsed)

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
  `\n${changed.length} file(s) ${DRY ? 'would be ' : ''}changed. ` +
    `Total ${totalBefore} -> ${totalAfter} bytes ` +
    `(${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller).`,
)
