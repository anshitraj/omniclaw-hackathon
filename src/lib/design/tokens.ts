/**
 * OmniClaw Console — Central Design Tokens
 *
 * Derived from:
 *  - DESIGN.md  (Wise-inspired color system, typography, button behaviors)
 *  - neobrutalism-SKILL.md (spacing rhythm, strong borders, high contrast)
 *
 * All raw values live here. Components consume CSS vars defined in globals.css.
 * This file provides typed constants for use in JS/TSX where inline styles are
 * unavoidable (e.g., Framer Motion `style` props, dynamic color interpolation).
 */

// ─── Brand Colors ─────────────────────────────────────────────────────────────
export const colors = {
  // Wise Green accent (primary CTA)
  green: '#9fe870',
  greenDark: '#163300',
  greenMint: '#e2f6d5',
  greenPastel: '#cdffad',
  greenPositive: '#054d28',

  // Near-black base
  nearBlack: '#0e0f0c',
  warmDark: '#454745',
  gray: '#868685',
  lightSurface: '#e8ebe6',

  // Semantic
  danger: '#d03238',
  warning: '#ffd11a',
  accentCyan: 'rgba(56,200,255,0.10)',
  brightOrange: '#ffc091',

  // Dark UI surface (dark mode foundation)
  bgPrimary: '#080a0e',
  bgSecondary: '#0d1117',
  bgTertiary: '#131820',
  bgElevated: '#192030',
  bgHover: '#1e2738',

  borderSubtle: '#1e2535',
  borderDefault: '#263047',
  borderAccent: '#2e3d57',

  textPrimary: '#f0f2f5',
  textSecondary: '#8d9ab5',
  textMuted: '#566680',

  // Accent scale (for badges, states, secondary UI)
  violet: '#7c5cfc',
  blue: '#3b82f6',
  teal: '#14b8a6',
  amber: '#f59e0b',
  red: '#ef4444',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  fontSans: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontMono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  // Display sizes (DESIGN.md headline scale)
  sizeDisplayMega: '7.88rem',
  sizeDisplayHero: '6rem',
  sizeSection: '4rem',
  sizeSub: '2.5rem',
  sizeCardTitle: '1.62rem',
  sizeFeature: '1.38rem',
  sizeBody: '1.13rem',
  sizeCaption: '0.88rem',
  sizeSmall: '0.75rem',
  // Weights
  weightBlack: 900,
  weightBold: 700,
  weightSemibold: 600,
  weightNormal: 400,
  // Line heights
  lineDisplayTight: 0.85,
  lineBody: 1.44,
  lineCaption: 1.5,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  // 8-point base (neobrutalism-SKILL.md)
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
} as const;

// ─── Radius ───────────────────────────────────────────────────────────────────
export const radius = {
  sm: '6px',
  md: '10px',
  card: '16px',
  medium: '20px',
  large: '30px',
  section: '40px',
  pill: '9999px',
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  // DESIGN.md: ring shadows only — no heavy drop shadows
  ring: 'rgba(14,15,12,0.12) 0px 0px 0px 1px',
  ringGreen: '0 0 0 1px rgba(159,232,112,0.3)',
  ringDanger: '0 0 0 1px rgba(208,50,56,0.3)',
  card: '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)',
  elevated: '0 4px 24px rgba(0,0,0,0.5)',
} as const;

// ─── Motion ───────────────────────────────────────────────────────────────────
export const motion = {
  // DESIGN.md: scale(1.05) hover, scale(0.95) active on buttons
  buttonHover: { scale: 1.05 },
  buttonActive: { scale: 0.95 },
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;
