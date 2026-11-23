// The app's whole look by Claude account (decision "A: według konta", 2026-11-21): Stefan runs three
// accounts on one computer and often can't tell which one a session is on. Personal is green,
// ELMI orange, ATERIMA navy (Stefan, 2026-11-23): the same colours as the account band of the "projekt" mod.
// Surfaces are only lightly tinted, so text reads in the light and the dark style alike
// (0.44.0 lesson: dark tints in a light app gave black text on dark ground).
import type { ThemeColors } from 'claude-code'

import { makeColors } from './make-colors.js'

export type Account = 'Personal' | 'ELMI' | 'ATERIMA'

// The organizations of Stefan's three accounts (the same table as in the "projekt" mod).
const ORGS: Record<string, Account> = {
  '8a5350ca-2541-4066-8c79-d4cc738ae76c': 'Personal',
  '6de9bd9f-5915-4468-81fa-8e28071e05b9': 'ELMI',
  '1f6c04b3-9eb2-479b-aa75-d2b914e7e274': 'ATERIMA',
}

/** The account: the desktop app names the organization; the config folder is the fallback. */
export function accountOf(org: string | undefined, configDir: string | undefined): Account {
  const byOrg = ORGS[(org ?? '').trim().toLowerCase()]
  if (byOrg) return byOrg
  const name = (configDir ?? '').replace(/\\/g, '/').replace(/\/$/, '').split('/').pop()?.toLowerCase() ?? ''
  return /aterima/.test(name) ? 'ATERIMA' : /elmi/.test(name) ? 'ELMI' : 'Personal'
}

export const ACCOUNT_COLOR: Record<Account, string> = { Personal: '#2E7D32', ELMI: '#E65100', ATERIMA: '#1A237E' }

type Anchors = { 'surface-0': string; 'surface-1': string; 'surface-2': string; 'surface-3'?: string; 'text-primary': string; 'text-secondary': string; 'text-muted': string }

const GRAYS: Record<Account, { light: Anchors; dark: Anchors }> = {
  Personal: {
    light: { 'surface-0': '#eef3ec', 'surface-1': '#f4f8f2', 'surface-2': '#fafcf9', 'text-primary': '#1a221a', 'text-secondary': '#3d483d', 'text-muted': '#556055' },
    dark: { 'surface-0': '#141a15', 'surface-1': '#1a211b', 'surface-2': '#202821', 'surface-3': '#252e26', 'text-primary': '#e9f0e9', 'text-secondary': '#c4cec4', 'text-muted': '#a0ada0' },
  },
  ELMI: {
    light: { 'surface-0': '#f7f0ea', 'surface-1': '#faf5f0', 'surface-2': '#fdfaf7', 'text-primary': '#2a1e16', 'text-secondary': '#504136', 'text-muted': '#68584c' },
    dark: { 'surface-0': '#1c1712', 'surface-1': '#231c16', 'surface-2': '#2a221b', 'surface-3': '#30271f', 'text-primary': '#f4ece4', 'text-secondary': '#d6c9bc', 'text-muted': '#b3a495' },
  },
  // ATERIMA without a navy cast on surfaces and text (Stefan, 2026-11-23): plain greys, navy only in the accent.
  ATERIMA: {
    light: { 'surface-0': '#efefef', 'surface-1': '#f5f5f5', 'surface-2': '#fbfbfb', 'text-primary': '#1c1c1c', 'text-secondary': '#424242', 'text-muted': '#5c5c5c' },
    dark: { 'surface-0': '#161616', 'surface-1': '#1c1c1c', 'surface-2': '#232323', 'surface-3': '#282828', 'text-primary': '#ececec', 'text-secondary': '#c8c8c8', 'text-muted': '#a3a3a3' },
  },
}

/** The theme of an account, and what makeColors says fails. Throws only on an unusable colour. */
export function lookOf(account: Account): { theme: ThemeColors; problems: string[] } {
  const grays = GRAYS[account]
  return makeColors({
    label: `Konto ${account}`,
    id: `wyglad-${account.toLowerCase()}`,
    roles: { accent: ACCOUNT_COLOR[account], danger: '#c0362c', success: '#2e7d32', warning: '#b26a00', pro: '#6d4f94' },
    // Navy stays navy: the generator would lift it to a bright blue, so ATERIMA fills from a darker stop.
    light: { gray: { anchors: grays.light }, ...(account === 'ATERIMA' ? { roles: { accent: { seed: ACCOUNT_COLOR.ATERIMA, fillShade: 700 } } } : {}) },
    dark: { gray: { anchors: grays.dark }, ...(account === 'ATERIMA' ? { roles: { accent: { seed: ACCOUNT_COLOR.ATERIMA, fillShade: 600 } } } : {}) },
  })
}

/** The line that would stop Desktop painting the theme, if any. */
export function unpainted(problems: string[]): string | undefined {
  return problems.find(line => line.startsWith("Desktop won't paint"))
}
