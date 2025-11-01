// src/styles/metrics.ts
// Defines common spacing, padding, and size constants for consistent layout.

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const metrics = {
  screenWidth: width,
  screenHeight: height,

  // Base spacing units (can be scaled globally)
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallMargin: 5,

  // Standard padding for screens and components
  horizontalPadding: 15,
  verticalPadding: 10,

  // UI element dimensions
  borderRadius: 8, // Standard border radius for cards, buttons, inputs
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
  },

  // Shadow properties (for iOS; Android uses elevation)
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
};