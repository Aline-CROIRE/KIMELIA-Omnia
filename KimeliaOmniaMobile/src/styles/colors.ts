// src/styles/colors.ts
// Defines the complete color palette for the KIMELIA Omnia brand, including gradients.

import { ColorValue } from 'react-native'; // Import ColorValue for explicit type hinting

export const colors = {
  // Core Chocolate Palette (from brand guide)
  chocolateBrown: '#5D3A1A', // Stability, reliability, sophistication
  deepCoffee: '#3B2F2F',     // Premium, strong, readable
  lightCocoa: '#D2B48C',     // Warmth, approachability, minimalism
  softCream: '#FFF8F0',      // Clean, bright, versatile
  copperMetallic: '#A9746E', // Luxury, elegance, warmth
  tanCamel: '#C8A27D',       // Friendly, natural, calm

  // New Gold Tones (for accents and luxury feel)
  richGold: '#D4AF37',       // A classic gold tone
  softGold: '#FFD700',       // Brighter, more vibrant gold
  bronze: '#CD7F32',         // A warm bronze

  // Semantic Colors (mapped to the palette for consistent usage)
  primary: '#5D3A1A',       // Main brand color (Chocolate Brown)
  secondary: '#3B2F2F',     // Deep Coffee for secondary elements/dark text
  accent: '#D4AF37',        // Rich Gold for strong accents, buttons, key highlights
  text: '#3B2F2F',          // Deep Coffee for general readable text
  textLight: '#5D3A1A',     // Chocolate Brown for less critical text or contrast
  background: '#FFF8F0',    // Soft Cream for main screen backgrounds
  backgroundLight: '#D2B48C', // Light Cocoa for lighter backgrounds/UI panels
  buttonPrimary: '#D4AF37', // Default for primary action buttons (Rich Gold)
  buttonSecondary: '#A9746E', // Default for secondary action buttons (Copper Metallic)

  // Utility colors (standard colors for common UI elements)
  white: '#FFFFFF',
  black: '#000000',
  grey: '#CCCCCC',
  lightGrey: '#EEEEEE',
  error: '#E74C3C',         // Standard red for error messages
  success: '#2ECC71',        // Standard green for success messages
  warning: '#F39C12',        // Standard orange for warning messages

  // --- Gradient Definitions ---
  // These are arrays of hex codes, explicitly typed for LinearGradient compatibility
  gradients: {
    primaryButton: ['#D4AF37', '#CD7F32'] as readonly ColorValue[], // Rich Gold to Bronze
    secondaryButton: ['#A9746E', '#5D3A1A'] as readonly ColorValue[], // Copper Metallic to Chocolate Brown
    backgroundOverlay: ['rgba(255,248,240,0.8)', 'rgba(210,180,140,0.5)'] as readonly ColorValue[],
    cardBackground: ['#FFF8F0', '#D2B48C'] as readonly ColorValue[],
    header: ['#5D3A1A', '#3B2F2F'] as readonly ColorValue[],
    logo: ['#FFD700', '#CD7F32'] as readonly ColorValue[], // Soft Gold to Bronze for logo highlights

    // Mapped gradients for the icon's visual style, using our chocolate/gold palette
    iconGradient1: ['#5D3A1A', '#C8A27D'] as readonly ColorValue[], // Primary (Chocolate Brown) to Tan Camel
    iconGradient2: ['#C8A27D', '#5D3A1A'] as readonly ColorValue[], // Tan Camel to Primary (Chocolate Brown)
    iconGradient3: ['#FFD700', '#D2B48C'] as readonly ColorValue[], // Soft Gold to Light Cocoa
  },
};