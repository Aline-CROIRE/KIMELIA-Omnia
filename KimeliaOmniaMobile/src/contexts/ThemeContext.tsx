// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { theme, AppTheme } from '../styles/theme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native'; // Import Styled Components' ThemeProvider

// Create a context for the theme (still useful for non-styled-components or for hook access)
const ThemeContext = createContext<AppTheme | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Our custom ThemeProvider component to wrap your app
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}> {/* Wrap with Styled Components' ThemeProvider */}
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme in any component (for non-styled-components access or specific logic)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export AppTheme for styled-components declarations
export { AppTheme };