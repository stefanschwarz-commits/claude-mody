// Company colours and the ATERIMA brand label for the teams (Stefan, 2026-11-23: "4A").
// Pure part: which company the session is on, its look, and the brands an ATERIMA employee picks from.
import type { ThemeColors } from 'claude-code'

import { makeColors } from './make-colors.js'

export type Firma = 'ATERIMA' | 'ELMI'

// Claude organizations of the two companies; any other organization gets nothing from this mod.
const ORGS: Record<string, Firma> = {
  '6de9bd9f-5915-4468-81fa-8e28071e05b9': 'ELMI',
  '1f6c04b3-9eb2-479b-aa75-d2b914e7e274': 'ATERIMA',
}

export function firmaOf(org: string | undefined): Firma | null {
  return ORGS[(org ?? '').trim().toLowerCase()] ?? null
}

// The label an ATERIMA employee picks once (the brand they work in).
export const MARKI = ['GRUPA', 'WORK', 'MED'] as const
export type Marka = (typeof MARKI)[number]

export function markaOf(text: string): Marka | null {
  const word = text.trim().toUpperCase()
  return (MARKI as readonly string[]).includes(word) ? (word as Marka) : null
}

// The same colours as Stefan's own accounts (mod wyglad 0.48.2): ATERIMA plain greys with navy
// buttons and links (no navy cast on text), ELMI lightly warm with orange.
export const KOLOR: Record<Firma, string> = { ELMI: '#E65100', ATERIMA: '#1A237E' }

export function lookOf(firma: Firma): { theme: ThemeColors; problems: string[] } {
  const roles = { accent: KOLOR[firma], danger: '#c0362c', success: '#2e7d32', warning: '#b26a00', pro: '#6d4f94' }
  if (firma === 'ATERIMA') {
    return makeColors({
      label: 'ATERIMA',
      id: 'kolory-firmy-aterima',
      roles,
      light: {
        gray: { anchors: { 'surface-0': '#efefef', 'surface-1': '#f5f5f5', 'surface-2': '#fbfbfb', 'text-primary': '#1c1c1c', 'text-secondary': '#424242', 'text-muted': '#5c5c5c' } },
        roles: { accent: { seed: KOLOR.ATERIMA, fillShade: 700 } },
      },
      dark: {
        gray: { anchors: { 'surface-0': '#161616', 'surface-1': '#1c1c1c', 'surface-2': '#232323', 'surface-3': '#282828', 'text-primary': '#ececec', 'text-secondary': '#c8c8c8', 'text-muted': '#a3a3a3' } },
        roles: { accent: { seed: KOLOR.ATERIMA, fillShade: 600 } },
      },
    })
  }
  return makeColors({
    label: 'ELMI',
    id: 'kolory-firmy-elmi',
    roles,
    light: { gray: { anchors: { 'surface-0': '#f7f0ea', 'surface-1': '#faf5f0', 'surface-2': '#fdfaf7', 'text-primary': '#2a1e16', 'text-secondary': '#504136', 'text-muted': '#68584c' } } },
    dark: { gray: { anchors: { 'surface-0': '#1c1712', 'surface-1': '#231c16', 'surface-2': '#2a221b', 'surface-3': '#30271f', 'text-primary': '#f4ece4', 'text-secondary': '#d6c9bc', 'text-muted': '#b3a495' } } },
  })
}

export function unpainted(problems: string[]): string | undefined {
  return problems.find(line => line.startsWith("Desktop won't paint"))
}
