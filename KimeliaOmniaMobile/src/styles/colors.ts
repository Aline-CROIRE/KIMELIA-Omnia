// src/styles/colors.ts
import { ColorValue } from 'react-native'; // Import ColorValue from react-native

export const colors = {
  // Core Chocolate Palette
  chocolateBrown: '#5D3A1A',
  deepCoffee: '#3B2F2F',
  lightCocoa: '#D2B48C',
  softCream: '#FFF8F0',
  copperMetallic: '#A9746E',
  tanCamel: '#C8A27D',

  // New Gold Tones
  richGold: '#D4AF37',
  softGold: '#FFD700',
  bronze: '#CD7F32',

  // Semantic Colors
  primary: '#5D3A1A',
  secondary: '#3B2F2F',
  accent: '#D4AF37',
  text: '#3B2F2F',
  textLight: '#5D3A1A', // Renamed from lightText to textLight to match usage
  background: '#FFF8F0',
  backgroundLight: '#D2B48C', // Renamed from lightBackground to backgroundLight to match usage
  buttonPrimary: '#D4AF37',
  buttonSecondary: '#A9746E',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  grey: '#CCCCCC',
  lightGrey: '#EEEEEE',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',

  // --- Gradient Definitions ---
  // Ensure these are explicitly typed as readonly tuples for LinearGradient compatibility
  gradients: {
    primaryButton: ['#D4AF37', '#CD7F32'] as readonly ColorValue[],
    secondaryButton: ['#A9746E', '#5D3A1A'] as readonly ColorValue[],
    backgroundOverlay: ['rgba(255,248,240,0.8)', 'rgba(210,180,140,0.5)'] as readonly ColorValue[],
    cardBackground: ['#FFF8F0', '#D2B48C'] as readonly ColorValue[],
    header: ['#5D3A1A', '#3B2F2F'] as readonly ColorValue[],
    logo: ['#FFD700', '#CD7F32'] as readonly ColorValue[], // Soft Gold to Bronze for logo highlights
  },
};