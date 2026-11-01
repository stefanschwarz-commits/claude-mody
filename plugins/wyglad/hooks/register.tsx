import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Last, Sprawa, Stamp } from '../types'
import { firstLine, isProgress, lettersOf, linkPaths, optionsOf, splitQuestions, splitReply, tipOf } from './split'
import type { Part, Reply } from './split'
import { svgOf } from './icons'
import { blocksOf, hasMarks, marksOf } from './zakreslacz'

// Ink colours for the icons, light or dark as the theme is.
type Ink = { green: string; red: string; orange: string; blue: string; sand: string; grey: string; text: string }
const INK_DARK: Ink = { green: '#4caf50', red: '#e5484d', orange: '#e8a33d', blue: '#4a8fe0', sand: '#b8ad98', grey: '#8a8984', text: '#e8e6e3' }
const INK_LIGHT: Ink = { green: '#2e7d32', red: '#c62828', orange: '#b26a00', blue: '#1e5fb3', sand: '#8a7f6a', grey: '#6b6a66', text: '#222222' }

// An icon (Tabler outline) where the surface draws SVG; the old text glyph on the terminal.
type Drawers = { Svg?: (props: { source: string; alt: string; width?: number; height?: number }) => unknown; Text: (props: { dimColor?: boolean; bold?: boolean; color?: string; children?: unknown }) => unknown }
// A mail draft is a light sheet in both themes, so it never looks like Claude's own text.
const PAPER = { sheet: '#FBFAF6', ink: '#222222', label: '#6b6a66', edge: '#9a958a' }

function inkOf(tint: { blue: string } | undefined): Ink {
  return tint?.blue === '#EEF4FC' ? INK_LIGHT : INK_DARK
}

function icon(els: unknown, surface: string, name: string, color: string, glyph: string, size = 16): unknown {
  const { Svg, Text } = els as Drawers
  // The terminal's table answers every name, so the surface decides, not the table.
  if (Svg && surface !== 'terminal') return <Svg source={svgOf(name, color, size)} alt={glyph} width={size} height={size} />
  return <Text>{glyph}</Text>
}

// One marked run: a word gets the marker (background), a sentence is bold and underlined.
function emphasis(els: unknown, run: { text: string; kind?: 'word' | 'sentence' }, mark: string | undefined, key: string): unknown {
  const { Text } = els as Drawers & { Text: (props: { key?: string; backgroundColor?: string; bold?: boolean; underline?: boolean; dimColor?: boolean; children?: unknown }) => unknown }
  return run.kind === 'word' ? (
    <Text key={key} backgroundColor={mark} dimColor={false}>{run.text}</Text>
  ) : (
    <Text key={key} bold underline dimColor={false}>{run.text}</Text>
  )
}

// A text with its bold runs drawn as a marker, wherever it stands: a task's why, a question's
// why or option, a summary point's grey rest. Markdown keeps anything a span cannot draw.
function marked(els: unknown, text: string, mark: string | undefined, isDim: boolean, key?: string): unknown {
  const { Text, Markdown } = els as Drawers & { Markdown: (props: { text: string; dimColor?: boolean; key?: string }) => unknown }
  const blocks = blocksOf(text)
  if (blocks.length !== 1 || blocks[0].kind !== 'para' || !hasMarks(blocks)) return <Markdown key={key} text={text} dimColor={isDim} />
  return (
    <Text key={key} dimColor={isDim}>
      {blocks[0].runs.map((run, j) => (run.isMark ? emphasis(els, run, mark, `r${j}`) : run.text))}
    </Text>
  )
}

const OFF = 'off'

const last = atom({ plugin: 'wyglad', key: 'last' } as const, null)
// Summary frames opened with their own "Pokaż szczegóły", by frame id ("<answer key>-<n>").
const openFrames = atom({ plugin: 'wyglad', key: 'openFrames' } as const, [] as string[])
// Tasks ticked off ("<answer key>:<n>") and long explanations opened (answer keys).
const doneTasks = atom({ plugin: 'wyglad', key: 'doneTasks' } as const, [] as string[])
// Tasks a newer answer replaced (a fresh login code, a new link): ticked, and drawn as "zastąpione".
const staleTasks = atom({ plugin: 'wyglad', key: 'staleTasks' } as const, [] as string[])
// Each answer's number in the conversation and the moment it was finished, by its key.
const stamps = atom({ plugin: 'wyglad', key: 'stamps' } as const, {} as Record<string, Stamp>)
// Questions Stefan has answered, by their id ("<answer key>:q1"): what he chose ("7B").
const answered = atom({ plugin: 'wyglad', key: 'answered' } as const, {} as Record<string, string>)

// "1.11.2026, 14:03:27" in local time; the day left out when it is `sameDayAs`.
function stampText(at: number, sameDayAs?: number): string {
  const d = new Date(at)
  const two = (n: number) => String(n).padStart(2, '0')
  const day = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
  const time = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`
  const isSameDay = sameDayAs !== undefined && new Date(sameDayAs).toDateString() === d.toDateString()
  return isSameDay ? time : `${day}, ${time}`
}
const openTexts = atom({ plugin: 'wyglad', key: 'openTexts' } as const, [] as string[])
// Answers whose explanation shows only its marked runs ("Tylko wyróżnione"), by key.
const onlyMarks = atom({ plugin: 'wyglad', key: 'onlyMarks' } as const, [] as string[])
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

// The answer layout Claude is told about lives in ~/.claude/rules/wyglad-uklad-odpowiedzi.md:
// since Claude 2.1.304 a Team plan's built-in security plugin skips a mod's prompt.compose hook.

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

// A mail draft, written as a fenced block tagged `mail`: header lines ("Do: Anna",
// "Temat: …") up to the first blank line, then the body exactly as it is to be sent.
export type Mail = { headers: [string, string][]; body: string }
const MAIL_HEADER = /^(Do|DW|UDW|Od|Temat|Załączniki?)\s*:\s*(.*)$/i

// Takes the mail drafts out of a text, so they can be drawn as cards of their own.
export function mailsOf(text: string): { rest: string; mails: Mail[] } {
  const mails: Mail[] = []
  const rest = text.replace(/^[ \t]*```+[ \t]*(mail|e-?mail|mejl)[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```+[ \t]*$/gim, (_all, _tag, inner: string) => {
    const lines = inner.split(/\r?\n/)
    const headers: [string, string][] = []
    let at = 0
    while (at < lines.length && MAIL_HEADER.test(lines[at])) {
      const m = MAIL_HEADER.exec(lines[at])!
      headers.push([m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase(), m[2].trim()])
      at++
    }
    if (headers.length > 0) while (at < lines.length && lines[at].trim() === '') at++
    mails.push({ headers, body: lines.slice(at).join('\n').replace(/\s+$/, '') })
    return ''
  })
  return { rest: rest.replace(/\n{3,}/g, '\n\n').trim(), mails }
}

// One-line places (the pane, a struck task, a folded gist) cannot draw a link, so
// "[nazwa](adres)" becomes its name and the markers go; nothing raw is shown.
function plainOf(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '')
}

function taskOf(text: string): { what: string; why: string } {
  // "**Zadanie 1:** …" (instruction v7) would double the number the frame draws. The what loses
  // its bold (it is drawn bold whole); the why keeps it, so a bold run there becomes a marker.
  const raw = text.replace(/^\*\*Zadanie\s+\d+:\*\*\s*/i, '').replace(/^Zadanie\s+\d+:\s*/i, '')
  const unbold = (part: string) => part.replace(/\*\*/g, '')
  const at = /\s[–—-]\s/.exec(raw)
  if (!at) {
    // No dash: "Usuń starą kartę (minuta). Na otwartej karcie …" – the first sentence is what to do.
    const stop = /[.!?]\s+(?=\S)/.exec(raw)
    if (!stop) return { what: unbold(raw), why: '' }
    return { what: unbold(raw.slice(0, stop.index)), why: raw.slice(stop.index + stop[0].length) }
  }
  // The why after the dash is a sentence of its own in the frame, so it opens with a capital.
  const why = raw.slice(at.index + at[0].length)
  return { what: unbold(raw.slice(0, at.index)), why: why.charAt(0).toLocaleUpperCase('pl') + why.slice(1) }
}

// A task's steps: indented "a) …", "b) …" (or "-") lines under it, drawn as "Krok 1a", "Krok 1b".
type Item = { isItem: boolean; text: string; steps?: string[] }

function itemsOf(body: string): Item[] {
  const out: Item[] = []
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
    // One task, several actions: an indented "a)" / "b)" / "-" line is a step of the task above.
    const step = /^\s{2,}(?:[a-z][.)]|[-*])\s+(.*)$/.exec(line)
    if (step && prev?.isItem) {
      prev.steps = [...(prev.steps ?? []), step[1]]
      continue
    }
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
      // A bold that stops mid-sentence ("**…wersją**, a WhatsApp…") keeps its sentence whole in the
      // lead, so no grey line ever opens with a comma.
      const open = /^[,;:–-]/.test(bold[2]) ? /^(.*?[.!?])(?:\s+(\S.*))?$/.exec(bold[2]) : null
      if (open) out.push({ n: point[1], lead: `${bold[1]}${open[1]}`, rest: open[2] ?? '', subs: [] })
      else if (/^[,;:–-]/.test(bold[2])) out.push({ n: point[1], lead: `${bold[1]}${bold[2]}`, rest: '', subs: [] })
      else out.push({ n: point[1], lead: bold[1], rest: bold[2], subs: [] })
      continue
    }
    const cut = /^(.*?[.:!?])\s+(\S.*)$/.exec(point[2])
    out.push(cut ? { n: point[1], lead: cut[1], rest: cut[2], subs: [] } : { n: point[1], lead: point[2], rest: '', subs: [] })
  }
  return out
}

// Faint blue inside the question cards and faint orange behind the tasks,
// light or dark as the theme is.
async function tintOf($: { config: { list: () => Promise<readonly { key: string; value: unknown }[]> } }): Promise<{ blue: string; orange: string; grey: string; green: string; red: string; sand: string; mark: string } | undefined> {
  try {
    const theme = String((await $.config.list()).find(row => row.key === 'theme')?.value ?? 'dark')
    return theme.includes('light') ? { blue: '#EEF4FC', orange: '#FDF3E7', grey: '#F2F2F0', green: '#EEF6EA', red: '#FCEEEE', sand: '#F6F3EC', mark: '#FFF0A6' } : { blue: '#17212E', orange: '#2A1F14', grey: '#222326', green: '#172116', red: '#2A1616', sand: '#262320', mark: '#3a3720' }
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

// A system notification. The engine's own `$.ui.notify` reaches terminals only
// (the desktop app answers `no-surface`), so Windows draws the toast itself,
// through PowerShell; the XML travels on stdin, so no quoting can break it.
async function notify($: Parameters<typeof read>[0], title: string, text: string): Promise<void> {
  const sent = await $.ui.notify(text, { title }).catch(() => ({ isSent: false as const }))
  if (sent.isSent) return
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const xml = `<toast><visual><binding template="ToastGeneric"><text>${esc(title)}</text><text>${esc(text)}</text></binding></visual></toast>`
  const script = [
    '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null',
    '[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null',
    '$x = New-Object Windows.Data.Xml.Dom.XmlDocument',
    '$x.LoadXml([Console]::In.ReadToEnd())',
    '$t = New-Object Windows.UI.Notifications.ToastNotification $x',
    "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe').Show($t)",
  ].join('; ')
  await $.process.run(['powershell', '-NoProfile', '-NonInteractive', '-Command', script], { stdin: xml, timeoutMs: 15_000 }).catch(() => undefined)
}

// The folder the session works in, as its short name: the nearest thing to a
// session title a mod can read.
async function placeOf($: Parameters<typeof read>[0]): Promise<string> {
  const cwd = await $.session.cwd().catch(() => '')
  return cwd.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? ''
}

// The Polish word for what the turn is doing, drawn in the working row.
const DOING: Record<string, string> = { thinking: 'Myślę', requesting: 'Pytam model', 'tool-use': 'Pracuję', 'tool-input': 'Pracuję', responding: 'Piszę odpowiedź' }

// "1B" → "B": the letter of an option id, whatever number it carries.
function letterOfId(id: string): string {
  return id.replace(/^\d+/, '')
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
      description: 'Odhacza zadania w panelu „Moje sprawy”. Wywołaj, gdy Stefan napisze, że zadanie zrobił („1 zrobiłem”) albo że odpada; numery to numery z ramki „Zadania dla Ciebie” ostatniej odpowiedzi. Gdy dajesz Stefanowi nowe zadanie zamiast wcześniejszego (nowy kod logowania, nowy link, zmieniony krok), wywołaj z `tekst` = fragment treści starego zadania i `stan` = nieaktualne, żeby stare zadanie znikło z panelu i było skreślone jako zastąpione.',
      inputSchema: {
        type: 'object',
        properties: {
          numery: { type: 'array', items: { type: 'integer', minimum: 1 }, description: 'Numery zadań z ostatniej odpowiedzi' },
          tekst: { type: 'string', description: 'Fragment treści zadania z dowolnej wcześniejszej odpowiedzi (zamiast numerów), np. „kod C57H2”' },
          stan: { type: 'string', enum: ['zrobione', 'odpada', 'nieaktualne', 'otwarte'], description: 'zrobione i odpada skreślają zadanie; nieaktualne skreśla je jako zastąpione nowszym; otwarte przywraca je' },
        },
      },
      isDeferred: false,
    })

    return next(e)
  })

  on('tool.call', { tool: 'mcp__wyglad__odhacz' }, async ($, e) => {
    const input = e as unknown as { numery?: number[]; tekst?: string; stan?: string }
    const tasks = await tasksOfLast($)
    const stan = input.stan ?? 'zrobione'
    const hit: { n: number | string; task?: Sprawa }[] = (input.numery ?? []).map(n => ({ n, task: tasks[n - 1] }))
    // A fragment names a task of any earlier answer, open or not, newest match first.
    const fragment = input.tekst?.trim().toLowerCase()
    if (fragment) {
      const found = (await read($, sprawy)).filter(one => one.kind === 'todo' && plainOf(one.text).toLowerCase().includes(fragment)).reverse()
      hit.push(found.length > 0 ? { n: `„${input.tekst}”`, task: found[0] } : { n: `„${input.tekst}”` })
    }
    const ids = hit.flatMap(h => (h.task ? [h.task.id] : []))
    await update($, doneTasks, list => (stan === 'otwarte' ? list.filter(id => !ids.includes(id)) : [...list.filter(id => !ids.includes(id)), ...ids]))
    await update($, staleTasks, list => (stan === 'nieaktualne' ? [...list.filter(id => !ids.includes(id)), ...ids] : list.filter(id => !ids.includes(id))))
    await $.ui.invalidate('ui.render')
    const lines = hit.map(h => (h.task ? `${h.n}. ${h.task.text} – ${stan}` : `${h.n}. brak takiego zadania`))
    const open = tasks.length - (await read($, doneTasks)).filter(id => tasks.some(t => t.id === id)).length
    $.ui.status(open > 0 ? `czeka: ${count(open, 'zadanie', 'zadania', 'zadań')}` : undefined)
    return { result: [...lines, `Otwartych zadań z ostatniej odpowiedzi: ${open}.`].join('\n') }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'wyglad: odhaczanie nie powiodło się' }))

  // "1 zrobiłem, 3 odpada": the model reads which tasks those numbers name.
  const SAID = /(\d+(?:\s*(?:,|i|oraz)\s*\d+)*)\s*(zrobi[łl][ae]m|zrobione|gotowe|załatwione|odpada|odpad[łl]o|pomijam|rezygnuj[eę]|nie zrobi[eę])/giu
  on('prompt.submit', async ($, e, next) => {
    if (e.text.length > 400) return next(e)
    const tasks = await tasksOfLast($)
    const notes: string[] = []
    // "7B": the running number of a question of the latest answer, which the model knows as "Pytanie 1".
    const answer = await read($, last)
    const stamp = answer ? (await read($, stamps))[answer.key] : undefined
    if (answer && stamp && stamp.questions > 0) {
      for (const m of e.text.matchAll(/\b(\d+)\s*([A-Z])\b/g)) {
        const n = Number(m[1])
        if (n > stamp.qBase && n <= stamp.qBase + stamp.questions) {
          notes.push(`${m[1]}${m[2]}: Pytanie ${n - stamp.qBase} z Twojej ostatniej odpowiedzi (u Stefana numerowane narastająco jako ${n}), opcja ${m[2]}.`)
          const id = `${answer.key}:q${n - stamp.qBase}`
          await update($, answered, all => ({ ...all, [id]: `${n}${m[2]}` }))
        }
      }
    }
    for (const m of e.text.matchAll(SAID)) {
      const stan = /zrobi|gotowe|załatw/i.test(m[2]) ? 'zrobione' : 'odpada'
      for (const n of m[1].split(/\D+/).filter(Boolean).map(Number)) {
        const task = tasks[n - 1]
        notes.push(task ? `Zadanie ${n} („${task.text}”): ${stan}.` : `Zadanie ${n}: brak takiego numeru w ostatniej odpowiedzi.`)
      }
    }
    if (notes.length === 0) return next(e)
    const note = [`Numery w wiadomości Stefana odnoszą się do Twojej ostatniej odpowiedzi (zadania z ramki „Zadania dla Ciebie”, pytania numerowane narastająco w całej rozmowie):`, ...notes, 'Zadania odhacz narzędziem odhacz i potwierdź jednym zdaniem.'].join('\n')
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
    const stale = await read($, staleTasks)
    const tasks = list.filter(one => one.kind === 'todo')
    const open = tasks.filter(one => !ticked.includes(one.id))
    const done = tasks.filter(one => ticked.includes(one.id))
    const replied = await read($, answered)
    const asks = list.filter(one => one.kind === 'question' && !replied[one.id])
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
            <Text wrap="truncate-end">{plainOf(one.text)}</Text>
          </Box>
        ))}
        {asks.length > 0 ? <Text bold>{`Pytania (${asks.length})`}</Text> : null}
        {asks.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`j-${one.id}`} label="↗" onPress={jump(`${answerOf(one.id)}-${one.id.split(':')[1]}`)} />
            <Text wrap="truncate-end">{plainOf(one.text)}</Text>
          </Box>
        ))}
        {done.length > 0 ? <Text bold dimColor>{`Odhaczone (${done.length})`}</Text> : null}
        {done.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`p-${one.id}`} label="☑" onPress={tick(one.id)} />
            <Text dimColor strikethrough wrap="truncate-end">{plainOf(one.text)}</Text>
            {stale.includes(one.id) ? <Text dimColor>zastąpione</Text> : null}
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

  // Remember the last answer for the band above the prompt.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.reason === 'answer' && e.agentId === undefined) {
      await update($, finalText, () => e.answer.trim() || null)
      const reply = splitReply(e.answer)
      const summary = reply ? summaryOf(reply) : null
      await update($, last, () => summary)
      if (summary) {
        const at = await $.clock.now().catch(() => Date.now())
        await update($, stamps, all => (all[summary.key] ? all : { ...all, [summary.key]: { n: Object.keys(all).length + 1, at, qBase: Object.values(all).reduce((sum, s) => sum + (s.questions ?? 0), 0), questions: summary.questions } }))
      }
      if (reply && summary) {
        const tasks: Sprawa[] = reply.parts
          .filter(part => part.kind === 'todo')
          .flatMap(part => itemsOf(part.body))
          .flatMap((item, i) => (item.isItem ? [{ id: `${summary.key}:${i}`, kind: 'todo' as const, text: item.text.replace(/[*_`]/g, ''), letters: [] }] : []))
        // Questions are numbered on through the conversation ("Pytanie 7"), so no two share a number.
        const qBase = (await read($, stamps))[summary.key]?.qBase ?? 0
        const asks: Sprawa[] = reply.parts
          .filter(part => part.kind === 'questions')
          .flatMap(part => splitQuestions(part.body))
          .map(q => ({ id: `${summary.key}:q${q.number}`, kind: 'question' as const, text: `${qBase + Number(q.number)}. ${q.text.split(`\n\n`)[0].replace(/\*\*/g, '')}`, letters: lettersOf(q).map(l => `${qBase + Number(q.number)}${l}`), options: optionsOf(q).map(o => ({ ...o, id: `${qBase + Number(q.number)}${letterOfId(o.id)}` })) }))
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
      // A question stops the work until Stefan answers, so it is the one thing
      // that leaves the window: a system notification, not just a toast.
      if (summary && summary.questions > 0 && (await $.store.get(OFF)) !== true) {
        const where = await placeOf($)
        await notify($, `Claude czeka na Twoją odpowiedź${where ? ` · ${where}` : ''}`, `${summary.headline} Czeka: ${count(summary.questions, 'pytanie', 'pytania', 'pytań')}.`)
      }
    }

    return done
  })

  // A compaction keeps what waits on Stefan: the summarizer is told the open tasks
  // and questions of the latest answer, so their numbers survive the summary.
  on('session.compact', async ($, e, next) => {
    if (e.agentId !== undefined || e.trigger === 'precompute') return next(e)
    const answer = await read($, last)
    if (!answer) return next(e)
    const mine = (await read($, sprawy)).filter(one => one.id.startsWith(`${answer.key}:`))
    const ticked = await read($, doneTasks)
    const tasks = mine.filter(one => one.kind === 'todo')
    const lines = [
      ...tasks.map((t, i) => `${i + 1}. ${plainOf(t.text)}${ticked.includes(t.id) ? ' (odhaczone)' : ''}`),
      ...mine.filter(one => one.kind === 'question').map(q => `Pytanie ${plainOf(q.text)} (opcje: ${q.letters.join(', ')})`),
    ]
    if (lines.length === 0) return next(e)
    const note = [
      'Zachowaj w streszczeniu dosłownie, jako osobną sekcję „Czeka na Stefana (z ostatniej odpowiedzi)”, z tymi samymi numerami:',
      `Ostatnia odpowiedź: „${answer.headline}”.`,
      ...lines,
      'Stefan odpowiada numerami zadań („1 zrobiłem”) i nazwami opcji („1A”), więc numeracja nie może się zmienić.',
    ].join('\n')
    return next({ ...e, instructions: e.instructions ? `${e.instructions}\n\n${note}` : note })
  })

  // Typing "1" after an answer offers its buttons' names ("1A", "1B") and
  // "1 zrobiłem" for its tasks, so a reply is two keystrokes.
  on('prompt.autocomplete', { token: /^\d/ }, async ($, e, next) => {
    const below = await next(e)
    const answer = await read($, last)
    if (!answer || (await $.store.get(OFF)) === true) return below
    const mine = (await read($, sprawy)).filter(one => one.id.startsWith(`${answer.key}:`))
    const tasks = mine.filter(one => one.kind === 'todo')
    const letters = mine.flatMap(one => one.letters)
    const rows = [
      ...letters.map(l => ({ text: l, description: 'odpowiedź na pytanie' })),
      ...tasks.map((t, i) => ({ text: `${i + 1} zrobiłem`, description: t.text })),
    ].filter(row => row.text.toLowerCase().startsWith(e.token.toLowerCase()) && row.text !== e.token)
    return { suggestions: [...below.suggestions, ...rows] }
  })

  // The working row speaks Polish: "Myślę", "Pracuję", "Piszę odpowiedź".
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if ((await $.store.get(OFF)) === true) return next(e)
    const word = DOING[e.props.mode]
    return word ? next({ ...e, props: { ...e.props, word } }) : next(e)
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

    const reply = splitReply(linkPaths(text))
    if (!reply) return next(e)

    const key = keyOf(reply.headline)
    const opened = await read($, openFrames)
    // Zrobione, Problem and Dla informacji show in full; only a really long lot folds.
    const isLongFold = reply.parts
      .filter(part => part.kind === 'done' || part.kind === 'failed' || part.kind === 'open' || part.kind === 'info')
      .reduce((n, part) => n + part.body.split(/\r?\n/).filter(l => l.trim() !== '').length, 0) > FOLD_LINES
    const isLatest = (await read($, last))?.key === key
    const ticked = await read($, doneTasks)
    const stale = await read($, staleTasks)
    const replied = await read($, answered)
    // The bar names the answer and the moment it was finished, so two answers are never confused.
    const stamp = (await read($, stamps))[key]
    const now = await $.clock.now().catch(() => Date.now())
    const barText = stamp ? `Odpowiedź ${stamp.n} · ${stampText(stamp.at, isLatest ? undefined : now)}` : isLatest ? 'Nowa odpowiedź' : 'Odpowiedź'
    const isOpen = (await read($, openTexts)).includes(key)
    const onlyMarked = await read($, onlyMarks)
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
              <Text color="inverseText" bold>{barText}</Text>
              {stamp ? <Text color="inverseText">najnowsza</Text> : null}
            </Box>
          ) : (
            <Box flexDirection="row" gap={1}>
              <Text dimColor>{barText}</Text>
            </Box>
          )}
          {/* The headline and the explanation are the answer's main content, so they stand in a
              frame of their own, the strongest on the page; the lists below are only what to do. */}
          <Box flexDirection="column" borderStyle="round" borderColor={ink.text} paddingX={1} gap={1}>
          {/* Markdown, not Text: a link in the headline stays clickable. */}
          <Markdown text={`**${reply.headline}**`} />
        {(() => {
          // A long explanation shows its first lines until opened.
          const lines = mailsOf(plain.map(part => part.body).join('\n\n')).rest.split('\n')
          if (lines.length === 1 && lines[0] === '') return null
          // Cut only at a blank line outside a table, so no table is ever split.
          // …and never right after a heading ("Zrobię sam:", "**Na ciebie**"), which would leave it empty.
          const isHeading = (line = '') => /:\s*\**\s*$/.test(line.trim()) || /^(#+\s|\*\*[^*]+\*\*$)/.test(line.trim())
          const lastText = (n: number) => [...lines.slice(0, n)].reverse().find(l => l.trim() !== '')
          const cut = lines.findIndex(
            (line, n) => n >= SHORT && line.trim() === '' && !lines[n - 1]?.trim().startsWith('|') && !isHeading(lastText(n)),
          )
          const isLong = lines.length > LONG && cut > 0 && cut < lines.length - 2
          // A bold run in a prose paragraph is the paragraph's point: drawn as a marker,
          // and "Tylko wyróżnione" leaves those runs alone, one per line.
          const blocks = blocksOf(isLong && !isOpen ? lines.slice(0, cut).join('\n') : lines.join('\n'))
          const marks = marksOf(blocks)
          const isOnly = hasMarks(blocks) && onlyMarked.includes(key)
          return (
            <Box flexDirection="column" gap={1}>
              {isOnly
                ? marks.map((mark, i) => (
                    <Box key={`m${i}`}>
                      <Text backgroundColor={tint?.mark}>{mark}</Text>
                    </Box>
                  ))
                : blocks.map((block, i) =>
                    block.kind === 'md' || !block.runs.some(run => run.isMark) ? (
                      <Markdown key={`b${i}`} text={block.kind === 'md' ? block.text : block.runs.map(run => run.text).join('')} />
                    ) : block.kind === 'md' ? (
                      <Markdown key={`b${i}`} text={block.text} />
                    ) : (
                      <Text key={`b${i}`}>
                        {block.runs.map((run, j) => (run.isMark ? emphasis(els, run, tint?.mark, `r${j}`) : run.text))}
                      </Text>
                    ),
                  )}
              {hasMarks(blocks) ? (
                <Box>
                  <Button
                    key={`only-${key}`}
                    label={isOnly ? 'Pokaż całość' : 'Tylko wyróżnione'}
                    onPress={() => void update($, onlyMarks, list => (list.includes(key) ? list.filter(x => x !== key) : [...list, key]))}
                  />
                </Box>
              ) : null}
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
          </Box>
        </Box>
        {/* A mail draft reads like a sheet of paper: who and what on top, then only the text to send. */}
        {mailsOf(plain.map(part => part.body).join('\n\n')).mails.map((mail, i) => (
          <Box key={`${key}-mail${i}`} flexDirection="column" borderStyle="round" borderColor={PAPER.edge} backgroundColor={PAPER.sheet} paddingX={1} gap={1}>
            <Box flexDirection="row" gap={1}>
              {icon(els, e.surface, 'mail', PAPER.edge, '✉')}
              <Text bold color={PAPER.ink}>Szkic maila</Text>
            </Box>
            {mail.headers.length > 0 ? (
              <Box flexDirection="column">
                {mail.headers.map(([label, value], j) => (
                  <Box key={`${key}-mail${i}-h${j}`} flexDirection="row" gap={1}>
                    <Text color={PAPER.label}>{`${label}:`}</Text>
                    <Text color={PAPER.ink} bold={label === 'Temat'}>{value}</Text>
                  </Box>
                ))}
              </Box>
            ) : null}
            <Box flexDirection="column" gap={1}>
              {mail.body.split(/\r?\n[ \t]*\r?\n/).map((paragraph, j) => (
                <Text key={`${key}-mail${i}-p${j}`} color={PAPER.ink}>{paragraph}</Text>
              ))}
            </Box>
            <Box>
              <Button
                key={`${key}-mail${i}-copy`}
                label="Kopiuj treść"
                onPress={(press: { surface?: string }) =>
                  void $.ui
                    .copy({ text: mail.body, surface: press?.surface as never })
                    .then(out => $.ui.toast(out.isCopied ? 'Skopiowałem treść maila.' : 'Nie udało się skopiować; zaznacz treść myszą.'))
                    .catch(() => undefined)
                }
              />
            </Box>
          </Box>
        ))}
        {todos.length + questions.length > 0 ? (
          <Box flexDirection="column" gap={1}>
            {todos.length > 0 ? (() => {
              // Each task is its own frame, in the same form as a question: "Zadanie 1: what", then why.
              // A fenced block (text to copy) and a file row are drawn below the frames.
              const all = todos.flatMap(part => itemsOf(part.body))
              const isFence = (text: string) => text.startsWith('```')
              return (
                <Box key={`${key}-todo`} flexDirection="column" gap={1}>
                  {all.map((item, i) => {
                    if (!item.isItem) return isFence(item.text) || fileOf(item.text) ? null : <Markdown key={`d${i}`} text={item.text} />
                    const n = all.slice(0, i + 1).filter(one => one.isItem).length
                    const isTicked = ticked.includes(`${key}:${i}`)
                    return (
                      <Box key={`${key}-todo-${n}`} flexDirection="column" borderStyle="round" borderColor={isTicked ? ink.grey : 'suggestion'} backgroundColor={isTicked ? undefined : tint?.blue} paddingX={1} gap={1}>
                        {isTicked ? (
                          <Box flexDirection="row" alignItems="flex-start" gap={1}>
                            {icon(els, e.surface, 'square-check', ink.grey, '☑')}
                            <Text dimColor strikethrough>{`Zadanie ${n}: ${plainOf(item.text)}`}</Text>
                            {stale.includes(`${key}:${i}`) ? <Text dimColor>zastąpione</Text> : null}
                          </Box>
                        ) : (
                          <Box flexDirection="column" gap={1}>
                            {/* Markdown, not Text: a link in the task's head stays clickable. The why is plain, not grey: it is the task. */}
                            <Box flexDirection="row" alignItems="flex-start" gap={1}>
                              {icon(els, e.surface, 'square', ink.blue, '☐')}
                              <Markdown text={`**Zadanie ${n}: ${taskOf(item.text).what}**`} />
                            </Box>
                            {taskOf(item.text).why ? marked(els, taskOf(item.text).why, tint?.mark, false) : null}
                            {(item.steps ?? []).map((step, k) => (
                              <Box key={`k${k}`} flexDirection="row" alignItems="flex-start" gap={1}>
                                <Text bold>{`Krok ${n}${String.fromCharCode(97 + k)}:`}</Text>
                                {marked(els, step, tint?.mark, false)}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )
                  })}
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
            {/* Each question is its own frame, in the same form as a task: "Pytanie 7: title", why, options, advice, buttons. */}
            {questions.map((q, i) => {
              const [title, ...why] = q.text.split('\n\n')
              // The number runs on through the conversation once the answer is recorded.
              const g = (stamp?.qBase ?? 0) + Number(q.number)
              const named = (id: string) => `${g}${letterOfId(id)}`
              const choice = replied[`${key}:q${q.number}`]
              // Answered: the question keeps its title and the choice, loses its options and buttons.
              if (choice) {
                return (
                  <Box key={`${key}-q${q.number}`} flexDirection="row" alignItems="flex-start" borderStyle="round" borderColor={ink.grey} paddingX={1} gap={1}>
                    {icon(els, e.surface, 'message-question', ink.grey, '●')}
                    <Markdown text={`**Pytanie ${g}: ${title.replace(/\*\*/g, '')}**`} dimColor />
                    <Text dimColor>{`odpowiedziałeś ${choice}`}</Text>
                  </Box>
                )
              }
              return (
                <Box key={`${key}-q${q.number}`} flexDirection="column" borderStyle="round" borderColor={ink.sand} backgroundColor={tint?.sand} paddingX={1} gap={1}>
                  <Box flexDirection="row" alignItems="flex-start" gap={1}>
                    {icon(els, e.surface, 'message-question', ink.sand, '●')}
                    <Markdown text={`**Pytanie ${g}: ${title.replace(/\*\*/g, '')}**`} />
                  </Box>
                  {why.length > 0 ? marked(els, why.join('\n\n'), tint?.mark, true) : null}
                  {/* One option per line, named as its button; the star marks the advice. */}
                  {optionsOf(q).map(option => (
                    <Box key={`o${i}-${option.id}`} flexDirection="row" alignItems="flex-start" gap={1}>
                      <Text bold>{`${named(option.id)}${option.isBest ? ' ★' : ''}`}</Text>
                      {marked(els, option.text.replace(/\s*[★⭐]️?\s*/gu, ' ').trim(), tint?.mark, false)}
                    </Box>
                  ))}
                  {q.tip ? <Markdown text={`**${tipOf(q).replace(/(Polecam\s+)\d+/i, `$1${g}`)}**`} /> : null}
                  {optionsOf(q).length > 0 ? (
                    <Box flexDirection="row" flexWrap="wrap" gap={2}>
                      {optionsOf(q).map(option => (
                        <Button
                          key={`b${i}-${option.id}`}
                          label={`Wybierz ${named(option.id)}${option.isBest ? ' ★' : ''}`}
                          onPress={fill(named(option.id))}
                        />
                      ))}
                    </Box>
                  ) : null}
                </Box>
              )
            })}
          </Box>
        ) : null}
        {folded.length > 0 ? (
          // The summary: one frame per section in its own colour, each with its title inside.
          <Box flexDirection="column" gap={1}>
            {folded.map((part, i) => {
              // Each frame folds and opens on its own button.
              const full = opened.includes(`${key}-${i}`)
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
                            <Markdown text={`**${piece.lead}**`} />
                            {piece.rest ? marked(els, piece.rest, tint?.mark, true) : null}
                            {piece.subs.map((sub, k) => marked(els, sub, tint?.mark, true, `sub${i}-${j}-${k}`))}
                          </Box>
                        </Box>
                      ) : (
                        <Markdown key={`s${i}-${j}`} text={piece.text} />
                      ),
                    )
                  ) : (
                    // Folded: the bold result of every point stays; "Pokaż szczegóły" opens the explanations.
                    all.some(piece => 'n' in piece) ? (
                      all.filter(piece => 'n' in piece).map((piece, j) =>
                        'n' in piece ? (
                          <Box key={`s${i}-${j}`} flexDirection="row" alignItems="flex-start" gap={1}>
                            <Text>{`${piece.n}.`}</Text>
                            <Markdown text={`**${piece.lead}**`} />
                          </Box>
                        ) : null,
                      )
                    ) : (
                      <Text wrap="truncate-end">{plainOf(gist(part))}</Text>
                    )
                  )}
                  {/* The button sits inside the frame it opens, so it is clear what it shows. */}
                  {isLongFold ? (
                    <Box>
                      <Button key={`more-${key}-${i}`} label={full ? 'Zwiń szczegóły' : 'Pokaż szczegóły'} onPress={() => void update($, openFrames, list => (list.includes(`${key}-${i}`) ? list.filter(x => x !== `${key}-${i}`) : [...list, `${key}-${i}`]))} />
                    </Box>
                  ) : null}
                </Box>
                {(!isLongFold || full ? all.filter(isFence) : []).map((piece, j) => (
                  <Markdown key={`fence${i}-${j}`} text={'text' in piece ? piece.text : ''} />
                ))}
                </Box>
              )
            })}
          </Box>
        ) : null}
      </Box>
    )
  })
}
