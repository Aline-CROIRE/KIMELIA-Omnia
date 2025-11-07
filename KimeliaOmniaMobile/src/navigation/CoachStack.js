import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

// Coach Screens
import CoachHomeScreen from '../screens/App/Coach/CoachHomeScreen';
import GoalListScreen from '../screens/App/Coach/GoalList/GoalListScreen';
import GoalDetailScreen from '../screens/App/Coach/GoalList/GoalDetailScreen';
import GoalFormScreen from '../screens/App/Coach/GoalList/GoalFormScreen';
// --- NEW IMPORTS for Learning Resources ---
import LearningResourceListScreen from '../screens/App/Coach/LearningResource/LearningResourceListScreen';
import LearningResourceDetailScreen from '../screens/App/Coach/LearningResource/LearningResourceDetailScreen';
import LearningResourceFormScreen from '../screens/App/Coach/LearningResource/LearningResourceFormScreen';
// --- END NEW IMPORTS ---

const CoachStack = createNativeStackNavigator();

const CoachStackScreen = () => {
  return (
    <CoachStack.Navigator
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
        options={{ headerShown: false }}
      />
      <CoachStack.Screen name="GoalList" component={GoalListScreen} options={{ title: 'My Goals' }} />
      <CoachStack.Screen name="GoalDetail" component={GoalDetailScreen} options={({ route }) => ({ title: route.params?.goalTitle || 'Goal Details' })} />
      <CoachStack.Screen name="GoalForm" component={GoalFormScreen} options={({ route }) => ({ title: route.params?.goalId ? 'Edit Goal' : 'Create Goal' })} />

      {/* --- NEW ROUTES for Learning Resources --- */}
      <CoachStack.Screen name="LearningResourceList" component={LearningResourceListScreen} options={{ title: 'My Resources' }} />
      <CoachStack.Screen name="LearningResourceDetail" component={LearningResourceDetailScreen} options={({ route }) => ({ title: route.params?.resourceTitle || 'Resource Details' })} />
      <CoachStack.Screen name="LearningResourceForm" component={LearningResourceFormScreen} options={({ route }) => ({ title: route.params?.resourceId ? 'Edit Resource' : 'Add Resource' })} />
      {/* --- END NEW ROUTES --- */}
    </CoachStack.Navigator>
  );
};

export default CoachStackScreen;