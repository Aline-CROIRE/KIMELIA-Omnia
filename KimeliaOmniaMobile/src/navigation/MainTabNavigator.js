import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import the module stacks
import HomeScreen from '../screens/App/HomeScreen'; // We can keep Home as a simple tab, or wrap it in its own stack
import PlannerStackScreen from './PlannerStack'; // Import the new PlannerStack

import { COLORS } from '../constants';

const Tab = createBottomTabNavigator();

// Helper to determine tab bar visibility based on current route
const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  // Hide tab bar for specific detail/form screens *within their respective stacks*
  // For nested navigators, getFocusedRouteNameFromRoute will give the name of the *innermost* focused screen
  const hideOnScreens = ['TaskForm', 'TaskDetail', 'EventForm', 'EventDetail'];
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
          fontFamily: COLORS.secondary,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab" // A simple home tab for a personalized overview
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PlannerTab" // This tab now represents the entire Planner module
        component={PlannerStackScreen} // Renders the PlannerStackNavigator
        options={({ route }) => ({
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
          // Apply dynamic visibility based on the focused screen INSIDE PlannerStack
          tabBarStyle: { display: getTabBarVisibility(route) },
        })}
      />
      {/* Add placeholders for other modules */}
      <Tab.Screen
        name="CommunicatorTab"
        component={HomeScreen} // Placeholder for Communicator module's stack
        options={{
          title: 'Communicator',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CoachTab"
        component={HomeScreen} // Placeholder for Coach module's stack
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="run" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkspaceTab"
        component={HomeScreen} // Placeholder for Workspace module's stack
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