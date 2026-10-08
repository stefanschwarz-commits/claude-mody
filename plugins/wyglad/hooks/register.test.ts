import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

const REPLY = [
  '▶ **Mod działa i jest gotowy do testu.**',
  '',
  'Krótki opis wyniku.',
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
    expect(await ui.find({ type: 'Text', text: '▶ Mod działa i jest gotowy do testu.' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Do zrobienia przez Ciebie/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Pytania do Ciebie/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Polecam A/ })).toBeDefined()
    expect(await ui.find({ type: 'Button', key: 'b2-1-B' })).toBeDefined()
    await ui.press({ key: 'b2-1-A' })
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
  expect(await ui.find({ type: 'Text', text: /▶ Mod działa/ })).toBeUndefined()
})
