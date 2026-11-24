import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { firmaOf, lookOf, markaOf, unpainted } from './firma'

const ATERIMA = '1f6c04b3-9eb2-479b-aa75-d2b914e7e274'
const ELMI = '6de9bd9f-5915-4468-81fa-8e28071e05b9'

function stand(on: On, org: string | undefined): void {
  mock.store(on)
  on('env.get', ($, e) => ({ value: e.name === 'CLAUDE_CODE_ORGANIZATION_UUID' ? org : undefined }) as never)
  on('ui.invalidate', () => ({ value: undefined }) as never)
  on('ui.render', () => ({ type: 'Text', props: {}, children: ['zwykły pasek'] }) as never)
}

test('firma z organizacji; inna organizacja nic nie dostaje', () => {
  expect(firmaOf(ATERIMA)).toBe('ATERIMA')
  expect(firmaOf(ELMI.toUpperCase())).toBe('ELMI')
  expect(firmaOf('8a5350ca-2541-4066-8c79-d4cc738ae76c')).toBe(null)
  expect(firmaOf(undefined)).toBe(null)
  expect(markaOf(' med ')).toBe('MED')
  expect(markaOf('care')).toBe('CARE')
  expect(markaOf('hr')).toBe(null)
})

test('Desktop maluje kolory obu firm, tekst bez problemów kontrastu', () => {
  for (const [firma, marka] of [['ELMI', null], ['ATERIMA', null], ['ATERIMA', 'GRUPA'], ['ATERIMA', 'MED'], ['ATERIMA', 'WORK'], ['ATERIMA', 'CARE']] as const) {
    const { problems } = lookOf(firma, marka)
    expect(unpainted(problems)).toBe(undefined)
    expect(problems.filter(line => /^text-(primary|secondary|muted) on surface/.test(line))).toEqual([])
  }
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`ATERIMA (${surface}): najpierw wybór marki, potem stały napis`, async ($, on) => {
    stand(on, ATERIMA)
    const ui = await $.ui.mount({ plugin: 'kolory-firmy', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
    expect(await ui.find({ type: 'Text', text: /W której marce/ })).toBeDefined()
    await ui.press({ key: 'marka-MED' })
    const after = await $.ui.mount({ plugin: 'kolory-firmy', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
    expect(await after.find({ type: 'Text', text: /ATERIMA MED/ })).toBeDefined()
  })
}

test('ELMI i inne konta: bez napisu marki', async ($, on) => {
  stand(on, ELMI)
  const ui = await $.ui.mount({ plugin: 'kolory-firmy', surface: 'desktop', component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
  expect(await ui.find({ type: 'Text', text: /W której marce/ })).toBeUndefined()
})

test('/marka work i /marka care zmieniają napis, nieznana marka dostaje podpowiedź', async ($, on) => {
  stand(on, ATERIMA)
  const out = await $.command.run({ command: 'marka', args: 'work' } as never)
  expect(out.text).toContain('ATERIMA WORK')
  const care = await $.command.run({ command: 'marka', args: 'care' } as never)
  expect(care.text).toContain('ATERIMA CARE')
  const bad = await $.command.run({ command: 'marka', args: 'hr' } as never)
  expect(bad.text).toContain('/marka med')
})
