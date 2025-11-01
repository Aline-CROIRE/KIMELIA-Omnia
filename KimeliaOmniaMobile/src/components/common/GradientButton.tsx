// src/components/common/GradientButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: readonly ColorValue[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  disabled?: boolean;
}

// Explicitly type props for each styled component
const StyledButtonContainer = styled(TouchableOpacity)<{ isDisabled: boolean }>`
  border-radius: ${(props: { theme: AppTheme }) => props.theme.metrics.borderRadius}px;
  overflow: hidden;
  margin-vertical: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  width: 80%;
  opacity: ${(props: { isDisabled: boolean }) => (props.isDisabled ? 0.6 : 1)};
`;

const StyledGradientOverlay = styled(LinearGradient)`
  padding-vertical: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  padding-horizontal: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
  align-items: center;
  justify-content: center;
`;

const StyledButtonText = styled(Text)`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.primaryBold};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.large}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.white};
  font-weight: bold;
`;

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors,
  style,
  textStyle,
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 1 },
  disabled = false,
}) => {
  const theme = useTheme();

  const finalColors = colors || theme.colors.gradients.primaryButton;

  return (
    <StyledButtonContainer style={style} onPress={onPress} disabled={disabled} isDisabled={disabled}>
      <StyledGradientOverlay
        colors={finalColors}
        start={startPoint}
        end={endPoint}
      >
        <StyledButtonText style={textStyle}>{title}</StyledButtonText>
      </StyledGradientOverlay>
    </StyledButtonContainer>
  );
};

export default GradientButton;