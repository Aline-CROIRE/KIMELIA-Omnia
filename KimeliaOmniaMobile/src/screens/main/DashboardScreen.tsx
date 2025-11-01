// src/screens/main/DashboardScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';
import GradientButton from '../../components/common/GradientButton';
import KIMELIAOmniaLogoRN from '../../components/logo/KIMELIAOmniaLogoRN';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainAppStackParamList } from '../../navigation/MainAppNavigator';

const StyledContainer = styled(View)<{ theme: AppTheme }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  /* FIXED: Removed 'px' unit from padding */
  padding-horizontal: ${(props: { theme: AppTheme }) => props.theme.metrics.horizontalPadding};
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.backgroundLight};
`;

const Title = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.primaryBold};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.xl}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.primary};
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.smallMargin}px;
  text-align: center;
`;

const Subtitle = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.secondary};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.large}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.textLight};
  text-align: center;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
`;

const PlaceholderText = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.primary};
  color: ${(props: { theme: AppTheme }) => props.theme.colors.text};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.large}px;
  margin-vertical: 20px;
`;

interface DashboardScreenProps extends NativeStackScreenProps<MainAppStackParamList, 'Dashboard'> {
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const theme = useTheme();

  return (
    <StyledContainer theme={theme}>
      <KIMELIAOmniaLogoRN iconSize={50} textSize={24} showTagline={false} style={{ marginBottom: theme.metrics.doubleBaseMargin }} />

      <Title theme={theme}>Welcome to KIMELIA Omnia Dashboard!</Title>
      <Subtitle theme={theme}>Your World, Organized Intelligently.</Subtitle>

      <PlaceholderText theme={theme}>
        This is where your modules will come alive!
      </PlaceholderText>

      <GradientButton
        title="Logout"
        onPress={onLogout}
        colors={theme.colors.gradients.secondaryButton}
        style={{ width: '70%', marginTop: theme.metrics.doubleBaseMargin }}
        textStyle={{ fontSize: theme.fontSizes.regular }}
      />
    </StyledContainer>
  );
};

export default DashboardScreen;