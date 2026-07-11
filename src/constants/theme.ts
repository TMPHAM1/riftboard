/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform, type ViewStyle } from 'react-native';

// Riftbound brand theme — a fixed dark-teal palette (not OS light/dark driven,
// so both keys are identical). Contrast checked against WCAG AA:
//   white on #013952 ≈ 12.3:1 (AAA) · #E78D17 on #013952 ≈ 4.8:1 (AA)
//   #B3C9D1 on #013952 ≈ 7.1:1 (AAA)
const brand = {
  text: '#FFFFFF',           // primary body text
  textSecondary: '#B3C9D1',  // muted text / metadata
  title: '#E78D17',          // headings / brand accent
  accent: '#E78D17',         // interactive accent (buttons, active states)
  accentText: '#013952',     // text/icon sitting on an accent fill
  background: '#013952',     // app base
  backgroundElement: '#0A4A63', // raised surfaces (cards, inputs)
  backgroundSelected: '#11607F', // hovered / selected surface
  border: '#1C5E78',         // hairlines & outlines on dark
  danger: '#F87171',         // destructive actions (accessible red on teal)
} as const;

export const Colors = {
  light: brand,
  dark: brand,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// Shared responsive content column. Spread into a screen's container style so
// every page lines up: phones use the full width (minus a small gutter), while
// desktop/web takes ~80% — capped so very large screens don't sprawl edge to edge.
export const ContentLayout = (Platform.select({
  web: { width: "65%", maxWidth: 1200, marginHorizontal: "auto" },
  default: { maxWidth: MaxContentWidth, marginHorizontal: 10 },
}) ?? {}) as ViewStyle;
