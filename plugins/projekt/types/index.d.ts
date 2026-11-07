export type Section = 'done' | 'doing' | 'waiting' | 'next'

// The most urgent matter of STAN.md: the first item of the first "W toku" or "Czeka"
// section in the file, with which of the two it stands in.
export type Urgent = { text: string; kind: 'doing' | 'waiting' }

export type Status = {
  project: string
  hasFile: boolean
  doing: string[]
  waiting: string[]
  next: string[]
  done: string[]
  urgent: Urgent | null
  // Which Claude account the session runs on (Personal, ELMI, ATERIMA), from the config folder.
  account: string
  // The session's title as the app shows it, from the engine's session record; '' until known.
  session: string
  // When Stefan last wrote in this session, in clock milliseconds; null when unknown.
  lastAt: number | null
  ageDays: number | null
}

declare module 'claude-code' {
  interface PluginState {
    projekt: { status: Status | null }
  }
}
