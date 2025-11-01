// src/screens/auth/LoginScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, ScrollView, ColorValue } from 'react-native';
import styled from 'styled-components/native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';
import GradientButton from '../../components/common/GradientButton';
import KimeliaOmniaLogoRN from '../../components/logo/KIMELIAOmniaLogoRN';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';
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
  color: ${(props: { theme: AppTheme }) => props.theme.colors.textLight};
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
  /* FIXED: Re-introduced 'px' unit for padding-horizontal and margin-bottom */
  padding-horizontal: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.metrics.baseMargin}px;
  font-family: ${(props: { theme: AppTheme }) => props.theme.fonts.secondary};
  font-size: ${(props: { theme: AppTheme }) => props.theme.fontSizes.medium}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.text};
  elevation: 1;
`;

interface LoginScreenProps extends NativeStackScreenProps<AuthStackParamList, 'Login'> {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLoginSuccess }) => {
  const theme = useTheme();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    clearError();
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      onLoginSuccess();
    } catch (err) {
      Alert.alert('Login Failed', error || 'Something went wrong. Please try again.');
    }
  }, [email, password, login, clearError, onLoginSuccess, error, isLoading]);

  React.useEffect(() => {
    if (error && !isLoading) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, isLoading, clearError]);

  return (
    <StyledScrollView contentContainerStyle={{ alignItems: 'center' }} theme={theme}>
      <ContentContainer theme={theme}>
        <KimeliaOmniaLogoRN iconSize={70} textSize={32} showTagline={true} />

        <Title theme={theme}>Welcome Back!</Title>
        <Subtitle theme={theme}>Login to your KIMELIA Omnia account.</Subtitle>

        <StyledTextInput
          theme={theme}
          placeholder="Email"
          placeholderTextColor={theme.colors.textLight as ColorValue}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
        <StyledTextInput
          theme={theme}
          placeholder="Password"
          placeholderTextColor={theme.colors.textLight as ColorValue}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginVertical: theme.metrics.doubleBaseMargin }} />
        ) : (
          <GradientButton
            title="Login"
            onPress={handleLogin}
            style={{ width: '90%', marginTop: theme.metrics.baseMargin }}
            disabled={isLoading}
          />
        )}

        <GradientButton
          title="Don't have an account? Register"
          colors={theme.colors.gradients.secondaryButton}
          onPress={() => navigation.navigate('Register')}
          style={{ width: '90%', marginTop: theme.metrics.baseMargin }}
          textStyle={{ fontSize: theme.fontSizes.regular }}
          disabled={isLoading}
        />
      </ContentContainer>
    </StyledScrollView>
  );
};

export default LoginScreen;