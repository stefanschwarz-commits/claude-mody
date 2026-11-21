// The app's whole look by Claude account (decision "A: według konta", 2026-11-21): Stefan runs three
// accounts on one computer and often can't tell which one a session is on. Personal is green,
// ELMI blue, ATERIMA red: the same colours as the account band of the "projekt" mod.
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

export const ACCOUNT_COLOR: Record<Account, string> = { Personal: '#2E7D32', ELMI: '#1565C0', ATERIMA: '#C62828' }

type Anchors = { 'surface-0': string; 'surface-1': string; 'surface-2': string; 'surface-3'?: string; 'text-primary': string; 'text-secondary': string; 'text-muted': string }

const GRAYS: Record<Account, { light: Anchors; dark: Anchors }> = {
  Personal: {
    light: { 'surface-0': '#eef3ec', 'surface-1': '#f4f8f2', 'surface-2': '#fafcf9', 'text-primary': '#1a221a', 'text-secondary': '#3d483d', 'text-muted': '#556055' },
    dark: { 'surface-0': '#141a15', 'surface-1': '#1a211b', 'surface-2': '#202821', 'surface-3': '#252e26', 'text-primary': '#e9f0e9', 'text-secondary': '#c4cec4', 'text-muted': '#a0ada0' },
  },
  ELMI: {
    light: { 'surface-0': '#ecf1f7', 'surface-1': '#f3f6fa', 'surface-2': '#f9fbfd', 'text-primary': '#19202d', 'text-secondary': '#3b4557', 'text-muted': '#535e70' },
    dark: { 'surface-0': '#13171e', 'surface-1': '#191e27', 'surface-2': '#1f2530', 'surface-3': '#242b37', 'text-primary': '#e7ecf4', 'text-secondary': '#c2cad7', 'text-muted': '#9da8b7' },
  },
  ATERIMA: {
    light: { 'surface-0': '#f6eeed', 'surface-1': '#f9f3f2', 'surface-2': '#fcf9f8', 'text-primary': '#281b1a', 'text-secondary': '#4f3e3c', 'text-muted': '#675553' },
    dark: { 'surface-0': '#1c1414', 'surface-1': '#231a1a', 'surface-2': '#2a2020', 'surface-3': '#302525', 'text-primary': '#f3e9e8', 'text-secondary': '#d4c5c3', 'text-muted': '#b2a19f' },
  },
}

/** The theme of an account, and what makeColors says fails. Throws only on an unusable colour. */
export function lookOf(account: Account): { theme: ThemeColors; problems: string[] } {
  const grays = GRAYS[account]
  return makeColors({
    label: `Konto ${account}`,
    id: `wyglad-${account.toLowerCase()}`,
    roles: { accent: ACCOUNT_COLOR[account], danger: '#c0362c', success: '#2e7d32', warning: '#b26a00', pro: '#6d4f94' },
    light: { gray: { anchors: grays.light } },
    dark: { gray: { anchors: grays.dark } },
  })
}

/** The line that would stop Desktop painting the theme, if any. */
export function unpainted(problems: string[]): string | undefined {
  return problems.find(line => line.startsWith("Desktop won't paint"))
}
