// The explanation of an answer, cut into blocks the frame draws: a prose paragraph
// with a bold run becomes a paragraph of runs, so the bold is drawn as a marker
// (a highlighted span), and "Tylko wyróżnione" can show those runs alone.
// Anything Markdown must draw (lists, tables, headings, links, code) stays Markdown.

export type Run = { text: string; isMark: boolean }
export type Block = { kind: 'md'; text: string } | { kind: 'para'; runs: Run[] }

const NOT_PROSE = /^\s*(?:[-*+]\s|\d+[.)]\s|#|>|\||```|~~~)/

function isProse(paragraph: string): boolean {
  const lines = paragraph.split('\n')
  if (lines.some(line => NOT_PROSE.test(line))) return false
  // A link or inline code needs Markdown; a Text span cannot draw them.
  if (/\]\(|`/.test(paragraph)) return false
  return /\*\*[^*]+\*\*/.test(paragraph)
}

export function runsOf(paragraph: string): Run[] {
  const out: Run[] = []
  const re = /\*\*([^*]+)\*\*/g
  let last = 0
  for (const m of paragraph.matchAll(re)) {
    if (m.index > last) out.push({ text: paragraph.slice(last, m.index), isMark: false })
    out.push({ text: m[1], isMark: true })
    last = m.index + m[0].length
  }
  if (last < paragraph.length) out.push({ text: paragraph.slice(last), isMark: false })
  return out.map(run => ({ ...run, text: run.text.replace(/\n/g, ' ') }))
}

// Paragraphs are separated by blank lines; a fenced block is one paragraph however long.
export function blocksOf(text: string): Block[] {
  const paragraphs: string[] = []
  let current: string[] = []
  let inFence = false
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (line.trim() === '' && !inFence) {
      if (current.length > 0) paragraphs.push(current.join('\n'))
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.length > 0) paragraphs.push(current.join('\n'))

  // Neighbouring Markdown paragraphs are joined back, so a list keeps its spacing.
  const out: Block[] = []
  for (const paragraph of paragraphs) {
    if (isProse(paragraph)) {
      out.push({ kind: 'para', runs: runsOf(paragraph) })
    } else {
      const last = out[out.length - 1]
      if (last && last.kind === 'md') last.text += `\n\n${paragraph}`
      else out.push({ kind: 'md', text: paragraph })
    }
  }
  return out
}

// The marked runs alone, one per paragraph that has any: what "Tylko wyróżnione" shows.
export function marksOf(blocks: Block[]): string[] {
  return blocks.flatMap(block => (block.kind === 'para' ? block.runs.filter(run => run.isMark).map(run => run.text.trim()) : []))
}
