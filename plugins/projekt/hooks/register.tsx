import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Status } from '../types'
import { age, parse, plain, short } from './parse'

const status = atom({ plugin: 'projekt', key: 'status' } as const, null)
const FILE = 'STAN.md'
const DAY_MS = 86_400_000

const TEMPLATE = `# STAN

**Zrobione:**

**W toku:**

**Dalej:**
`

function folderName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path
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
  const found = await locate($)
  const next: Status = found
    ? await (async () => {
        const parsed = parse(found.text)
        const stat = await $.fs.stat(found.path).catch(() => undefined)
        const now = await $.clock.now()
        const ageDays = stat ? Math.floor((now - stat.mtimeMs) / DAY_MS) : null

        return { project: folderName(cwd), hasFile: true, ...parsed, ageDays }
      })()
    : { project: folderName(cwd), hasFile: false, doing: [], next: [], done: [], ageDays: null }
  await update($, status, () => next)

  return next
}

function table(s: Status): string {
  const rows = [
    ...s.doing.map(item => `| ${plain(item)} | W toku |`),
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

  on('command.run', { command: 'stan' }, async ($, e) => {
    if (e.args.trim().toLowerCase() === 'nowy') {
      if (await $.fs.exists(FILE)) return { text: 'STAN.md już jest w tym folderze. Wpisz /stan, żeby go zobaczyć.' }
      await $.fs.write(FILE, TEMPLATE)
      await refresh($)

      return { text: 'Założyłem pusty STAN.md w tym folderze (Zrobione / W toku / Dalej).' }
    }
    const s = await refresh($)

    return {
      text: s.hasFile ? table(s) : `W projekcie ${s.project} nie ma pliku STAN.md. Wpisz /stan nowy, żeby go założyć.`,
    }
  })

  // Claude may have just updated STAN.md: read it again when the turn ends.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined) void refresh($).catch(() => undefined)

    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, status)
    if (e.props.hasSurvey || s === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const width = Math.max(30, e.props.bodyColumns)

    if (!s.hasFile) {
      return (
        <Box>
          <Text color="claude" bold>{`▣ ${s.project}`}</Text>
          <Text dimColor>{'  ·  brak STAN.md (/stan nowy)'}</Text>
        </Box>
      )
    }

    const first = s.doing[0] ? `: ${s.doing[0]}` : ''
    const parts = [
      `w toku ${s.doing.length}${first}`,
      `dalej ${s.next.length}`,
      s.ageDays === null ? '' : `aktualizacja: ${age(s.ageDays)}`,
    ].filter(Boolean)
    const room = width - s.project.length - 6

    return (
      <Box>
        <Text color="claude" bold>{`▣ ${s.project}`}</Text>
        <Text dimColor>{`  ·  ${short(parts.join('  ·  '), room)}`}</Text>
      </Box>
    )
  })
}
