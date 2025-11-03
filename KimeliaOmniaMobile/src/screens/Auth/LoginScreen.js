import React, { useState, useContext } from 'react';
import {
  GradientBackground, // Changed from Container to GradientBackground
  Title,
  Input,
  GradientButton, // Using GradientButton
  GradientButtonBackground,
  ButtonText,
  LinkText,
  ErrorText,
  SuccessText, // For success messages
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
      // AuthContext handles navigation to AppStack on success
    } catch (e) {
      console.error("Login error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message;
      if (backendMessage === "Invalid credentials. Please check your email and password.") {
        setError("Invalid email or password. Please try again.");
      } else if (backendMessage === "Email is not verified. Please check your inbox for a verification email.") {
        setError("Your email is not verified. Please check your inbox for a verification email.");
      }
      else {
        setError(backendMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground> {/* Apply gradient background */}
      <KIMELIAOmniaLogo iconSize={80} textSize={28} />
      <Title style={{ marginTop: 30, color: COLORS.deepCoffee }}>Welcome Back!</Title>
      {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
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