import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

import { accountOf, ACCOUNT_COLOR, lookOf, unpainted } from './motyw'

const ELMI_ORG = '6de9bd9f-5915-4468-81fa-8e28071e05b9'

test('konto: najpierw organizacja z aplikacji, potem folder ustawień', () => {
  expect(accountOf(ELMI_ORG, undefined)).toBe('ELMI')
  expect(accountOf('1F6C04B3-9EB2-479B-AA75-D2B914E7E274', 'C:/Users/x/.claude')).toBe('ATERIMA')
  expect(accountOf(undefined, 'C:\\Users\\x\\.claude-elmi')).toBe('ELMI')
  expect(accountOf('', 'C:/Users/x/.claude-aterima/')).toBe('ATERIMA')
  expect(accountOf(undefined, undefined)).toBe('Personal')
  expect(accountOf('obca-organizacja', 'C:/Users/x/.claude')).toBe('Personal')
})

test('każde konto: Desktop maluje motyw w trybie jasnym i ciemnym', () => {
  for (const account of ['Personal', 'ELMI', 'ATERIMA'] as const) {
    const { theme, problems } = lookOf(account)
    expect(unpainted(problems)).toBe(undefined)
    // Text must never be a contrast problem (the 0.44.0 lesson): only borders, fills and git colours may be.
    expect(problems.filter(line => /^text-(primary|secondary|muted) on surface/.test(line))).toEqual([])
    expect(JSON.stringify(theme).length > 1000).toBe(true)
  }
})

function answers(on: On, org: string | undefined, sets: unknown[], clears: number[]): void {
  mock.store(on)
  on('env.get', ($, e) => ({ value: e.name === 'CLAUDE_CODE_ORGANIZATION_UUID' ? org : undefined }) as never)
  on('theme.set', ($, e) => {
    sets.push(e)
    return { value: { isDrawn: true, requestId: 't1' } } as never
  })
  on('theme.clear', () => {
    clears.push(1)
    return { value: undefined } as never
  })
}

test('/wyglad motyw on ustawia motyw konta ELMI, off go czyści i zapamiętuje', async ($, on) => {
  const sets: unknown[] = []
  const clears: number[] = []
  answers(on, ELMI_ORG, sets, clears)
  const out = await $.command.run({ command: 'wyglad', args: 'motyw on' } as never)
  expect(JSON.stringify(out)).toContain('ELMI')
  expect(sets.length).toBe(1)
  expect(JSON.stringify(sets[0])).toEqual(JSON.stringify({ colors: lookOf('ELMI').theme }))
  const off = await $.command.run({ command: 'wyglad', args: 'motyw off' } as never)
  expect(JSON.stringify(off)).toContain('motyw on')
  expect(clears.length).toBe(1)
  // The frames stay on: "motyw off" is not "/wyglad off".
  const stan = await $.command.run({ command: 'wyglad', args: 'stan' } as never)
  expect(JSON.stringify(stan)).toContain('Wygląd odpowiedzi włączony')
  expect(JSON.stringify(stan)).toContain('Kolory aplikacji wyłączone')
})

test('kolor akcentu to kolor konta z paska moda projekt', () => {
  expect(ACCOUNT_COLOR).toEqual({ Personal: '#2E7D32', ELMI: '#FFB33B', ATERIMA: '#1A237E' })
})

test('ATERIMA z modem kolory-firmy z biblioteki firmy: wyglad nie ustawia własnych kolorów', async ($, on) => {
  const ATERIMA = '1f6c04b3-9eb2-479b-aa75-d2b914e7e274'
  const sets: unknown[] = []
  mock.store(on)
  on('env.get', ($, e) => ({ value: e.name === 'CLAUDE_CODE_ORGANIZATION_UUID' ? ATERIMA : e.name === 'USERPROFILE' ? 'C:/Users/x' : undefined }) as never)
  on('fs.list', ($, e) => {
    const path = String((e as { path?: string }).path ?? '')
    if (path.split('\\').join('/').endsWith('/plugins/synced')) return { value: [{ name: `${ATERIMA}_abc`, kind: 'dir', size: 0, mtimeMs: 0 }] } as never
    return { value: [{ name: 'p1', kind: 'dir', size: 0, mtimeMs: 0 }] } as never
  })
  on('fs.read', () => ({ value: '{ "name": "kolory-firmy", "version": "0.2.0" }' }) as never)
  on('theme.set', ($, e) => {
    sets.push(e)
    return { value: { isDrawn: true, requestId: 't1' } } as never
  })
  const out = await $.command.run({ command: 'wyglad', args: 'motyw on' } as never)
  expect(JSON.stringify(out)).toContain('kolory-firmy')
  expect(sets.length).toBe(0)
})
