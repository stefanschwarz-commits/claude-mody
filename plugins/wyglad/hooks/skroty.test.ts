import { expect, test } from 'claude-code/testing'

import { foldOf, hasTable, isPermission, tilesOf } from './skroty'
import { runsOf } from './zakreslacz'

test('punkt z pogrubionym zdaniem chowa resztę', () => {
  const fold = foldOf(runsOf('**Slajd 44 ma teraz prosty układ.** Logo i trzy pozycje pod spodem.'))
  expect(fold?.lead.map(r => r.text).join('')).toBe('Slajd 44 ma teraz prosty układ.')
  expect(fold?.rest.map(r => r.text).join('').trim()).toBe('Logo i trzy pozycje pod spodem.')
})

test('punkt bez reszty albo z wyróżnionym słowem się nie chowa', () => {
  expect(foldOf(runsOf('**Slajd 44 ma teraz prosty układ.**'))).toBeUndefined()
  expect(foldOf(runsOf('**Slajd** ma układ i resztę zdania.'))).toBeUndefined()
})

test('tabela rozpoznana', () => {
  expect(hasTable('Tekst\n\n| Nr | Co |\n| --- | --- |\n| 1 | A |')).toBe(true)
  expect(hasTable('Zwykły tekst | z kreską')).toBe(false)
})

test('kafle liczą punkty, zadania i pytania', () => {
  const tiles = tilesOf(
    [
      { kind: 'done', title: 'Zrobione', body: '- **A.** a\n- **B.** b' },
      { kind: 'todo', title: 'Zadania', body: '1. Zrób X – bo tak\n   a) krok' },
      { kind: 'failed', title: 'Nie udało się', body: '- **C.** c' },
    ],
    2,
  )
  expect(tiles).toEqual({ done: 2, failed: 1, todo: 1, questions: 2 })
})

test('brak uprawnień rozpoznany', () => {
  expect(isPermission('Zapis odrzucony: Operation not permitted')).toBe(true)
  expect(isPermission('Brak uprawnień do folderu')).toBe(true)
  expect(isPermission('Strona nie odpowiada')).toBe(false)
})
