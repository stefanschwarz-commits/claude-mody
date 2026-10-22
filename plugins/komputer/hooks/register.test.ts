import { expect, test } from 'claude-code/testing'

import { prefixed } from './register'

test('dopisuje 💻 raz, nie rusza reszty tytułu, pomija chmurę i brak tytułu', () => {
  expect(prefixed('Mody', 'C:\\Projekty\\claude-mody')).toBe('💻 Mody')
  expect(prefixed('💻 Mody', 'C:\\Projekty\\claude-mody')).toBeUndefined()
  expect(prefixed('Mody', '/home/user/work')).toBeUndefined()
  expect(prefixed(undefined, 'C:\\Projekty')).toBeUndefined()
  expect(prefixed('   ', 'C:\\Projekty')).toBeUndefined()
  expect(prefixed('Dyspozytor poczty: przebieg', 'D:/praca')).toBe('💻 Dyspozytor poczty: przebieg')
})
