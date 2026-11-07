import type { Section, Urgent } from '../types'

export type Parsed = Record<Section, string[]> & { urgent: Urgent | null }

// Section names as Stefan writes them: "W toku", "W toku / czeka", "Czeka", "Czeka na Stefana",
// "Zrobione", "Dalej", "Następne tematy", "Do zrobienia". The first matching kind wins, so
// "W toku / czeka" is doing and "Czeka na Stefana" is waiting.
const KINDS: readonly [Section, RegExp][] = [
  ['doing', /w\s+toku|w\s+trakcie|in\s+progress/i],
  ['waiting', /czeka|wstrzyman|oczekuj|waiting|blocked/i],
  ['done', /zrobion|gotow|ukończon|done|✅/i],
  ['next', /dalej|następn|do\s+zrobienia|plan|todo|next/i],
]

function kindOf(text: string): Section | undefined {
  return KINDS.find(([, pattern]) => pattern.test(text))?.[0]
}

// Plain words: no bold, links, code or leading emoji, one line.
export function plain(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// A matter's name: the bold lead of a bullet ("**Dostęp od Dawida** — …") or its first
// sentence, so the band shows the matter, not a paragraph.
function nameOf(text: string): string {
  const bold = /^\s*\*\*([^*]+)\*\*/.exec(text)
  const lead = bold ? bold[1] : text
  const flat = plain(lead)
  const cut = /^(.{12,}?[.;:])(\s|$)/.exec(flat)
  return cut ? cut[1].replace(/[.;:]$/, '') : flat
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => plain(cell))
}

// Reads STAN.md as Stefan writes it: headings or bold labels ("**W toku:** …")
// with bullets beneath, or a table whose Status column sorts each row.
export function parse(text: string): Parsed {
  const out: Parsed = { done: [], doing: [], waiting: [], next: [], urgent: null }
  let current: Section | undefined
  let statusColumn = -1

  const add = (kind: Section, raw: string) => {
    const item = plain(raw)
    if (item === '' || /^(brak|nic|—|-)$/i.test(item)) return
    out[kind].push(item)
    if (out.urgent === null && (kind === 'doing' || kind === 'waiting')) out.urgent = { text: nameOf(raw), kind }
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (line === '') continue

    const heading = /^#{1,6}\s+(.*)$/.exec(line)
    if (heading) {
      current = kindOf(heading[1])
      statusColumn = -1
      continue
    }

    if (line.startsWith('|')) {
      const row = cells(line)
      if (row.every(cell => /^:?-{2,}:?$/.test(cell) || cell === '')) continue
      const status = row.findIndex(cell => /^status$/i.test(cell))
      if (status >= 0) {
        statusColumn = status
        continue
      }
      const kind = statusColumn >= 0 ? kindOf(row[statusColumn] ?? '') ?? 'next' : current
      if (kind && row[0]) add(kind, row[0])
      continue
    }

    const label = /^\*{0,2}([^*:]{2,40}):?\*{0,2}:?\s*(.*)$/.exec(line)
    const bullet = /^([-*+]|\d+[.)])\s+(.*)$/.exec(line)
    if (bullet) {
      if (current) add(current, bullet[2])
      continue
    }
    if (label && /[:]/.test(line.slice(0, 45)) && kindOf(label[1])) {
      current = kindOf(label[1])
      if (current && plain(label[2])) add(current, label[2])
    }
  }

  return out
}

export function short(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

export function age(days: number | null): string {
  if (days === null) return ''
  if (days <= 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  return `${days} dni temu`
}

// "dziś 14:51", "wczoraj 09:10", "3 dni temu (4.11, 14:51)": when something last happened,
// in Polish local time (the clock gives UTC milliseconds).
export function when(at: number, now: number): string {
  const d = new Date(at)
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const day = (t: number) => Math.floor((t + new Date(t).getTimezoneOffset() * -60_000) / 86_400_000)
  const days = day(now) - day(at)
  if (days <= 0) return `dziś ${hhmm}`
  if (days === 1) return `wczoraj ${hhmm}`
  return `${days} dni temu (${d.getDate()}.${d.getMonth() + 1}, ${hhmm})`
}
