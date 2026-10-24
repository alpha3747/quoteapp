import { Platform } from 'react-native';

export const colors = {
  background: '#0E1110',
  surface: '#161A18',
  surfaceRaised: '#1D2220',
  glass: 'rgba(22, 26, 24, 0.72)',
  hairline: 'rgba(233, 236, 232, 0.09)',

  text: '#E9ECE8',
  textMuted: 'rgba(233, 236, 232, 0.6)',
  textFaint: 'rgba(233, 236, 232, 0.36)',

  /** Muted sage — the single, understated brand accent. */
  accent: '#9DB8A5',
  accentSoft: 'rgba(157, 184, 165, 0.14)',
  danger: '#D98C8C',
} as const;

/**
 * Soft color pairs for the ambient background, one per day in rotation.
 * Kept low-opacity so they tint the dark base rather than dominate it.
 */
export const ambientPalettes = [
  {
    primary: 'rgba(157, 184, 165, 0.30)',
    secondary: 'rgba(120, 140, 160, 0.22)',
  }, // sage + slate
  {
    primary: 'rgba(130, 150, 175, 0.28)',
    secondary: 'rgba(157, 184, 165, 0.20)',
  }, // dusk blue + sage
  {
    primary: 'rgba(176, 150, 140, 0.24)',
    secondary: 'rgba(130, 150, 140, 0.20)',
  }, // clay + moss
  {
    primary: 'rgba(150, 140, 170, 0.24)',
    secondary: 'rgba(140, 165, 160, 0.20)',
  }, // lavender + teal
  {
    primary: 'rgba(180, 168, 132, 0.22)',
    secondary: 'rgba(120, 150, 135, 0.22)',
  }, // sand + fern
] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const fonts = {
  /** Editorial serif used for the quote itself. */
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  /** System sans for UI chrome. */
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  sansMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
