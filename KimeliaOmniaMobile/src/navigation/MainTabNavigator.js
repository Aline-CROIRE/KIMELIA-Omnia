import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import the module stacks/screens
import HomeScreen from '../screens/App/HomeScreen';
import PlannerStackScreen from './PlannerStack';
import CommunicatorStackScreen from './CommunicatorStack';
import CoachStackScreen from './CoachStack'; // CoachStack now includes LR screens
// import WorkspaceStackScreen from './WorkspaceStack'; // Still commented out for now

import { COLORS, FONTS } from '../constants';

const Tab = createBottomTabNavigator();

// Helper to determine tab bar visibility based on current route
const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  // Hide tab bar for specific detail/form screens *within their respective stacks*
  const hideOnScreens = [
    'TaskForm', 'TaskDetail', 'EventForm', 'EventDetail',
    'MessageForm', 'MessageDetail',
    'GoalForm', 'GoalDetail',
    'LearningResourceForm', 'LearningResourceDetail', // --- NEW: Add Learning Resource detail/form screens ---
    // 'ProjectForm', 'ProjectDetail', // Still commented out for now
  ];
  if (hideOnScreens.includes(routeName)) {
    return 'none'; // This hides the tab bar
  }
  return 'flex'; // Default to show
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // We will manage headers within the nested stack navigators
        tabBarActiveTintColor: COLORS.chocolateBrown,
        tabBarInactiveTintColor: COLORS.deepCoffee,
        tabBarStyle: {
          backgroundColor: COLORS.softCream,
          borderTopColor: COLORS.lightCocoa,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          display: getTabBarVisibility(route), // Dynamic visibility
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: FONTS.secondary,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PlannerTab"
        component={PlannerStackScreen}
        options={({ route }) => ({
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
          tabBarStyle: { display: getTabBarVisibility(route) },
        })}
      />
      <Tab.Screen
        name="CommunicatorTab"
        component={CommunicatorStackScreen}
        options={({ route }) => ({
          title: 'Communicator',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
          tabBarStyle: { display: getTabBarVisibility(route) },
        })}
      />
      <Tab.Screen
        name="CoachTab"
        component={CoachStackScreen}
        options={({ route }) => ({
          title: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="run" color={color} size={size} />
          ),
          tabBarStyle: { display: getTabBarVisibility(route) },
        })}
      />
      <Tab.Screen
        name="WorkspaceTab"
        component={HomeScreen} // Placeholder for Workspace module's stack (still)
        options={{
          title: 'Workspace',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FinanceTab"
        component={HomeScreen} // Placeholder for Finance module's stack
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bank-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;