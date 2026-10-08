import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Last, Sprawa } from '../types'
import { firstLine, isProgress, lettersOf, optionsOf, splitQuestions, splitReply, tipOf } from './split'
import type { Part, Reply } from './split'

const OFF = 'off'

const last = atom({ plugin: 'wyglad', key: 'last' } as const, null)
const isFull = atom({ plugin: 'wyglad', key: 'isFull' } as const, false)
// Tasks ticked off ("<answer key>:<n>") and long explanations opened (answer keys).
const doneTasks = atom({ plugin: 'wyglad', key: 'doneTasks' } as const, [] as string[])
const openTexts = atom({ plugin: 'wyglad', key: 'openTexts' } as const, [] as string[])
// Every task asked of Stefan in this session, and the questions of the latest answer.
const sprawy = atom({ plugin: 'wyglad', key: 'sprawy' } as const, [] as Sprawa[])
const PANE = 'sprawy'

// A long explanation shows this many lines until opened.
const SHORT = 8

// What a work step was, in plain words, for its one faint line.
const STEPS: Record<string, string> = {
  Bash: 'polecenie', PowerShell: 'polecenie', Read: 'czytam plik', Write: 'zapisuję plik', Edit: 'zmieniam plik',
  Grep: 'szukam w plikach', Glob: 'szukam plików', WebSearch: 'szukam w internecie', WebFetch: 'czytam stronę',
  Agent: 'pomocnik', Skill: 'umiejętność', ToolSearch: 'przygotowuję narzędzia',
}
const stepOf = (tool: string) => STEPS[tool] ?? (tool.startsWith('mcp__') ? 'usługa zewnętrzna' : tool)

const SECTIONS = [
  'Odpowiedź końcowa z ▶ jest rysowana według sekcji rozdzielonych `---`.',
  'Nagłówki sekcji: 🟢 **Zrobione**, 🔴 **Problem**, 🟠 **Do zrobienia przez Ciebie**, 🔵 **Pytania do Ciebie**, ⚪ **Dla informacji** (dawne ✅ ❓ ℹ️ też działają). Zrobione i Problem tylko, gdy występują:',
  '- `🟢 **Zrobione**` (pierwsza sekcja po linii ▶): co jest gotowe i jak sprawdziłem, krótkie punkty;',
  '- `🔴 **Problem**` (zaraz po Zrobione): tylko rzeczy, które coś blokują albo poszły źle.',
  'Zadania i pytania są rysowane razem na górze pod nagłówkiem „Potrzebuję od Ciebie”; Zrobione, Problem i Dla informacji zwijają się do jednej linii, więc ich pierwsze zdanie ma mówić najważniejsze.',
  'W „Do zrobienia przez Ciebie” nie używaj tabeli: lista numerowana „1. Co zrobić (ile czasu) – po co”.',
  'Pytania: pogrubione pytanie „**1. …?**”, linia „Dlaczego to ważne: …”, potem każda opcja w osobnej linii „- **A)** co się stanie – plus: …; minus: …” (bez tabeli), na końcu linia „➜ Polecam 1B, bo …”. Mod sam nazywa opcje jak przyciski (1A, 1B, 2A…) i oznacza polecaną gwiazdką.',
].join('\n')

// The same reply always gets the same key, so the band can scroll to it.
function keyOf(headline: string): string {
  let hash = 0
  for (const char of headline) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return `start-${(hash >>> 0).toString(36)}`
}

function summaryOf(reply: Reply): Last {
  const todos = reply.parts
    .filter(part => part.kind === 'todo')
    .flatMap(part => part.body.split(/\r?\n/).filter(line => /^\s*(\d+\.|[-*]|\|\s*\d)/.test(line)))
  const questions = reply.parts.filter(part => part.kind === 'questions').flatMap(part => splitQuestions(part.body))

  return { headline: reply.headline, key: keyOf(reply.headline), todos: todos.length, questions: questions.length }
}

// One short line for a folded section: its first sentence.
function gist(part: Part): string {
  const text = part.kind === 'done' && part.title.length > 30 ? part.title : part.body
  const line = text.split(/\r?\n/).map(l => l.replace(/^\s*([-*]|\d+\.)\s*/, '').replace(/[*_`]/g, '').trim()).find(l => l !== '') ?? ''
  const more = text.split(/\r?\n/).filter(l => /^\s*([-*]|\d+\.)/.test(l)).length - 1

  return more > 0 ? `${line} (+${more})` : line
}

// A task list split into its items ("1. …", "- …"), each to get its own dot.
// Other lines in a row (a sentence, a table) stay together as one block.
function itemsOf(body: string): { isItem: boolean; text: string }[] {
  const out: { isItem: boolean; text: string }[] = []
  for (const line of body.split(/\r?\n/)) {
    if (line.trim() === '') continue
    const item = /^\s*(\d+\.|[-*])\s+(.*)$/.exec(line)
    const prev = out[out.length - 1]
    if (item) out.push({ isItem: true, text: item[2] })
    else if (prev && !prev.isItem) prev.text += `\n${line}`
    else out.push({ isItem: false, text: line })
  }
  return out
}

function needsOf(todos: number, questions: number): string {
  return [
    todos > 0 ? count(todos, 'zadanie', 'zadania', 'zadań') : '',
    questions > 0 ? count(questions, 'pytanie', 'pytania', 'pytań') : '',
  ].filter(Boolean).join(' i ')
}

function count(n: number, one: string, few: string, many: string): string {
  const word = n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many
  return `${n} ${word}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'wyglad',
      description: 'Wygląd odpowiedzi: /wyglad on albo /wyglad off',
    })
    await $.command.register({ name: 'sprawy', description: 'Panel „Moje sprawy”: zadania do odhaczenia i pytania' })

    return next(e)
  })

  on('command.run', { command: 'sprawy' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Moje sprawy' })

    return { text: 'Otworzyłem panel „Moje sprawy”.' }
  })

  // The pane: open tasks with tick boxes, the latest questions with answer buttons.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, sprawy)
    const ticked = await read($, doneTasks)
    const tasks = list.filter(one => one.kind === 'todo')
    const open = tasks.filter(one => !ticked.includes(one.id))
    const done = tasks.filter(one => ticked.includes(one.id))
    const asks = list.filter(one => one.kind === 'question')
    const tick = (id: string) => () => void update($, doneTasks, l => (l.includes(id) ? l.filter(x => x !== id) : [...l, id]))
    const fill = (value: string) => () => void $.prompt.fill({ text: `${value} `, mode: 'append' }).catch(() => undefined)

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>{`Do zrobienia (${open.length})`}</Text>
        {open.length === 0 ? <Text dimColor>Nic nie czeka na Ciebie.</Text> : null}
        {open.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`p-${one.id}`} label="☐" onPress={tick(one.id)} />
            <Text color="warning">●</Text>
            <Text>{one.text}</Text>
          </Box>
        ))}
        {asks.length > 0 ? <Text bold>{`Pytania (${asks.length})`}</Text> : null}
        {asks.map(one => (
          <Box key={one.id} flexDirection="column">
            <Box flexDirection="row" gap={1}>
              <Text color="suggestion">●</Text>
              <Text>{one.text}</Text>
            </Box>
            <Box flexDirection="row" gap={2}>
              {one.letters.map(l => <Button key={`p-${one.id}-${l}`} label={`Wybierz ${l}`} onPress={fill(l)} />)}
            </Box>
          </Box>
        ))}
        {done.length > 0 ? <Text bold dimColor>{`Odhaczone (${done.length})`}</Text> : null}
        {done.map(one => (
          <Box key={one.id} flexDirection="row" gap={1}>
            <Button key={`p-${one.id}`} label="☑" onPress={tick(one.id)} />
            <Text color="success">●</Text>
            <Text dimColor strikethrough>{one.text}</Text>
          </Box>
        ))}
      </Box>
    )
  })

  on('command.run', { command: 'wyglad' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const isOff = arg === 'off' ? true : arg === 'on' ? false : (await $.store.get(OFF)) !== true
    await $.store.set(OFF, isOff)
    await $.ui.invalidate('ui.render')

    return { text: isOff ? 'Wygląd odpowiedzi: zwykły. Włączysz: /wyglad on' : 'Wygląd odpowiedzi: kolorowy. Wyłączysz: /wyglad off' }
  })

  // Tell Claude about the sections this mod draws.
  on('prompt.compose', async ($, e, next) => {
    const out = await next(e)
    if ((await $.store.get(OFF)) === true) return out

    return { sections: [...out.sections, { id: 'wyglad:sekcje', text: SECTIONS, scope: 'session' }] }
  })

  // Remember the last answer for the band above the prompt.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.reason === 'answer' && e.agentId === undefined) {
      const reply = splitReply(e.answer)
      const summary = reply ? summaryOf(reply) : null
      await update($, last, () => summary)
      if (reply && summary) {
        const tasks: Sprawa[] = reply.parts
          .filter(part => part.kind === 'todo')
          .flatMap(part => itemsOf(part.body))
          .flatMap((item, i) => (item.isItem ? [{ id: `${summary.key}:${i}`, kind: 'todo' as const, text: item.text.replace(/[*_`]/g, ''), letters: [] }] : []))
        const asks: Sprawa[] = reply.parts
          .filter(part => part.kind === 'questions')
          .flatMap(part => splitQuestions(part.body))
          .map(q => ({ id: `${summary.key}:q${q.number}`, kind: 'question' as const, text: `${q.number}. ${q.text.split(`\n\n`)[0].replace(/\*\*/g, '')}`, letters: lettersOf(q).map(l => `${q.number}${l}`) }))
        await update($, sprawy, list => [
          ...list.filter(one => one.kind === 'todo' && !tasks.some(t => t.id === one.id)),
          ...tasks,
          ...asks,
        ].slice(-100))
      }
      const needs = summary ? needsOf(summary.todos, summary.questions) : ''
      if (needs && (await $.store.get(OFF)) !== true) $.ui.toast(`Gotowe. Potrzebuję od Ciebie: ${needs}`, { timeoutMs: 8000 })
    }

    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    const answer = await read($, last)
    if (e.props.hasSurvey || e.props.isWorking || answer === null || (await $.store.get(OFF)) === true) return below

    const { Box, Text, Button } = $.ui.resolve(e)
    const ticked = (await read($, doneTasks)).filter(id => id.startsWith(`${answer.key}:`)).length
    const needs = needsOf(Math.max(0, answer.todos - ticked), answer.questions)

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={2}>
          <Box flexDirection="row" gap={1}>
            <Text color={needs ? 'warning' : 'success'}>●</Text>
            <Text bold>{needs ? `Potrzebuję od Ciebie: ${needs}` : 'Nic od Ciebie nie potrzebuję'}</Text>
          </Box>
          <Button
            key="jump"
            label="↑ Początek odpowiedzi"
            onPress={() => void $.ui.scroll({ to: { key: answer.key }, block: 'start' }).catch(() => undefined)}
          />
          <Button key="pane" label="Moje sprawy" onPress={() => void $.ui.open({ id: PANE, title: 'Moje sprawy' }).catch(() => undefined)} />
        </Box>
        <Text dimColor wrap="truncate-end">{`▶ ${answer.headline}`}</Text>
        {below}
      </Box>
    )
  })

  // Work steps: a run of calls is one faint line, a single call too. Errors and
  // running calls keep the engine's own drawing, so nothing that matters hides.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    if (e.props.isExpanded || (await $.store.get(OFF)) === true) return next(e)
    const { Text } = $.ui.resolve(e)
    const kinds = [...new Set(e.props.calls.map(call => stepOf(call.tool)))].slice(0, 3).join(', ')
    const running = e.props.calls.some(call => call.isRunning) ? ' …' : ''
    return <Text dimColor italic wrap="truncate-end">{`· ${count(e.props.calls.length, 'krok', 'kroki', 'kroków')} w tle (${kinds})${running}`}</Text>
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { tool, isRunning, isErrored, isInterrupted } = e.props
    if (isRunning || isErrored || isInterrupted || (await $.store.get(OFF)) === true) return next(e)
    const { Text } = $.ui.resolve(e)
    return <Text dimColor italic>{`· ${stepOf(tool)}`}</Text>
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const { text, isSummary } = e.props
    if (isSummary || (await $.store.get(OFF)) === true) return next(e)

    const { Box, Text, Markdown, Button } = $.ui.resolve(e)

    // Messages written while Claude works: one faint, slanted line.
    if (isProgress(text)) {
      return (
        <Box>
          <Text dimColor italic>{`· ${firstLine(text)}`}</Text>
        </Box>
      )
    }

    const reply = splitReply(text)
    if (!reply) return next(e)

    const key = keyOf(reply.headline)
    const full = await read($, isFull)
    const isLatest = (await read($, last))?.key === key
    const ticked = await read($, doneTasks)
    const isOpen = (await read($, openTexts)).includes(key)
    const tick = (id: string) => () => void update($, doneTasks, list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]))
    const fill = (value: string) => () => {
      void $.prompt.fill({ text: `${value} `, mode: 'append' }).catch(() => undefined)
    }

    const todos = reply.parts.filter(part => part.kind === 'todo')
    const questions = reply.parts.filter(part => part.kind === 'questions').flatMap(part => splitQuestions(part.body))
    const plain = reply.parts.filter(part => part.kind === 'plain')
    const folded = reply.parts.filter(part => part.kind === 'done' || part.kind === 'problem' || part.kind === 'info')

    return (
      <Box flexDirection="column" gap={1}>
        <Box key={key} flexDirection="column" gap={1}>
          {/* The bar marks where the answer starts; bright only on the latest one. */}
          <Box backgroundColor={isLatest ? 'claude' : 'inactive'} paddingX={1}>
            <Text color="inverseText" bold>▶ Nowa odpowiedź</Text>
          </Box>
          <Text bold>{reply.headline}</Text>
        </Box>
        {(() => {
          // A long explanation shows its first lines until opened.
          const lines = plain.map(part => part.body).join('\n\n').split('\n')
          if (lines.length === 1 && lines[0] === '') return null
          const isLong = lines.length > SHORT + 2
          return (
            <Box flexDirection="column">
              <Markdown text={isLong && !isOpen ? `${lines.slice(0, SHORT).join('\n')}\n…` : lines.join('\n')} />
              {isLong ? (
                <Box>
                  <Button
                    key={`open-${key}`}
                    label={isOpen ? 'Pokaż mniej' : `Pokaż więcej (${lines.length - SHORT} linii)`}
                    onPress={() => void update($, openTexts, list => (list.includes(key) ? list.filter(x => x !== key) : [...list, key]))}
                  />
                </Box>
              ) : null}
            </Box>
          )
        })()}
        {todos.length + questions.length > 0 ? (
          <Box flexDirection="column" gap={1}>
            <Text bold>Potrzebuję od Ciebie</Text>
            {/* Status is a coloured dot; the words stay plain. */}
            {todos.flatMap(part => itemsOf(part.body)).map((item, i) =>
              item.isItem ? (
                <Box key={`d${i}`} flexDirection="row" gap={1}>
                  <Button key={`tick-${key}-${i}`} label={ticked.includes(`${key}:${i}`) ? '☑' : '☐'} onPress={tick(`${key}:${i}`)} />
                  <Text color={ticked.includes(`${key}:${i}`) ? 'success' : 'warning'}>●</Text>
                  {ticked.includes(`${key}:${i}`) ? <Text dimColor strikethrough>{item.text.replace(/[*_`]/g, '')}</Text> : <Markdown text={item.text} />}
                </Box>
              ) : (
                <Markdown key={`d${i}`} text={item.text} />
              ),
            )}
            <Box flexDirection="column" gap={2}>
            {questions.map((q, i) => {
              // A decision card: the question, its options, the advice and the buttons in one frame.
              const [title, ...why] = q.text.split('\n\n')
              return (
                <Box key={`q${i}`} flexDirection="column" borderStyle="round" borderColor="suggestion" paddingX={1} gap={1}>
                  <Box flexDirection="row" gap={1}>
                    <Text color="suggestion">●</Text>
                    <Text bold>{`Pytanie ${q.number}: ${title.replace(/\*\*/g, '')}`}</Text>
                  </Box>
                  {why.length > 0 ? <Markdown text={why.join('\n\n')} dimColor /> : null}
                  {/* One option per line, named as its button; the star marks the advice. */}
                  {optionsOf(q).map(option => (
                    <Box key={`o${i}-${option.id}`} flexDirection="row" gap={1}>
                      <Text bold>{`${option.id}${option.isBest ? ' ★' : ''}`}</Text>
                      <Markdown text={option.text} />
                    </Box>
                  ))}
                  {q.tip ? <Text bold>{tipOf(q)}</Text> : null}
                  {optionsOf(q).length > 0 ? (
                    <Box flexDirection="row" gap={2}>
                      {optionsOf(q).map(option => (
                        <Button
                          key={`b${i}-${option.id}`}
                          label={`Wybierz ${option.id}${option.isBest ? ' ★' : ''}`}
                          onPress={fill(option.id)}
                        />
                      ))}
                    </Box>
                  ) : null}
                </Box>
              )
            })}
            </Box>
          </Box>
        ) : null}
        {folded.length > 0 ? (
          <Box flexDirection="column">
            {full
              ? folded.map((part, i) => (
                  <Box key={`f${i}`} flexDirection="column">
                    <Box flexDirection="row" gap={1}>
                      <Text color={part.kind === 'done' ? 'success' : part.kind === 'problem' ? 'error' : 'inactive'}>●</Text>
                      <Text bold>{part.kind === 'done' ? 'Zrobione' : part.kind === 'problem' ? 'Problem' : 'Dla informacji'}</Text>
                    </Box>
                    <Markdown text={part.kind === 'done' && part.title.length > 30 ? `${part.title}\n\n${part.body}` : part.body} />
                  </Box>
                ))
              : folded.filter(part => part.kind !== 'info').map((part, i) => (
                  <Box key={`g${i}`} flexDirection="row" gap={1}>
                    <Text color={part.kind === 'problem' ? 'error' : 'success'}>●</Text>
                    <Text wrap="truncate-end">{`${part.kind === 'problem' ? 'Problem' : 'Zrobione'}: ${gist(part)}`}</Text>
                  </Box>
                ))}
            <Box>
              <Button key={`more-${key}`} label={full ? 'Zwiń szczegóły' : 'Pokaż szczegóły'} onPress={() => void update($, isFull, value => !value)} />
            </Box>
          </Box>
        ) : null}
      </Box>
    )
  })
}
