export type Last = { headline: string; key: string; todos: number; questions: number; isStructured?: boolean }

// When an answer was finished and which one of the conversation it is, for its bar.
export type Stamp = { n: number; at: number; qBase: number; questions: number }

// One open matter for the "Moje sprawy" pane: a task to tick or a question to answer.
export type Sprawa = { id: string; kind: 'todo' | 'question'; text: string; letters: string[]; options?: { id: string; isBest: boolean; text: string }[] }

declare module 'claude-code' {
  interface PluginState {
    wyglad: { last: Last | null; openFrames: string[]; doneTasks: string[]; staleTasks: string[]; stamps: Record<string, Stamp>; answered: Record<string, string>; openTexts: string[]; sprawy: Sprawa[]; finalText: string | null }
  }
}
