import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { linkPaths } from './split'

test('gołe ścieżki obok pełnego adresu w tej samej linii stają się linkami', () => {
  const line = 'Strony do obejrzenia: https://akademiaopiekunow.pl/dyzury-ekspertow/ · /jak-pracuja-eksperci/ · /kontakt/'
  expect(linkPaths(line)).toBe('Strony do obejrzenia: https://akademiaopiekunow.pl/dyzury-ekspertow/ · [/jak-pracuja-eksperci/](https://akademiaopiekunow.pl/jak-pracuja-eksperci/) · [/kontakt/](https://akademiaopiekunow.pl/kontakt/)')
  expect(linkPaths('Ścieżka /tmp/plik bez adresu w linii')).toBe('Ścieżka /tmp/plik bez adresu w linii')
  expect(linkPaths('```\nhttps://x.pl/ · /a/\n```')).toBe('```\nhttps://x.pl/ · /a/\n```')
  expect(linkPaths('[Strona](https://x.pl/a/) i /b/')).toBe('[Strona](https://x.pl/a/) i [/b/](https://x.pl/b/)')
})

// A link in the head of a task, in the head of a summary point and in a question
// title is drawn through Markdown, bold, so it stays a clickable link.
const REPLY = [
  '▶ **Dokument gotowy: [Strona główna](https://claude.ai/artifact/xyz)**',
  '',
  '---',
  '',
  '🔵 **Do zrobienia przez Ciebie**',
  '',
  '1. Otwórz [dokument](https://claude.ai/artifact/abc) i kliknij Share (2 minuty) – tam dodasz prawnika',
  '',
  '---',
  '',
  '🔵 **Pytania do Ciebie**',
  '',
  '**1. Zostawić [stary wpis](https://example.org/wpis)?**',
  '- **A)** Tak – plus: nic; minus: nic.',
  '- **B)** Nie – plus: nic; minus: nic.',
  '➜ Polecam 1A.',
  '',
  '---',
  '',
  '🟢 **Zrobione**',
  '- **Opublikowałem [politykę](https://example.org/polityka).** Sprawdziłem na stronie.',
].join('\n')

function setup(on: On) {
  mock.store(on)
  on('prompt.fill', () => ({ isFilled: true }))
}

test('linki w pogrubionych początkach są rysowane przez Markdown, nie jako goły tekst', async ($, on) => {
  setup(on)
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
  type Node = { type: string; props?: { text?: string }; children?: (Node | string)[] }
  const md: string[] = []
  const texts: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Markdown' && n.props?.text) md.push(n.props.text)
    if (n.type === 'Text') texts.push((n.children ?? []).filter(c => typeof c === 'string').join(''))
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(md).toContain('**Dokument gotowy: [Strona główna](https://claude.ai/artifact/xyz)**')
  expect(md).toContain('**Otwórz [dokument](https://claude.ai/artifact/abc) i kliknij Share (2 minuty)**')
  expect(md).toContain('**Pytanie 1: Zostawić [stary wpis](https://example.org/wpis)?**')
  expect(md).toContain('**Opublikowałem [politykę](https://example.org/polityka).**')
  expect(texts.some(t => t.includes('](http'))).toBe(false)
})
