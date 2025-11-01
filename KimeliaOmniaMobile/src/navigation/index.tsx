// src/navigation/index.tsx
import React, { useState, createContext, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { NavigationContainer, Theme as NavigationTheme, DefaultTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native'; // Ensure Text is imported
import AuthNavigator from './AuthNavigator';
import MainAppNavigator from './MainAppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import KIMELIAOmniaLogoRN from '../components/logo/KIMELIAOmniaLogoRN';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AppNavigation: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const theme = useTheme();

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
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <KIMELIAOmniaLogoRN iconSize={80} textSize={36} showTagline={true} />
        {/* CONFIRMED: Text wrapped */}
        <Text style={{ marginTop: theme.metrics.doubleBaseMargin, fontFamily: theme.fonts.secondary, color: theme.colors.textLight }}>
          Loading your world...
        </Text>
      </View>
    );
  }

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