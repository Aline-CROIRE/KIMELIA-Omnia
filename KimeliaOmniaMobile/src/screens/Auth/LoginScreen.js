import React, { useState, useContext } from 'react';
import { Alert } from 'react-native';
import {
  GradientBackground,
  Title,
  Input,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  LinkText,
  ErrorText,
  SuccessText,
  LoadingIndicator,
} from '../../components/StyledComponents';
import KIMELIAOmniaLogo from '../../components/Logo/KIMELIAOmniaLogo';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setError('');
    setSuccessMessage('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      console.error("Login error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message || 'Login failed. Please try again.';
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KIMELIAOmniaLogo iconSize={80} textSize={28} />
      <Title style={{ marginTop: 30, color: COLORS.deepCoffee }}>Welcome Back!</Title>
      {successMessage && <SuccessText>{successMessage}</SuccessText>}
      {error && <ErrorText>{error}</ErrorText>}
      <Input
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <GradientButton onPress={handleLogin} disabled={loading}>
        <GradientButtonBackground>
          {loading ? <LoadingIndicator size="small" color="#fff" /> : <ButtonText>Login</ButtonText>}
        </GradientButtonBackground>
      </GradientButton>
      <LinkText onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register here.
      </LinkText>
    </GradientBackground>
  );
};

export default LoginScreen;
