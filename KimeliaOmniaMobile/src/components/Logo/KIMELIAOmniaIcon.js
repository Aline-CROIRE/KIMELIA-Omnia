import React, { useId } from 'react';
import styled from 'styled-components/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../constants';

const IconWrapper = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  /* CORRECTED: Removed 'px' and directly use the number */
  width: ${(props) => props.size || 60};
  height: ${(props) => props.size || 60};
`;

const KIMELIAOmniaIcon = ({ size }) => {
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
          <LinearGradient id={gradientBrownCopperId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.chocolateBrown} />
            <Stop offset="100%" stopColor={COLORS.copper} />
          </LinearGradient>

          <LinearGradient id={gradientCopperGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.copper} />
            <Stop offset="100%" stopColor={COLORS.gold} />
          </LinearGradient>

          <LinearGradient id={gradientLightCocoaDeepCoffeeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.lightCocoa} />
            <Stop offset="100%" stopColor={COLORS.deepCoffee} />
          </LinearGradient>
        </Defs>

        <Path
          d="M 20 50 C 10 30, 30 10, 50 10 C 70 10, 90 30, 80 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 20 50 Z"
          stroke={`url(#${gradientBrownCopperId})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        <Path
          d="M 25 75 Q 50 25 75 75"
          stroke={`url(#${gradientCopperGoldId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        <Path
          d="M 35 25 Q 50 75 65 25"
          stroke={`url(#${gradientBrownCopperId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        <Circle cx="50" cy="50" r="8" fill={COLORS.gold} opacity="0.8" />
      </Svg>
    </IconWrapper>
  );
};

export default KIMELIAOmniaIcon;