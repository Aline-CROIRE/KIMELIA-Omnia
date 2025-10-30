// src/styles/metrics.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const metrics = {
  screenWidth: width,
  screenHeight: height,
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallMargin: 5,
  horizontalPadding: 15,
  verticalPadding: 10,
  borderRadius: 8,
  cardElevation: 2, // For Android shadow
  shadow: { // For iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
};