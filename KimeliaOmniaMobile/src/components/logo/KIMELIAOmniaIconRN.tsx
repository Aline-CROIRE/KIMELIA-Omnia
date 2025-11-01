// src/components/logo/KIMELIAOmniaIconRN.tsx
// Renders the KIMELIA Omnia SVG icon using react-native-svg, adapted for React Native styling.

import React from 'react';
import styled from 'styled-components/native';
import { Svg, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';
import { View } from 'react-native';

interface KIMELIAOmniaIconRNProps {
  size?: number; // Size in logical pixels (dp)
}

// Styled component for the icon wrapper with explicit props typing
const IconWrapper = styled(View)<{ size: number; theme: AppTheme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props: { size: number; theme: AppTheme }) => props.size}px;
  height: ${(props: { size: number; theme: AppTheme }) => props.size}px;
  /* Removed 'overflow: visible;' as it's not a valid style property for View in React Native's styled-components context.
     SVG overflow is typically handled by its own viewBox. */
`;

const KIMELIAOmniaIconRN: React.FC<KIMELIAOmniaIconRNProps> = ({ size = 60 }) => {
  const theme = useTheme();

  // Generate unique IDs for gradients to prevent conflicts if multiple icons are on screen
  // Using a combination of timestamp and random string for robust uniqueness.
  const uniquePrefix = React.useMemo(() => `svg-${Date.now()}-${Math.random().toString(36).substring(7)}`, []);

  const gradientId1 = `${uniquePrefix}-gradient1`;
  const gradientId2 = `${uniquePrefix}-gradient2`;
  const gradientId3 = `${uniquePrefix}-gradient3`;

  return (
    <IconWrapper size={size} theme={theme}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
      >
        <Defs>
          {/* Linear gradients for icon paths, using theme colors */}
          <LinearGradient id={gradientId1} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.gradients.iconGradient1[0] as string} />
            <Stop offset="100%" stopColor={theme.colors.gradients.iconGradient1[1] as string} />
          </LinearGradient>

          <LinearGradient id={gradientId2} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.gradients.iconGradient2[0] as string} />
            <Stop offset="100%" stopColor={theme.colors.gradients.iconGradient2[1] as string} />
          </LinearGradient>

          <LinearGradient id={gradientId3} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.gradients.iconGradient3[0] as string} />
            <Stop offset="100%" stopColor={theme.colors.gradients.iconGradient3[1] as string} />
          </LinearGradient>
        </Defs>

        {/* SVG paths representing the icon design */}
        <Path
          d="M 20 50 C 10 30, 30 10, 50 10 C 70 10, 90 30, 80 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 20 50 Z"
          stroke={`url(#${gradientId1})`} // Apply gradient
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        <Path
          d="M 25 75 Q 50 25 75 75"
          stroke={`url(#${gradientId2})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        <Path
          d="M 35 25 Q 50 75 65 25"
          stroke={`url(#${gradientId1})`} // Re-using gradient1
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

         {/* Central circle element */}
         <Circle cx="50" cy="50" r="8" fill={theme.colors.softGold} opacity="0.8" />
      </Svg>
    </IconWrapper>
  );
};

export default KIMELIAOmniaIconRN;