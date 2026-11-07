import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const NOW = Date.UTC(2026, 10, 7, 12)
const STAN = '# STAN\n\n**Zrobione:** mod dzwiek.\n\n**W toku:** pasek projektu.\n\n**Dalej:**\n- powiadomienia\n- bezpiecznik\n'
// A file the way Stefan's sessions write it: "Czeka" with bold leads, no "W toku".
const CZEKA = '# opiekunki24.pl — stan\n\n## Zasady\n- nic na żywo bez zgody\n\n## Czeka\n- **Dostęp od Dawida — nie wiadomo, do czego** — Dawid przysłał samo „OP24”.\n- **Spis panelu portalu** — wstrzymane.\n\n## Historia\n- 2026-10-21: decyzja.\n'
const BAND = { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 160 } as never
const SESSION = 'a6bdaef9-0212-4eac-8d1d-7db53dbe2ca3'

function folder(on: On, files: Record<string, string>, env: Record<string, string> = {}) {
  const written: Record<string, string> = {}
  const kept: Record<string, unknown> = {}
  const base = (path: string) => path.split(/[\\/]/).pop() ?? path
  on('session.cwd', () => ({ value: 'C:\\Projekty\\strona-elmi' }))
  on('session.id', () => ({ value: SESSION }))
  on('clock.now', () => ({ value: NOW }))
  on('env.get', ($, e) => ({ value: env[e.name] }))
  on('fs.read', ($, e) => {
    const text = files[base(e.path)] ?? written[base(e.path)]
    return text === undefined ? { deny: 'ENOENT' } : { value: text }
  })
  on('fs.list', ($, e) => ({ value: /sessions$/.test(e.path) ? [{ name: '101.json', kind: 'file', size: 10, mtimeMs: NOW, isLink: false }] : [] }) as never)
  on('fs.exists', ($, e) => ({ value: base(e.path) in files || base(e.path) in written }))
  on('fs.ancestors', () => ({ value: [] }))
  on('fs.stat', ($, e) => (/\.jsonl$/.test(e.path) ? { deny: 'ENOENT' } : { value: { kind: 'file', size: 10, mtimeMs: NOW - 2 * 86_400_000, isLink: false } as never }))
  on('fs.write', ($, e) => {
    written[base(e.path)] = e.text
    return { value: undefined }
  })
  on('store.get', ($, e) => ({ value: kept[e.key] }))
  on('store.set', ($, e) => {
    kept[e.key] = e.value
    return { value: undefined }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('prompt.submit', ($, e) => ({ text: e.text }))
  // What the other mods draw in the shared band: nothing here.
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  return written
}

const RECORD = JSON.stringify({ sessionId: SESSION, name: '💻 🏡 ⚙️ Mody', startedAt: NOW - 3 * 86_400_000 })

test('pasek: konto, tytuł sesji, ostatnia aktywność i najpilniejsza sprawa', async ($, on) => {
  folder(on, { 'STAN.md': STAN, '101.json': RECORD }, { CLAUDE_CONFIG_DIR: 'C:/Users/Stefan/.claude-elmi' })
  await $.command.run({ command: 'stan', args: '' } as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'projekt', surface, component: 'AbovePrompt', props: BAND })
    expect(await ui.find({ type: 'Text', text: '▣ ELMI' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Mody/ })).toBeDefined()
    // Before any prompt of this run: the session's start, three days ago.
    expect(await ui.find({ type: 'Text', text: /ostatnio: 3 dni temu/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /w toku: pasek projektu/ })).toBeDefined()
    await ui.unmount()
  }
  // Stefan writes: the band counts from now, and the moment is kept for the next run.
  await $.prompt.submit({ text: 'cześć' } as never)
  const ui = await $.ui.mount({ plugin: 'projekt', surface: 'desktop', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /ostatnio: dziś/ })).toBeDefined()
})

test('bez zmiennej konta: Personal; sekcja „Czeka” daje sprawę z jej pogrubionego początku', async ($, on) => {
  folder(on, { 'STAN.md': CZEKA, '101.json': RECORD })
  await $.command.run({ command: 'stan', args: '' } as never)
  const ui = await $.ui.mount({ plugin: 'projekt', surface: 'desktop', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: '▣ Personal' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /czeka: Dostęp od Dawida — nie wiadomo, do czego/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /w toku 0|dalej 0/ })).toBeUndefined()
})

test('/stan pokazuje tabelę spraw', async ($, on) => {
  folder(on, { 'STAN.md': STAN })
  const out = await $.command.run({ command: 'stan', args: '' } as never)
  expect(out.text).toContain('| Sprawa | Status |')
  expect(out.text).toContain('| pasek projektu. | W toku |')
  expect(out.text).toContain('| bezpiecznik | Dalej |')
})

test('bez STAN.md: pasek mówi, że pliku nie ma, /stan podpowiada, a /stan nowy zakłada plik', async ($, on) => {
  const written = folder(on, {})
  const out = await $.command.run({ command: 'stan', args: '' } as never)
  expect(out.text).toContain('/stan nowy')
  const ui = await $.ui.mount({ plugin: 'projekt', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /bez STAN.md/ })).toBeDefined()
  const made = await $.command.run({ command: 'stan', args: 'nowy' } as never)
  expect(made.text).toContain('Założyłem')
  expect(written['STAN.md']).toContain('**Czeka:**')
})
