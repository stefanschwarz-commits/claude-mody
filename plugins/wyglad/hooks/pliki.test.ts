import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { fileOf } from './register'

const REPLY = [
  '▶ **Plan prac KNX.**',
  '',
  '---',
  '',
  '🔵 **Do zrobienia przez Ciebie**',
  '',
  '1. **Zadanie 1:** Przeczytaj plan (10 minut) – po co',
  '',
  'Pliki:',
  '- [plan-knx.pdf](plan-knx.pdf)',
  '- [Kosztorys](C:\\Projekty\\knx\\kosztorys.xlsx)',
].join('\n')

function setup(on: On) {
  mock.store(on)
  on('prompt.fill', () => ({ isFilled: true }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.status', () => ({ value: undefined }) as never)
  on('turn.complete', () => ({ text: '' }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
}

test('fileOf poznaje link do pliku na komputerze, nie do strony', () => {
  expect(fileOf('[plan.pdf](plan.pdf)')).toEqual({ label: 'plan.pdf', path: 'plan.pdf' })
  expect(fileOf('[Kosztorys](C:\\Projekty\\knx\\kosztorys.xlsx)')).toEqual({ label: 'Kosztorys', path: 'C:\\Projekty\\knx\\kosztorys.xlsx' })
  expect(fileOf('[GitHub](https://github.com/x)')).toBeUndefined()
  expect(fileOf('Przeczytaj [plan](plan.pdf) i odpisz')).toBeUndefined()
})

test('linki do plików nie są zadaniami: licznik, panel i ramka', async ($, on) => {
  setup(on)
  await $.turn.complete({ reason: 'answer', answer: REPLY, durationMs: 1, isAborted: false, turnId: 'k' } as never)
  const band = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await band.find({ type: 'Text', text: 'Potrzebuję od Ciebie: 1 zadanie' })).toBeDefined()
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
  expect(await ui.find({ type: 'Text', text: '2.' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'plan-knx.pdf' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Kosztorys' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Pokaż w folderze' })).toBeDefined()
  type Node = { type: string; props?: { text?: string }; children?: (Node | string)[] }
  const md: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Markdown' && n.props?.text) md.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk((await ui.find({ type: 'Box' })) as unknown as Node)
  expect(md.some(t => /Pliki:/.test(t) || /\]\(/.test(t))).toBe(false)
  const phone = await $.ui.mount({ plugin: 'wyglad', surface: 'mobile', component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
  expect(await phone.find({ type: 'Text', text: 'plik na komputerze, poproś o załącznik' })).toBeDefined()
  expect(await phone.find({ type: 'Button', text: 'Pokaż w folderze' })).toBeUndefined()
})

test('przycisk „Pokaż w folderze” woła narzędzie aplikacji ze ścieżką pliku', async ($, on) => {
  setup(on)
  const calls: unknown[] = []
  on('tool.call', ($, e) => {
    calls.push(e)
    return { result: 'ok' } as never
  })
  const ui = await $.ui.mount({ plugin: 'wyglad', surface: 'desktop', component: 'AssistantMessage', props: { text: REPLY, isFirstOfReply: true } as never })
  const button = await ui.find({ type: 'Button', text: 'Pokaż w folderze' })
  await ui.press({ key: button!.key! })
  expect(calls.length).toBe(1)
  expect(calls[0]).toMatchObject({ tool: 'mcp__ccd_host__reveal_path', path: 'plan-knx.pdf' })
})
