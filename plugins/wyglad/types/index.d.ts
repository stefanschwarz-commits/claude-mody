export type Last = { headline: string; key: string; todos: number; questions: number }

declare module 'claude-code' {
  interface PluginState {
    wyglad: { last: Last | null; isFull: boolean }
  }
}
