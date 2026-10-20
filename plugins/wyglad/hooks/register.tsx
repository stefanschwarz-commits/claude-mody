import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Last, Sprawa } from '../types'
import { firstLine, isProgress, lettersOf, optionsOf, splitQuestions, splitReply, tipOf } from './split'
import type { Part, Reply } from './split'
import { svgOf } from './icons'

// Ink colours for the icons, light or dark as the theme is.
type Ink = { green: string; red: string; orange: string; blue: string; grey: string; text: string }
const INK_DARK: Ink = { green: '#4caf50', red: '#e5484d', orange: '#e8a33d', blue: '#4a8fe0', grey: '#8a8984', text: '#e8e6e3' }
const INK_LIGHT: Ink = { green: '#2e7d32', red: '#c62828', orange: '#b26a00', blue: '#1e5fb3', grey: '#6b6a66', text: '#222222' }

// An icon (Tabler outline) where the surface draws SVG; the old text glyph on the terminal.
type Drawers = { Svg?: (props: { source: string; alt: string; width?: number; height?: number }) => unknown; Text: (props: { dimColor?: boolean; bold?: boolean; color?: string; children?: unknown }) => unknown }
function inkOf(tint: { blue: string } | undefined): Ink {
  return tint?.blue === '#EEF4FC' ? INK_LIGHT : INK_DARK
}

function icon(els: unknown, surface: string, name: string, color: string, glyph: string, size = 16): unknown {
  const { Svg, Text } = els as Drawers
  // The terminal's table answers every name, so the surface decides, not the table.
  if (Svg && surface !== 'terminal') return <Svg source={svgOf(name, color, size)} alt={glyph} width={size} height={size} />
  return <Text>{glyph}</Text>
}

const OFF = 'off'

const last = atom({ plugin: 'wyglad', key: 'last' } as const, null)
const isFull = atom({ plugin: 'wyglad', key: 'isFull' } as const, false)
// Tasks ticked off ("<answer key>:<n>") and long explanations opened (answer keys).
const doneTasks = atom({ plugin: 'wyglad', key: 'doneTasks' } as const, [] as string[])
const openTexts = atom({ plugin: 'wyglad', key: 'openTexts' } as const, [] as string[])
// Every task asked of Stefan in this session, and the questions of the latest answer.
const sprawy = atom({ plugin: 'wyglad', key: 'sprawy' } as const, [] as Sprawa[])
// The text of the latest final answer, so a short one without ▶ is not taken for a work note.
const finalText = atom({ plugin: 'wyglad', key: 'finalText' } as const, null as string | null)
const PANE = 'sprawy'

// A long explanation shows this many lines until opened.
const SHORT = 12
// …and folds at all only above this many lines.
const LONG = 40
// Zrobione, Problem and Dla informacji fold only above this many lines together.
const FOLD_LINES = 15

// What a work step was, in plain words, for its one faint line.
const STEPS: Record<string, string> = {
  Bash: 'polecenie', PowerShell: 'polecenie', Read: 'czytam plik', Write: 'zapisuję plik', Edit: 'zmieniam plik',
  Grep: 'szukam w plikach', Glob: 'szukam plików', WebSearch: 'szukam w internecie', WebFetch: 'czytam stronę',
  Agent: 'pomocnik', Skill: 'umiejętność', ToolSearch: 'przygotowuję narzędzia',
}
const stepOf = (tool: string) => STEPS[tool] ?? (tool.startsWith('mcp__') ? 'usługa zewnętrzna' : tool)

const SECTIONS = [
  'Każdą odpowiedź końcową zaczynaj od linii `▶ ` z jednozdaniowym nagłówkiem (co się stało); bez niej nic nie zostanie narysowane. Odpowiedź z ▶ jest rysowana według sekcji rozdzielonych `---`.',
  'Nagłówki sekcji: 🟢 **Zrobione**, 🔴 **Nie udało się**, 🟠 **Niewyjaśnione**, 🔵 **Do zrobienia przez Ciebie**, 🔵 **Pytania do Ciebie**, ⚪ **Dla informacji** (dawne ✅ ❓ ℹ️ i „Problem” też działają). Każda tylko, gdy występuje:',
  '- `🟢 **Zrobione**` (pierwsza sekcja po linii ▶): co jest gotowe i jak sprawdziłem, krótkie punkty;',
  '- `🔴 **Nie udało się**`: co próbowałem i się nie powiodło;',
  '- `🟠 **Niewyjaśnione**`: czego jeszcze nie wiem i sprawdzam, bez pytania do Stefana (decyzje idą do „Pytania do Ciebie”).',
  'Zadania są w ramce „Do zrobienia przez Ciebie”, każde pytanie w swojej karcie, a Zrobione, Nie udało się, Niewyjaśnione i Dla informacji w osobnych kolorowych ramkach na końcu. Każdy punkt podsumowania: pogrubiony początek to wynik, nie temat („**Gira: bez nowych wydań.**”, nie „**Centrum Gira sprawdzone:**”), i najwyżej jedno zdanie dalej; szczegóły (wersje, ceny, daty) idą do wyjaśnienia wyżej, nie do podsumowania.',
  'W „Do zrobienia przez Ciebie” nie używaj tabeli: lista numerowana „1. Co zrobić (ile czasu) – po co”; mod pogrubia część przed myślnikiem, więc tam ma być samo konkretne działanie, a po myślniku tylko uzasadnienie.',
  'W tabelach porównawczych oznaczaj odpowiedzi znakami ✓ (tak), ✗ (nie), ~ (częściowo), ? (nie wiadomo), nigdy kolorowymi kropkami; kropki są tylko dla statusu sprawy.',
  'Pytania: pogrubione pytanie „**1. …?**”, linia „Dlaczego to ważne: …”, potem każda opcja w osobnej linii „- **A)** co się stanie – plus: …; minus: …” (bez tabeli), na końcu linia „➜ Polecam 1B, bo …”. Mod sam nazywa opcje jak przyciski (1A, 1B, 2A…) i oznacza polecaną gwiazdką, więc nie wpisuj gwiazdek ★ ani ⭐ w treść opcji.',
].join('\n')

// The same reply always gets the same key, so the band can scroll to it.
function keyOf(headline: string): string {
  let hash = 0
  for (const char of headline) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return `start-${(hash >>> 0).toString(36)}`
}

function summaryOf(reply: Reply): Last {
  // Count the items the frame draws, plus rows of an old-style task table (| 1 | … |);
  // a fenced block is one plain piece, so a pasted instruction never inflates the number.
  const todos = reply.parts
    .filter(part => part.kind === 'todo')
    .flatMap(part => itemsOf(part.body))
    .flatMap(item => (item.isItem ? [item] : item.text.startsWith('```') ? [] : item.text.split(/\r?\n/).filter(l => /^\s*\|\s*\d/.test(l))))
  const questions = reply.parts.filter(part => part.kind === 'questions').flatMap(part => splitQuestions(part.body))

  // Only an answer written in the sections can say "nothing for you"; a free-form one says nothing.
  const isStructured = reply.parts.some(part => part.kind !== 'plain')

  return { headline: reply.headline, key: keyOf(reply.headline), todos: todos.length, questions: questions.length, isStructured }
}

// One short line for a folded section: its first sentence.
function gist(part: Part): string {
  const text = part.kind === 'done' && part.title.length > 30 ? part.title : part.body
  const line = text.split(/\r?\n/).map(l => l.replace(/^\s*([-*]|\d+\.)\s*/, '').replace(/[*_`]/g, '').trim()).find(l => l !== '') ?? ''
  const more = text.split(/\r?\n/).filter(l => /^\s*([-*]|\d+\.)/.test(l)).length - 1

  return more > 0 ? `${line} (+${more})` : line
}

// A task list split into its items ("1. …", "- …"), each to get its own dot.
// Other lines in a row (a sentence, a table) stay together as one block.
// A fenced block (``` … ```) is text to copy, never a list of tasks: it stays one
// piece, fences included, so a pasted instruction is not turned into tick boxes.
// "Zmień hasło (5 min) – po to": what to do reads bold, why reads faint.
// "[plan.pdf](plan.pdf)", "[Plan](C:\Projekty\plan.pdf)": a link to a file on this
// computer, not a web address. Returns its label and path.
export function fileOf(text: string): { label: string; path: string } | undefined {
  const link = /^\s*\**\s*\[([^\]]+)\]\(([^)\s]+)\)\s*\**\s*[.;,]?\s*$/.exec(text)
  if (!link) return undefined
  const path = link[2]
  if (/^(https?|mailto|ftp):/i.test(path)) return undefined
  return { label: link[1], path }
}

function taskOf(text: string): { what: string; why: string } {
  // "**Zadanie 1:** …" (instruction v7) would double the number the frame draws.
  const plain = text.replace(/\*\*/g, '').replace(/^Zadanie\s+\d+:\s*/i, '')
  const at = /\s[–—-]\s/.exec(plain)
  if (!at) return { what: plain, why: '' }
  return { what: plain.slice(0, at.index), why: plain.slice(at.index + at[0].length) }
}

function itemsOf(body: string): { isItem: boolean; text: string }[] {
  const out: { isItem: boolean; text: string }[] = []
  let inFence = false
  for (const line of body.split(/\r?\n/)) {
    const prev = out[out.length - 1]
    if (/^\s*```/.test(line)) {
      if (!inFence) out.push({ isItem: false, text: line })
      else if (prev) prev.text += `\n${line}`
      inFence = !inFence
      continue
    }
    if (inFence) {
      if (prev) prev.text += `\n${line}`
      continue
    }
    if (line.trim() === '') continue
    const item = /^\s*(\d+\.|[-*])\s+(.*)$/.exec(line)
    // A link to a file on this computer is not a task: it is drawn below the frame.
    if (item && fileOf(item[2])) out.push({ isItem: false, text: item[2] })
    else if (item) out.push({ isItem: true, text: item[2] })
    else if (/^\s*plik[a-z]*:\s*$/i.test(line)) continue
    else if (prev && !prev.isItem && !fileOf(prev.text)) prev.text += `\n${line}`
    else out.push({ isItem: false, text: line })
  }
  return out
}

// Points in the summary get numbers instead of bullets: fewer dots on screen.
// Numbering restarts after a paragraph; nested points and tables stay as they are.
function numbered(body: string): string {
  let n = 0
  let inFence = false
  return body
    .split(/\r?\n/)
    .map(line => {
      if (/^\s*```/.test(line)) inFence = !inFence
      if (inFence || /^\s*```/.test(line)) return line
      const point = /^[-*•]\s+(.*)$/.exec(line)
      if (point) {
        n += 1
        return `${n}. ${point[1]}`
      }
      // A sub-point under a numbered point needs a deeper indent to stay inside it.
      const sub = /^\s+[-*•]\s+(.*)$/.exec(line)
      if (sub && n > 0) return `    - ${sub[1]}`
      if (line.trim() !== '' && !/^\s/.test(line)) n = 0
      return line
    })
    .join('\n')
}

// How each summary section is drawn: its title, frame colour and tint.
const SECTION = {
  done: { title: 'Zrobione', color: 'success', tint: 'green', icon: 'circle-check', glyph: '●' },
  failed: { title: 'Nie udało się', color: 'error', tint: 'red', icon: 'circle-x', glyph: '●' },
  open: { title: 'Niewyjaśnione', color: 'warning', tint: 'orange', icon: 'help-circle', glyph: '●' },
  info: { title: 'Dla informacji', color: 'inactive', tint: 'grey', icon: 'info-circle', glyph: '●' },
} as const

// A summary split into drawable pieces: a numbered point is { n, lead, rest },
// where the lead (first sentence, or Claude's own bold start) reads bold and the
// rest faint; anything else (a table, a sub-point, a sentence) is kept as text.
// Indented lines under a point (a sub-point, a link) are its `subs`, drawn inside the
// point with their indent stripped: left as-is, four leading spaces would read as code.
type Piece = { n: string; lead: string; rest: string; subs: string[] } | { text: string }

function pieces(body: string): Piece[] {
  const out: Piece[] = []
  let fence: { text: string } | undefined
  for (const line of body.split(/\r?\n/)) {
    // A fenced block is one piece, kept whole.
    if (fence) {
      fence.text += `\n${line}`
      if (/^\s*```/.test(line)) fence = undefined
      continue
    }
    if (/^\s*```/.test(line)) {
      fence = { text: line }
      out.push(fence)
      continue
    }
    if (line.trim() === '') continue
    const last = out[out.length - 1]
    if (/^\s+\S/.test(line) && last && 'n' in last) {
      last.subs.push(line.trim())
      continue
    }
    const point = /^(\d+)\.\s+(.*)$/.exec(line)
    if (!point) {
      out.push({ text: line })
      continue
    }
    const bold = /^\*\*(.+?)\*\*\s*(.*)$/.exec(point[2])
    if (bold) {
      out.push({ n: point[1], lead: bold[1], rest: bold[2], subs: [] })
      continue
    }
    const cut = /^(.*?[.:!?])\s+(\S.*)$/.exec(point[2])
    out.push(cut ? { n: point[1], lead: cut[1], rest: cut[2], subs: [] } : { n: point[1], lead: point[2], rest: '', subs: [] })
  }
  return out
}

// Faint blue inside the question cards and faint orange behind the tasks,
// light or dark as the theme is.
async function tintOf($: { config: { list: () => Promise<readonly { key: string; value: unknown }[]> } }): Promise<{ blue: string; orange: string; grey: string; green: string; red: string; violet: string } | undefined> {
  try {
    const theme = String((await $.config.list()).find(row => row.key === 'theme')?.value ?? 'dark')
    return theme.includes('light') ? { blue: '#EEF4FC', orange: '#FDF3E7', grey: '#F2F2F0', green: '#EEF6EA', red: '#FCEEEE', violet: '#F3EEFB' } : { blue: '#17212E', orange: '#2A1F14', grey: '#222326', green: '#172116', red: '#2A1616', violet: '#221A30' }
  } catch {
    return undefined
  }
}

function needsOf(todos: number, questions: number): string {
  return [
    todos > 0 ? count(todos, 'zadanie', 'zadania', 'zadań') : '',
    questions > 0 ? count(questions, 'pytanie', 'pytania', 'pytań') : '',
  ].filter(Boolean).join(' i ')
}

// Tasks of the latest answer, in the order of their numbers in the frame.
async function tasksOfLast($: Parameters<typeof read>[0]): Promise<Sprawa[]> {
  const answer = await read($, last)
  if (!answer) return []
  return (await read($, sprawy)).filter(one => one.kind === 'todo' && one.id.startsWith(`${answer.key}:`))
}

function count(n: number, one: string, few: string, many: string): string {
  const word = n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many
  return `${n} ${word}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wyglad',
      description: 'Wygląd odpowiedzi: /wyglad on albo /wyglad off',
    })
    await $.command.register({ name: 'sprawy', description: 'Panel „Moje sprawy”: zadania do odhaczenia i pytania' })
    // A tool Claude calls to tick tasks off in "Moje sprawy" when Stefan says "1 zrobiłem".
    await $.tool.register({
      name: 'odhacz',
      description: 'Odhacza zadania z ostatniej odpowiedzi w panelu „Moje sprawy”. Wywołaj, gdy Stefan napisze, że zadanie zrobił („1 zrobiłem”) albo że odpada; numery to numery z ramki „Do zrobienia przez Ciebie”.',
      inputSchema: {
        type: 'object',
        properties: {
          numery: { type: 'array', items: { type: 'integer', minimum: 1 }, description: 'Numery zadań z ostatniej odpowiedzi' },
          stan: { type: 'string', enum: ['zrobione', 'odpada', 'otwarte'], description: 'zrobione i odpada skreślają zadanie; otwarte przywraca je' },
        },
        required: ['numery'],
      },
      isDeferred: false,
    })

    return next(e)
  })

  on('tool.call', { tool: 'mcp__wyglad__odhacz' }, async ($, e) => {
    const input = e as unknown as { numery?: number[]; stan?: string }
    const tasks = await tasksOfLast($)
    const stan = input.stan ?? 'zrobione'
    const hit = (input.numery ?? []).map(n => ({ n, task: tasks[n - 1] }))
    const ids = hit.flatMap(h => (h.task ? [h.task.id] : []))
    await update($, doneTasks, list => (stan === 'otwarte' ? list.filter(id => !ids.includes(id)) : [...list.filter(id => !ids.includes(id)), ...ids]))
    await $.ui.invalidate('ui.render')
    const lines = hit.map(h => (h.task ? `${h.n}. ${h.task.text} – ${stan}` : `${h.n}. brak takiego zadania w ostatniej odpowiedzi`))
    const open = tasks.length - (await read($, doneTasks)).filter(id => tasks.some(t => t.id === id)).length
    $.ui.status(open > 0 ? `czeka: ${count(open, 'zadanie', 'zadania', 'zadań')}` : undefined)
    return { result: [...lines, `Otwartych zadań z ostatniej odpowiedzi: ${open}.`].join('\n') }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'wyglad: odhaczanie nie powiodło się' }))

  // "1 zrobiłem, 3 odpada": the model reads which tasks those numbers name.
  const SAID = /(\d+(?:\s*(?:,|i|oraz)\s*\d+)*)\s*(zrobi[łl][ae]m|zrobione|gotowe|załatwione|odpada|odpad[łl]o|pomijam|rezygnuj[eę]|nie zrobi[eę])/giu
  on('prompt.submit', async ($, e, next) => {
    if (e.text.length > 400) return next(e)
    const tasks = await tasksOfLast($)
    if (tasks.length === 0) return next(e)
    const notes: string[] = []
    for (const m of e.text.matchAll(SAID)) {
      const stan = /zrobi|gotowe|załatw/i.test(m[2]) ? 'zrobione' : 'odpada'
      for (const n of m[1].split(/\D+/).filter(Boolean).map(Number)) {
        const task = tasks[n - 1]
        notes.push(task ? `Zadanie ${n} („${task.text}”): ${stan}.` : `Zadanie ${n}: brak takiego numeru w ostatniej odpowiedzi.`)
      }
    }
    if (notes.length === 0) return next(e)
    const note = [`Numery w wiadomości Stefana odnoszą się do ramki „Do zrobienia przez Ciebie” z Twojej ostatniej odpowiedzi:`, ...notes, 'Odhacz je narzędziem odhacz i potwierdź jednym zdaniem.'].join('\n')
    return next({ ...e, context: [...(e.context ?? []), note] })
  })

  on('command.run', { command: 'sprawy' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Moje sprawy' })

    return { text: 'Otworzyłem panel „Moje sprawy”.' }
  })

  // The pane is a table of contents: one line per task or question, a tick box
  // for tasks, and ↗ to jump to the full text in the answer, where it is answered.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, sprawy)
    const ticked = await read($, doneTasks)
    const tasks = list.filter(one => one.kind === 'todo')
    const open = tasks.filter(one => !ticked.includes(one.id))
    const done = tasks.filter(one => ticked.includes(one.id))
    const asks = list.filter(one => one.kind === 'question')
    const tick = (id: string) => () => void update($, doneTasks, l => (l.includes(id) ? l.filter(x => x !== id) : [...l, id]))
    const jump = (target: string) => () => void $.ui.scroll({ to: { key: target }, block: 'start' }).catch(() => undefined)
    const answerOf = (id: string) => id.split(':')[0]

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>{`Do zrobienia (${open.length})`}</Text>
        {open.length === 0 ? <Text dimColor>Nic nie czeka na Ciebie.</Text> : null}
        {open.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`p-${one.id}`} label="☐" onPress={tick(one.id)} />
            <Button key={`j-${one.id}`} label="↗" onPress={jump(`${answerOf(one.id)}-todo`)} />
            <Text wrap="truncate-end">{one.text}</Text>
          </Box>
        ))}
        {asks.length > 0 ? <Text bold>{`Pytania (${asks.length})`}</Text> : null}
        {asks.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`j-${one.id}`} label="↗" onPress={jump(`${answerOf(one.id)}-${one.id.split(':')[1]}`)} />
            <Text wrap="truncate-end">{one.text}</Text>
          </Box>
        ))}
        {done.length > 0 ? <Text bold dimColor>{`Odhaczone (${done.length})`}</Text> : null}
        {done.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`p-${one.id}`} label="☑" onPress={tick(one.id)} />
            <Text dimColor strikethrough wrap="truncate-end">{one.text}</Text>
          </Box>
        ))}
      </Box>
    )
  })

  on('command.run', { command: 'wyglad' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const isOff = arg === 'off' ? true : arg === 'on' ? false : (await $.store.get(OFF)) !== true
    await $.store.set(OFF, isOff)
    await $.ui.invalidate('ui.render')

    return { text: isOff ? 'Wygląd odpowiedzi: zwykły. Włączysz: /wyglad on' : 'Wygląd odpowiedzi: kolorowy. Wyłączysz: /wyglad off' }
  })

  // Tell Claude about the sections this mod draws.
  on('prompt.compose', async ($, e, next) => {
    const out = await next(e)
    if ((await $.store.get(OFF)) === true) return out

    return { sections: [...out.sections, { id: 'wyglad:sekcje', text: SECTIONS, scope: 'session' }] }
  })

  // Remember the last answer for the band above the prompt.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.reason === 'answer' && e.agentId === undefined) {
      await update($, finalText, () => e.answer.trim() || null)
      const reply = splitReply(e.answer)
      const summary = reply ? summaryOf(reply) : null
      await update($, last, () => summary)
      if (reply && summary) {
        const tasks: Sprawa[] = reply.parts
          .filter(part => part.kind === 'todo')
          .flatMap(part => itemsOf(part.body))
          .flatMap((item, i) => (item.isItem ? [{ id: `${summary.key}:${i}`, kind: 'todo' as const, text: item.text.replace(/[*_`]/g, ''), letters: [] }] : []))
        const asks: Sprawa[] = reply.parts
          .filter(part => part.kind === 'questions')
          .flatMap(part => splitQuestions(part.body))
          .map(q => ({ id: `${summary.key}:q${q.number}`, kind: 'question' as const, text: `${q.number}. ${q.text.split(`\n\n`)[0].replace(/\*\*/g, '')}`, letters: lettersOf(q).map(l => `${q.number}${l}`), options: optionsOf(q) }))
        await update($, sprawy, list => [
          ...list.filter(one => one.kind === 'todo' && !tasks.some(t => t.id === one.id)),
          ...tasks,
          ...asks,
        ].slice(-100))
      }
      const needs = summary ? needsOf(summary.todos, summary.questions) : ''
      if (needs && (await $.store.get(OFF)) !== true) $.ui.toast(`Gotowe. Potrzebuję od Ciebie: ${needs}`, { timeoutMs: 8000 })
      // The status line keeps the count in view without scrolling.
      $.ui.status(needs ? `czeka: ${needs}` : undefined)
    }

    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    const answer = await read($, last)
    if (e.props.hasSurvey || e.props.isWorking || answer === null || (await $.store.get(OFF)) === true) return below

    const els = $.ui.resolve(e)
    const { Box, Text, Button } = els
    const ink = inkOf(await tintOf($))
    const ticked = (await read($, doneTasks)).filter(id => id.startsWith(`${answer.key}:`)).length
    const needs = needsOf(Math.max(0, answer.todos - ticked), answer.questions)

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={2}>
          {needs || answer.isStructured ? (
            <Box flexDirection="row" gap={1}>
              {icon(els, e.surface, 'dot', needs ? ink.orange : ink.green, '●')}
              <Text bold>{needs ? `Potrzebuję od Ciebie: ${needs}` : 'Nic od Ciebie nie potrzebuję'}</Text>
            </Box>
          ) : null}
          <Button
            key="jump"
            label="↑ Początek odpowiedzi"
            onPress={() => void $.ui.scroll({ to: { key: answer.key }, block: 'start' }).catch(() => undefined)}
          />
          <Button key="pane" label="Moje sprawy" onPress={() => void $.ui.open({ id: PANE, title: 'Moje sprawy' }).catch(() => undefined)} />
        </Box>
        {below}
      </Box>
    )
  })

  // Work steps: a run of calls is one faint line, a single call too. Errors and
  // running calls keep the engine's own drawing, so nothing that matters hides.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (e.props.isExpanded || (await $.store.get(OFF)) === true) return next(e)
    const els = $.ui.resolve(e)
    const { Box, Text } = els
    const ink = inkOf(await tintOf($))
    const kinds = [...new Set(e.props.calls.map(call => stepOf(call.tool)))].slice(0, 3).join(', ')
    const running = e.props.calls.some(call => call.isRunning) ? ' …' : ''
    return (
      <Box flexDirection="row" gap={1}>
        {icon(els, e.surface, 'settings', ink.grey, '·', 14)}
        <Text dimColor italic wrap="truncate-end">{`${count(e.props.calls.length, 'krok', 'kroki', 'kroków')} w tle (${kinds})${running}`}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { tool, isRunning, isErrored, isInterrupted } = e.props
    if (isRunning || isErrored || isInterrupted || (await $.store.get(OFF)) === true) return next(e)
    const els = $.ui.resolve(e)
    const { Box, Text } = els
    const ink = inkOf(await tintOf($))
    return (
      <Box flexDirection="row" gap={1}>
        {icon(els, e.surface, 'settings', ink.grey, '·', 14)}
        <Text dimColor italic>{stepOf(tool)}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const { text, isSummary } = e.props
    if (isSummary || (await $.store.get(OFF)) === true) return next(e)

    const els = $.ui.resolve(e)
    const { Box, Text, Markdown, Button } = els

    // Messages written while Claude works: one faint, slanted line.
    // The final answer never is one, even short and without ▶: it keeps the engine's drawing.
    const answer = await read($, finalText)
    const isFinal = answer !== null && text.trim() !== '' && answer.endsWith(text.trim())
    if (isProgress(text) && !isFinal) {
      return (
        <Box>
          <Text dimColor italic>{`· ${firstLine(text)}`}</Text>
        </Box>
      )
    }

    const reply = splitReply(text)
    if (!reply) return next(e)

    const key = keyOf(reply.headline)
    const full = await read($, isFull)
    // Zrobione, Problem and Dla informacji show in full; only a really long lot folds.
    const isLongFold = reply.parts
      .filter(part => part.kind === 'done' || part.kind === 'failed' || part.kind === 'open' || part.kind === 'info')
      .reduce((n, part) => n + part.body.split(/\r?\n/).filter(l => l.trim() !== '').length, 0) > FOLD_LINES
    const isLatest = (await read($, last))?.key === key
    const ticked = await read($, doneTasks)
    const isOpen = (await read($, openTexts)).includes(key)
    const tint = await tintOf($)
    const ink = inkOf(tint)
    const tick = (id: string) => () => void update($, doneTasks, list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]))
    const fill = (value: string) => () => {
      void $.prompt.fill({ text: `${value} `, mode: 'append' }).catch(() => undefined)
    }

    const todos = reply.parts.filter(part => part.kind === 'todo')
    const questions = reply.parts.filter(part => part.kind === 'questions').flatMap(part => splitQuestions(part.body))
    const plain = reply.parts.filter(part => part.kind === 'plain')
    const folded = reply.parts.filter(part => part.kind === 'done' || part.kind === 'failed' || part.kind === 'open' || part.kind === 'info')

    return (
      <Box flexDirection="column" gap={1}>
        <Box key={key} flexDirection="column" gap={1}>
          {/* A light bar marks where the latest answer starts; older ones get a faint line. */}
          {isLatest ? (
            <Box backgroundColor="inactive" paddingX={1} flexDirection="row" gap={1}>
              {icon(els, e.surface, 'player-play', ink.text, '▶')}
              <Text color="inverseText" bold>Nowa odpowiedź</Text>
            </Box>
          ) : (
            <Box flexDirection="row" gap={1}>
              {icon(els, e.surface, 'player-play', ink.grey, '▶')}
              <Text dimColor>Odpowiedź</Text>
            </Box>
          )}
          <Text bold>{reply.headline}</Text>
        </Box>
        {(() => {
          // A long explanation shows its first lines until opened.
          const lines = plain.map(part => part.body).join('\n\n').split('\n')
          if (lines.length === 1 && lines[0] === '') return null
          // Cut only at a blank line outside a table, so no table is ever split.
          // …and never right after a heading ("Zrobię sam:", "**Na ciebie**"), which would leave it empty.
          const isHeading = (line = '') => /:\s*\**\s*$/.test(line.trim()) || /^(#+\s|\*\*[^*]+\*\*$)/.test(line.trim())
          const lastText = (n: number) => [...lines.slice(0, n)].reverse().find(l => l.trim() !== '')
          const cut = lines.findIndex(
            (line, n) => n >= SHORT && line.trim() === '' && !lines[n - 1]?.trim().startsWith('|') && !isHeading(lastText(n)),
          )
          const isLong = lines.length > LONG && cut > 0 && cut < lines.length - 2
          return (
            <Box flexDirection="column">
              <Markdown text={isLong && !isOpen ? lines.slice(0, cut).join('\n') : lines.join('\n')} />
              {isLong ? (
                <Box>
                  <Button
                    key={`open-${key}`}
                    label={isOpen ? 'Pokaż mniej' : `Pokaż więcej (${lines.length - cut} linii)`}
                    onPress={() => void update($, openTexts, list => (list.includes(key) ? list.filter(x => x !== key) : [...list, key]))}
                  />
                </Box>
              ) : null}
            </Box>
          )
        })()}
        {todos.length + questions.length > 0 ? (
          <Box flexDirection="column" gap={1}>
            {/* Every frame carries its own title inside, so it is clear what it holds. */}
            {todos.length > 0 ? (() => {
              // The frame holds the tasks and their sentence; a fenced block (text to copy)
              // is drawn below it as a plain code box, so the frame never swallows a paste.
              const all = todos.flatMap(part => itemsOf(part.body))
              const isFence = (text: string) => text.startsWith('```')
              return (
                <Box flexDirection="column" gap={1}>
                  <Box key={`${key}-todo`} flexDirection="column" borderStyle="round" borderColor="suggestion" backgroundColor={tint?.blue} paddingX={1} gap={1}>
                    <Box flexDirection="row" gap={1}>
                      {icon(els, e.surface, 'list-check', ink.blue, '●')}
                      <Text bold>Do zrobienia przez Ciebie</Text>
                    </Box>
                    {all.map((item, i) =>
                      item.isItem ? (
                        <Box key={`d${i}`} flexDirection="row" alignItems="flex-start" gap={1}>
                          <Text>{`${all.slice(0, i + 1).filter(one => one.isItem).length}.`}</Text>
                          {ticked.includes(`${key}:${i}`) ? (
                            <Text dimColor strikethrough>{item.text.replace(/[*_`]/g, '')}</Text>
                          ) : (
                            <Box flexDirection="column">
                              <Text bold>{taskOf(item.text).what}</Text>
                              {taskOf(item.text).why ? <Markdown text={taskOf(item.text).why} dimColor /> : null}
                            </Box>
                          )}
                        </Box>
                      ) : isFence(item.text) || fileOf(item.text) ? null : (
                        <Markdown key={`d${i}`} text={item.text} />
                      ),
                    )}
                  </Box>
                  {all.filter(item => !item.isItem && isFence(item.text)).map((item, i) => (
                    <Markdown key={`fence${i}`} text={item.text} />
                  ))}
                  {/* Files on this computer: a row each, with a button that shows the file in its folder
                      (the desktop app's own tool); on the phone a note, as the file is not there. */}
                  {all.flatMap(item => (!item.isItem && fileOf(item.text) ? [fileOf(item.text)!] : [])).map((file, i) => (
                    <Box key={`file${i}`} flexDirection="row" alignItems="flex-start" gap={1}>
                      {icon(els, e.surface, 'file', ink.grey, '·')}
                      <Text>{file.label}</Text>
                      {e.surface === 'mobile' ? (
                        <Text dimColor>plik na komputerze, poproś o załącznik</Text>
                      ) : (
                        <Button key={`reveal-${key}-${i}`} label="Pokaż w folderze" onPress={() => void $.tool.call({ tool: 'mcp__ccd_host__reveal_path', path: file.path } as never).catch(() => $.ui.toast(`Nie udało się pokazać pliku ${file.label}`))} />
                      )}
                    </Box>
                  ))}
                </Box>
              )
            })() : null}
            <Box flexDirection="column" gap={2}>
            {questions.map((q, i) => {
              // A decision card: the question, its options, the advice and the buttons in one frame.
              const [title, ...why] = q.text.split('\n\n')
              return (
                <Box key={`${key}-q${q.number}`} flexDirection="column" borderStyle="round" borderColor="suggestion" backgroundColor={tint?.blue} paddingX={1} gap={1}>
                  <Box flexDirection="row" gap={1}>
                    {icon(els, e.surface, 'message-question', ink.blue, '●')}
                    <Text bold>{`Pytanie ${q.number}: ${title.replace(/\*\*/g, '')}`}</Text>
                  </Box>
                  {why.length > 0 ? <Markdown text={why.join('\n\n')} dimColor /> : null}
                  {/* One option per line, named as its button; the star marks the advice. */}
                  {optionsOf(q).map(option => (
                    <Box key={`o${i}-${option.id}`} flexDirection="row" alignItems="flex-start" gap={1}>
                      <Text bold>{`${option.id}${option.isBest ? ' ★' : ''}`}</Text>
                      <Markdown text={option.text.replace(/\s*[★⭐]️?\s*/gu, ' ').trim()} />
                    </Box>
                  ))}
                  {q.tip ? <Text bold>{tipOf(q)}</Text> : null}
                  {optionsOf(q).length > 0 ? (
                    <Box flexDirection="row" flexWrap="wrap" gap={2}>
                      {optionsOf(q).map(option => (
                        <Button
                          key={`b${i}-${option.id}`}
                          label={`Wybierz ${option.id}${option.isBest ? ' ★' : ''}`}
                          onPress={fill(option.id)}
                        />
                      ))}
                    </Box>
                  ) : null}
                </Box>
              )
            })}
            </Box>
          </Box>
        ) : null}
        {folded.length > 0 ? (
          // The summary: one frame per section in its own colour, each with its title inside.
          <Box flexDirection="column" gap={1}>
            {(!isLongFold || full ? folded : folded.filter(part => part.kind !== 'info')).map((part, i) => {
              const look = SECTION[part.kind as keyof typeof SECTION] ?? SECTION.info
              const body = part.kind === 'done' && part.title.length > 30 ? `${part.title}

${part.body}` : part.body
              const all = pieces(numbered(body))
              // A block to paste (```) is drawn whole, below the frame, so its fences
              // never become empty code boxes inside it.
              const isFence = (piece: Piece) => 'text' in piece && piece.text.startsWith('```')
              return (
                <Box key={`f${i}`} flexDirection="column" gap={1}>
                <Box flexDirection="column" borderStyle="round" borderColor={look.color} backgroundColor={tint?.[look.tint]} paddingX={1} gap={1}>
                  <Box flexDirection="row" gap={1}>
                    {icon(els, e.surface, look.icon, ink[look.tint], look.glyph)}
                    <Text bold>{look.title}</Text>
                  </Box>
                  {!isLongFold || full ? (
                    all.filter(piece => !isFence(piece)).map((piece, j) =>
                      'n' in piece ? (
                        <Box key={`s${i}-${j}`} flexDirection="row" alignItems="flex-start" gap={1}>
                          <Text>{`${piece.n}.`}</Text>
                          <Box flexDirection="column">
                            <Text bold>{piece.lead}</Text>
                            {piece.rest ? <Markdown text={piece.rest} dimColor /> : null}
                            {piece.subs.map((sub, k) => (
                              <Markdown key={`sub${i}-${j}-${k}`} text={sub} dimColor />
                            ))}
                          </Box>
                        </Box>
                      ) : (
                        <Markdown key={`s${i}-${j}`} text={piece.text} />
                      ),
                    )
                  ) : (
                    <Text wrap="truncate-end">{gist(part)}</Text>
                  )}
                </Box>
                {(!isLongFold || full ? all.filter(isFence) : []).map((piece, j) => (
                  <Markdown key={`fence${i}-${j}`} text={'text' in piece ? piece.text : ''} />
                ))}
                </Box>
              )
            })}
            {isLongFold ? (
              <Box>
                <Button key={`more-${key}`} label={full ? 'Zwiń szczegóły' : 'Pokaż szczegóły'} onPress={() => void update($, isFull, value => !value)} />
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    )
  })
}
