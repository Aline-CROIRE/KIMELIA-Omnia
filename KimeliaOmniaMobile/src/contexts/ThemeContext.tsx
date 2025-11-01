// src/contexts/ThemeContext.tsx
// This file defines the Theme Context for the application, providing access to styling constants (colors, fonts, metrics).
// It also integrates with styled-components' ThemeProvider.

import React, { createContext, useContext, ReactNode } from 'react';
import { theme } from '../styles/theme'; // Import the defined theme object
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'; // Styled Components' ThemeProvider

// Define the type for the application theme for TypeScript inference
export type AppTheme = typeof theme;

// Create a React Context for the theme
const ThemeContext = createContext<AppTheme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// ThemeProvider component to wrap the entire application
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {/* Also wrap with styled-components' ThemeProvider to make theme available to styled components */}
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to easily access the theme in any functional component (for non-styled-components or logic)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};