import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

declare const setTimeout: (fn: (value?: unknown) => void, ms: number) => unknown

const settle = () => new Promise(resolve => setTimeout(resolve, 50))

const turn = (extra: Record<string, unknown> = {}) => ({
  answer: 'Gotowe.', durationMs: 1200, isAborted: false, turnId: 't1', reason: 'answer', ...extra,
}) as never

function recorder(on: On) {
  const played: string[][] = []
  on('process.run', ($, e) => {
    played.push([...e.argv])
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  return played
}

test('Windows: koniec tury gra „gotowe” przez PowerShell', async ($, on) => {
  mock.env(on, { OS: 'Windows_NT' })
  mock.store(on)
  const played = recorder(on)
  await $.turn.complete(turn())
  await settle()
  expect(played.length).toBe(1)
  expect(played[0][0]).toBe('powershell.exe')
  expect(played[0].join(' ')).toContain('done.wav')
})

test('Mac: koniec tury gra „gotowe” przez afplay', async ($, on) => {
  mock.env(on, {})
  mock.store(on)
  const played = recorder(on)
  await $.turn.complete(turn())
  await settle()
  expect(played[0][0]).toBe('afplay')
  expect(played[0][1]).toContain('done.wav')
})

test('przerwana tura i podagent nie grają', async ($, on) => {
  mock.env(on, {})
  mock.store(on)
  const played = recorder(on)
  await $.turn.complete(turn({ isAborted: true, reason: 'aborted' }))
  await $.turn.complete(turn({ agentId: 'sub1' }))
  await settle()
  expect(played.length).toBe(0)
})

test('prośba o zgodę gra „czekam”, raz mimo dwóch zdarzeń', async ($, on) => {
  mock.env(on, {})
  mock.store(on)
  const played = recorder(on)
  on('classic.PermissionRequest', () => ({}))
  await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'ls' } } as never)
  await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'ls' } } as never)
  await settle()
  expect(played.length).toBe(1)
  expect(played[0][1]).toContain('ask.wav')
})

test('/dzwiek off wycisza, /dzwiek on włącza', async ($, on) => {
  mock.env(on, {})
  mock.store(on)
  const played = recorder(on)
  const off = await $.command.run({ command: 'dzwiek', args: 'off' } as never)
  expect(off.text).toContain('wyłączone')
  await $.turn.complete(turn())
  await settle()
  expect(played.length).toBe(0)
  await $.command.run({ command: 'dzwiek', args: 'on' } as never)
  await $.turn.complete(turn())
  await settle()
  expect(played.length).toBe(1)
})
