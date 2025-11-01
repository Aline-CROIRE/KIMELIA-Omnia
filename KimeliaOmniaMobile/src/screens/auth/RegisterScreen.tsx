// src/screens/auth/RegisterScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, ScrollView, ColorValue } from 'react-native';
import styled from 'styled-components/native';
import { useTheme, AppTheme } from '../../contexts/ThemeContext';
import GradientButton from '../../components/common/GradientButton';
import KIMELIAOmniaLogoRN from '../../components/logo/KIMELIAOmniaLogoRN';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterCredentials } from '../../types/auth';
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

interface RegisterScreenProps extends NativeStackScreenProps<AuthStackParamList, 'Register'> {}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { register, isLoading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = useCallback(async () => {
    clearError();
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      const credentials: RegisterCredentials = { name, email, password };
      await register(credentials);
      Alert.alert('Registration Successful', 'Please check your email to verify your account.', [
        { text: 'OK', onPress: () => navigation.navigate('VerifyEmail', { email }) }
      ]);
    } catch (err) {
      Alert.alert('Registration Failed', error || 'Something went wrong. Please try again.');
    }
  }, [name, email, password, confirmPassword, register, clearError, navigation, error, isLoading]);

  React.useEffect(() => {
    if (error && !isLoading) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, isLoading, clearError]);

  return (
    <StyledScrollView contentContainerStyle={{ alignItems: 'center' }} theme={theme}>
      <ContentContainer theme={theme}>
        <KIMELIAOmniaLogoRN iconSize={60} textSize={28} />

        <Title theme={theme}>Join KIMELIA Omnia</Title>
        <Subtitle theme={theme}>Organize your world intelligently.</Subtitle>

        <StyledTextInput
          theme={theme}
          placeholder="Full Name"
          placeholderTextColor={theme.colors.textLight as ColorValue}
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          editable={!isLoading}
        />
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
        <StyledTextInput
          theme={theme}
          placeholder="Confirm Password"
          placeholderTextColor={theme.colors.textLight as ColorValue}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginVertical: theme.metrics.doubleBaseMargin }} />
        ) : (
          <GradientButton
            title="Register"
            onPress={handleRegister}
            style={{ width: '90%', marginTop: theme.metrics.baseMargin }}
            disabled={isLoading}
          />
        )}

        <GradientButton
          title="Already have an account? Login"
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

export default RegisterScreen;