// src/styles/theme.ts
import { colors } from './colors';
import { fonts, fontSizes } from './typography';
import { metrics } from './metrics';

export const theme = {
  colors,
  fonts,
  fontSizes,
  metrics,
};

export type AppTheme = typeof theme; // For TypeScript inference