export type Kind = 'todo' | 'questions' | 'info' | 'plain'

export type Part = { kind: Kind; title: string; body: string }

export type Question = { number: string; text: string; options: string[]; tip: string }

export type Reply = { headline: string; parts: Part[] }

const KINDS: readonly [Kind, RegExp][] = [
  ['todo', /^✅/],
  ['questions', /^❓/],
  ['info', /^ℹ️?/],
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
      const title = head.replace(/^(✅|❓|ℹ️?)\s*/, '').replace(/\*\*/g, '').replace(/:\s*$/, '').trim()
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
    const start = /^\*\*(\d+)\.\s*(.*?)\*\*\s*$/.exec(line)
    if (start) {
      current = { number: start[1], text: `**${start[2]}**`, options: [], tip: '' }
      out.push(current)
      continue
    }
    if (!current) {
      current = { number: '1', text: '', options: [], tip: '' }
      out.push(current)
    }
    if (/^[-*]\s+\*\*[A-Z]\)\*\*/.test(line)) current.options.push(line.replace(/^[-*]\s+/, ''))
    else if (/^➜/.test(line)) current.tip = line
    else current.text += `${current.text ? '\n\n' : ''}${line}`
  }

  return out
}

export function letterOf(option: string): string {
  return /\*\*([A-Z])\)\*\*/.exec(option)?.[1] ?? '?'
}
