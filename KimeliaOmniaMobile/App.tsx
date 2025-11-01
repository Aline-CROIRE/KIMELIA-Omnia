// App.tsx
// This file is the entry point for your React Native application.
// It sets up global providers (Theme, Auth) and the main navigation.

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Correct way to import and enable react-native-screens for performance
import { enableScreens } from 'react-native-screens';
enableScreens();

// Import Google Fonts (Poppins for primary, Lato for secondary/body text)
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';

// Import global providers and the root navigation component
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigation from './src/navigation';

// Prevent the native splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Load the custom fonts for the application
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  // Callback to hide the splash screen once fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // While fonts are loading, return null to keep the splash screen visible
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // If fonts are loaded (or if there was a font error), render the main app structure
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* The root View covers the entire screen and manages the splash screen hiding */}
        <View style={styles.container} onLayout={onLayoutRootView}>
          <AppNavigation />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});