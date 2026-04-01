import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';


import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold, 
  Poppins_700Bold,      
} from '@expo-google-fonts/poppins';
import {
  Lato_400Regular,      
  Lato_700Bold,         secondary text

import { LoadingIndicator, GradientBackground } from './src/components/StyledComponents';
import { GRADIENTS } from './src/constants'; // Needed for GradientBackground colors

export default function App() {
  const [fontsLoaded] = useFonts({
    p
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,

   
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    
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