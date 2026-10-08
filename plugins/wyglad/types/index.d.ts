export type Last = { headline: string; key: string; todos: number; questions: number }

// One open matter for the "Moje sprawy" pane: a task to tick or a question to answer.
export type Sprawa = { id: string; kind: 'todo' | 'question'; text: string; letters: string[] }

declare module 'claude-code' {
  interface PluginState {
    wyglad: { last: Last | null; isFull: boolean; doneTasks: string[]; openTexts: string[]; sprawy: Sprawa[] }
  }
}
