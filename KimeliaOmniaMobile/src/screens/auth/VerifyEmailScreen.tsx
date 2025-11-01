// src/screens/auth/VerifyEmailScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, ScrollView, ColorValue } from 'react-native';
import styled from 'styled-components/native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';
import GradientButton from '../../components/common/GradientButton';
import KimeliaOmniaLogo from '../../components/logo/KimeliaOmniaLogo';
// CORRECT: Import useAuth from its new location
import { useAuth } from '../../contexts/AuthContext';
import { RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

// Define styled components with explicit theme typing
const StyledScrollView = styled(ScrollView)<{ theme: AppTheme }>`
  flex-grow: 1;
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.background};
`;

const ContentContainer = styled(View)<{ theme: AppTheme }>`
  width: 100%;
  max-width: 400px;
  align-items: center;
  padding-horizontal: ${(props: { theme: AppTheme }) => props.theme.metrics.horizontalPadding}px;
  padding-vertical: 40px;
  justify-content: center;
`;

const Title = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.primaryBold};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.xxl}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.primary};
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.smallMargin}px;
  margin-top: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
`;

const Subtitle = styled(Text)<{ theme: AppTheme }>`
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.secondary};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.large}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.textLight}; // Corrected property name
  text-align: center;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.doubleBaseMargin}px;
  padding-horizontal: ${(props: { theme: AppTheme }) => props.theme.metrics.horizontalPadding}px;
`;

const StyledTextInput = styled(TextInput)<{ theme: AppTheme }>`
  width: 100%;
  height: 50px;
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.white};
  border-radius: ${(props: { theme: AppTheme }) => props.theme.metrics.borderRadius}px;
  border-width: 1px;
  border-color: ${(props: { theme: AppTheme }) => props.theme.colors.lightGrey};
  padding-horizontal: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.secondary};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.medium}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.text};
  /* FIX: Removed problematic shadow properties from here */
  elevation: 1; /* Keep elevation for Android shadow */
`;

type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

interface VerifyEmailScreenProps extends NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'> {
  route: VerifyEmailScreenRouteProp;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { verifyEmail, isLoading, error, clearError } = useAuth();

  const [verificationCode, setVerificationCode] = useState('');
  const { email } = route.params || {};

  const handleVerify = useCallback(async () => {
    clearError();
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    try {
      await verifyEmail(verificationCode);
      Alert.alert('Email Verified', 'Your email has been successfully verified! You can now log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Verification Failed', error || 'Invalid or expired code. Please try again.');
    }
  }, [verificationCode, verifyEmail, clearError, navigation, email, error, isLoading]);

  React.useEffect(() => {
    if (error && !isLoading) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, isLoading, clearError]);

  return (
    <StyledScrollView contentContainerStyle={{ alignItems: 'center' }} theme={theme}>
      <ContentContainer theme={theme}>
        <KimeliaOmniaLogo iconSize={60} textSize={28} />

        <Title theme={theme}>Verify Your Email</Title>
        <Subtitle theme={theme}>
          We sent a verification code to {email || 'your email address'}. Please enter it below.
        </Subtitle>

        <StyledTextInput
          theme={theme}
          placeholder="Verification Code"
          placeholderTextColor={theme.colors.textLight as ColorValue} // Corrected property name
          keyboardType="number-pad"
          autoCapitalize="none"
          value={verificationCode}
          onChangeText={setVerificationCode}
          editable={!isLoading}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginVertical: theme.metrics.doubleBaseMargin }} />
        ) : (
          <GradientButton
            title="Verify Email"
            onPress={handleVerify}
            style={{ width: '90%', marginTop: theme.metrics.baseMargin }}
            disabled={isLoading}
          />
        )}

        <GradientButton
          title="Back to Login"
          colors={theme.colors.gradients.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          style={{ width: '90%', marginTop: theme.metrics.baseMargin }}
          textStyle={{ fontSize: theme.fontSizes.regular }}
          disabled={isLoading}
        />
      </ContentContainer>
    </StyledScrollView>
  );
};

export default VerifyEmailScreen;