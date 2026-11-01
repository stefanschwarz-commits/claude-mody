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
  return true
}

// A sentence ends at . ! ? followed by a space, or at the end of the text.
const SENTENCE_END = /[.!?](?=\s|$)/g

// The marker covers the whole sentence a bold stands in: two bold words alone say
// nothing when read by themselves (Stefan, 2026-11-01), a sentence does.
export function runsOf(paragraph: string): Run[] {
  const flat = paragraph.replace(/\n/g, ' ')
  // Where each bold run sits once the ** are gone.
  const bolds: [number, number][] = []
  let text = ''
  let i = 0
  for (const m of flat.matchAll(/\*\*([^*]+)\*\*/g)) {
    text += flat.slice(i, m.index)
    bolds.push([text.length, text.length + m[1].length])
    text += m[1]
    i = m.index + m[0].length
  }
  text += flat.slice(i)
  // Sentence bounds: [start, end) for each sentence of the text.
  const ends = [...text.matchAll(SENTENCE_END)].map(m => m.index + 1)
  if (ends.length === 0 || ends[ends.length - 1] < text.length) ends.push(text.length)
  const sentences: [number, number][] = []
  let start = 0
  for (const end of ends) {
    sentences.push([start, end])
    start = end
  }
  const marked = sentences.filter(([s, e]) => bolds.some(([bs, be]) => bs < e && be > s))
  const out: Run[] = []
  let at = 0
  for (const [s, e] of marked) {
    // Leading spaces stay unmarked, so the marker starts at the first letter.
    const lead = text.slice(s, e).match(/^\s*/)?.[0].length ?? 0
    if (s + lead > at) out.push({ text: text.slice(at, s + lead), isMark: false })
    out.push({ text: text.slice(s + lead, e), isMark: true })
    at = e
  }
  if (at < text.length) out.push({ text: text.slice(at), isMark: false })
  return out
}

// The first sentence of a text, for a paragraph that marks nothing.
export function firstSentenceOf(text: string): string {
  const flat = text.replace(/\*\*/g, '').replace(/\n/g, ' ').trim()
  const end = SENTENCE_END.exec(flat)
  SENTENCE_END.lastIndex = 0
  return end ? flat.slice(0, end.index + 1) : flat
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

// What "Tylko wyróżnione" shows: the marked sentences of each prose paragraph, or its
// first sentence when it marks nothing, so no paragraph vanishes from the short view.
export function marksOf(blocks: Block[]): string[] {
  return blocks.flatMap(block => {
    if (block.kind !== 'para') return []
    const marks = block.runs.filter(run => run.isMark).map(run => run.text.trim())
    return marks.length > 0 ? marks : [firstSentenceOf(block.runs.map(run => run.text).join(''))]
  })
}

// Whether any paragraph marks anything: without one, the short view is no shorter.
export function hasMarks(blocks: Block[]): boolean {
  return blocks.some(block => block.kind === 'para' && block.runs.some(run => run.isMark))
}
