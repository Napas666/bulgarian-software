export interface Theme {
  id: string
  name: string
  accent: string
  accentDim: string
  accentGlow: string
  accentGlowSm: string
  accentBorder: string
  bg: string
  bg2: string
  bg3: string
  text: string
  text2: string
  text3: string
  swatch: string
}

export const themes: Theme[] = [
  {
    id: 'red',
    name: 'NEON RED',
    swatch: '#ff0030',
    accent: '#ff0030',
    accentDim: '#cc0025',
    accentGlow: '0 0 20px rgba(255,0,48,0.4)',
    accentGlowSm: '0 0 8px rgba(255,0,48,0.3)',
    accentBorder: 'rgba(255,0,48,0.25)',
    bg: '#08080f',
    bg2: '#0d0d1a',
    bg3: '#111122',
    text: 'rgba(255,255,255,0.92)',
    text2: 'rgba(255,255,255,0.6)',
    text3: 'rgba(255,255,255,0.3)',
  },
  {
    id: 'yellow',
    name: 'NEON YELLOW',
    swatch: '#ffe600',
    accent: '#ffe600',
    accentDim: '#ccb800',
    accentGlow: '0 0 20px rgba(255,230,0,0.4)',
    accentGlowSm: '0 0 8px rgba(255,230,0,0.3)',
    accentBorder: 'rgba(255,230,0,0.25)',
    bg: '#0a0900',
    bg2: '#100f00',
    bg3: '#161400',
    text: 'rgba(255,255,255,0.92)',
    text2: 'rgba(255,255,255,0.6)',
    text3: 'rgba(255,255,255,0.3)',
  },
  {
    id: 'blue',
    name: 'COLD BLUE',
    swatch: '#00c8ff',
    accent: '#00c8ff',
    accentDim: '#0099cc',
    accentGlow: '0 0 20px rgba(0,200,255,0.4)',
    accentGlowSm: '0 0 8px rgba(0,200,255,0.3)',
    accentBorder: 'rgba(0,200,255,0.25)',
    bg: '#00080f',
    bg2: '#000d18',
    bg3: '#001020',
    text: 'rgba(220,240,255,0.95)',
    text2: 'rgba(180,220,255,0.65)',
    text3: 'rgba(140,190,255,0.35)',
  },
  {
    id: 'white',
    name: 'NEON WHITE',
    swatch: '#ffffff',
    accent: '#e8e8e8',
    accentDim: '#bbbbbb',
    accentGlow: '0 0 20px rgba(255,255,255,0.35)',
    accentGlowSm: '0 0 8px rgba(255,255,255,0.25)',
    accentBorder: 'rgba(255,255,255,0.3)',
    bg: '#000000',
    bg2: '#080808',
    bg3: '#101010',
    text: 'rgba(255,255,255,0.95)',
    text2: 'rgba(255,255,255,0.6)',
    text3: 'rgba(255,255,255,0.3)',
  }
]

export function applyTheme(t: Theme) {
  const r = document.documentElement.style
  r.setProperty('--red', t.accent)
  r.setProperty('--red-dim', t.accentDim)
  r.setProperty('--red-glow', t.accentGlow)
  r.setProperty('--red-glow-sm', t.accentGlowSm)
  r.setProperty('--border-red', t.accentBorder)
  r.setProperty('--bg', t.bg)
  r.setProperty('--bg-2', t.bg2)
  r.setProperty('--bg-3', t.bg3)
  r.setProperty('--text', t.text)
  r.setProperty('--text-2', t.text2)
  r.setProperty('--text-3', t.text3)
  document.body.style.background = t.bg
}
