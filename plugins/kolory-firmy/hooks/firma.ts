// Company colours and the ATERIMA brand label for the teams (Stefan, 2026-11-23).
// Colours come from the official logotypes (Marketing library, LOGOTYPY folder; ELMI from its website logo):
// GRUPA ATERIMA black, ATERIMA MED #00508F, ATERIMA WORK #BF0F7E, ATERIMA CARE #B7074E (with #00568E),
// Akademia Opiekunów #F39200, Home Care Services #04508D (added 2026-11-24, Stefan: „Zapomnieliśmy jeszcze o brandzie Akademii i HCS.”),
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
export const MARKI = ['GRUPA', 'MED', 'WORK', 'CARE', 'AKADEMIA', 'HCS'] as const
export type Marka = (typeof MARKI)[number]

export function markaOf(text: string): Marka | null {
  const word = text.trim().toUpperCase()
  return (MARKI as readonly string[]).includes(word) ? (word as Marka) : null
}

/** The brand's name as its logotype writes it. */
export const NAZWA: Record<Marka, string> = { GRUPA: 'GRUPA ATERIMA', MED: 'ATERIMA MED', WORK: 'ATERIMA WORK', CARE: 'ATERIMA CARE', AKADEMIA: 'AKADEMIA OPIEKUNÓW', HCS: 'HOME CARE SERVICES' }

/** The logotype colour: the label's background, and the seed of the buttons and links. */
export const LOGO: Record<Marka | 'ELMI', { color: string; ink: string; shade?: number }> = {
  GRUPA: { color: '#1C1C1C', ink: '#FFFFFF', shade: 700 },
  MED: { color: '#00508F', ink: '#FFFFFF', shade: 600 },
  WORK: { color: '#BF0F7E', ink: '#FFFFFF' },
  CARE: { color: '#B7074E', ink: '#FFFFFF' },
  // Akademia Opiekunów: its one orange (akademiaopiekunow.pl, decision of 2026-10-29); Home Care Services: its logo (hcs-logo.svg).
  AKADEMIA: { color: '#F39200', ink: '#1C1C1C', shade: 250 },
  HCS: { color: '#04508D', ink: '#FFFFFF', shade: 600 },
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

// Each ATERIMA brand paints the whole background in its own colour, the text stays neutral
// (Stefan, 2026-11-24: "Grupa ATERIMA powinna być na czarnym tle", then "Tak" to the brand backgrounds).
const BRAND_SURFACES: Record<Marka, { dark: [string, string, string, string]; light: [string, string, string] }> = {
  GRUPA: { dark: ['#000000', '#0a0a0a', '#121212', '#1a1a1a'], light: ['#ececec', '#f4f4f4', '#fbfbfb'] },
  MED: { dark: ['#07121d', '#0b1928', '#102133', '#14283d'], light: ['#e9f0f7', '#f1f6fb', '#f9fbfd'] },
  WORK: { dark: ['#1a0814', '#220c1b', '#2b1123', '#33152a'], light: ['#f7ebf3', '#faf2f7', '#fdf9fb'] },
  CARE: { dark: ['#1a070e', '#230b14', '#2c101a', '#341520'], light: ['#f7eaef', '#faf2f5', '#fdf8fa'] },
  AKADEMIA: { dark: ['#14110d', '#1b1712', '#221d17', '#29231c'], light: ['#f6f2ec', '#faf7f3', '#fdfcfa'] },
  HCS: { dark: ['#06121e', '#0a1929', '#0f2134', '#13283e'], light: ['#e8f0f7', '#f0f5fa', '#f8fbfd'] },
}

function brandGrays(marka: Marka): typeof GREY {
  const b = BRAND_SURFACES[marka]
  return {
    light: { ...GREY.light, 'surface-0': b.light[0], 'surface-1': b.light[1], 'surface-2': b.light[2] },
    dark: { ...GREY.dark, 'surface-0': b.dark[0], 'surface-1': b.dark[1], 'surface-2': b.dark[2], 'surface-3': b.dark[3] },
  }
}

/** The look: ELMI, or an ATERIMA brand (a person who has not picked yet sees the GRUPA look). */
export function lookOf(firma: Firma, marka: Marka | null): { theme: ThemeColors; problems: string[] } {
  const key = firma === 'ELMI' ? 'ELMI' : (marka ?? 'GRUPA')
  const logo = LOGO[key]
  const accent = logo.shade ? { seed: logo.color, fillShade: logo.shade } : logo.color
  const grays = firma === 'ELMI' ? WARM : brandGrays(marka ?? 'GRUPA')
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
