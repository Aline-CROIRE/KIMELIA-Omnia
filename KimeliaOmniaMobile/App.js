import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// --- NEW IMPORTS FOR FONTS ---
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold, // Recommended for logo font or bolder primary
  Poppins_700Bold,     // Recommended for main titles or bolder primary
} from '@expo-google-fonts/poppins';
import {
  Lato_400Regular,     // Recommended for regular body text (secondary)
  Lato_700Bold,        // Recommended for bolder secondary text
} from '@expo-google-fonts/lato';
// --- END NEW IMPORTS ---

// Import necessary Styled Components for the loading screen
import { LoadingIndicator, GradientBackground } from './src/components/StyledComponents';
import { GRADIENTS } from './src/constants'; // Needed for GradientBackground colors

export default function App() {
  const [fontsLoaded] = useFonts({
    // Poppins for primary and logo
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,

    // Lato for secondary body text
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    // Display a loading screen while fonts are loading
    return (
      <GradientBackground colors={GRADIENTS.background}>
        <LoadingIndicator />
      </GradientBackground>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}