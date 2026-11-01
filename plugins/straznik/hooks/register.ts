import type { Register } from 'claude-code'

// Stefan's decision (2026-11-01, option 1A): only the irreversible is guarded,
// and only what goes out as Stefan himself. A guarded call becomes an ask that
// a hook made, which the engine puts to a person alone: no permission mode,
// no auto-mode classifier and no saved rule settles it, and where nobody can
// be asked (a headless run, a scheduled task) it is refused.
//
// Mail and messages sent as Czesiek (czesiek@aterima.pl, through Power
// Automate and the Graph token of that mailbox) or as Claude Kowalski
// (claude@labourinstitute.eu, through the site's own script) do not pass
// through these connector tools, so they are not guarded here.

// Sending as Stefan: the Microsoft 365 connector signed in as him.
const SENDS: readonly RegExp[] = [
  /^mcp__[^_]+(?:_[^_]+)*__outlook_send_mail$/,
  /^mcp__[^_]+(?:_[^_]+)*__outlook_send_draft$/,
  /^mcp__[^_]+(?:_[^_]+)*__outlook_forward_mail$/,
  /^mcp__[^_]+(?:_[^_]+)*__teams_send_chat_message$/,
  /^mcp__[^_]+(?:_[^_]+)*__teams_send_channel_message$/,
  /^mcp__[^_]+(?:_[^_]+)*__teams_reply_channel_message$/,
  /^mcp__[^_]+(?:_[^_]+)*__teams_create_chat$/,
]

// Permanent deletion: a session, a SharePoint item, mail deleted for good.
const DELETES: readonly RegExp[] = [
  /^mcp__ccd_session_mgmt__delete_session$/,
  /^mcp__[^_]+(?:_[^_]+)*__sharepoint_delete_item$/,
  /^mcp__[^_]+(?:_[^_]+)*__outlook_batch_delete_messages$/,
]

export function guardOf(tool: string): string | undefined {
  if (SENDS.some(p => p.test(tool))) return 'Wysyłka wiadomości jako Stefan: zatwierdzić może tylko Stefan w tym okienku (mod straznik).'
  if (DELETES.some(p => p.test(tool))) return 'Trwałe usunięcie, którego nie da się cofnąć: zatwierdzić może tylko Stefan w tym okienku (mod straznik).'
  return undefined
}

export const register: Register = on => {
  on('tool.check', async ($, e, next) => {
    const reason = guardOf(e.tool)
    if (!reason) return next(e)
    const below = await next(e)
    // A deny beneath (a rule, a hook) stands; anything else becomes a person's ask.
    if (below.decision === 'deny') return below
    return { decision: 'ask', reason }
  }).catch(() => ({ decision: 'deny', reason: 'straznik: nie udało się sprawdzić wywołania, więc odmawiam' }))
}
