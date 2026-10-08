export type Section = 'done' | 'doing' | 'next'

export type Status = {
  project: string
  hasFile: boolean
  doing: string[]
  next: string[]
  done: string[]
  ageDays: number | null
}

declare module 'claude-code' {
  interface PluginState {
    projekt: { status: Status | null }
  }
}
