import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Last } from '../types'
import { firstLine, isProgress, lettersOf, splitQuestions, splitReply, tableOf, tipOf } from './split'
import type { Part, Reply } from './split'

const OFF = 'off'

const last = atom({ plugin: 'wyglad', key: 'last' } as const, null)
const isFull = atom({ plugin: 'wyglad', key: 'isFull' } as const, false)

const SECTIONS = [
  'Odpowiedź końcowa z ▶ jest rysowana według sekcji rozdzielonych `---`.',
  'Oprócz stałych sekcji (✅ Do zrobienia przez Ciebie, ❓ Pytania do Ciebie, ℹ️ Dla informacji) używaj dwóch kolejnych, tylko gdy występują:',
  '- `**Zrobione**` (pierwsza sekcja po linii ▶): co jest gotowe i jak sprawdziłem, krótkie punkty;',
  '- `⚠️ **Problem**` (zaraz po Zrobione): tylko rzeczy, które coś blokują albo poszły źle.',
  'Zadania i pytania są rysowane razem na górze pod nagłówkiem „Potrzebuję od Ciebie”; Zrobione, Problem i Dla informacji zwijają się do jednej linii, więc ich pierwsze zdanie ma mówić najważniejsze.',
  'W „Do zrobienia przez Ciebie” nie używaj tabeli: lista numerowana „1. Co zrobić (ile czasu) – po co”.',
  'Pytania: pogrubione pytanie „**1. …?**”, linia „Dlaczego to ważne: …”, potem tabela | Opcja | Co się stanie | Plus | Minus | z wierszami „| **A)** | … |”, na końcu linia „➜ Polecam …”. Mod sam numeruje opcje jak przyciski (1A, 1B, 2A…); w tekście odwołuj się do nich tak samo.',
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

    return next(e)
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
      await update($, last, () => (reply ? summaryOf(reply) : null))
    }

    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    const answer = await read($, last)
    if (e.props.hasSurvey || e.props.isWorking || answer === null || (await $.store.get(OFF)) === true) return below

    const { Box, Text, Button } = $.ui.resolve(e)
    const needs = [
      answer.todos > 0 ? count(answer.todos, 'zadanie', 'zadania', 'zadań') : '',
      answer.questions > 0 ? count(answer.questions, 'pytanie', 'pytania', 'pytań') : '',
    ].filter(Boolean).join(' i ')

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={2}>
          {needs ? (
            <Text color="claude" bold>{`Potrzebuję od Ciebie: ${needs}`}</Text>
          ) : (
            <Text color="success" bold>Nic od Ciebie nie potrzebuję</Text>
          )}
          <Button
            key="jump"
            label="↑ Początek odpowiedzi"
            onPress={() => void $.ui.scroll({ to: { key: answer.key }, block: 'start' }).catch(() => undefined)}
          />
        </Box>
        <Text dimColor wrap="truncate-end">{`▶ ${answer.headline}`}</Text>
        {below}
      </Box>
    )
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
    const fill = (value: string) => () => {
      void $.prompt.fill({ text: `${value} `, mode: 'append' }).catch(() => undefined)
    }

    const todos = reply.parts.filter(part => part.kind === 'todo')
    const questions = reply.parts.filter(part => part.kind === 'questions').flatMap(part => splitQuestions(part.body))
    const plain = reply.parts.filter(part => part.kind === 'plain')
    const folded = reply.parts.filter(part => part.kind === 'done' || part.kind === 'problem' || part.kind === 'info')

    return (
      <Box flexDirection="column" gap={1}>
        <Box key={key} flexDirection="column">
          {/* The bar marks where the answer starts; bright only on the latest one. */}
          <Box backgroundColor={isLatest ? 'claude' : 'inactive'} paddingX={1}>
            <Text color="inverseText" bold>▶ Nowa odpowiedź</Text>
          </Box>
          <Text bold>{reply.headline}</Text>
        </Box>
        {plain.map((part, i) => <Markdown key={`t${i}`} text={part.body} />)}
        {todos.length + questions.length > 0 ? (
          <Box flexDirection="column" gap={1}>
            <Text color="claude" bold>Potrzebuję od Ciebie</Text>
            {todos.map((part, i) => <Markdown key={`d${i}`} text={part.body} />)}
            <Box flexDirection="column" gap={2}>
            {questions.map((q, i) => {
              // A decision card: the question, its options, the advice and the buttons in one frame.
              const [title, ...why] = q.text.split('\n\n')
              return (
                <Box key={`q${i}`} flexDirection="column" borderStyle="round" borderColor="suggestion" paddingX={1} gap={1}>
                  <Text color="suggestion" bold>{`Pytanie ${q.number}: ${title.replace(/\*\*/g, '')}`}</Text>
                  {why.length > 0 ? <Markdown text={why.join('\n\n')} dimColor /> : null}
                  {tableOf(q) ? <Markdown text={tableOf(q)} /> : null}
                  {q.tip ? <Text bold>{tipOf(q)}</Text> : null}
                  {lettersOf(q).length > 0 ? (
                    <Box flexDirection="row" gap={2}>
                      {lettersOf(q).map(letter => (
                        <Button key={`b${i}-${q.number}-${letter}`} label={`${q.number}${letter}`} onPress={fill(`${q.number}${letter}`)} />
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
                    <Text color={part.kind === 'done' ? 'success' : part.kind === 'problem' ? 'error' : undefined} dimColor={part.kind === 'info'} bold>
                      {part.kind === 'done' ? '✓ Zrobione' : part.kind === 'problem' ? '⚠ Problem' : 'Dla informacji'}
                    </Text>
                    <Markdown text={part.kind === 'done' && part.title.length > 30 ? `${part.title}\n\n${part.body}` : part.body} />
                  </Box>
                ))
              : folded.filter(part => part.kind !== 'info').map((part, i) => (
                  <Text key={`g${i}`} color={part.kind === 'problem' ? 'error' : 'success'} wrap="truncate-end">
                    {`${part.kind === 'problem' ? '⚠ Problem' : '✓ Zrobione'}: ${gist(part)}`}
                  </Text>
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
