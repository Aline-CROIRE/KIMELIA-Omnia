// src/navigation/index.tsx
import React, { useState, createContext, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { NavigationContainer, Theme as NavigationTheme, DefaultTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native'; // Ensure Text and StyleSheet are imported
import AuthNavigator from './AuthNavigator';
import MainAppNavigator from './MainAppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import KimeliaOmniaLogo from '../components/logo/KimeliaOmniaLogo';
// Correct import path for AuthProvider and useAuth
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AppNavigation: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const theme = useTheme();

  // console.log('AppNavigation - Rendering. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  const customNavigationTheme: NavigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.backgroundLight,
      text: theme.colors.text,
      border: theme.colors.grey,
      notification: theme.colors.accent,
    },
  };

  if (isLoading) {
    // console.log('AppNavigation - Displaying loading screen.');
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <KimeliaOmniaLogo iconSize={80} textSize={36} showTagline={true} />
        {/* CONFIRMED: This text is correctly wrapped in <Text> */}
        <Text style={{ marginTop: theme.metrics.doubleBaseMargin, fontFamily: theme.fonts.secondary, color: theme.colors.textLight }}>
          Loading your world...
        </Text>
      </View>
    );
  }

  // console.log('AppNavigation - Loading finished. isAuthenticated:', isAuthenticated);
  return (
    <NavigationContainer theme={customNavigationTheme}>
      {isAuthenticated ? (
        <MainAppNavigator onLogout={logout} />
      ) : (
        <AuthNavigator onAuthenticate={() => { /* No-op: LoginScreen will call useAuth().login directly */ }} />
      )}
    </NavigationContainer>
  );
};

export default AppNavigation;