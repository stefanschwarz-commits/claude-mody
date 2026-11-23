// Company colours and the ATERIMA brand label for the teams (Stefan, 2026-11-23).
// Colours come from the official logotypes (Marketing library, LOGOTYPY folder; ELMI from its website logo):
// GRUPA ATERIMA black, ATERIMA MED #00508F, ATERIMA WORK #BF0F7E, ATERIMA CARE #B7074E (with #00568E),
// ELMI #FFB33B. Surfaces stay plain grey for ATERIMA (Stefan: "granatowa poświata na tekście ... nie wygląda dobrze").
import type { ThemeColors } from 'claude-code'

import { makeColors } from './make-colors.js'

export type Firma = 'ATERIMA' | 'ELMI'

const ORGS: Record<string, Firma> = {
  '6de9bd9f-5915-4468-81fa-8e28071e05b9': 'ELMI',
  '1f6c04b3-9eb2-479b-aa75-d2b914e7e274': 'ATERIMA',
}

export function firmaOf(org: string | undefined): Firma | null {
  return ORGS[(org ?? '').trim().toLowerCase()] ?? null
}

// The brands an ATERIMA employee picks from once.
export const MARKI = ['GRUPA', 'MED', 'WORK', 'CARE'] as const
export type Marka = (typeof MARKI)[number]

export function markaOf(text: string): Marka | null {
  const word = text.trim().toUpperCase()
  return (MARKI as readonly string[]).includes(word) ? (word as Marka) : null
}

/** The brand's name as its logotype writes it. */
export const NAZWA: Record<Marka, string> = { GRUPA: 'GRUPA ATERIMA', MED: 'ATERIMA MED', WORK: 'ATERIMA WORK', CARE: 'ATERIMA CARE' }

/** The logotype colour: the label's background, and the seed of the buttons and links. */
export const LOGO: Record<Marka | 'ELMI', { color: string; ink: string; shade?: number }> = {
  GRUPA: { color: '#1C1C1C', ink: '#FFFFFF', shade: 700 },
  MED: { color: '#00508F', ink: '#FFFFFF', shade: 600 },
  WORK: { color: '#BF0F7E', ink: '#FFFFFF' },
  CARE: { color: '#B7074E', ink: '#FFFFFF' },
  ELMI: { color: '#FFB33B', ink: '#1C1C1C', shade: 250 },
}

const GREY = {
  light: { 'surface-0': '#efefef', 'surface-1': '#f5f5f5', 'surface-2': '#fbfbfb', 'text-primary': '#1c1c1c', 'text-secondary': '#424242', 'text-muted': '#5c5c5c' },
  dark: { 'surface-0': '#161616', 'surface-1': '#1c1c1c', 'surface-2': '#232323', 'surface-3': '#282828', 'text-primary': '#ececec', 'text-secondary': '#c8c8c8', 'text-muted': '#a3a3a3' },
}
const WARM = {
  light: { 'surface-0': '#f7f0ea', 'surface-1': '#faf5f0', 'surface-2': '#fdfaf7', 'text-primary': '#2a1e16', 'text-secondary': '#504136', 'text-muted': '#68584c' },
  dark: { 'surface-0': '#1c1712', 'surface-1': '#231c16', 'surface-2': '#2a221b', 'surface-3': '#30271f', 'text-primary': '#f4ece4', 'text-secondary': '#d6c9bc', 'text-muted': '#b3a495' },
}

/** The look: ELMI, or an ATERIMA brand (a person who has not picked yet sees the GRUPA look). */
export function lookOf(firma: Firma, marka: Marka | null): { theme: ThemeColors; problems: string[] } {
  const key = firma === 'ELMI' ? 'ELMI' : (marka ?? 'GRUPA')
  const logo = LOGO[key]
  const accent = logo.shade ? { seed: logo.color, fillShade: logo.shade } : logo.color
  const grays = firma === 'ELMI' ? WARM : GREY
  return makeColors({
    label: firma === 'ELMI' ? 'ELMI' : NAZWA[marka ?? 'GRUPA'],
    id: `kolory-firmy-${key.toLowerCase()}`,
    roles: { accent, danger: '#c0362c', success: '#2e7d32', warning: '#b26a00', pro: '#6d4f94' },
    light: { gray: { anchors: grays.light } },
    dark: { gray: { anchors: grays.dark } },
  })
}

export function unpainted(problems: string[]): string | undefined {
  return problems.find(line => line.startsWith("Desktop won't paint"))
}
