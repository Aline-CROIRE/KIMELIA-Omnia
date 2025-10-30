// src/styles/typography.ts
import { Platform } from 'react-native';

export const fonts = {
  // Use the names provided by expo-google-fonts
  primary: Platform.select({
    ios: 'Poppins_400Regular', // Standard weight for body text
    android: 'Poppins_400Regular',
    default: 'Poppins_400Regular',
  }),
  primaryBold: Platform.select({
    ios: 'Poppins_700Bold', // Bold weight for headers/logo
    android: 'Poppins_700Bold',
    default: 'Poppins_700Bold',
  }),
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
  logo: Platform.select({
    ios: 'Poppins_700Bold', // Using bold Poppins for logo as specified earlier
    android: 'Poppins_700Bold',
    default: 'Poppins_700Bold',
  }),
  // You can also add Nunito Sans or Inter if needed for specific elements
  // nunito: Platform.select({ ios: 'NunitoSans_400Regular', android: 'NunitoSans_400Regular', default: 'NunitoSans_400Regular' }),
  // inter: Platform.select({ ios: 'Inter_400Regular', android: 'Inter_400Regular', default: 'Inter_400Regular' }),
};

export const fontSizes = {
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xl: 24,
  xxl: 32,
};