// src/styles/theme.ts
// Combines all styling constants (colors, fonts, metrics) into a single theme object for easy access.

import { colors } from './colors';
import { fonts, fontSizes } from './typography';
import { metrics } from './metrics';

// The main theme object, combining all styling categories
export const theme = {
  colors,
  fonts,
  fontSizes,
  metrics,
};

// Export the type of the theme object for TypeScript inference
export type AppTheme = typeof theme;