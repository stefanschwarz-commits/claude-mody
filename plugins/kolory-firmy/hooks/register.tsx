// Kolory firmy: the app's colours for ELMI and ATERIMA employees, and for ATERIMA a label above the
// prompt with the brand the person works in (GRUPA, WORK, MED), picked once and remembered.
import type { EngineInterface, Register } from 'claude-code'

import { firmaOf, LOGO, lookOf, MARKI, markaOf, NAZWA, unpainted } from './firma'
import type { Firma, Marka } from './firma'

const MARKA = 'marka'
const OFF = 'kolory-off'

// A copy installed from the claude-mody repository (Stefan's computer) gives way to the copy the
// organization's library synced, so the label and the colours never come twice.
async function isSecondCopy($: EngineInterface, org: string): Promise<boolean> {
  const root = $.plugin.root.split('\\').join('/')
  if (root.includes('/plugins/synced/')) return false
  const home = (await $.env.get('USERPROFILE').catch(() => undefined)) ?? (await $.env.get('HOME').catch(() => undefined))
  const dir = (await $.env.get('CLAUDE_CONFIG_DIR').catch(() => undefined)) ?? `${home}/.claude`
  const synced = `${dir.split('\\').join('/')}/plugins/synced`
  for (const o of await $.fs.list(synced).catch(() => [])) {
    if (o.kind !== 'dir' || !o.name.toLowerCase().startsWith(org)) continue
    for (const p of await $.fs.list(`${synced}/${o.name}`).catch(() => [])) {
      if (p.kind !== 'dir') continue
      const text = await $.fs.read(`${synced}/${o.name}/${p.name}/.claude-plugin/plugin.json`).catch(() => undefined)
      if (typeof text === 'string' && /"name"\s*:\s*"kolory-firmy"/.test(text)) return true
    }
  }
  return false
}

// The company of this session, from the organization the app names (null: nothing to do here).
async function firmaNow($: EngineInterface): Promise<Firma | null> {
  const org = ((await $.env.get('CLAUDE_CODE_ORGANIZATION_UUID').catch(() => undefined)) ?? '').trim().toLowerCase()
  const firma = firmaOf(org)
  if (!firma || (await isSecondCopy($, org))) return null
  return firma
}

async function markaNow($: EngineInterface): Promise<Marka | null> {
  return markaOf(String((await $.store.get(MARKA)) ?? ''))
}

async function setLook($: EngineInterface, firma: Firma): Promise<void> {
  try {
    const { theme, problems } = lookOf(firma, await markaNow($))
    if (unpainted(problems)) return
    await $.theme.set({ colors: theme })
  } catch {
    // A broken look must not take the label with it.
  }
}

// The brand changes the label and the colours at once.
async function pick($: EngineInterface, marka: Marka): Promise<void> {
  await $.store.set(MARKA, marka)
  if ((await $.store.get(OFF)) !== true) await setLook($, 'ATERIMA')
  await $.ui.invalidate('ui.render')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const firma = await firmaNow($)
    if (firma) {
      await $.command.register({ name: 'marka', description: 'Napis nad polem: /marka grupa, /marka med, /marka work, /marka care; /marka kolory off|on' })
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
    return { text: `Napis nad polem: ${NAZWA[marka]}.` }
  })

  // The label above the prompt, only on the ATERIMA account.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await firmaNow($)) !== 'ATERIMA') return next(e)
    const marka = await markaNow($)
    const { Box, Button, Text } = $.ui.resolve(e)
    if (marka) {
      return (
        <Box flexDirection="row">
          <Box backgroundColor={LOGO[marka].color} paddingX={1}>
            <Text color={LOGO[marka].ink} bold>{NAZWA[marka]}</Text>
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
