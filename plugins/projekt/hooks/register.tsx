import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Status } from '../types'
import { age, parse, plain, short, when } from './parse'

const status = atom({ plugin: 'projekt', key: 'status' } as const, null)
const FILE = 'STAN.md'
const DAY_MS = 86_400_000
// Where the last prompt's moment is kept across restarts, per session.
const LAST = (sessionId: string) => `ostatnio:${sessionId}`

const TEMPLATE = `# STAN

**Zrobione:**

**W toku:**

**Czeka:**

**Dalej:**
`

function folderName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path
}

// The Claude account this session runs on, from its config folder: Stefan keeps one
// folder per account (.claude, .claude-elmi, .claude-aterima).
async function accountOf($: EngineInterface): Promise<{ account: string; dir: string }> {
  const configDir = await $.env.get('CLAUDE_CONFIG_DIR').catch(() => undefined)
  const home = (await $.env.get('USERPROFILE').catch(() => undefined)) ?? (await $.env.get('HOME').catch(() => undefined)) ?? ''
  const dir = (configDir ?? `${home}/.claude`).replace(/\\/g, '/').replace(/\/$/, '')
  const name = folderName(dir).toLowerCase()
  const account = /aterima/.test(name) ? 'ATERIMA' : /elmi/.test(name) ? 'ELMI' : 'Personal'
  return { account, dir }
}

// The session's title as the app shows it: the engine writes one record per running
// session under <config>/sessions, with the title as `name`.
async function sessionNameOf($: EngineInterface, dir: string, sessionId: string): Promise<{ name: string; startedAt: number | null }> {
  const entries = await $.fs.list(`${dir}/sessions`).catch(() => [])
  for (const entry of entries) {
    if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue
    const text = await $.fs.read(`${dir}/sessions/${entry.name}`).catch(() => undefined)
    if (typeof text !== 'string') continue
    try {
      const record = JSON.parse(text) as { sessionId?: string; name?: string; startedAt?: number }
      if (record.sessionId === sessionId) return { name: record.name ?? '', startedAt: typeof record.startedAt === 'number' ? record.startedAt : null }
    } catch {
      continue
    }
  }
  return { name: '', startedAt: null }
}

// When Stefan last wrote here: the moment kept at his last prompt; before any prompt of
// this run, the transcript's last change, else the session's start.
async function lastAtOf($: EngineInterface, dir: string, cwd: string, sessionId: string, startedAt: number | null): Promise<number | null> {
  const kept = await $.store.get(LAST(sessionId)).catch(() => undefined)
  if (typeof kept === 'number') return kept
  const transcript = `${dir}/projects/${cwd.replace(/[:\\/]/g, '-')}/${sessionId}.jsonl`
  const stat = await $.fs.stat(transcript).catch(() => undefined)
  if (stat && stat.mtimeMs > 0) return stat.mtimeMs
  return startedAt
}

// STAN.md in the working folder, else the nearest one above it.
async function locate($: EngineInterface): Promise<{ text: string; path: string } | undefined> {
  const text = await $.fs.read(FILE).catch(() => undefined)
  if (typeof text === 'string') return { text, path: FILE }
  const found = await $.fs.ancestors({ names: [FILE] }).catch(() => [])
  const nearest = found[found.length - 1]

  return nearest ? { text: nearest.content, path: `${nearest.dir}/${FILE}` } : undefined
}

async function refresh($: EngineInterface): Promise<Status> {
  const cwd = await $.session.cwd()
  const sessionId = await $.session.id().catch(() => '')
  const { account, dir } = await accountOf($)
  const { name, startedAt } = await sessionNameOf($, dir, sessionId)
  const lastAt = await lastAtOf($, dir, cwd, sessionId, startedAt)
  const found = await locate($)
  const base = { project: folderName(cwd), account, session: name, lastAt }
  const next: Status = found
    ? await (async () => {
        const parsed = parse(found.text)
        const stat = await $.fs.stat(found.path).catch(() => undefined)
        const now = await $.clock.now()
        const ageDays = stat ? Math.floor((now - stat.mtimeMs) / DAY_MS) : null

        return { ...base, hasFile: true, ...parsed, ageDays }
      })()
    : { ...base, hasFile: false, doing: [], waiting: [], next: [], done: [], urgent: null, ageDays: null }
  await update($, status, () => next)

  return next
}

function table(s: Status): string {
  const rows = [
    ...s.doing.map(item => `| ${plain(item)} | W toku |`),
    ...s.waiting.map(item => `| ${plain(item)} | Czeka |`),
    ...s.next.map(item => `| ${plain(item)} | Dalej |`),
    ...s.done.slice(-5).map(item => `| ${plain(item)} | Zrobione |`),
  ]
  const head = `**Projekt: ${s.project}** · STAN.md zaktualizowany ${age(s.ageDays)}`
  if (rows.length === 0) return `${head}\n\nSTAN.md jest pusty albo nie rozpoznaję jego układu.`

  return `${head}\n\n| Sprawa | Status |\n| --- | --- |\n${rows.join('\n')}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'stan',
      description: 'Pokaż stan projektu z STAN.md (/stan nowy zakłada plik)',
    })
    void refresh($).catch(() => undefined)

    return next(e)
  })

  // Stefan wrote: the band's "ostatnio" counts from this moment, also after a restart.
  on('prompt.submit', async ($, e, next) => {
    const sessionId = await $.session.id().catch(() => '')
    const now = await $.clock.now().catch(() => Date.now())
    if (sessionId) await $.store.set(LAST(sessionId), now).catch(() => undefined)
    await update($, status, s => (s ? { ...s, lastAt: now } : s))

    return next(e)
  })

  on('command.run', { command: 'stan' }, async ($, e) => {
    if (e.args.trim().toLowerCase() === 'nowy') {
      if (await $.fs.exists(FILE)) return { text: 'STAN.md już jest w tym folderze. Wpisz /stan, żeby go zobaczyć.' }
      await $.fs.write(FILE, TEMPLATE)
      await refresh($)

      return { text: 'Założyłem pusty STAN.md w tym folderze (Zrobione / W toku / Czeka / Dalej).' }
    }
    const s = await refresh($)

    return {
      text: s.hasFile ? table(s) : `W projekcie ${s.project} nie ma pliku STAN.md. Wpisz /stan nowy, żeby go założyć.`,
    }
  })

  // Claude may have just updated STAN.md, and the app may have renamed the session:
  // read both again when the turn ends.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined) void refresh($).catch(() => undefined)

    return done
  })

  // One line above the prompt (Stefan, 2026-11-07): the account, the session's title,
  // when he last wrote here, and the most urgent matter of STAN.md with its state.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // The band is shared: draw this line and keep what the other mods draw.
    const below = await next(e)
    const s = await read($, status)
    if (e.props.hasSurvey || s === null) return below

    const { Box, Text } = $.ui.resolve(e)
    const width = Math.max(30, e.props.bodyColumns)
    const now = await $.clock.now().catch(() => Date.now())

    const head = s.session || s.project
    const parts = [
      s.lastAt === null ? '' : `ostatnio: ${when(s.lastAt, now)}`,
      s.urgent ? `${s.urgent.kind === 'doing' ? 'w toku' : 'czeka'}: ${s.urgent.text}` : s.hasFile ? '' : 'bez STAN.md',
    ].filter(Boolean)
    const room = width - s.account.length - head.length - 9

    return (
      <Box flexDirection="column">
        {below}
        <Box>
          <Text color="claude" bold>{`▣ ${s.account}`}</Text>
          <Text bold>{`  ·  ${head}`}</Text>
          <Text dimColor>{`  ·  ${short(parts.join('  ·  '), room)}`}</Text>
        </Box>
      </Box>
    )
  })
}
