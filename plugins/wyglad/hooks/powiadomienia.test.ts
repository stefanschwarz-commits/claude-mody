import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

// An answer with a question stops the work until Stefan answers: Windows draws
// a toast (the engine's own notify reaches terminals only). Typing "1" then
// offers "1A", "1B" and "1 zrobiłem"; the working row speaks Polish.

const WITH_QUESTION = [
  '▶ **Strona gotowa do sprawdzenia.**',
  '',
  '---',
  '',
  '🔵 **Do zrobienia przez Ciebie**',
  '',
  '1. Otwórz stronę (minuta) – sprawdź nagłówek',
  '',
  '---',
  '',
  '🔵 **Pytania do Ciebie**',
  '',
  '**1. Zostawić kolory?**',
  '- **A)** Tak – plus: nic; minus: nic.',
  '- **B)** Nie – plus: nic; minus: nic.',
  '➜ Polecam 1A.',
].join('\n')

const WITHOUT_QUESTION = ['▶ **Zrobione bez pytań.**', '', '---', '', '🟢 **Zrobione**', '- Wszystko.'].join('\n')

type Run = { argv: readonly string[]; stdin?: string }

function setup(on: On, isSent = false): Run[] {
  mock.store(on)
  const runs: Run[] = []
  on('turn.complete', () => ({ text: '' }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.status', () => ({ value: undefined }) as never)
  on('ui.notify', () => ({ value: isSent ? { isSent: true, channel: 'kitty' } : { isSent: false, reason: 'no-surface' } }) as never)
  on('session.cwd', () => ({ value: 'C:\\Projekty\\claude-mody' }) as never)
  on('process.run', ($, e) => {
    runs.push({ argv: e.argv, stdin: e.init?.stdin })
    return { value: { exitCode: 0, stdout: '', stderr: '' } } as never
  })
  return runs
}

test('odpowiedź z pytaniem: dymek Windows z nagłówkiem, folderem i liczbą pytań', async ($, on) => {
  const runs = setup(on)
  await $.turn.complete({ reason: 'answer', answer: WITH_QUESTION, durationMs: 1, isAborted: false, turnId: 'a' } as never)
  expect(runs.length).toBe(1)
  expect(runs[0].argv[0]).toBe('powershell')
  expect(runs[0].stdin).toContain('Claude czeka na Twoją odpowiedź · claude-mody')
  expect(runs[0].stdin).toContain('Strona gotowa do sprawdzenia.')
  expect(runs[0].stdin).toContain('Czeka: 1 pytanie.')
})

test('odpowiedź bez pytania: żadnego dymka, nawet gdy są zadania', async ($, on) => {
  const runs = setup(on)
  await $.turn.complete({ reason: 'answer', answer: WITHOUT_QUESTION, durationMs: 1, isAborted: false, turnId: 'b' } as never)
  const tasksOnly = ['▶ **Same zadania.**', '', '---', '', '🔵 **Do zrobienia przez Ciebie**', '', '1. Kliknij (minuta) – po co'].join('\n')
  await $.turn.complete({ reason: 'answer', answer: tasksOnly, durationMs: 1, isAborted: false, turnId: 'c' } as never)
  expect(runs.length).toBe(0)
})

test('gdy silnik sam wysłał powiadomienie, PowerShell nie jest uruchamiany', async ($, on) => {
  const runs = setup(on, true)
  await $.turn.complete({ reason: 'answer', answer: WITH_QUESTION, durationMs: 1, isAborted: false, turnId: 'd' } as never)
  expect(runs.length).toBe(0)
})

test('podpowiedzi: po „1” nazwy przycisków i „1 zrobiłem” z ostatniej odpowiedzi', async ($, on) => {
  setup(on)
  on('prompt.autocomplete', () => ({ suggestions: [] }))
  await $.turn.complete({ reason: 'answer', answer: WITH_QUESTION, durationMs: 1, isAborted: false, turnId: 'e' } as never)
  const got = await $.prompt.autocomplete({ text: '1', cursor: 1, token: '1', start: 0 })
  const texts = got.suggestions.map(s => s.text)
  expect(texts).toContain('1A')
  expect(texts).toContain('1B')
  expect(texts).toContain('1 zrobiłem')
  const narrowed = await $.prompt.autocomplete({ text: '1A', cursor: 2, token: '1A', start: 0 })
  expect(narrowed.suggestions.map(s => s.text)).toEqual([])
  const other = await $.prompt.autocomplete({ text: 'co 2', cursor: 4, token: '2', start: 3 })
  expect(other.suggestions.map(s => s.text)).toEqual([])
})

test('wiersz pracy mówi po polsku, co robi tura', async ($, on) => {
  setup(on)
  let drawn: { word?: string } | undefined
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    drawn = e.props as { word?: string }
    return { type: 'Box', props: {}, children: [] } as never
  })
  await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Spinner', props: { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' } as never })
  expect(drawn?.word).toBe('Myślę')
  await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'Spinner', props: { word: 'Baking', message: null, suffix: '…', mode: 'responding' } as never })
  expect(drawn?.word).toBe('Piszę odpowiedź')
})
