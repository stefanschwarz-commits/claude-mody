import type { Register } from 'claude-code'

import { firstLine, isProgress, letterOf, splitQuestions, splitReply } from './split'

const OFF = 'off'

const SECTIONS = [
  'Odpowiedź końcowa z ▶ jest rysowana w kolorowych ramkach według sekcji rozdzielonych `---`.',
  'Oprócz stałych sekcji (✅ Do zrobienia przez Ciebie, ❓ Pytania do Ciebie, ℹ️ Dla informacji) używaj dwóch kolejnych, tylko gdy występują:',
  '- `**Zrobione**` (pierwsza sekcja po linii ▶): co jest gotowe i jak sprawdziłem; rysowana w zielonej ramce;',
  '- `⚠️ **Problem**` (zaraz po Zrobione): tylko rzeczy, które coś blokują albo poszły źle; rysowana w czerwonej ramce.',
].join('\n')

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

  // Tell Claude about the two sections only this mod draws.
  on('prompt.compose', async ($, e, next) => {
    const out = await next(e)
    if ((await $.store.get(OFF)) === true) return out

    return { sections: [...out.sections, { id: 'wyglad:sekcje', text: SECTIONS, scope: 'session' }] }
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

    const answer = (value: string) => () => {
      void $.prompt.fill({ text: `${value} `, mode: 'append' }).catch(() => undefined)
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box backgroundColor="claude" paddingX={1}>
          <Text color="inverseText" bold>{`▶ ${reply.headline}`}</Text>
        </Box>
        {reply.parts.map((part, i) => {
          // Done: the green frame says it, so no title and no icon.
          if (part.kind === 'done') {
            const text = part.title.length > 30 ? `${part.title}

${part.body}` : part.body
            return (
              <Box key={`p${i}`} flexDirection="column" borderStyle="round" borderColor="success" paddingX={1}>
                <Markdown text={text} />
              </Box>
            )
          }
          if (part.kind === 'problem') {
            return (
              <Box key={`p${i}`} flexDirection="column" borderStyle="bold" borderColor="error" paddingX={1}>
                <Text color="error" bold underline>{`⚠ ${part.title}`}</Text>
                <Markdown text={part.body} />
              </Box>
            )
          }
          if (part.kind === 'todo') {
            return (
              <Box key={`p${i}`} flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
                <Text color="warning" bold underline>{`☐ ${part.title}`}</Text>
                <Markdown text={part.body} />
              </Box>
            )
          }
          if (part.kind === 'questions') {
            return (
              <Box key={`p${i}`} flexDirection="column" borderStyle="double" borderColor="suggestion" paddingX={1} gap={1}>
                <Text color="suggestion" bold underline>{`❓ ${part.title}`}</Text>
                {splitQuestions(part.body).map(q => (
                  <Box key={`q${i}-${q.number}`} flexDirection="column" borderStyle="single" borderColor="suggestion" paddingX={1}>
                    <Markdown text={q.text} />
                    {q.options.map((option, j) => (
                      <Markdown key={`o${i}-${q.number}-${j}`} text={option} />
                    ))}
                    {q.tip ? <Text bold>{q.tip}</Text> : null}
                    {q.options.length > 0 ? (
                      <Box flexDirection="row" gap={2}>
                        {q.options.map(option => {
                          const letter = letterOf(option)
                          return (
                            <Button
                              key={`b${i}-${q.number}-${letter}`}
                              label={`${q.number}${letter}`}
                              onPress={answer(`${q.number}${letter}`)}
                            />
                          )
                        })}
                      </Box>
                    ) : null}
                  </Box>
                ))}
              </Box>
            )
          }
          if (part.kind === 'info') {
            return (
              <Box key={`p${i}`} flexDirection="column" paddingX={1}>
                <Text dimColor italic>{`ℹ️ ${part.title}`}</Text>
                <Markdown text={part.body} dimColor />
              </Box>
            )
          }

          return <Markdown key={`p${i}`} text={part.body} />
        })}
      </Box>
    )
  })
}
