import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { LoadingIndicator, GradientBackground } from '../components/StyledComponents';
import { COLORS, GRADIENTS } from '../constants';

// --- Screens ---
// Auth Screens
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main App Tabs (which includes nested module stacks)
import MainTabNavigator from './MainTabNavigator';


const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: COLORS.softCream }
  }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppStackScreen = () => (
  <AppStack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.chocolateBrown },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: 'bold' },
    contentStyle: { backgroundColor: COLORS.softCream }
  }}>
    {/* MainTabNavigator is the primary content for authenticated users */}
    <AppStack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />

    {/* Any other global modals or screens that should *not* be part of the tab bar
        or any module's stack would go here. For now, we only have the tabs. */}
  </AppStack.Navigator>
);

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <GradientBackground colors={GRADIENTS.background}>
        <LoadingIndicator />
      </GradientBackground>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;