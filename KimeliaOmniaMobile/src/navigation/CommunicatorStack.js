import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

// Communicator Screens
import CommunicatorHomeScreen from '../screens/App/Communicator/CommunicatorHomeScreen';
import MessageListScreen from '../screens/App/Communicator/MessageListScreen';
import MessageDetailScreen from '../screens/App/Communicator/MessageDetailScreen';
import MessageFormScreen from '../screens/App/Communicator/MessageFormScreen';

const CommunicatorStack = createNativeStackNavigator();

const CommunicatorStackScreen = () => {
  return (
    <CommunicatorStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.chocolateBrown },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: COLORS.softCream }, // Default background, gradients will override
      }}
    >
      <CommunicatorStack.Screen
        name="CommunicatorHome"
        component={CommunicatorHomeScreen}
        options={{ headerShown: false }} // No header for the module's own dashboard
      />
      <CommunicatorStack.Screen name="MessageList" component={MessageListScreen} options={{ title: 'My Messages' }} />
      <CommunicatorStack.Screen name="MessageDetail" component={MessageDetailScreen} options={({ route }) => ({ title: route.params?.messageSubject || 'Message Details' })} />
      <CommunicatorStack.Screen name="MessageForm" component={MessageFormScreen} options={({ route }) => ({ title: route.params?.messageId ? 'Edit Message' : 'Create Message' })} />

      {/* Add more communicator-related screens here (e.g., AI chat, Email summary config) */}
    </CommunicatorStack.Navigator>
  );
};

export default CommunicatorStackScreen;