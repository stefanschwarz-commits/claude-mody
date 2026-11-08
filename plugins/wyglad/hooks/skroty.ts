import type { Part } from './split'
import type { Run } from './zakreslacz'

// Each point of the explanation shows its bold sentence; the rest waits behind a "›"
// (Stefan, 2026-11-08: "każdy punkt miał ukryte informacje"). Nothing folds when the
// answer has a table (Stefan, same day: "nie proponuj mi ukrywać, przygaszać, kiedy mam tabelę").
export function foldOf(runs: Run[]): { lead: Run[]; rest: Run[] } | undefined {
  const first = runs.findIndex(run => run.text.trim() !== '')
  if (first < 0 || !runs[first].isMark || runs[first].kind !== 'sentence') return undefined
  const rest = runs.slice(first + 1)
  if (!rest.some(run => run.text.trim() !== '')) return undefined
  return { lead: runs.slice(0, first + 1), rest }
}

export function hasTable(text: string): boolean {
  return /^\s*\|.*\|\s*$/m.test(text)
}

// Status tiles above the answer: how many things are done, failed, wait for Stefan, ask him.
export type Tiles = { done: number; failed: number; todo: number; questions: number }

function itemsIn(body: string): number {
  return body.split(/\r?\n/).filter(line => /^(\d+\.|[-*•])\s+\S/.test(line) || /^\*\*Zadanie \d+/.test(line)).length
}

export function tilesOf(parts: Part[], questions: number): Tiles {
  const sum = (kind: Part['kind']) => parts.filter(part => part.kind === kind).reduce((n, part) => n + itemsIn(part.body), 0)
  return { done: sum('done'), failed: sum('failed'), todo: sum('todo'), questions }
}

// A failure for want of a permission gets its own name, so Stefan sees he can act on it.
export function isPermission(text: string): boolean {
  return /uprawnie|brak zgody|odmow|permission|not permitted|denied|zablokowa/i.test(text)
}
