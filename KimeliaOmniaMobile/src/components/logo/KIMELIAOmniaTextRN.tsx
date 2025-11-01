// src/components/logo/KIMELIAOmniaTextRN.tsx
// Renders the "KIMELIA Omnia" text part of the logo, adapted for React Native styling.

import React from 'react';
import styled from 'styled-components/native';
import { Text, View } from 'react-native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';

interface KIMELIAOmniaTextRNProps {
  fontSize?: number; // Base font size for the text, in dp
}

// Styled component for the wrapper View, containing the two text spans
const TextWrapper = styled(View)<{ theme: AppTheme }>`
  display: flex;
  flex-direction: row; /* Arrange "KIMELIA" and "Omnia" horizontally */
  align-items: baseline; /* Align text by their baseline */
`;

// Styled component for the "KIMELIA" part of the text
const KIMELIASpan = styled(Text)<{ fontSize: number; theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.logo};
  font-weight: bold; /* Maps to 600 weight */
  color: ${(props: { theme: AppTheme }) => props.theme.colors.text}; /* Deep Coffee for KIMELIA */
  /* FIXED: Re-introduced 'px' unit for font-size as React Native expects it for Text components */
  font-size: ${(props: { fontSize: number }) => props.fontSize}px;
  /* FIXED: Re-introduced 'px' for letter-spacing if it was removed, or confirm it works unitless (often does) */
  letter-spacing: -0.5px; /* Use 'px' for letter-spacing if warned, otherwise keep unitless */
  margin-right: 2px; /* Small space between "KIMELIA" and "Omnia" */
  /* FIXED: Re-introduced 'px' unit for line-height as React Native expects it for Text components */
  line-height: ${(props: { fontSize: number }) => props.fontSize * 1.2}px; /* Re-introduced 'px' for line-height */
`;

// Styled component for the "Omnia" part of the text
const OmniaSpan = styled(Text)<{ fontSize: number; theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.logo};
  font-weight: bold; /* Maps to 700 weight */
  color: ${(props: { theme: AppTheme }) => props.theme.colors.accent}; /* Rich Gold for Omnia */
  /* FIXED: Re-introduced 'px' unit for font-size as React Native expects it for Text components */
  font-size: ${(props: { fontSize: number }) => props.fontSize * 0.9}px; /* Slightly smaller size for Omnia */
  /* FIXED: Re-introduced 'px' for letter-spacing if it was removed, or confirm it works unitless (often does) */
  letter-spacing: -0.2px; /* Use 'px' for letter-spacing if warned, otherwise keep unitless */
  /* FIXED: Re-introduced 'px' unit for line-height as React Native expects it for Text components */
  line-height: ${(props: { fontSize: number }) => props.fontSize * 1.2}px; /* Re-introduced 'px' for line-height */
`;

const KIMELIAOmniaTextRN: React.FC<KIMELIAOmniaTextRNProps> = ({ fontSize = 28 }) => {
  const theme = useTheme();
  return (
    <TextWrapper theme={theme}>
      <KIMELIASpan fontSize={fontSize} theme={theme}>KIMELIA</KIMELIASpan>
      <OmniaSpan fontSize={fontSize} theme={theme}>Omnia</OmniaSpan>
    </TextWrapper>
  );
};

export default KIMELIAOmniaTextRN;