export type Kind = 'done' | 'problem' | 'todo' | 'questions' | 'info' | 'plain'

export type Part = { kind: Kind; title: string; body: string }

export type Question = { number: string; text: string; options: string[]; table: string[]; tip: string }

export type Reply = { headline: string; parts: Part[] }

// A section is known by its icon or by the words of its title, as a heading or bold.
const LEAD = String.raw`^(#+\s*)?(✅|☐|❓|ℹ️?|⚠️?|❗|✔️?)?\s*\**\s*`
const MARK = new RegExp(LEAD)
const KINDS: readonly [Kind, RegExp][] = [
  ['done', new RegExp(`${LEAD}zrobione`, 'i')],
  ['problem', new RegExp(`${LEAD}problem`, 'i')],
  ['todo', new RegExp(`${LEAD}do zrobienia`, 'i')],
  ['questions', new RegExp(`${LEAD}pytani`, 'i')],
  ['info', new RegExp(`${LEAD}dla informacji`, 'i')],
]

// Short, one or two lines, no ▶: a message written while Claude works.
export function isProgress(text: string): boolean {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim() !== '')
  return !text.includes('▶') && lines.length <= 2 && text.length <= 300
}

export function firstLine(text: string): string {
  return text.trim().split(/\r?\n/)[0]?.replace(/[*_`]/g, '') ?? ''
}

// A reply in Stefan's form: the ▶ line, then sections between `---` rules.
export function splitReply(text: string): Reply | undefined {
  const lines = text.split(/\r?\n/)
  const at = lines.findIndex(line => line.trimStart().startsWith('▶'))
  if (at < 0) return undefined

  const headline = lines[at].trim().replace(/^▶\s*/, '').replace(/\*\*/g, '')
  const rest = [...lines.slice(0, at), ...lines.slice(at + 1)].join('\n')
  const parts: Part[] = []

  for (const chunk of rest.split(/^\s*---+\s*$/m)) {
    const body = chunk.trim()
    if (body === '') continue
    const [head, ...tail] = body.split(/\r?\n/)
    const kind = KINDS.find(([, pattern]) => pattern.test(head.trim()))?.[0] ?? 'plain'
    if (kind === 'plain') {
      parts.push({ kind, title: '', body })
    } else {
      const title = head.replace(MARK, '').replace(/\*\*/g, '').replace(/:\s*$/, '').trim()
      parts.push({ kind, title, body: tail.join('\n').trim() })
    }
  }

  return { headline, parts }
}

// "**1. Pytanie?**", "Dlaczego…", "- **A)** …", "➜ Polecam …" per question.
export function splitQuestions(body: string): Question[] {
  const out: Question[] = []
  let current: Question | undefined
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim()
    if (line === '') continue
    const start = /^(?:#+\s*)?\**\s*(\d+)\.\s*\**\s*(.*?)\**\s*$/.exec(line)
    if (start) {
      current = { number: start[1], text: `**${start[2]}**`, options: [], table: [], tip: '' }
      out.push(current)
      continue
    }
    if (!current) {
      current = { number: '1', text: '', options: [], table: [], tip: '' }
      out.push(current)
    }
    if (/^[-*]\s+\*\*[A-Z]\)\*\*/.test(line)) current.options.push(line.replace(/^[-*]\s+/, ''))
    else if (line.startsWith('|')) current.table.push(line)
    else if (/^➜/.test(line)) current.tip = line
    else current.text += `${current.text ? '\n\n' : ''}${line}`
  }

  return out
}

// "| **A)** | …" or "| A | …": one table row per option.
const ROW = /^\|\s*\**\s*([A-Z])\)?\s*\**\s*\|/

// The letters a question offers, from its list or its table.
export function lettersOf(q: Question): string[] {
  const fromTable = q.table.map(row => ROW.exec(row)?.[1]).filter((l): l is string => l !== undefined)
  return [...q.options.map(letterOf), ...fromTable].filter((l, i, all) => l !== '?' && all.indexOf(l) === i)
}

// The letter the tip recommends: "➜ Polecam **B**, bo…".
export function recommendedOf(q: Question): string | undefined {
  return /Polecam\s+\**([A-Z])\b/i.exec(q.tip)?.[1]?.toUpperCase()
}

// One cue only: a star in the recommended row's first cell, explained in the header.
function mark(row: string, letter: string | undefined): string {
  const at = ROW.exec(row)
  if (!at || at[1] !== letter) return row
  const end = row.indexOf('|', 1)
  return `${row.slice(0, end).trimEnd()} ★ ${row.slice(end)}`
}

// The options as a table: Claude's own table, or one made from the A/B list.
export function tableOf(q: Question): string {
  const best = recommendedOf(q)
  const head = (row: string) => (best ? row.replace(/^\|\s*Opcja\s*\|/, '| Opcja (★ polecam) |') : row)
  if (q.table.length > 0) return q.table.map((row, i) => (i === 0 ? head(row) : mark(row, best))).join('\n')
  if (q.options.length === 0) return ''
  const rows = q.options.map(option => {
    const rest = option.replace(/^\*\*[A-Z]\)\*\*\s*/, '').replaceAll('|', '/')
    return mark(`| **${letterOf(option)}** | ${rest} |`, best)
  })
  return [head('| Opcja | Co się stanie |'), '|---|---|', ...rows].join('\n')
}

export function letterOf(option: string): string {
  return /\*\*([A-Z])\)\*\*/.exec(option)?.[1] ?? '?'
}
