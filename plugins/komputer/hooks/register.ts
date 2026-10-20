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

export const register: Register = on => {
  // At session start the app may not have titled the session yet; a new session
  // gets its title after the first message, so the prompt hook below catches it then.
  on('classic.SessionStart', async ($, e, next) => {
    const out = await next(e)
    // A settings hook beneath (znaczek-komputer.js) may already have set the title, with its ◦ mark: keep it.
    const title = out.sessionTitle ? undefined : prefixed(e.session_title, e.cwd)
    return title ? { ...out, sessionTitle: title } : out
  })

  on('classic.UserPromptSubmit', async ($, e, next) => {
    const out = await next(e)
    // A settings hook beneath (znaczek-komputer.js) may already have set the title, with its ◦ mark: keep it.
    const title = out.sessionTitle ? undefined : prefixed(e.session_title, e.cwd)
    return title ? { ...out, sessionTitle: title } : out
  })
}
