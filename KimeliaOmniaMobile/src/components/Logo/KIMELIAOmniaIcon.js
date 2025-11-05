// src/components/Logo/KIMELIAOmniaIcon.js
import React, { useId } from 'react';
import styled from 'styled-components/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../constants';

const IconWrapper = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.size || 60}px;
  height: ${(props) => props.size || 60}px;
`;

const KIMELIAOmniaIcon = ({ size = 60 }) => {
  const uniquePrefix = useId();

  const gradientBrownCopperId = `${uniquePrefix}-gradientBrownCopper`;
  const gradientCopperGoldId = `${uniquePrefix}-gradientCopperGold`;
  const gradientLightCocoaDeepCoffeeId = `${uniquePrefix}-gradientLightCocoaDeepCoffee`;

  return (
    <IconWrapper size={size}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
      >
        <Defs>
          {/* Brown to Copper gradient */}
          <LinearGradient id={gradientBrownCopperId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.chocolateBrown} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.copper} stopOpacity="1" />
          </LinearGradient>

          {/* Copper to Gold gradient */}
          <LinearGradient id={gradientCopperGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.copper} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.gold} stopOpacity="1" />
          </LinearGradient>

          {/* Light Cocoa to Deep Coffee gradient */}
          <LinearGradient id={gradientLightCocoaDeepCoffeeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.lightCocoa} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.deepCoffee} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Outer flowing organic shape - represents interconnected ecosystem */}
        <Path
          d="M 20 50 C 10 30, 30 10, 50 10 C 70 10, 90 30, 80 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 20 50 Z"
          stroke={`url(#${gradientBrownCopperId})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upper curve - represents upward growth and progress */}
        <Path
          d="M 25 75 Q 50 25 75 75"
          stroke={`url(#${gradientCopperGoldId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lower inverted curve - represents balance and harmony */}
        <Path
          d="M 35 25 Q 50 75 65 25"
          stroke={`url(#${gradientBrownCopperId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Center core - represents the unified center of all activities */}
        <Circle cx="50" cy="50" r="8" fill={COLORS.gold} opacity="0.8" />
        
        {/* Inner highlight for depth */}
        <Circle cx="50" cy="50" r="4" fill={COLORS.gold} opacity="0.6" />
      </Svg>
    </IconWrapper>
  );
};

export default KIMELIAOmniaIcon;

