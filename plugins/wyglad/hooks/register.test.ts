import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { optionsOf, splitQuestions, tableOf, tipOf } from './split'

const REPLY = [
  '▶ **Mod działa i jest gotowy do testu.**',
  '',
  'Krótki opis wyniku.',
  '',
  '---',
  '',
  '**Zrobione**',
  '',
  'Formularz wysyła wiadomości, sprawdziłem na stronie.',
  '',
  '---',
  '',
  '⚠️ **Problem**',
  '',
  'Serwer poczty odrzuca część wiadomości.',
  '',
  '---',
  '',
  '✅ **Do zrobienia przez Ciebie**',
  '',
  '| Nr | Co zrobić |',
  '|---|---|',
  '| 1 | Uruchom ponownie aplikację |',
  '',
  '---',
  '',
  '❓ **Pytania do Ciebie**',
  '',
  '**1. Zostawić kolory?**',
  'Dlaczego to ważne: łatwiej czytać.',
  '- **A)** Tak: plus i minus.',
  '- **B)** Nie: plus i minus.',
  '➜ Polecam A. Odpisz A albo B.',
  '',
  '---',
  '',
  'ℹ️ **Dla informacji (możesz pominąć)**',
  '- drobiazg',
].join('\n')

const message = (text: string) => ({ text, isFirstOfReply: true }) as never

function setup(on: On) {
  mock.store(on)
  const filled: string[] = []
  on('prompt.fill', ($, e) => {
    filled.push(e.text)
    return { isFilled: true }
  })
  return filled
}

test('odpowiedź z ▶: kolorowy wniosek, ramki i przyciski na każdym ekranie', async ($, on) => {
  const filled = setup(on)
  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ plugin: 'wyglad', surface, component: 'AssistantMessage', props: message(REPLY) })
    expect(await ui.find({ type: 'Text', text: /^▶ / })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Mod działa i jest gotowy do testu.' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Potrzebuję od Ciebie' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Uruchom ponownie/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: 'Problem' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Zrobione' })).toBeDefined()
    expect(await ui.find({ type: 'Button', text: 'Pokaż szczegóły' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /Polecam 1A/ })).toBeDefined()
    expect(await ui.find({ type: 'Button', key: 'b0-1B' })).toBeDefined()
    await ui.press({ key: 'b0-1A' })
    await ui.unmount()
  }
  expect(filled).toEqual(['1A ', '1A ', '1A '])
})

test('komunikat z trakcie pracy zwija się do jednej szarej linii', async ($, on) => {
  setup(on)
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'terminal', component: 'AssistantMessage', props: message('Sprawdzam, jakie dane dostaje mod.') })
  expect(await ui.find({ type: 'Text', text: '· Sprawdzam, jakie dane dostaje mod.' })).toBeDefined()
})

test('/wyglad off przywraca zwykły wygląd', async ($, on) => {
  setup(on)
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['zwykły'] }) as never)
  on('ui.invalidate', () => ({ value: undefined }) as never)
  const out = await $.command.run({ command: 'wyglad', args: 'off' } as never)
  expect(out.text).toContain('zwykły')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'terminal', component: 'AssistantMessage', props: message(REPLY) })
  expect(await ui.find({ type: 'Text', text: /^▶ / })).toBeUndefined()
})

test('wskazówka o sekcjach Zrobione i Problem trafia do Claude', async ($, on) => {
  setup(on)
  on('prompt.compose', () => ({ sections: [{ id: 'base', text: 'x', scope: 'shared' }] }) as never)
  const { sections } = await $.prompt.compose({ model: 'm', promptModel: 'm', outputStyle: null, traits: [], surfaces: [], tools: [] } as never)
  expect(sections.some(s => s.id === 'wyglad:sekcje' && s.text.includes('Zrobione'))).toBe(true)
})

test('pytanie z tabelą opcji: tabela i przyciski z jej wierszy', async ($, on) => {
  const filled = setup(on)
  const reply = [
    '▶ **Test tabeli.**',
    '',
    '---',
    '',
    '❓ **Pytania do Ciebie**',
    '',
    '**1. Który wygląd?**',
    'Dlaczego to ważne: czytelność.',
    '| Opcja | Co się stanie | Plus | Minus |',
    '|---|---|---|---|',
    '| **A)** | Ramki | Kolor | Więcej linii |',
    '| **B)** | Bez ramek | Spokojnie | Mniej widać |',
    '➜ Polecam A. Odpisz A albo B.',
  ].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  expect(await ui.find({ type: 'Text', text: 'Pytanie 1: Który wygląd?' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'b0-1B' })).toBeDefined()
  await ui.press({ key: 'b0-1B' })
  expect(filled).toEqual(['1B '])
})

test('pasek nad polem: co jest potrzebne i przycisk do początku odpowiedzi', async ($, on) => {
  setup(on)
  const scrolled: unknown[] = []
  on('ui.scroll', ($, e) => {
    scrolled.push(e)
    return {}
  })
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  await $.turn.complete({ reason: 'answer', answer: REPLY, durationMs: 1, isAborted: false, turnId: 't1' } as never)
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await ui.find({ type: 'Text', text: 'Potrzebuję od Ciebie: 1 zadanie i 1 pytanie' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'jump' })).toBeDefined()
  await ui.press({ key: 'jump' })
})

test('opcja polecana ma w tabeli jeden znak: ★, objaśniony w nagłówku', () => {
  const [q] = splitQuestions(['**1. Który?**', '| Opcja | Co |', '|---|---|', '| **A)** | Ramki |', '| **B)** | Bez |', '➜ Polecam **B**, bo prościej.'].join('\n'))
  const table = tableOf(q)
  expect(table).toContain('| **1B** ★ | Bez |')
  expect(table).toContain('| **1A** | Ramki |')
  expect(tipOf(q)).toBe('➜ Polecam 1B, bo prościej.')
  expect(table).toContain('| Opcja (★ polecam) |')
  expect(table).not.toContain('1A** ★')
})

test('odhaczone zadanie się skreśla, a pasek liczy tylko pozostałe', async ($, on) => {
  setup(on)
  const toasts: string[] = []
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined } as never
  })
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  const reply = ['▶ **Test zadań.**', '', '---', '', '✅ **Do zrobienia przez Ciebie**', '', '1. Zmień hasło (5 min) – po to', '2. Sprawdź stronę (2 min) – po to'].join('\n')
  await $.turn.complete({ reason: 'answer', answer: reply, durationMs: 1, isAborted: false, turnId: 't2' } as never)
  expect(toasts).toEqual(['Gotowe. Potrzebuję od Ciebie: 2 zadania'])
  const answer = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  const tick = await answer.find({ type: 'Button', text: '☐' })
  expect(tick).toBeDefined()
  await answer.press({ key: tick!.key! })
  expect(await answer.find({ type: 'Button', text: '☑' })).toBeDefined()
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: 'Potrzebuję od Ciebie: 1 zadanie' })).toBeDefined()
})

test('kroki pracy: jedna szara linia, błąd zostaje widoczny', async ($, on) => {
  setup(on)
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['silnik'] }) as never)
  const ok = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'ToolUse', props: { tool: 'Read', input: {}, isRunning: false, isErrored: false, isInterrupted: false } as never })
  expect(await ok.find({ type: 'Text', text: '· czytam plik' })).toBeDefined()
  const bad = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'ToolUse', props: { tool: 'Bash', input: {}, isRunning: false, isErrored: true, isInterrupted: false } as never })
  expect(await bad.find({ type: 'Text', text: 'silnik' })).toBeDefined()
  const group = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'ToolGroup', props: { calls: [{ tool: 'Read', input: {}, isRunning: false }, { tool: 'Grep', input: {}, isRunning: false }], isActive: false, isExpanded: false } as never })
  expect(await group.find({ type: 'Text', text: '· 2 kroki w tle (czytam plik, szukam w plikach)' })).toBeDefined()
})

test('długie wyjaśnienie: zwija się dopiero powyżej 30 linii i nigdy w środku tabeli', async ($, on) => {
  setup(on)
  const table = ['| A | B |', '|---|---|', ...Array.from({ length: 12 }, (_, i) => `| w${i} | x |`)]
  const para = (n: number) => [`Akapit ${n}, linia 1.`, `Akapit ${n}, linia 2.`, '']
  const long = ['▶ **Długie.**', '', ...para(1), ...table, '', ...para(2), ...para(3), ...para(4), ...para(5), ...para(6)].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(long) })
  const more = await ui.find({ type: 'Button', text: /Pokaż więcej/ })
  expect(more).toBeDefined()
  expect(await ui.find({ type: 'Markdown', props: { text: /\| w11 \| x \|/ } })).toBeDefined()
  await ui.press({ key: more!.key! })
  expect(await ui.find({ type: 'Button', text: 'Pokaż mniej' })).toBeDefined()
  const short = ['▶ **Krótkie.**', '', ...Array.from({ length: 14 }, (_, i) => `Linia ${i + 1}.`)].join('\n')
  const ui2 = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(short) })
  expect(await ui2.find({ type: 'Button', text: /Pokaż więcej/ })).toBeUndefined()
})

test('panel Moje sprawy: zadania z całej rozmowy, odhaczanie i pytania z przyciskami', async ($, on) => {
  setup(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  const first = ['▶ **Pierwsza.**', '', '---', '', '✅ **Do zrobienia przez Ciebie**', '', '1. Zmień hasło (5 min) – po to'].join('\n')
  await $.turn.complete({ reason: 'answer', answer: first, durationMs: 1, isAborted: false, turnId: 'a' } as never)
  await $.turn.complete({ reason: 'answer', answer: REPLY, durationMs: 1, isAborted: false, turnId: 'b' } as never)
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  expect(await pane.find({ type: 'Text', text: 'Do zrobienia (1)' })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: 'Zmień hasło (5 min) – po to' })).toBeDefined()
  expect(await pane.find({ type: 'Button', text: 'Wybierz 1B' })).toBeDefined()
  const box = await pane.find({ type: 'Button', text: '☐' })
  await pane.press({ key: box!.key! })
  expect(await pane.find({ type: 'Text', text: 'Do zrobienia (0)' })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: 'Odhaczone (1)' })).toBeDefined()
})

test('nagłówki z kolorowymi kropkami (wersja 6 instrukcji) są rozpoznawane', async ($, on) => {
  setup(on)
  const reply = ['▶ **Kropki.**', '', '---', '', '🟢 **Zrobione**', '- Strona działa.', '', '---', '', '🔴 **Problem**', '- Hasło wygasło.', '', '---', '', '🟠 **Do zrobienia przez Ciebie**', '1. Zmień hasło (5 min) – po to'].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  expect(await ui.find({ type: 'Markdown', props: { text: /Strona działa/ } })).toBeDefined()
  expect(await ui.find({ type: 'Markdown', props: { text: /Hasło wygasło/ } })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: '☐' })).toBeDefined()
})

test('gwiazdka także przy „Polecam 2B” z numerem', () => {
  const [q] = splitQuestions(['**2. Kiedy?**', '| Opcja | Co |', '|---|---|', '| **A)** | Teraz |', '| **B)** | Wieczorem |', '➜ Polecam 2B.'].join('\n'))
  expect(tableOf(q)).toContain('| **2B** ★ | Wieczorem |')
  expect(tipOf(q)).toBe('➜ Polecam 2B.')
})

test('opcje bez tabeli: jedna linia na opcję, gwiazdka i przyciski „Wybierz 1B ★”', () => {
  const [q] = splitQuestions(['**1. Adres?**', '| Opcja | Co się stanie | Plus | Minus |', '|---|---|---|---|', '| **A)** | Zostawiam | Nic nie zmieniam | Pełna skrzynka |', '| **B)** | Zmieniam | Porządek | Nowa skrzynka |', '➜ Polecam 1B.'].join('\n'))
  expect(optionsOf(q)).toEqual([
    { id: '1A', isBest: false, text: 'Zostawiam · Plus: Nic nie zmieniam · Minus: Pełna skrzynka' },
    { id: '1B', isBest: true, text: 'Zmieniam · Plus: Porządek · Minus: Nowa skrzynka' },
  ])
})

test('opcje zapisane listą „**1A) ★**” (instrukcja v6) też działają', () => {
  const [q] = splitQuestions(['**1. Usunąć kopię?**', '- **1A) ★** Usuwam kopię – plus: porządek; minus: brak.', '- **1B)** Zostawiam – plus: nic; minus: bałagan.', '➜ Polecam 1A, bo nic nie tracisz.'].join('\n'))
  expect(optionsOf(q)).toEqual([
    { id: '1A', isBest: true, text: 'Usuwam kopię – plus: porządek; minus: brak.' },
    { id: '1B', isBest: false, text: 'Zostawiam – plus: nic; minus: bałagan.' },
  ])
})

test('karta pytania ma delikatne tło dopasowane do motywu', async ($, on) => {
  setup(on)
  on('config.list', () => ({ value: [{ key: 'theme', value: 'light' }] }) as never)
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(REPLY) })
  expect(await ui.find({ type: 'Box', props: { backgroundColor: '#EEF4FC' } })).toBeDefined()
  expect(await ui.find({ type: 'Box', props: { backgroundColor: '#FDF3E7' } })).toBeDefined()
})

test('panel: pytanie z treścią opcji, nie same przyciski; pasek ma jedną linię', async ($, on) => {
  setup(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  await $.turn.complete({ reason: 'answer', answer: REPLY, durationMs: 1, isAborted: false, turnId: 'c' } as never)
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  expect(await pane.find({ type: 'Markdown', props: { text: /^\*\*1A\*\*/ } })).toBeDefined()
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: /^▶/ })).toBeUndefined()
})

test('panel: opcje pytania jedna pod drugą, przyciski osobno w rzędzie', async ($, on) => {
  setup(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  await $.turn.complete({ reason: 'answer', answer: REPLY, durationMs: 1, isAborted: false, turnId: 'd' } as never)
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  type Node = { type: string; children?: Node[] }
  const root = (await pane.find({ type: 'Box' })) as unknown as Node
  const holders: Node[] = []
  const walk = (n: Node) => {
    if (n.children?.some(c => c.type === 'Button' && /Wybierz/.test(JSON.stringify(c)))) holders.push(n)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk(root)
  expect(holders.length).toBeGreaterThan(0)
  expect(holders.every(h => h.children!.every(c => c.type === 'Button'))).toBe(true)
})
