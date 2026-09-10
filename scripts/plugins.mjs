import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Reports which of the plugins this repo declares are actually installed for this checkout.
 *
 * Declaring a plugin in `.claude/settings.json` does not install it. Installs are recorded per
 * project in `~/.claude/plugins/installed_plugins.json`, keyed by `projectPath`. On 2026-09-10 this
 * repo declared seventeen plugins and exactly one of them — `ui-ux-pro-max` — had a record pointing
 * at `D:\jp-platform`. The other sixteen were recorded against `D:\DesignTeamPlatform`,
 * `D:\tw-platform` or an Orca workspace, and none of them loaded here.
 *
 * That went unnoticed because `claude plugin list` prints "enabled" for them. Its pretty output
 * collapses one line per plugin id and prints the *current* project's enabled flag beside a record
 * that may belong to a different project entirely. `claude plugin list --json` keeps the records
 * apart, each with its own `projectPath`. So the status word is not the check — the record is.
 *
 * This script is that check, as a diff of two files that already exist. It reads no plugin list of
 * its own: the list is whatever `enabledPlugins` says, so it can never drift from the settings file
 * the way four hand-written checklists in `docs/` did.
 *
 * Usage:
 *   node scripts/plugins.mjs             report, exit 1 if anything is missing
 *   node scripts/plugins.mjs --install   install what is missing, then report
 *   node scripts/plugins.mjs --quiet     silent when everything is ok; used by the SessionStart hook
 */

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')

/**
 * Where each marketplace comes from, so `--install` can add one that is absent.
 *
 * Measured from `~/.claude/plugins/known_marketplaces.json` on 2026-09-10. A `github` source is
 * written `owner/repo`; a `git` source is written as its clone URL. This is the only hand-kept list
 * here, and it is five lines — a config file for five lines would be the abstraction this repo's
 * rules tell us not to build.
 */
const MARKETPLACES = {
  'ui-ux-pro-max-skill': 'nextlevelbuilder/ui-ux-pro-max-skill',
  ponytail: 'https://github.com/dietrichgebert/ponytail.git',
  caveman: 'JuliusBrussee/caveman',
  'claude-plugins-official': 'anthropics/claude-plugins-official',
  'voltagent-subagents': 'https://github.com/VoltAgent/awesome-claude-code-subagents.git',
}

/**
 * Plugins whose marketplace entry points at a separate git repo pinned by sha, rather than at a
 * path inside the marketplace repo. They are the two that failed on 2026-09-10, and they fail
 * differently: installing them needs network reach to these repos, not just to the marketplace.
 * Naming them here means the next session reads the cause instead of re-deriving it.
 */
const EXTERNAL_SOURCE = {
  'superpowers@claude-plugins-official': 'github.com/obra/superpowers',
  'figma@claude-plugins-official': 'github.com/figma/mcp-server-guide',
}

const claudeConfigDir = process.env.CLAUDE_CONFIG_DIR ?? path.join(homedir(), '.claude')
const installedPath = path.join(claudeConfigDir, 'plugins', 'installed_plugins.json')
const marketplacesPath = path.join(claudeConfigDir, 'plugins', 'known_marketplaces.json')

/** A missing or unreadable file means "nothing is installed", which is a finding, not a crash. */
function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Windows writes the same directory as `D:\jp-platform` and `D:/jp-platform`, and the drive letter
 * case varies between tools. Compare resolved, lowercased, without a trailing separator.
 */
function samePath(a, b) {
  if (!a || !b) return false
  const norm = (p) => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase()
  return norm(a) === norm(b)
}

function declaredPlugins() {
  const settings = readJson(path.join(REPO_ROOT, '.claude', 'settings.json'))
  const enabled = settings?.enabledPlugins ?? {}
  return Object.keys(enabled).filter((id) => enabled[id] === true)
}

/**
 * `ok` when a record covers this checkout and its cache is still on disk.
 *
 * The cache check is not paranoia: the plugins directory carries a `.last_inuse_sweep`, so the CLI
 * does delete cached installs. A record whose `installPath` is gone is a record that lies.
 */
function statusOf(id, installed) {
  const records = installed?.plugins?.[id] ?? []
  const mine = records.filter((r) => r.scope === 'user' || samePath(r.projectPath, REPO_ROOT))
  if (mine.length === 0) return { state: 'MISSING', detail: 'not installed for this project' }

  const live = mine.find((r) => existsSync(path.join(r.installPath, '.claude-plugin', 'plugin.json')))
  if (!live) return { state: 'BROKEN', detail: 'record present, installPath gone' }

  return { state: 'ok', detail: live.version ?? '' }
}

function report() {
  const declared = declaredPlugins()
  const installed = readJson(installedPath)
  return declared.map((id) => ({ id, ...statusOf(id, installed) }))
}

function printReport(rows) {
  const width = Math.max(...rows.map((r) => r.id.length))
  for (const row of rows) {
    const label = row.state === 'ok' ? 'ok' : `${row.state} — ${row.detail}`
    console.log(`${row.id.padEnd(width)}  ${label}`)
  }
  const bad = rows.filter((r) => r.state !== 'ok')
  console.log(`\n${rows.length - bad.length}/${rows.length} installed for ${REPO_ROOT}`)
  return bad
}

function install(missing) {
  const known = readJson(marketplacesPath) ?? {}

  for (const row of missing) {
    const marketplace = row.id.split('@')[1]
    const source = MARKETPLACES[marketplace]

    if (!source) {
      console.log(`\n${row.id}: marketplace "${marketplace}" is not in this script's source map — add it.`)
      continue
    }

    if (!known[marketplace]) {
      console.log(`\nadding marketplace ${marketplace} (${source})`)
      spawnSync('claude', ['plugin', 'marketplace', 'add', source], {
        stdio: 'inherit',
        shell: true,
        cwd: REPO_ROOT,
      })
    }

    console.log(`\ninstalling ${row.id}`)
    const result = spawnSync('claude', ['plugin', 'install', row.id, '--scope', 'project'], {
      stdio: 'inherit',
      shell: true,
      cwd: REPO_ROOT,
    })

    if (result.status !== 0 && EXTERNAL_SOURCE[row.id]) {
      console.log(
        `  ${row.id} resolves from ${EXTERNAL_SOURCE[row.id]}, a separate repo from its marketplace.` +
          ` A failure here is reach to that repo, not to the marketplace.`,
      )
    }
  }
}

const args = process.argv.slice(2)
const quiet = args.includes('--quiet')

if (args.includes('--install')) {
  const missing = report().filter((r) => r.state !== 'ok')
  if (missing.length === 0) {
    console.log('nothing to install')
    process.exit(0)
  }

  install(missing)

  console.log('\nafter installing:')
  const stillBad = printReport(report())
  console.log('\nrestart the session — plugins resolve at session start, nothing above is live in this one.')
  console.log('then: git diff .claude/settings.json — the installer may have rewritten it.')
  process.exit(stillBad.length === 0 ? 0 : 1)
}

const rows = report()
const bad = rows.filter((r) => r.state !== 'ok')

if (quiet) {
  if (bad.length > 0) {
    console.log(`${bad.length} declared plugin(s) not installed here: ${bad.map((r) => r.id).join(', ')}`)
    console.log('fix with: npm run plugins:install')
  }
  process.exit(0)
}

printReport(rows)
if (bad.length > 0) console.log('fix with: npm run plugins:install')
process.exit(bad.length === 0 ? 0 : 1)
