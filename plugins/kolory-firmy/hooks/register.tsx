// Kolory firmy: the app's colours for ELMI and ATERIMA employees, and for ATERIMA a label above the
// prompt with the brand the person works in (GRUPA, WORK, MED), picked once and remembered.
import type { EngineInterface, Register } from 'claude-code'

import { firmaOf, lookOf, MARKI, markaOf, unpainted } from './firma'
import type { Firma } from './firma'

const MARKA = 'marka'
const OFF = 'kolory-off'

// The company of this session, from the organization the app names.
async function firmaNow($: EngineInterface): Promise<Firma | null> {
  const org = await $.env.get('CLAUDE_CODE_ORGANIZATION_UUID').catch(() => undefined)
  return firmaOf(org)
}

async function setLook($: EngineInterface, firma: Firma): Promise<void> {
  try {
    const { theme, problems } = lookOf(firma)
    if (unpainted(problems)) return
    await $.theme.set({ colors: theme })
  } catch {
    // A broken look must not take the label with it.
  }
}

async function pick($: EngineInterface, marka: string): Promise<void> {
  await $.store.set(MARKA, marka)
  await $.ui.invalidate('ui.render')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const firma = await firmaNow($)
    if (firma) {
      await $.command.register({ name: 'marka', description: 'Napis nad polem: /marka grupa, /marka work, /marka med; /marka kolory off|on' })
      // Never a clear here: a reload must not wipe a theme.
      if ((await $.store.get(OFF)) !== true) await setLook($, firma)
    }
    return next(e)
  })

  on('command.run', { command: 'marka' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg.startsWith('kolory')) {
      const isOff = arg.endsWith('off')
      await $.store.set(OFF, isOff)
      if (isOff) {
        await $.theme.clear().catch(() => undefined)
        return { text: 'Kolory firmy wyłączone. Włączysz: /marka kolory on' }
      }
      const firma = await firmaNow($)
      if (firma) await setLook($, firma)
      return { text: 'Kolory firmy włączone.' }
    }
    const marka = markaOf(arg)
    if (!marka) return { text: `Wpisz jedną z marek: ${MARKI.map(m => `/marka ${m.toLowerCase()}`).join(', ')}.` }
    await pick($, marka)
    return { text: `Napis nad polem: ATERIMA ${marka}.` }
  })

  // The label above the prompt, only on the ATERIMA account.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await firmaNow($)) !== 'ATERIMA') return next(e)
    const marka = markaOf(String((await $.store.get(MARKA)) ?? ''))
    const { Box, Button, Text } = $.ui.resolve(e)
    if (marka) {
      return (
        <Box flexDirection="row">
          <Box backgroundColor="#1A237E" paddingX={1}>
            <Text color="#FFFFFF" bold>ATERIMA {marka}</Text>
          </Box>
        </Box>
      )
    }
    return (
      <Box flexDirection="row" gap={1}>
        <Text>W której marce pracujesz? Wybierz raz:</Text>
        {MARKI.map(m => (
          <Button key={`marka-${m}`} label={m} onPress={() => pick($, m)} />
        ))}
      </Box>
    )
  })
}
