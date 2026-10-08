import type { EngineInterface, Register } from 'claude-code'

type Sound = 'done' | 'ask'
type Api = EngineInterface

const MUTED = 'muted'
// One sound per moment: a question that also raises a permission dialog chimes once.
const QUIET_MS = 1500
let lastAskAt = 0

// The person's own machine plays the file: PowerShell on Windows, afplay on
// macOS, PulseAudio or ALSA on Linux. $.audio.play is silent on Windows.
async function play($: Api, sound: Sound): Promise<void> {
  if ((await $.store.get(MUTED)) === true) return

  const isWindows = (await $.env.get('OS')) === 'Windows_NT'
  const file = isWindows
    ? `${$.plugin.root}\\sounds\\${sound}.wav`
    : `${$.plugin.root}/sounds/${sound}.wav`
  const players: string[][] = isWindows
    ? [[
        'powershell.exe', '-NoProfile', '-NonInteractive', '-Command',
        `(New-Object System.Media.SoundPlayer '${file.replaceAll("'", "''")}').PlaySync()`,
      ]]
    : [['afplay', file], ['paplay', file], ['aplay', '-q', file]]

  for (const argv of players) {
    try {
      const { exitCode } = await $.process.run(argv, { timeoutMs: 10_000 })
      if (exitCode === 0) return
    } catch {
      // This player is not on this machine; try the next one.
    }
  }
}

function chime($: Api, sound: Sound): void {
  if (sound === 'ask') {
    const now = Date.now()
    if (now - lastAskAt < QUIET_MS) return
    lastAskAt = now
  }
  void play($, sound).catch(() => undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'dzwiek',
      description: 'Włącz lub wyłącz dźwięki Claude (on / off / test)',
    })

    return next(e)
  })

  on('command.run', { command: 'dzwiek' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'test') {
      await play($, 'done')
      await play($, 'ask')
      return { text: 'Zagrałem oba dźwięki: „gotowe” i „czekam na Ciebie”.' }
    }
    const wasMuted = (await $.store.get(MUTED)) === true
    const isMuted = arg === 'off' ? true : arg === 'on' ? false : !wasMuted
    await $.store.set(MUTED, isMuted)

    return { text: isMuted ? 'Dźwięki wyłączone. Włączysz je: /dzwiek on' : 'Dźwięki włączone. Wyłączysz je: /dzwiek off' }
  })

  // The main conversation's turn ended with an answer: Claude waits for you.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined && !e.isAborted) chime($, 'done')

    return done
  })

  // A permission dialog opened.
  on('classic.PermissionRequest', ($, e, next) => {
    chime($, 'ask')

    return next(e)
  })

  // Claude asks a question or wants a plan approved.
  on('tool.call', { tool: 'AskUserQuestion' }, ($, e, next) => {
    chime($, 'ask')

    return next(e)
  })
  on('tool.call', { tool: 'ExitPlanMode' }, ($, e, next) => {
    chime($, 'ask')

    return next(e)
  })
}
