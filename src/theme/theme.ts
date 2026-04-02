import { brandPalette } from './colors';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = typeof brandPalette & {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentStrong: string;
};

export const appThemes: Record<ThemeMode, AppTheme> = {
  light: {
    ...brandPalette,
    background: '#FFFDF9',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF7EE',
    text: brandPalette.ink,
    muted: brandPalette.cocoa,
    border: '#E7D8C8',
    accent: brandPalette.ember,
    accentStrong: brandPalette.emberDeep
  },
  dark: {
    ...brandPalette,
    background: '#17110D',
    surface: '#241913',
    surfaceAlt: '#2B1D16',
    text: '#FFF7F0',
    muted: '#E1B68C',
    border: '#4B3327',
    accent: brandPalette.emberSoft,
    accentStrong: brandPalette.ember
  }
};

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = mode;
}
