// src/components/logo/KIMELIAOmniaLogoRN.tsx
// Combines the native SVG icon and native text components to form the complete KIMELIA Omnia logo.

import React from 'react';
import styled from 'styled-components/native';
import { View, ViewStyle, TextStyle, Text } from 'react-native';
import KIMELIAOmniaIconRN from './KIMELIAOmniaIconRN';
import KIMELIAOmniaTextRN from './KIMELIAOmniaTextRN';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';

interface KIMELIAOmniaLogoRNProps {
  iconSize?: number; // Size for the icon part
  textSize?: number; // Size for the text part
  style?: ViewStyle; // Custom styling for the main logo container
  textStyle?: TextStyle; // Custom styling for the text part (though typically handled by KIMELIAOmniaTextRN)
  showTagline?: boolean; // Option to show the tagline (if implemented internally, or passed as children)
}

// Styled component for the main logo container
const LogoContainer = styled(View)<{ theme: AppTheme }>`
  display: flex;
  flex-direction: row; /* Icon and text side-by-side */
  align-items: center;
  justify-content: center;
  /* FIXED: Removed 'px' unit from gap and converted all line comments to block comments */
  gap: ${(props: { theme: AppTheme }) => props.theme.metrics.smallMargin}; /* Small space between icon and text */
`;

const KIMELIAOmniaLogoRN: React.FC<KIMELIAOmniaLogoRNProps> = ({
  iconSize = 60,
  textSize = 28,
  style,
  textStyle,
  showTagline = false, // Default to not show tagline; screens can decide
}) => {
  const theme = useTheme(); // Access the current theme

  return (
    <LogoContainer style={style} theme={theme}>
      <KIMELIAOmniaIconRN size={iconSize} />
      {/* Pass textStyle if needed, but KIMELIAOmniaTextRN handles most styling internally */}
      <KIMELIAOmniaTextRN fontSize={textSize} />
      {/* If a tagline is desired directly within the logo component,
          it would be wrapped in a <Text> component here, styled via theme.
          For now, it's typically handled by the parent screen. */}
      {/* {showTagline && (
        <Text style={{ fontFamily: theme.fonts.secondary, fontSize: theme.fontSizes.regular, color: theme.colors.textLight }}>
          Your World, Organized Intelligently.
        </Text>
      )} */}
    </LogoContainer>
  );
};

export default KIMELIAOmniaLogoRN;