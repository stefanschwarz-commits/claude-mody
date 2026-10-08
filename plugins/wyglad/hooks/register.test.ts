import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

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
    expect(await ui.find({ type: 'Text', text: '▶ Nowa odpowiedź' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Mod działa i jest gotowy do testu.' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Potrzebuję od Ciebie' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Uruchom ponownie/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /⚠ Problem: Serwer poczty/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /✓ Zrobione: Formularz/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Polecam A/ })).toBeDefined()
    expect(await ui.find({ type: 'Button', key: 'b0-1-B' })).toBeDefined()
    await ui.press({ key: 'b0-1-A' })
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
  expect(await ui.find({ type: 'Text', text: '▶ Nowa odpowiedź' })).toBeUndefined()
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
  expect(await ui.find({ type: 'Button', key: 'b0-1-B' })).toBeDefined()
  await ui.press({ key: 'b0-1-B' })
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
