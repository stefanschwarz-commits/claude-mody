import type { Register } from 'claude-code'

// Sessions on this computer: a working folder on a Windows drive (C:\…).
// Cloud sessions run on Linux, so their folder starts with "/".
const PREFIX = '💻 '
const WINDOWS = /^[A-Za-z]:[\\/]/

export function isLocal(cwd: string | undefined): boolean {
  return cwd !== undefined && WINDOWS.test(cwd)
}

// The title with the prefix added once; undefined when nothing has to change
// (no title yet, already prefixed, or not a local session).
export function prefixed(title: string | undefined, cwd: string | undefined): string | undefined {
  if (!title || !isLocal(cwd)) return undefined
  const clean = title.trim()
  if (clean === '' || clean.startsWith(PREFIX.trim())) return undefined
  return `${PREFIX}${clean}`
}

// The title hooks moved to a settings hook, ~/.claude/hooks/znaczek-komputer.js (2026-10-20):
// since Claude 2.1.304 a Team plan's built-in security plugin skips this mod's classic hooks,
// and each skip printed a grey line in every session. prefixed() stays as the rule it follows.
export const register: Register = () => {}
