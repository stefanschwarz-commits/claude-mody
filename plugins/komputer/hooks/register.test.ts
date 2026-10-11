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

test('zdarzenie wysłania polecenia odpowiada nowym tytułem tylko gdy trzeba', async ($, on) => {
  on('classic.UserPromptSubmit', () => ({}))
  const base = { session_id: 's', transcript_path: 't', cwd: 'C:\\Projekty\\claude-mody', hook_event_name: 'UserPromptSubmit' as const, prompt: 'cześć' }
  const changed = await $.classic.UserPromptSubmit({ ...base, session_title: 'Mody' } as never)
  expect((changed as { sessionTitle?: string }).sessionTitle).toBe('💻 Mody')
  const kept = await $.classic.UserPromptSubmit({ ...base, session_title: '💻 Mody' } as never)
  expect((kept as { sessionTitle?: string }).sessionTitle).toBeUndefined()
  const cloud = await $.classic.UserPromptSubmit({ ...base, cwd: '/work', session_title: 'Mody' } as never)
  expect((cloud as { sessionTitle?: string }).sessionTitle).toBeUndefined()
})

test('start sesji z tytułem też dostaje znaczek', async ($, on) => {
  on('classic.SessionStart', () => ({}))
  const out = await $.classic.SessionStart({ session_id: 's', transcript_path: 't', cwd: 'C:\\Projekty', hook_event_name: 'SessionStart', source: 'startup', session_title: 'Mody' } as never)
  expect((out as { sessionTitle?: string }).sessionTitle).toBe('💻 Mody')
})
