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
 *   2. a <path> whose own bounding box misses the viewBox entirely, or dwarfs it
 *   3. any <rect> or <foreignObject> outside <defs> that dwarfs the viewBox — see FURNITURE_SCALE
 *
 * ## Why rule 2 is a shape and not a distance
 *
 * Rule 2 used to ask how far a path's *first* coordinate sat from the viewBox and called anything
 * past 1000 units page furniture. That is a property of where the artboard happened to be parked,
 * not of the artwork. Six files kept a 1440x729 footer panel — `M-803.453 -464.576H636.547V264.424
 * H-803.453V-464.576Z` in cascading-gbp-a.svg — purely because it starts at -803 and not at -1200,
 * while the identical panel in every other export was removed. It now measures the shape instead:
 * a path is furniture when its box does not touch the viewBox at all, or when it spans the viewBox
 * FURNITURE_SCALE times over. That holds wherever Figma parks the frame.
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

/**
 * How many times the viewBox a shape has to span before rules 2 and 3 call it page furniture.
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

const NUMBER = /-?\d*\.?\d+(?:e-?\d+)?/gi

/**
 * Bounding box `[x0, y0, x1, y1]` of a path's `d`, or null when it holds no coordinates.
 *
 * Only M, L, C, H, V and Z occur in the 50 files under public/images — counted, not assumed — so
 * this walks those and nothing else. H and V are why it cannot just min/max every number in the
 * string: in `H636.547V264.424` those are an x and a y on their own, and pairing blindly would read
 * them as one point at (636.547, 264.424) and miss the 1440-wide span they actually describe.
 *
 * Curve control points are folded in as they are, which can only overstate the box. A glyph's
 * control points never push it past FURNITURE_SCALE, and a page frame is past it either way.
 */
function pathBox(d) {
  let x = 0
  let y = 0
  let box = null
  const grow = () => {
    box = box
      ? [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)]
      : [x, y, x, y]
  }
  for (const [, command, args] of d.matchAll(/([MLCHVZ])([^MLCHVZ]*)/gi)) {
    const numbers = (args.match(NUMBER) ?? []).map(Number)
    if (command.toUpperCase() === 'H') {
      for (const value of numbers) {
        x = value
        grow()
      }
    } else if (command.toUpperCase() === 'V') {
      for (const value of numbers) {
        y = value
        grow()
      }
    } else {
      for (let i = 0; i + 1 < numbers.length; i += 2) {
        x = numbers[i]
        y = numbers[i + 1]
        grow()
      }
    }
  }
  return box
}

/** True when a path's box misses the viewBox altogether, or spans it FURNITURE_SCALE times over. */
function isFurniturePath([x0, y0, x1, y1], vw, vh) {
  const misses = x1 < 0 || y1 < 0 || x0 > vw || y0 > vh
  const dwarfs = x1 - x0 > vw * FURNITURE_SCALE || y1 - y0 > vh * FURNITURE_SCALE
  return misses || dwarfs
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

  // Rules 2 and 3 both measure against the viewBox, so neither can run without one.
  if (Number(vw) > 0 && Number(vh) > 0) {
    // 2. paths whose own geometry is the page and not the glyph
    out = out.replace(/\s*<path\b[^>]*\bd="([^"]+)"[^>]*\/>/gi, (tag, d) => {
      const box = pathBox(d)
      return box && isFurniturePath(box, Number(vw), Number(vh)) ? '' : tag
    })

    // 3. rects and blur layers bigger than the icon itself — the page behind the glyph
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

  // Groups and masks left empty by the removals carry nothing. An empty <mask> is exactly what the
  // footer panel leaves behind — Figma wraps the panel's own outline in one — and the only path
  // that referenced it was the panel's border, removed by the same rule. Repeated, because a group
  // that only held another empty group is itself only empty after that inner one has gone.
  let collapsed
  do {
    collapsed = out
    out = collapsed.replace(/\s*<(g|mask)\b[^>]*>\s*<\/\1>/g, '')
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
