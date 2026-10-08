import { expect, test } from 'claude-code/testing'

import { age, parse, short } from './parse'

test('czyta pogrubione etykiety z tekstem w tej samej linii', async () => {
  const s = parse('# STAN\n\n**Zrobione (2026-10-08):** mod dzwiek.\n\n**W toku:** instalacja u Stefana.\n\n**Dalej:** kolejne mody.\n')
  expect(s.done).toEqual(['mod dzwiek.'])
  expect(s.doing).toEqual(['instalacja u Stefana.'])
  expect(s.next).toEqual(['kolejne mody.'])
})

test('czyta nagłówki z listami punktów', async () => {
  const s = parse('## Co zrobione\n- strona główna\n- logo\n\n## W toku\n- formularz kontaktowy\n\n## Co dalej\n1. SEO\n2. Polityka prywatności\n')
  expect(s.done.length).toBe(2)
  expect(s.doing).toEqual(['formularz kontaktowy'])
  expect(s.next).toEqual(['SEO', 'Polityka prywatności'])
})

test('czyta tabelę z kolumną Status', async () => {
  const s = parse('| Sprawa | Status | Następny krok | Kto |\n|---|---|---|---|\n| Raport roczny | w toku | korekta | Ania |\n| Strona | zrobione | — | Claude |\n| Grant | do zrobienia | wniosek | Stefan |\n')
  expect(s.doing).toEqual(['Raport roczny'])
  expect(s.done).toEqual(['Strona'])
  expect(s.next).toEqual(['Grant'])
})

test('pomija puste wpisy i skraca długie teksty', async () => {
  const s = parse('**W toku:** brak\n**Dalej:**\n- coś\n')
  expect(s.doing).toEqual([])
  expect(s.next).toEqual(['coś'])
  expect(short('abcdefghij', 5)).toBe('abcd…')
  expect(age(0)).toBe('dziś')
  expect(age(1)).toBe('wczoraj')
  expect(age(3)).toBe('3 dni temu')
})
