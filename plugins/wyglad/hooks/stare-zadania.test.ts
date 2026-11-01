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
  expect(oldTexts).toContain('dim:**Zadanie 1: Wejdź na stronę i wpisz kod C57H2PBE7 (minuta)**')
  const latest = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: SECOND, isFirstOfReply: true } as never })
  const newTexts = texts((await latest.find({ type: 'Box' })) as unknown as Node)
  expect(newTexts.some(t => t.startsWith('Starsza odpowiedź'))).toBe(false)
  expect(newTexts).toContain('**Zadanie 1: Wejdź na stronę i wpisz kod CZLZPGDFZ (minuta)**')
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

// Questions are numbered on through the conversation: the second answer's first
// question is "Pytanie 2", its buttons "2A"/"2B", and "2B" typed back is explained
// to the model as Pytanie 1 of its latest answer.
const ASK = (head: string) => [`▶ **${head}**`, '', '---', '', '🔵 **Pytania do Ciebie**', '', '**1. Co wybrać?**', '- **A)** To – plus: nic; minus: nic.', '- **B)** Tamto – plus: nic; minus: nic.', '➜ Polecam 1B.'].join('\n')

test('pytania numerowane narastająco w rozmowie, przyciski i wskazówka też', async ($, on) => {
  setup(on)
  await complete($, ASK('Pierwsza sprawa.'), 'a')
  await complete($, ASK('Druga sprawa.'), 'b')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: ASK('Druga sprawa.'), isFirstOfReply: true } as never })
  const all = texts((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(all).toContain('**Pytanie 2: Co wybrać?**')
  expect(all).toContain('2B ★')
  expect(all).toContain('**➜ Polecam 2B.**')
  expect(await ui.find({ type: 'Button', text: 'Wybierz 2A' })).toBeDefined()
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  expect(texts((await pane.find({ type: 'Box' })) as unknown as Node)).toContain('2. Co wybrać?')
})

test('„2B” w wiadomości Stefana: model dostaje, że to Pytanie 1 ostatniej odpowiedzi, opcja B', async ($, on) => {
  setup(on)
  let context: string[] | undefined
  on('prompt.submit', ($, e) => {
    context = e.context as string[] | undefined
    return { text: e.text } as never
  })
  await complete($, ASK('Pierwsza sprawa.'), 'a')
  await complete($, ASK('Druga sprawa.'), 'b')
  await $.prompt.submit({ text: '2B' } as never)
  expect((context ?? []).join('\n')).toContain('2B: Pytanie 1 z Twojej ostatniej odpowiedzi')
})

test('odpowiedziane pytanie traci przyciski i pokazuje wybór; pytania starszej odpowiedzi przygaszone', async ($, on) => {
  setup(on)
  on('prompt.submit', ($, e) => ({ text: e.text }) as never)
  await complete($, ASK('Pierwsza sprawa.'), 'a')
  await complete($, ASK('Druga sprawa.'), 'b')
  const older = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: ASK('Pierwsza sprawa.'), isFirstOfReply: true } as never })
  const oldTexts = texts((await older.find({ type: 'Box' })) as unknown as Node)
  expect(oldTexts.some(t => t.startsWith('Starsza odpowiedź: aktualne zadania i pytania'))).toBe(true)
  expect(await older.find({ type: 'Button', text: 'Wybierz 1A' })).toBeUndefined()
  await $.prompt.submit({ text: '2B' } as never)
  const latest = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: ASK('Druga sprawa.'), isFirstOfReply: true } as never })
  const newTexts = texts((await latest.find({ type: 'Box' })) as unknown as Node)
  expect(newTexts).toContain('odpowiedziałeś 2B')
  expect(await latest.find({ type: 'Button', text: 'Wybierz 2A' })).toBeUndefined()
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  expect(texts((await pane.find({ type: 'Box' })) as unknown as Node).some(t => t.startsWith('Pytania ('))).toBe(false)
})

