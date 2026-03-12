export type ThemeName = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'royal';

export interface ThemeColors {
  name: string;
  label: string;
  // Background colors
  bg: string;
  bgSecondary: string;
  // Component colors
  sidebar: string;
  card: string;
  cardHover: string;
  // Primary action colors
  primary: string;
  primaryHover: string;
  primaryText: string;
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  // Border colors
  border: string;
  borderLight: string;
  // Accent colors
  accent: string;
  accentHover: string;
  // Status colors (consistent across themes)
  success: string;
  warning: string;
  error: string;
  info: string;
  // Input colors
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  isDark: boolean;
}