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
import { COLORS, GRADIENTS } from '../../constants';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      setSuccessMessage('Registration successful! Please verify your email to log in.');
      Alert.alert(
        'Registration Successful',
        'Your account has been created. A verification email has been sent. Please verify your email to log in.'
      );
      navigation.navigate('Login');
    } catch (e) {
      console.error("Registration error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message || 'Registration failed. Please try again.';
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KIMELIAOmniaLogo iconSize={80} textSize={28} />
      <Title style={{ marginTop: 30, color: COLORS.deepCoffee }}>Create Account</Title>
      {successMessage && <SuccessText>{successMessage}</SuccessText>}
      {error && <ErrorText>{error}</ErrorText>}
      <Input
        placeholder="Full Name"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
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
      <GradientButton onPress={handleRegister} disabled={loading}>
        <GradientButtonBackground colors={GRADIENTS.goldAccent}>
          {loading ? <LoadingIndicator size="small" color="#fff" /> : <ButtonText>Register</ButtonText>}
        </GradientButtonBackground>
      </GradientButton>
      <LinkText onPress={() => navigation.navigate('Login')}>
        Already have an account? Login here.
      </LinkText>
    </GradientBackground>
  );
};

export default RegisterScreen;
