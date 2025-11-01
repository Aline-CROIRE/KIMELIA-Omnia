// src/screens/auth/WelcomeScreen.tsx
import React from 'react';
import styled from 'styled-components/native';
import { View, Text, StatusBar } from 'react-native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';
import GradientButton from '../../components/common/GradientButton';
import KIMELIAOmniaLogoRN from '../../components/logo/KIMELIAOmniaLogoRN';

const WelcomeContainer = styled(View)<{ theme: AppTheme }>`
  flex: 1;
  align-items: center;
  justify-content: space-around;
  /* FIXED: Re-introduced 'px' unit for padding as React Native expects it for this property */
  padding: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.background};
`;

const ContentWrapper = styled(View)<{ theme: AppTheme }>`
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const Tagline = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.secondary};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.large}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.text};
  text-align: center;
  margin-top: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
  line-height: ${(props: { theme: AppTheme }) => props.theme.fontSizes.large * 1.4};
`;

const CallToActionText = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.primary};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.regular}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.textLight};
  text-align: center;
  margin-top: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
`;

const ButtonGroup = styled(View)<{ theme: AppTheme }>`
  width: 100%;
  align-items: center;
  margin-top: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
`;

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <WelcomeContainer theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ContentWrapper theme={theme}>
        <KIMELIAOmniaLogoRN iconSize={80} textSize={36} />
        <Tagline theme={theme}>
          "Your World, Organized Intelligently."
        </Tagline>

        <CallToActionText theme={theme}>
          Unite your life and work with AI-powered efficiency.
          Start achieving your goals effortlessly.
        </CallToActionText>
      </ContentWrapper>

      <ButtonGroup theme={theme}>
        <GradientButton
          title="Get Started"
          onPress={() => navigation.navigate('Register')}
          style={{ width: '90%' }}
        />
        <GradientButton
          title="Already have an account? Login"
          colors={theme.colors.gradients.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          style={{ width: '90%', marginTop: theme.metrics.baseMargin }}
          textStyle={{ fontSize: theme.fontSizes.regular }}
        />
      </ButtonGroup>
    </WelcomeContainer>
  );
};

export default WelcomeScreen;