/**
 * Keep `docs/figma-node-ledger.md` in step with the tree.
 *
 * Adds rows for ids you have just read alive, then regenerates, from `citations()`, the
 * "cited under src/" column and the "Dead ids that are cited under `src/`" table. Both were edited
 * by hand until session 16 and had drifted: `21:3296`...`21:3657` still read "yes" after session 15
 * had removed every citation of them.
 *
 * It never decides whether an id is alive. Read each one with `get_metadata` first; the size you
 * pass is the one that call returned. Then run `node scripts/dead-nodes.mjs` to regenerate the guard.
 *
 * Usage: node scripts/ledger-sync.mjs '{"32:4829":"360x64"}'   (or no argument to only resync)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { citations } from './dead-nodes.mjs'
const NEW = JSON.parse(process.argv[2] ?? '{}')
const P = 'docs/figma-node-ledger.md'
let s = readFileSync(P, 'utf8').replace(/\r\n/g, '\n')
const found = citations()
const srcOf = (id) => [...(found.get(id) ?? [])].filter((p) => p.startsWith('src/')).sort()
const col = (id) => (srcOf(id).length ? 'yes' : found.has(id) ? 'docs only' : 'not cited')
const rowRe = /^\| `(\d+:\d+)` \| (alive|dead) \| ([^|]+) \| ([^|]+) \|$/gm
const rows = new Map([...s.matchAll(rowRe)].map((m) => [m[1], { status: m[2], size: m[3].trim() }]))
for (const [id, size] of Object.entries(NEW)) rows.set(id, { status: 'alive', size })
const key = (id) => id.split(':').map(Number)
const sorted = [...rows.keys()].sort((a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1])
const a = s.indexOf('| id | status | size | cited under src/ |'), b = s.indexOf('\n\n## Still to check')
if (a < 0 || b < 0) throw new Error('settled bounds')
s = s.slice(0, a) + '| id | status | size | cited under src/ |\n| --- | --- | --- | --- |\n' +
  sorted.map((id) => `| \`${id}\` | ${rows.get(id).status} | ${rows.get(id).size} | ${col(id)} |`).join('\n') + s.slice(b)
const dead = sorted.filter((id) => rows.get(id).status === 'dead' && srcOf(id).length)
const d0 = s.indexOf('## Dead ids that are cited under `src/`'), t0 = s.indexOf('| id | cited in |', d0), t1 = s.indexOf('\n\n', t0)
if (d0 < 0 || t0 < 0 || t1 < 0) throw new Error('dead bounds')
s = s.slice(0, d0) + `## Dead ids that are cited under \`src/\` — ${dead.length}` + s.slice(s.indexOf('\n', d0), t0) +
  '| id | cited in |\n| --- | --- |\n' + dead.map((id) => `| \`${id}\` | ${srcOf(id).join(', ')} |`).join('\n') + s.slice(t1)
s = s.replace(/^# Figma node id ledger — \d+ of \d+/m, `# Figma node id ledger — ${rows.size} of ${rows.size}`)
writeFileSync(P, s)
const missing = [...found.keys()].filter((id) => !rows.has(id))
console.log('rows', rows.size, 'dead cited under src', dead.length, 'missing', missing)
