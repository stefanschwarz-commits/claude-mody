import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { optionsOf, splitQuestions, textOf } from './split'

// A question written the way a session without the instructions writes it:
// "Pytanie 1:" in the text, the bold running through the first sentence of each option.
const BODY = [
  '**Pytanie 1: Jak chronić archiwa korespondencji przed skasowaniem maili?**',
  '',
  'Pytałem o to wcześniej i nie było odpowiedzi.',
  '',
  'Dlaczego to ważne: archiwum ma być trwałym zapisem.',
  '',
  '- **1A) ★ Archiwa tylko do odczytu, usuwać możesz tylko Ty.** Plus: nikt nie skasuje. Minus: trzeba dodać archiwa w Outlooku.',
  '- **1B) Pełny dostęp zostaje, a do tego odzyskiwanie usuniętych maili.** Plus: nic się nie zmienia. Minus: kasowanie nadal możliwe.',
  '',
  '➜ Polecam 1A, bo archiwum ma być nienaruszalne. Odpisz 1A albo 1B.',
].join('\n')

function setup(on: On) {
  mock.store(on)
  on('prompt.fill', () => ({ isFilled: true }))
}

test('„Pytanie 1:” w treści nie dubluje numeru, a pogrubione opcje są opcjami', () => {
  const [q] = splitQuestions(BODY)
  expect(q.number).toBe('1')
  expect(q.text.startsWith('**Jak chronić')).toBe(true)
  expect(q.options.length).toBe(2)
  const options = optionsOf(q)
  expect(options.map(o => o.id)).toEqual(['1A', '1B'])
  expect(options[0].isBest).toBe(true)
  expect(options[0].text.startsWith('**Archiwa tylko do odczytu, usuwać możesz tylko Ty.** Plus:')).toBe(true)
  expect(options[1].text.startsWith('**Pełny dostęp zostaje')).toBe(true)
})

test('textOf: stary zapis bez zmian, nowy zapis zachowuje pogrubienie tytułu', () => {
  expect(textOf('**1A) ★** Tak, plus i minus.')).toBe('Tak, plus i minus.')
  expect(textOf('**1B)** Nie.')).toBe('Nie.')
  expect(textOf('**1A) ★ Tytuł.** reszta')).toBe('**Tytuł.** reszta')
})

test('karta takiego pytania ma jeden nagłówek i przyciski Wybierz 1A / 1B', async ($, on) => {
  setup(on)
  const reply = ['▶ **Archiwa.**', '', '---', '', '🔵 **Pytania do Ciebie**', '', BODY].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: reply, isFirstOfReply: true } as never })
  expect(await ui.find({ type: 'Text', text: /^Pytanie 1: Jak chronić/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Pytanie 1: Pytanie 1/ })).toBeUndefined()
  expect(await ui.find({ type: 'Button', text: 'Wybierz 1A ★' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Wybierz 1B' })).toBeDefined()
})
