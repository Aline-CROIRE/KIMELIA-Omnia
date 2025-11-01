// src/styles/typography.ts
// Defines the font families and sizes used throughout the application.

import { Platform } from 'react-native';

export const fonts = {
  // Primary font (e.g., Poppins) for headings, titles, and key UI elements
  primary: Platform.select({
    ios: 'Poppins_400Regular', // Standard weight
    android: 'Poppins_400Regular',
    default: 'Poppins_400Regular',
  }),
  primaryBold: Platform.select({
    ios: 'Poppins_700Bold', // Bold weight for emphasis
    android: 'Poppins_700Bold',
    default: 'Poppins_700Bold',
  }),
  // Secondary font (e.g., Lato) for body text and descriptive content
  secondary: Platform.select({
    ios: 'Lato_400Regular',
    android: 'Lato_400Regular',
    default: 'Lato_400Regular',
  }),
  secondaryBold: Platform.select({
    ios: 'Lato_700Bold',
    android: 'Lato_700Bold',
    default: 'Lato_700Bold',
  }),
  // Specific font for the logo text
  logo: Platform.select({
    ios: 'Poppins_700Bold',
    android: 'Poppins_700Bold',
    default: 'Poppins_700Bold',
  }),
  // Add other font weights/styles as needed (e.g., 'Poppins_500Medium')
};

export const fontSizes = {
  tiny: 10,     // Smallest text (e.g., captions, helper text)
  small: 12,    // Small text (e.g., labels, fine print)
  regular: 14,  // Standard body text size
  medium: 16,   // Slightly larger body text or subheadings
  large: 18,    // Medium headings or prominent text
  xl: 24,       // Large headings
  xxl: 32,      // Extra-large headings (e.g., screen titles)
};