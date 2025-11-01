// src/components/logo/KimeliaOmniaLogo.tsx
import React from 'react';
import { View, Text, ViewStyle, TextStyle, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext'; // Import useTheme and AppTheme

interface KimeliaOmniaLogoProps {
  iconSize?: number;
  textSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showTagline?: boolean;
}

const LogoContainer = styled(View)<{ theme: AppTheme }>`
  align-items: center;
  justify-content: center;
`;

const IconGradientWrapper = styled(LinearGradient)<{ size: number; theme: AppTheme }>`
  width: ${(props: { size: any; }) => props.size}px;
  height: ${(props: { size: any; }) => props.size}px;
  border-radius: ${(props: { size: number; }) => props.size / 2}px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props: { theme: { metrics: { smallMargin: any; }; }; }) => props.theme.metrics.smallMargin}px;
`;

const IconText = styled(Text)<{ size: number; theme: AppTheme }>`
  font-weight: bold;
  font-size: ${(props: { size: number; }) => props.size * 0.6}px;
  color: ${(props: { theme: { colors: { white: any; }; }; }) => props.theme.colors.white};
`;

const BrandName = styled(Text)<{ size: number; theme: AppTheme }>`
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.5px;
  font-size: ${(props: { size: any; }) => props.size}px;
  font-family: ${(props: { theme: { fonts: { logo: any; }; }; }) => props.theme.fonts.logo};
  color: ${(props: { theme: { colors: { primary: any; }; }; }) => props.theme.colors.primary};
`;

const Tagline = styled(Text)<{ theme: AppTheme }>`
  text-align: center;
  margin-top: ${(props: { theme: { metrics: { smallMargin: any; }; }; }) => props.theme.metrics.smallMargin}px;
  font-family: ${(props: { theme: { fonts: { secondary: any; }; }; }) => props.theme.fonts.secondary};
  font-size: ${(props: { theme: { fontSizes: { regular: any; }; }; }) => props.theme.fontSizes.regular}px;
  color: ${(props: { theme: { colors: { textLight: any; }; }; }) => props.theme.colors.textLight};
`;

const KimeliaOmniaLogo: React.FC<KimeliaOmniaLogoProps> = ({
  iconSize = 60,
  textSize = 28,
  style,
  textStyle,
  showTagline = false,
}) => {
  const theme = useTheme(); // Use useTheme hook to get the theme

  return (
    <LogoContainer style={style}>
      <IconGradientWrapper
        colors={theme.colors.gradients.logo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        size={iconSize}
      >
        <IconText size={iconSize}>KO</IconText>
      </IconGradientWrapper>

      <BrandName size={textSize} style={textStyle}>
        KIMELIA Omnia
      </BrandName>

      {showTagline && (
        <Tagline>
          Your World, Organized Intelligently.
        </Tagline>
      )}
    </LogoContainer>
  );
};

export default KimeliaOmniaLogo;