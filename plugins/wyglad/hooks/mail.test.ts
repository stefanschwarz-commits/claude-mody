import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { bolds } from './drzewo'
import { mailsOf } from './register'

const REPLY = [
  '▶ **Karta ELMI jest już podstawowa.**',
  '',
  'Poprawiona odpowiedź do Anny, wyślę po Twoim „wyślij”:',
  '',
  '```mail',
  'Do: Anna',
  'Temat: RE: Google Cloud – konto Google na Twój adres',
  '',
  'Cześć Aniu,',
  '',
  'masz rację, karta ELMI jest już podstawowa.',
  '',
  'Pozdrawiam',
  '```',
  '',
  '---',
  '',
  '🔵 **Do zrobienia przez Ciebie**',
  '',
  '1. Usuń starą kartę (minuta) – żeby Google nie obciążył karty spoza ELMI',
].join('\n')

function setup(on: On) {
  mock.store(on)
  on('prompt.fill', () => ({ isFilled: true }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.status', () => ({ value: undefined }) as never)
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
}

test('mailsOf wyjmuje szkic maila: nagłówki osobno, treść bez nagłówków', () => {
  const { rest, mails } = mailsOf(['Przed.', '', '```mail', 'Do: Anna', 'DW: Ligia', 'Temat: Test', '', 'Treść.', '```', '', 'Po.'].join('\n'))
  expect(rest).toBe('Przed.\n\nPo.')
  expect(mails).toEqual([{ headers: [['Do', 'Anna'], ['Dw', 'Ligia'], ['Temat', 'Test']], body: 'Treść.' }])
  expect(mailsOf('```\nkod\n```').mails).toEqual([])
  expect(mailsOf('```mail\nSama treść bez nagłówków.\n```').mails).toEqual([{ headers: [], body: 'Sama treść bez nagłówków.' }])
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`szkic maila to osobna karta z nagłówkami i przyciskiem kopiowania (${surface})`, async ($, on) => {
    setup(on)
    const ui = await $.ui.mount({ plugin: 'wyglad', surface, component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
    expect(await ui.find({ type: 'Text', text: 'Szkic maila' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'RE: Google Cloud – konto Google na Twój adres' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'Cześć Aniu,' })).toBeDefined()
    expect(await ui.find({ type: 'Button', text: 'Kopiuj treść' })).toBeDefined()
    expect(bolds(await ui.find({ type: 'Box' }))).toContain('Usuń starą kartę (minuta)')
  })
}

test('„Kopiuj treść” kopiuje samą treść, bez „Do:” i „Temat:”', async ($, on) => {
  setup(on)
  const copied: string[] = []
  on('ui.copy', ($, e) => {
    copied.push((e as { text: string }).text)
    return { value: { isCopied: true } } as never
  })
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
  const button = await ui.find({ type: 'Button', text: 'Kopiuj treść' })
  await ui.press({ key: button!.key! })
  expect(copied).toEqual(['Cześć Aniu,\n\nmasz rację, karta ELMI jest już podstawowa.\n\nPozdrawiam'])
})
