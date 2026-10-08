import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const NOW = Date.UTC(2026, 9, 8, 12)
const STAN = '# STAN\n\n**Zrobione:** mod dzwiek.\n\n**W toku:** pasek projektu.\n\n**Dalej:**\n- powiadomienia\n- bezpiecznik\n'
const BAND = { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never

function folder(on: On, files: Record<string, string>) {
  const written: Record<string, string> = {}
  const base = (path: string) => path.split(/[\\/]/).pop() ?? path
  on('session.cwd', () => ({ value: '/Users/stefan/OneDrive/Claude/strona-elmi' }))
  on('clock.now', () => ({ value: NOW }))
  on('fs.read', ($, e) => {
    const text = files[base(e.path)] ?? written[base(e.path)]
    return text === undefined ? { deny: 'ENOENT' } : { value: text }
  })
  on('fs.exists', ($, e) => ({ value: base(e.path) in files || base(e.path) in written }))
  on('fs.ancestors', () => ({ value: [] }))
  on('fs.stat', () => ({ value: { kind: 'file', size: 10, mtimeMs: NOW - 2 * 86_400_000, isLink: false } as never }))
  on('fs.write', ($, e) => {
    written[base(e.path)] = e.text
    return { value: undefined }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  // What the other mods draw in the shared band: nothing here.
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  return written
}

test('pasek pokazuje projekt i stan prac na terminalu i w aplikacji', async ($, on) => {
  folder(on, { 'STAN.md': STAN })
  await $.command.run({ command: 'stan', args: '' } as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'projekt', surface, component: 'AbovePrompt', props: BAND })
    expect(await ui.find({ type: 'Text', text: 'strona-elmi' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /w toku 1: pasek projektu/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /dalej 2/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /2 dni temu/ })).toBeDefined()
    await ui.unmount()
  }
})

test('/stan pokazuje tabelę spraw', async ($, on) => {
  folder(on, { 'STAN.md': STAN })
  const out = await $.command.run({ command: 'stan', args: '' } as never)
  expect(out.text).toContain('| Sprawa | Status |')
  expect(out.text).toContain('| pasek projektu. | W toku |')
  expect(out.text).toContain('| bezpiecznik | Dalej |')
})

test('bez STAN.md: podpowiedź, a /stan nowy zakłada plik', async ($, on) => {
  const written = folder(on, {})
  const out = await $.command.run({ command: 'stan', args: '' } as never)
  expect(out.text).toContain('/stan nowy')
  const ui = await $.ui.mount({ plugin: 'projekt', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /brak STAN.md/ })).toBeDefined()
  const made = await $.command.run({ command: 'stan', args: 'nowy' } as never)
  expect(made.text).toContain('Założyłem')
  expect(written['STAN.md']).toContain('**W toku:**')
})
