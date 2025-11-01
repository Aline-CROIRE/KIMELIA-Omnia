// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen'; // Import the new WelcomeScreen
import { useTheme } from '../contexts/ThemeContext';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onAuthenticate: () => void;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onAuthenticate }) => {
  const theme = useTheme();

  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login">
        {(props: NativeStackScreenProps<AuthStackParamList, 'Login'>) =>
          <LoginScreen {...props} onLoginSuccess={onAuthenticate} />
        }
      </AuthStack.Screen>
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;