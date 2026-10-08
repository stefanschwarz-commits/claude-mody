import type { Section } from '../types'

export type Parsed = Record<Section, string[]>

const KINDS: readonly [Section, RegExp][] = [
  ['doing', /w\s+toku|w\s+trakcie|in\s+progress/i],
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

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => plain(cell))
}

// Reads STAN.md as Stefan writes it: headings or bold labels ("**W toku:** …")
// with bullets beneath, or a table whose Status column sorts each row.
export function parse(text: string): Parsed {
  const out: Parsed = { done: [], doing: [], next: [] }
  let current: Section | undefined
  let statusColumn = -1

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
      if (kind && row[0]) out[kind].push(row[0])
      continue
    }

    const label = /^\*{0,2}([^*:]{2,40}):?\*{0,2}:?\s*(.*)$/.exec(line)
    const bullet = /^([-*+]|\d+[.)])\s+(.*)$/.exec(line)
    if (bullet) {
      if (current) out[current].push(plain(bullet[2]))
      continue
    }
    if (label && /[:]/.test(line.slice(0, 45)) && kindOf(label[1])) {
      current = kindOf(label[1])
      const rest = plain(label[2])
      if (current && rest) out[current].push(rest)
    }
  }

  for (const key of Object.keys(out) as Section[]) {
    out[key] = out[key].filter(item => item !== '' && !/^(brak|nic|—|-)$/i.test(item))
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
