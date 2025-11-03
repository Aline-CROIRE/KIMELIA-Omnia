import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

// Planner Screens
import PlannerHomeScreen from '../screens/App/Planner/PlannerHomeScreen';
import TaskListScreen from '../screens/App/Planner/TaskListScreen';
import TaskDetailScreen from '../screens/App/Planner/TaskDetailScreen';
import TaskFormScreen from '../screens/App/Planner/TaskFormScreen';
import EventListScreen from '../screens/App/Planner/Events/EventListScreen';
import EventDetailScreen from '../screens/App/Planner/Events/EventDetailScreen';
import EventFormScreen from '../screens/App/Planner/Events/EventFormScreen';

const PlannerStack = createNativeStackNavigator();

const PlannerStackScreen = () => {
  return (
    <PlannerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.chocolateBrown },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: COLORS.softCream },
      }}
    >
      <PlannerStack.Screen
        name="PlannerHome"
        component={PlannerHomeScreen}
        options={{ headerShown: false }} // No header for the module's own dashboard
      />
      <PlannerStack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'My Tasks' }} />
      <PlannerStack.Screen name="TaskDetail" component={TaskDetailScreen} options={({ route }) => ({ title: route.params?.taskTitle || 'Task Details' })} />
      <PlannerStack.Screen name="TaskForm" component={TaskFormScreen} options={({ route }) => ({ title: route.params?.taskId ? 'Edit Task' : 'Create Task' })} />

      <PlannerStack.Screen name="EventList" component={EventListScreen} options={{ title: 'My Events' }} />
      <PlannerStack.Screen name="EventDetail" component={EventDetailScreen} options={({ route }) => ({ title: route.params?.eventTitle || 'Event Details' })} />
      <PlannerStack.Screen name="EventForm" component={EventFormScreen} options={({ route }) => ({ title: route.params?.eventId ? 'Edit Event' : 'Create Event' })} />
    </PlannerStack.Navigator>
  );
};

export default PlannerStackScreen;