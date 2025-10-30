// src/navigation/MainAppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/main/DashboardScreen';
import { useTheme } from '../contexts/ThemeContext';

export type MainAppStackParamList = {
  Dashboard: undefined;
  Planner: undefined;
  Communicator: undefined;
};

const MainAppStack = createNativeStackNavigator<MainAppStackParamList>(); // CORRECTED: Typo fixed here

interface MainAppNavigatorProps {
  onLogout: () => void;
}

const MainAppNavigator: React.FC<MainAppNavigatorProps> = ({ onLogout }) => {
  const theme = useTheme();

  return (
    <MainAppStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontFamily: theme.fonts.primaryBold,
          fontSize: theme.fontSizes.large,
        },
        contentStyle: { backgroundColor: theme.colors.backgroundLight },
      }}
    >
      <MainAppStack.Screen name="Dashboard">
        {(props: NativeStackScreenProps<MainAppStackParamList, 'Dashboard'>) =>
          <DashboardScreen {...props} onLogout={onLogout} />
        }
      </MainAppStack.Screen>
    </MainAppStack.Navigator>
  );
};

export default MainAppNavigator;