import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { optionsOf, splitQuestions, splitReply, tableOf, tipOf } from './split'

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
    // The ▶ marker is an icon where the surface draws SVG, the glyph on the terminal.
    expect(await ui.find(surface === 'terminal' ? { type: 'Text', text: '▶' } : { type: 'Svg' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /[Oo]dpowiedź$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Mod działa i jest gotowy do testu.' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Do zrobienia przez Ciebie' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Nie udało się' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Uruchom ponownie/ })).toBeUndefined()
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
  // Tasks are numbered, so Stefan can say "zrobiłem 1"; what to do reads bold, why reads faint.
  expect(await answer.find({ type: 'Text', text: '2.' })).toBeDefined()
  expect(await answer.find({ type: 'Text', text: 'Zmień hasło (5 min)' })).toBeDefined()
  expect(await answer.find({ type: 'Markdown', props: { text: 'po to' } })).toBeDefined()
  expect(await answer.find({ type: 'Button', text: '☐' })).toBeUndefined()
  // Ticking lives in the "Moje sprawy" pane.
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  const tick = await pane.find({ type: 'Button', text: '☐' })
  expect(tick).toBeDefined()
  await pane.press({ key: tick!.key! })
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: 'Potrzebuję od Ciebie: 1 zadanie' })).toBeDefined()
})

test('kroki pracy: jedna szara linia, błąd zostaje widoczny', async ($, on) => {
  setup(on)
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['silnik'] }) as never)
  const ok = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'ToolUse', props: { tool: 'Read', input: {}, isRunning: false, isErrored: false, isInterrupted: false } as never })
  expect(await ok.find({ type: 'Text', text: 'czytam plik' })).toBeDefined()
  const bad = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'ToolUse', props: { tool: 'Bash', input: {}, isRunning: false, isErrored: true, isInterrupted: false } as never })
  expect(await bad.find({ type: 'Text', text: 'silnik' })).toBeDefined()
  const group = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'ToolGroup', props: { calls: [{ tool: 'Read', input: {}, isRunning: false }, { tool: 'Grep', input: {}, isRunning: false }], isActive: false, isExpanded: false } as never })
  expect(await group.find({ type: 'Text', text: '2 kroki w tle (czytam plik, szukam w plikach)' })).toBeDefined()
})

test('długie wyjaśnienie: zwija się dopiero powyżej 40 linii i nigdy w środku tabeli', async ($, on) => {
  setup(on)
  const table = ['| A | B |', '|---|---|', ...Array.from({ length: 12 }, (_, i) => `| w${i} | x |`)]
  const para = (n: number) => [`Akapit ${n}, linia 1.`, `Akapit ${n}, linia 2.`, '']
  const long = ['▶ **Długie.**', '', ...para(1), ...table, '', ...para(2), ...para(3), ...para(4), ...para(5), ...para(6), ...para(7), ...para(8), ...para(9), ...para(10)].join('\n')
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
  expect(await pane.find({ type: 'Button', text: '↗' })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: '1. Zostawić kolory?' })).toBeDefined()
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
  expect(await ui.find({ type: 'Text', text: '1.' })).toBeDefined()
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
  expect(await pane.find({ type: 'Button', text: /Wybierz/ })).toBeUndefined()
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: /^▶/ })).toBeUndefined()
})

test('panel to spis: jedna linia na sprawę, ↗ prowadzi do pełnej treści w odpowiedzi', async ($, on) => {
  setup(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  const scrolls: unknown[] = []
  on('ui.scroll', ($, e) => {
    scrolls.push(e)
    return {}
  })
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  await $.turn.complete({ reason: 'answer', answer: REPLY, durationMs: 1, isAborted: false, turnId: 'd' } as never)
  const pane = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Pane', requestId: 'sprawy', props: {} as never } as never)
  const jump = await pane.find({ type: 'Button', text: '↗' })
  expect(jump).toBeDefined()
  await pane.press({ key: jump!.key! })
  expect(await pane.find({ type: 'Markdown' })).toBeUndefined()
})

test('podsumowanie: punkty z numerami zamiast kropek, delikatne szare tło', async ($, on) => {
  setup(on)
  on('config.list', () => ({ value: [{ key: 'theme', value: 'dark' }] }) as never)
  const reply = ['▶ **Numery.**', '', '---', '', '🟢 **Zrobione**', '- Pierwsze.', '- Drugie.', '', '---', '', '🔴 **Problem**', '- Jedyne.'].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  type Node = { type: string; props?: { backgroundColor?: string; bold?: boolean }; children?: (Node | string)[] }
  const found: string[] = []
  const bold: string[] = []
  const walk = (n: Node) => {
    if (n.props?.backgroundColor) found.push(n.props.backgroundColor)
    if (n.type === 'Text' && n.props?.bold) bold.push(n.children?.filter(c => typeof c === 'string').join('') ?? '')
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(found).toContain('#172116')
  expect(found).toContain('#2A1616')
  expect(bold).toContain('Pierwsze.')
  expect(bold).toContain('Drugie.')
  expect(bold).toContain('Jedyne.')
})

test('odpowiedź pisana po swojemu: pasek nie twierdzi „Nic od Ciebie nie potrzebuję”', async ($, on) => {
  setup(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  const free = ['▶ **Zostało 6 spraw.**', '', '**Na ciebie:**', '', '| # | Sprawa |', '|---|---|', '| 1 | Archiwum |'].join('\n')
  await $.turn.complete({ reason: 'answer', answer: free, durationMs: 1, isAborted: false, turnId: 'f' } as never)
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: /Nic od Ciebie/ })).toBeUndefined()
  expect(await band.find({ type: 'Button', text: 'Moje sprawy' })).toBeDefined()
})

test('zwijanie nie zostawia samego nagłówka nad schowaną listą', async ($, on) => {
  setup(on)
  const para = (n: number) => [`Akapit ${n}, linia 1.`, `Akapit ${n}, linia 2.`, '']
  const items = Array.from({ length: 30 }, (_, i) => `- punkt ${i + 1}`)
  const text = ['▶ **Długo.**', '', ...para(1), ...para(2), ...para(3), ...para(4), 'Zrobię sam:', '', ...items, '', ...para(5)].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(text) })
  type Node = { type: string; props?: { text?: string }; children?: Node[] }
  const texts: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Markdown' && n.props?.text) texts.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  const shown = texts.find(t => t.includes('Akapit 1')) ?? ''
  expect(await ui.find({ type: 'Button', text: /Pokaż więcej/ })).toBeDefined()
  expect(/Zrobię sam:\s*$/.test(shown.trim())).toBe(false)
})

test('podsumowanie: podpunkty zostają wcięte pod numerowanym punktem', async ($, on) => {
  setup(on)
  const reply = ['▶ **Podpunkty.**', '', '---', '', 'ℹ️ **Dla informacji**', '- Co jest do poprawy:', '  - brak osoby;', '  - stan „Do ustalenia”;', '- Wdrożenia jeszcze nie ma.'].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  type Node = { type: string; props?: { text?: string }; children?: Node[] }
  const texts: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Markdown' && n.props?.text) texts.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  // Sub-points are drawn inside their point with the indent stripped, so no line
  // starts with four spaces (Markdown would draw that as a code box).
  expect(texts).toContain('- brak osoby;')
  expect(texts).toContain('- stan „Do ustalenia”;')
  expect(texts.some(t => /^ {4}/.test(t))).toBe(false)
})

test('podsumowanie: pogrubiony początek punktu, reszta szarym; stare „Problem” nadal działa', async ($, on) => {
  setup(on)
  const reply = ['▶ **Lead.**', '', '---', '', '🟢 **Zrobione**', '- Testy przechodzą. 23 z 23 na kopii.', '', '---', '', '🔴 **Problem**', '- Kopia nie wyszła.', '', '---', '', '🟠 **Niewyjaśnione**', '- Nie wiem, czemu mail nie dotarł.'].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  type Node = { type: string; props?: { bold?: boolean; dimColor?: boolean; text?: string }; children?: (Node | string)[] }
  const bold: string[] = []
  const faint: string[] = []
  const walk = (n: Node) => {
    const text = n.children?.filter(c => typeof c === 'string').join('') ?? ''
    if (n.type === 'Text' && n.props?.bold) bold.push(text)
    if (n.type === 'Text' && n.props?.dimColor) faint.push(text)
    // The rest is Markdown (links stay clickable), drawn faint.
    if (n.type === 'Markdown' && n.props?.dimColor) faint.push(n.props.text ?? '')
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(bold).toContain('Testy przechodzą.')
  expect(faint).toContain('23 z 23 na kopii.')
  expect(bold).toContain('Nie udało się')
  expect(bold).toContain('Niewyjaśnione')
})

test('blok do wklejenia (```) w zadaniach nie zamienia się w kratki i nie zawyża licznika', async ($, on) => {
  setup(on)
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  const reply = [
    '▶ **Wklej wersję 6.**', '', '---', '',
    '🟠 **Do zrobienia przez Ciebie**',
    '1. Usuń starą treść (10 s) – po to.',
    '2. Wklej blok poniżej (1 min) – po to.',
    '3. Napisz „wklejone” (5 s).',
    '', 'Gotowe, gdy napiszesz „wklejone”.', '',
    '```', 'Jestem Stefan Schwarz.', 'JĘZYK', '- Odpisuj po polsku.', '- Zwracaj się na „ty”.', '```',
  ].join('\n')
  await $.turn.complete({ reason: 'answer', answer: reply, durationMs: 1, isAborted: false, turnId: 'g' } as never)
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  type Node = { type: string; props?: { text?: string; label?: string }; children?: (Node | string)[] }
  const boxes: string[] = []
  const md: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Text' && /^\d+\.$/.test(n.children?.join('') ?? '')) boxes.push('n')
    if (n.type === 'Markdown' && n.props?.text) md.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(boxes.length).toBe(3)
  expect(md).toContain('```\nJestem Stefan Schwarz.\nJĘZYK\n- Odpisuj po polsku.\n- Zwracaj się na „ty”.\n```')
  // The fenced block sits below the orange frame, not inside it.
  type Framed = { type: string; props?: { borderColor?: string; text?: string }; children?: (Framed | string)[] }
  const inFrame: string[] = []
  const dig = (n: Framed, inside: boolean) => {
    const here = inside || n.props?.borderColor === 'warning'
    if (here && n.type === 'Markdown' && n.props?.text) inFrame.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && dig(c, here))
  }
  dig((await ui.find({ type: 'Box' })) as unknown as Framed, false)
  expect(inFrame.some(t => t.startsWith('```'))).toBe(false)
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: 'Potrzebuję od Ciebie: 3 zadania' })).toBeDefined()
})

test('sekcje bez linii --- między nimi są rozpoznawane tak samo', () => {
  const reply = splitReply(['▶ **Gotowe.**', '', 'Opis.', '', '🟢 **Zrobione**', '1. **Raz.** Tak.', '', '🟠 **Do zrobienia przez Ciebie**', '1. Zrób (1 min) – po co', '', '⚪ **Dla informacji**', '- drobiazg', '```', '🟢 **Zrobione** w kodzie nie dzieli', '```'].join('\n'))
  expect(reply?.parts.map(part => part.kind)).toEqual(['plain', 'done', 'todo', 'info'])
  expect(reply?.parts[3].body).toContain('w kodzie nie dzieli')
})

test('zdanie zaczynające się od „Zrobione” nie otwiera sekcji', () => {
  const reply = splitReply(['▶ **Gotowe.**', '', 'Zrobione zostało wszystko, co prosiłeś, i sprawdzone na stronie.', '', '---', '', '🟢 **Zrobione**', '- raz'].join('\n'))
  expect(reply?.parts.map(part => part.kind)).toEqual(['plain', 'done'])
})

test('blok do wklejenia w ramce Zrobione zostaje w całości i stoi pod ramką', async ($, on) => {
  setup(on)
  const reply = ['▶ **Gotowa wiadomość.**', '', '---', '', '🟢 **Zrobione**', '', '```', 'Sprawdź, tylko odczytem:', '1. Czy skrypt się uruchomił.', '2. Czy wysyła maila.', '```', '', '---', '', '⚪ **Dla informacji**', '1. **Brak maila nie musi oznaczać awarii.** Nie wiem.'].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  type Node = { type: string; props?: { text?: string }; children?: (Node | string)[] }
  const md: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Markdown' && n.props?.text) md.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  const fence = md.find(t => t.startsWith('```'))
  expect(fence).toContain('2. Czy wysyła maila.')
  expect(fence).toMatch(/```$/)
  expect(md.filter(t => t.trim() === '```').length).toBe(0)
})

test('„1 zrobiłem”: Claude dostaje treść zadania, narzędzie odhacz skreśla je, linia stanu liczy resztę', async ($, on) => {
  setup(on)
  const status: (string | undefined)[] = []
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.status', ($, e) => {
    status.push(e.text)
    return { value: undefined } as never
  })
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  const seen: string[][] = []
  on('prompt.submit', ($, e) => {
    seen.push([...(e.context ?? [])])
    return { text: e.text }
  })
  const reply = ['▶ **Test.**', '', '---', '', '🔵 **Do zrobienia przez Ciebie**', '', '1. Zmień hasło (5 min) – po to', '2. Sprawdź stronę (2 min) – po to', '3. Napisz do Ligii (5 min) – po to'].join('\n')
  await $.turn.complete({ reason: 'answer', answer: reply, durationMs: 1, isAborted: false, turnId: 't3' } as never)
  expect(status.at(-1)).toBe('czeka: 3 zadania')
  await $.prompt.submit({ text: '1 i 3 zrobiłem, 2 odpada', wait: false } as never)
  expect(seen[0].join('\n')).toContain('Zadanie 1 („Zmień hasło (5 min) – po to”): zrobione.')
  expect(seen[0].join('\n')).toContain('Zadanie 2 („Sprawdź stronę (2 min) – po to”): odpada.')
  const out = (await $.tool.call({ tool: 'mcp__wyglad__odhacz', numery: [1, 3], stan: 'zrobione' } as never)) as { result?: unknown }
  expect(String(out.result)).toContain('Otwartych zadań z ostatniej odpowiedzi: 1.')
  expect(status.at(-1)).toBe('czeka: 1 zadanie')
})

test('„**Zadanie 1:**” z instrukcji v7 nie dubluje numeru w ramce zadań', async ($, on) => {
  setup(on)
  const reply = `▶ **Test.**

---

🔵 **Do zrobienia przez Ciebie**

1. **Zadanie 1:** Załóż projekt (2 minuty) – po co
2. **Zadanie 2:** Odpowiedz Ligii (5 minut) – prosiła`
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: message(reply) })
  expect(await ui.find({ type: 'Text', text: '2.' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Załóż projekt (2 minuty)' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Zadanie 1: Załóż projekt (2 minuty)' })).toBeUndefined()
})
