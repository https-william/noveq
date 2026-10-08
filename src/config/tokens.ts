/**
 * NOVEQ Brand Design Tokens
 * 
 * Single source of truth for design tokens.
 * Calibrated for strict WCAG 2.2 AA contrast compliance.
 * Any future palette updates can be made here and in globals.css.
 */

export const BRAND_TOKENS = {
  colors: {
    // Primary dark background, nav, footer
    inkBlack: '#0A0A0A',
    // Deep brand brown, overlays, secondary surfaces
    espresso: '#2A1B15',
    // Supportive brown, borders, select accents
    cocoa: '#5B4033',
    // Primary light canvas / product storytelling
    bone: '#F4F1EA',
    // Clean surfaces / text on dark
    warmWhite: '#FAF8F4',
    // Secondary text on light surfaces (Calibrated to #665B53 for 5.8:1 contrast on bone)
    mutedTaupe: '#665B53',
    // Secondary text on dark surfaces (Calibrated to #C7BCB3 for 9.2:1 contrast on ink-black)
    mutedTaupeOnDark: '#C7BCB3',
    // OPTIONAL editorial/product accent ONLY - use sparingly, never as primary UI
    oxblood: '#5A2028',
  },
  typography: {
    primaryFont: 'var(--font-inter)',
    accentFont: 'var(--font-instrument-serif)',
  },
  radii: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  motion: {
    smallUi: '200ms ease',
    editorial: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type BrandColors = typeof BRAND_TOKENS.colors;
