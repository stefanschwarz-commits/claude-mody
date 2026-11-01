import { expect, test } from 'claude-code/testing'

import { guardOf } from './register'

test('strzeżone są tylko wysyłki jako Stefan i trwałe usuwanie', () => {
  expect(guardOf('mcp__f0d7e42d-1e42-4607-b926-3c5fed636f7b__outlook_send_mail')).toContain('Wysyłka')
  expect(guardOf('mcp__f0d7e42d-1e42-4607-b926-3c5fed636f7b__teams_send_chat_message')).toContain('Wysyłka')
  expect(guardOf('mcp__ccd_session_mgmt__delete_session')).toContain('Trwałe usunięcie')
  expect(guardOf('mcp__f0d7e42d-1e42-4607-b926-3c5fed636f7b__sharepoint_delete_item')).toContain('Trwałe usunięcie')
  // Reversible or read-only: not guarded. Archiving a session was left out (Stefan's 1A).
  expect(guardOf('mcp__ccd_session_mgmt__archive_session')).toBeUndefined()
  expect(guardOf('mcp__f0d7e42d-1e42-4607-b926-3c5fed636f7b__outlook_create_draft')).toBeUndefined()
  expect(guardOf('mcp__f0d7e42d-1e42-4607-b926-3c5fed636f7b__outlook_trash_thread')).toBeUndefined()
  expect(guardOf('Bash')).toBeUndefined()
  expect(guardOf('mcp__wyglad__odhacz')).toBeUndefined()
})

test('strzeżone wywołanie staje się pytaniem do człowieka, nawet gdy tryb by je puścił', async ($, on) => {
  on('tool.check', () => ({ decision: 'allow', reason: 'tryb auto' }))
  const out = await $.tool.check({ tool: 'mcp__f0d7e42d-1e42-4607-b926-3c5fed636f7b__outlook_send_mail', input: { to: 'x' } })
  expect(out.decision).toBe('ask')
  expect(out.reason).toContain('tylko Stefan')
})

test('odmowa spod spodu zostaje odmową', async ($, on) => {
  on('tool.check', () => ({ decision: 'deny', reason: 'reguła' }))
  const out = await $.tool.check({ tool: 'mcp__ccd_session_mgmt__delete_session', input: {} })
  expect(out.decision).toBe('deny')
})

test('inne narzędzia przechodzą bez zmian', async ($, on) => {
  on('tool.check', () => ({ decision: 'allow', reason: 'tryb auto' }))
  const out = await $.tool.check({ tool: 'Read', input: { file_path: 'x' } })
  expect(out.decision).toBe('allow')
})
