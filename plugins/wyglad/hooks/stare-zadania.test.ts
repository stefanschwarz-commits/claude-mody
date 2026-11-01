import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

// A task of an earlier answer may be out of date (a login code that expired):
// its frame says so and dims the tasks, and Claude can mark it "nieaktualne"
// by a fragment of its text, so the pane shows it struck as "zastąpione".

const FIRST = ['▶ **Logowanie: pierwszy kod.**', '', '---', '', '🔵 **Do zrobienia przez Ciebie**', '', '1. Wejdź na stronę i wpisz kod C57H2PBE7 (minuta) – kod jest ważny kwadrans'].join('\n')
const SECOND = ['▶ **Logowanie: nowy kod.**', '', '---', '', '🔵 **Do zrobienia przez Ciebie**', '', '1. Wejdź na stronę i wpisz kod CZLZPGDFZ (minuta) – poprzedni wygasł'].join('\n')

type Node = { type: string; props?: Record<string, unknown>; children?: (Node | string)[] }

function setup(on: On) {
  mock.store(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.status', () => ({ value: undefined }) as never)
  on('ui.notify', () => ({ value: { isSent: false, reason: 'no-surface' } }) as never)
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('prompt.fill', () => ({ isFilled: true }))
}

function texts(root: Node): string[] {
  const out: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Text') out.push((n.children ?? []).filter(c => typeof c === 'string').join(''))
    if (n.type === 'Markdown' && typeof n.props?.text === 'string') out.push(`${n.props.dimColor ? 'dim:' : ''}${n.props.text}`)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk(root)
  return out
}

async function complete($: { turn: { complete: (e: never) => Promise<unknown> } }, answer: string, id: string) {
  await $.turn.complete({ reason: 'answer', answer, durationMs: 1, isAborted: false, turnId: id } as never)
}

test('starsza ramka zadań mówi, że aktualne zadania są niżej, i przygasza swoje', async ($, on) => {
  setup(on)
  await complete($, FIRST, 'a')
  await complete($, SECOND, 'b')
  const older = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: FIRST, isFirstOfReply: true } as never })
  const oldTexts = texts((await older.find({ type: 'Box' })) as unknown as Node)
  expect(oldTexts.some(t => t.startsWith('Starsza odpowiedź'))).toBe(true)
  expect(oldTexts).toContain('dim:**Wejdź na stronę i wpisz kod C57H2PBE7 (minuta)**')
  const latest = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: SECOND, isFirstOfReply: true } as never })
  const newTexts = texts((await latest.find({ type: 'Box' })) as unknown as Node)
  expect(newTexts.some(t => t.startsWith('Starsza odpowiedź'))).toBe(false)
  expect(newTexts).toContain('**Wejdź na stronę i wpisz kod CZLZPGDFZ (minuta)**')
})

test('odpowiedź, która jeszcze nie ma wpisu w sprawach, nie jest „starsza”', async ($, on) => {
  setup(on)
  await complete($, FIRST, 'a')
  const fresh = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: SECOND, isFirstOfReply: true } as never })
  expect(texts((await fresh.find({ type: 'Box' })) as unknown as Node).some(t => t.startsWith('Starsza odpowiedź'))).toBe(false)
})

test('odhacz z fragmentem treści i stanem nieaktualne: stare zadanie skreślone jako zastąpione', async ($, on) => {
  setup(on)
  await complete($, FIRST, 'a')
  await complete($, SECOND, 'b')
  const out = await $.tool.call({ tool: 'mcp__wyglad__odhacz', tekst: 'kod C57H2', stan: 'nieaktualne' } as never)
  expect(String((out as { result?: string }).result)).toContain('nieaktualne')
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  const rows = texts((await pane.find({ type: 'Box' })) as unknown as Node)
  expect(rows).toContain('zastąpione')
  expect(rows).toContain('Do zrobienia (1)')
  const older = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: FIRST, isFirstOfReply: true } as never })
  expect(texts((await older.find({ type: 'Box' })) as unknown as Node)).toContain('zastąpione')
})

test('pasek odpowiedzi: numer w rozmowie i czas co do sekundy; starsza bez daty tego samego dnia', async ($, on) => {
  setup(on)
  const noon = new Date(2026, 10, 1, 12, 0, 5).getTime()
  let now = noon
  on('clock.now', () => ({ value: now }) as never)
  await complete($, FIRST, 'a')
  now = noon + 95_000
  await complete($, SECOND, 'b')
  const latest = texts((await (await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: SECOND, isFirstOfReply: true } as never })).find({ type: 'Box' })) as unknown as Node)
  expect(latest).toContain('Odpowiedź 2 · 1.11.2026, 12:01:40')
  expect(latest).toContain('najnowsza')
  const older = texts((await (await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: FIRST, isFirstOfReply: true } as never })).find({ type: 'Box' })) as unknown as Node)
  expect(older).toContain('Odpowiedź 1 · 12:00:05')
  expect(older).not.toContain('najnowsza')
})

test('kompresja rozmowy: streszczacz dostaje otwarte zadania i pytania z numerami', async ($, on) => {
  setup(on)
  let told: string | undefined
  on('session.compact', ($, e) => {
    told = e.instructions
    return { messages: [{ role: 'user', text: 'streszczenie', toolUses: [] }] } as never
  })
  const withAsk = [SECOND, '', '---', '', '🔵 **Pytania do Ciebie**', '', '**1. Zostawić kod?**', '- **A)** Tak – plus: nic; minus: nic.', '- **B)** Nie – plus: nic; minus: nic.', '➜ Polecam 1A.'].join('\n')
  await complete($, withAsk, 'a')
  await $.session.compact({ trigger: 'auto', messages: [{ role: 'user', text: 'x', toolUses: [] }] } as never)
  expect(told).toContain('Czeka na Stefana')
  expect(told).toContain('1. Wejdź na stronę i wpisz kod CZLZPGDFZ (minuta) – poprzedni wygasł')
  expect(told).toContain('Pytanie 1. Zostawić kod? (opcje: 1A, 1B)')
})

test('odhacz z fragmentem, którego nie ma: odpowiedź mówi „brak takiego zadania”', async ($, on) => {
  setup(on)
  await complete($, FIRST, 'a')
  const out = await $.tool.call({ tool: 'mcp__wyglad__odhacz', tekst: 'nic takiego', stan: 'nieaktualne' } as never)
  expect(String((out as { result?: string }).result)).toContain('brak takiego zadania')
})
