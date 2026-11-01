import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { blocksOf, marksOf } from './zakreslacz'

// A bold run in a prose paragraph of the explanation is drawn as a marker (a span
// with its own background), and "Tylko wyróżnione" shows those runs alone.

const REPLY = [
  '▶ **Zakreślacz działa.**',
  '',
  'Pierwszy akapit mówi, że **ramki rysują się po restarcie**, a reszta to szczegóły.',
  '',
  'Drugi akapit ma link do [dokumentu](https://example.org/doc) i **pogrubienie**, więc zostaje Markdown.',
  '',
  '- punkt listy z **pogrubieniem**',
  '',
  'Trzeci akapit bez wyróżnienia.',
  '',
  '---',
  '',
  '🟢 **Zrobione**',
  '- **Gotowe.** Tak.',
].join('\n')

type Node = { type: string; props?: Record<string, unknown>; children?: (Node | string)[] }

function setup(on: On) {
  mock.store(on)
  on('prompt.fill', () => ({ isFilled: true }))
  on('config.list', () => ({ value: [{ key: 'theme', value: 'dark' }] }) as never)
}

function spans(root: Node): { text: string; bg?: unknown }[] {
  const out: { text: string; bg?: unknown }[] = []
  const walk = (n: Node) => {
    if (n.type === 'Text') out.push({ text: (n.children ?? []).filter(c => typeof c === 'string').join(''), bg: n.props?.backgroundColor })
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk(root)
  return out
}

test('blocksOf: proza z pogrubieniem to akapit z zakreśleniem; link, lista i tabela zostają Markdown', () => {
  const blocks = blocksOf(['Zdanie z **ważną** częścią.', '', 'Link [x](https://x.pl) i **bold**.', '', '- lista **a**', '', '| a | b |', '|---|---|', '', 'Bez pogrubienia.'].join('\n'))
  expect(blocks.map(b => b.kind)).toEqual(['para', 'md', 'para'])
  // A short bold is a word (the marker); the short view still reads the whole sentence.
  expect(blocks[0].kind === 'para' ? blocks[0].runs : []).toEqual([
    { text: 'Zdanie z ', isMark: false },
    { text: 'ważną', isMark: true, kind: 'word' },
    { text: ' częścią.', isMark: false },
  ])
  // A paragraph without a bold gives the short view its first sentence.
  expect(marksOf(blocks)).toEqual(['Zdanie z ważną częścią.', 'Bez pogrubienia.'])
  // A long bold is a sentence: bold and underlined, as written.
  const two = blocksOf('Pierwsze zdanie jest zwykłe. **Drugie ma więcej niż trzy słowa i jest ważne.** Trzecie jest zwykłe.')
  expect(two[0].kind === 'para' ? two[0].runs : []).toEqual([
    { text: 'Pierwsze zdanie jest zwykłe. ', isMark: false },
    { text: 'Drugie ma więcej niż trzy słowa i jest ważne.', isMark: true, kind: 'sentence' },
    { text: ' Trzecie jest zwykłe.', isMark: false },
  ])
  expect(marksOf(two)).toEqual(['Drugie ma więcej niż trzy słowa i jest ważne.'])
})

test('zakreślenie w wyjaśnieniu ma własne tło, a „Tylko wyróżnione” zostawia same zakreślenia', async ($, on) => {
  setup(on)
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
  const all = spans((await ui.find({ type: 'Box' })) as unknown as Node)
  // "ramki rysują się po restarcie" is four words: a sentence, bold and underlined, no marker.
  const mark = all.find(s => s.text === 'ramki rysują się po restarcie')
  expect(mark).toBeDefined()
  expect(mark?.bg).toBeUndefined()
  expect(await ui.find({ type: 'Markdown', props: { text: /dokumentu/ } })).toBeDefined()
  const only = await ui.find({ type: 'Button', text: 'Tylko wyróżnione' })
  expect(only).toBeDefined()
  await ui.press({ key: (only as { key?: string } | undefined)?.key ?? '' })
  const after = spans((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(after.some(s => s.text === 'Pierwszy akapit mówi, że ramki rysują się po restarcie, a reszta to szczegóły.')).toBe(true)
  expect(after.some(s => s.text === 'Trzeci akapit bez wyróżnienia.')).toBe(true)
  expect(await ui.find({ type: 'Button', text: 'Pokaż całość' })).toBeDefined()
})

test('zakreślenie działa też w zadaniu, w pytaniu i w punkcie podsumowania', async ($, on) => {
  setup(on)
  const reply = [
    '▶ **Wszędzie.**',
    '',
    '---',
    '',
    '🔵 **Zadania dla Ciebie**',
    '',
    '1. Zrestartuj aplikację – bez tego **stary wygląd zostaje**, bo mody wczytują się przy starcie.',
    '',
    '---',
    '',
    '🟤 **Pytania do Ciebie**',
    '',
    '**1. Który wariant?**',
    'Dlaczego to ważne: **od tego zależy telefon**, nie komputer.',
    '- **A)** Pierwszy – plus: **krótko**; minus: nic.',
    '- **B)** Drugi – plus: nic; minus: nic.',
    '➜ Polecam 1A.',
    '',
    '---',
    '',
    '🟢 **Zrobione**',
    '- **Wydane.** Dla Ciebie **nic do zrobienia** poza restartem.',
  ].join('\n')
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: reply, isFirstOfReply: true } as never })
  const all = spans((await ui.find({ type: 'Box' })) as unknown as Node)
  // Up to three bold words: the marker; "stary wygląd zostaje", "od tego zależy telefon" (four) is a sentence.
  const missing = ['stary wygląd zostaje', 'krótko', 'nic do zrobienia'].filter(text => all.find(s => s.text === text)?.bg !== '#3a3720')
  expect(all.find(s => s.text === 'od tego zależy telefon')?.bg).toBeUndefined()
  expect(missing).toEqual([])
})

