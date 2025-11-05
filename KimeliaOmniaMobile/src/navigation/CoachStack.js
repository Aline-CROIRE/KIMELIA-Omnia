import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

// Coach Screens
import CoachHomeScreen from '../screens/App/Coach/CoachHomeScreen';
import GoalListScreen from '../screens/App/Coach/GoalList/GoalListScreen'; 
import GoalDetailScreen from '../screens/App/Coach/GoalList/GoalDetailScreen'; 
import GoalFormScreen from '../screens/App/Coach/GoalList/GoalFormScreen'; 
// Future: import LearningResource screens here

const CoachStack = createNativeStackNavigator();

const CoachStackScreen = () => {
  return (
    <CoachStack.Navigator
      // --- Explicitly setting initialRouteName to CoachHome ---
      initialRouteName="CoachHome" 
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.chocolateBrown },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: COLORS.softCream },
      }}
    >
      <CoachStack.Screen
        name="CoachHome"
        component={CoachHomeScreen}
        options={{ headerShown: false }} // No header for the module's own dashboard
      />
      <CoachStack.Screen name="GoalList" component={GoalListScreen} options={{ title: 'My Goals' }} />
      <CoachStack.Screen name="GoalDetail" component={GoalDetailScreen} options={({ route }) => ({ title: route.params?.goalTitle || 'Goal Details' })} />
      <CoachStack.Screen name="GoalForm" component={GoalFormScreen} options={({ route }) => ({ title: route.params?.goalId ? 'Edit Goal' : 'Create Goal' })} />

      {/* Future: Add Learning Resource screens here */}
    </CoachStack.Navigator>
  );
};

export default CoachStackScreen;