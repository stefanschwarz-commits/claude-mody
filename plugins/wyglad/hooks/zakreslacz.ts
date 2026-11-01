// The explanation of an answer, cut into blocks the frame draws: a prose paragraph
// with a bold run becomes a paragraph of runs, so the bold is drawn as a marker
// (a highlighted span), and "Tylko wyróżnione" can show those runs alone.
// Anything Markdown must draw (lists, tables, headings, links, code) stays Markdown.

// A marked run is a word (a short bold: the marker) or a sentence (a long bold: bold and underlined).
// A run with `href` is a link ([label](https://…)), drawn as a Link inside the sentence.
// A run with `path` names a file on this computer: drawn as its name, with a row below the
// block that shows the file in its folder (the desktop opens only https: links inline).
export type Run = { text: string; isMark: boolean; kind?: 'word' | 'sentence'; href?: string; path?: string }
export type Block = { kind: 'md'; text: string } | { kind: 'para'; runs: Run[]; isBullet?: boolean }

const NOT_PROSE = /^\s*(?:[-*+]\s|\d+[.)]\s|#|>|\||```|~~~)/

function isProse(paragraph: string): boolean {
  const lines = paragraph.split('\n')
  if (lines.some(line => NOT_PROSE.test(line))) return false
  // Inline code needs Markdown; a Text span cannot draw it. A link can be a Link inside the Text.
  if (/`/.test(paragraph)) return false
  return true
}

// A link target as a URL the surface opens: http(s) as written, a file on this computer
// ("C:\Projekty\plan.md", "/home/x/plan.md", "file:///…") as a file: URL; anything else, none.
export function hrefOf(target: string): string | undefined {
  if (/^(https?|file):\/\//i.test(target)) return target
  if (/^[A-Za-z]:[\\/]/.test(target)) return `file:///${target.replace(/\\/g, '/').replace(/ /g, '%20')}`
  if (/^\/[^/]/.test(target)) return `file://${target.replace(/ /g, '%20')}`
  return undefined
}

// The path a file: URL names, as the host's tools take it.
export function pathOf(href: string): string {
  return decodeURIComponent(href.replace(/^file:\/\/\/?/i, ''))
}

// The files a block names: label and path each, in order, no path twice.
export function filesOf(block: Block): { label: string; path: string }[] {
  const out: { label: string; path: string }[] = []
  const add = (label: string, path: string) => {
    if (!out.some(f => f.path === path)) out.push({ label, path })
  }
  if (block.kind === 'para') {
    for (const run of block.runs) if (run.path) add(run.text, run.path)
  } else {
    for (const m of block.text.matchAll(/\[([^\]]+)\]\((file:\/\/[^)]+)\)/gi)) add(m[1], pathOf(m[2]))
  }
  return out
}

// "[label](…)" links of a Markdown text with their targets rewritten as URLs the surface
// opens (a file path becomes file:///…), so a file's name is a link wherever it stands.
export function fileLinksOf(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label: string, target: string) => {
    const href = hrefOf(target)
    return href ? `[${label}](${href})` : m
  })
}

// "[label](…)" runs of a text, the rest plain; a link without an openable target stays text.
function linkRunsOf(text: string, isMark: boolean, kind?: 'word' | 'sentence'): Run[] {
  const out: Run[] = []
  let i = 0
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    if (m.index > i) out.push({ text: text.slice(i, m.index), isMark, kind })
    const href = hrefOf(m[2])
    if (href && /^file:/i.test(href)) out.push({ text: m[1], isMark, kind, path: pathOf(href) })
    else out.push(href ? { text: m[1], isMark, kind, href } : { text: m[1], isMark, kind })
    i = m.index + m[0].length
  }
  if (i < text.length) out.push({ text: text.slice(i), isMark, kind })
  return out
}

// A sentence ends at . ! ? followed by a space, or at the end of the text.
const SENTENCE_END = /[.!?](?=\s|$)/g

// A short bold (up to three words) is a word to mark with the marker; a longer one
// is a sentence to set bold and underlined (Stefan, 2026-11-01: the marker for a word
// or fragment that matters, bold and underline for whole sentences).
const WORD_LIMIT = 3

export function runsOf(paragraph: string): Run[] {
  const flat = paragraph.replace(/\n/g, ' ')
  const out: Run[] = []
  let i = 0
  for (const m of flat.matchAll(/\*\*([^*]+)\*\*/g)) {
    if (m.index > i) out.push(...linkRunsOf(flat.slice(i, m.index), false))
    const words = m[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim().split(/\s+/).length
    out.push(...linkRunsOf(m[1], true, words <= WORD_LIMIT ? 'word' : 'sentence'))
    i = m.index + m[0].length
  }
  if (i < flat.length) out.push(...linkRunsOf(flat.slice(i), false))
  return out
}

// The sentences of a paragraph that hold any mark, whole, each as its runs (the marks
// inside kept): what the short view draws, as plain sentences with their emphasis.
export function markedSentenceRunsOf(runs: Run[]): Run[][] {
  let text = ''
  const marks: [number, number][] = []
  for (const run of runs) {
    if (run.isMark) marks.push([text.length, text.length + run.text.length])
    text += run.text
  }
  const ends = [...text.matchAll(SENTENCE_END)].map(m => m.index + 1)
  if (ends.length === 0 || ends[ends.length - 1] < text.length) ends.push(text.length)
  const out: Run[][] = []
  let start = 0
  for (const end of ends) {
    if (marks.some(([ms, me]) => ms < end && me > start)) out.push(sliceRuns(runs, start, end))
    start = end
  }
  return out
}

// The runs between two positions of the joined text, cut at the bounds and trimmed.
function sliceRuns(runs: Run[], from: number, to: number): Run[] {
  const out: Run[] = []
  let at = 0
  for (const run of runs) {
    const s = Math.max(from, at)
    const e = Math.min(to, at + run.text.length)
    if (e > s) out.push({ ...run, text: run.text.slice(s - at, e - at) })
    at += run.text.length
  }
  if (out.length > 0) {
    out[0] = { ...out[0], text: out[0].text.replace(/^\s+/, '') }
    out[out.length - 1] = { ...out[out.length - 1], text: out[out.length - 1].text.replace(/\s+$/, '') }
  }
  return out.filter(run => run.text !== '')
}

export function markedSentencesOf(runs: Run[]): string[] {
  return markedSentenceRunsOf(runs).map(sentence => sentence.map(run => run.text).join(''))
}

// The first sentence of a text, for a paragraph that marks nothing.
export function firstSentenceOf(text: string): string {
  const flat = text.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n/g, ' ').trim()
  const end = SENTENCE_END.exec(flat)
  SENTENCE_END.lastIndex = 0
  return end ? flat.slice(0, end.index + 1) : flat
}

// A paragraph that is a flat bullet list of prose items ("- …" lines, continuation lines
// indented): its items; undefined when it is anything else.
function bulletsOf(paragraph: string): string[] | undefined {
  const lines = paragraph.split('\n')
  if (!/^[-*•]\s+/.test(lines[0])) return undefined
  const items: string[] = []
  for (const line of lines) {
    const item = /^[-*•]\s+(.*)$/.exec(line)
    if (item) items.push(item[1])
    else if (/^\s+\S/.test(line) && items.length > 0) items[items.length - 1] += ` ${line.trim()}`
    else return undefined
  }
  if (items.some(item => /`/.test(item) || NOT_PROSE.test(item))) return undefined
  return items
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
    const bullets = bulletsOf(paragraph)
    if (bullets) {
      // A plain bullet list: each item a prose block of its own, with its emphasis drawn.
      for (const item of bullets) out.push({ kind: 'para', runs: runsOf(item), isBullet: true })
    } else if (isProse(paragraph)) {
      out.push({ kind: 'para', runs: runsOf(paragraph) })
    } else {
      const last = out[out.length - 1]
      const md = fileLinksOf(paragraph)
      if (last && last.kind === 'md') last.text += `\n\n${md}`
      else out.push({ kind: 'md', text: md })
    }
  }
  return out
}

// What "Tylko wyróżnione" shows: the marked sentences of each prose paragraph, or its
// first sentence when it marks nothing, so no paragraph vanishes from the short view.
export function marksOf(blocks: Block[]): string[] {
  return shortViewOf(blocks).map(sentence => sentence.map(run => run.text).join(''))
}

// The short view: per prose paragraph its marked sentences as runs, or its first sentence plain.
export function shortViewOf(blocks: Block[]): Run[][] {
  return blocks.flatMap(block => {
    if (block.kind !== 'para') return []
    const marks = markedSentenceRunsOf(block.runs)
    return marks.length > 0 ? marks : [[{ text: firstSentenceOf(block.runs.map(run => run.text).join('')), isMark: false }]]
  })
}

// Whether any paragraph marks anything: without one, the short view is no shorter.
export function hasMarks(blocks: Block[]): boolean {
  return blocks.some(block => block.kind === 'para' && block.runs.some(run => run.isMark))
}
