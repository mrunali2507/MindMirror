import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS } from '../utils/helpers';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Reflect"
        component={ReflectionScreen}
        options={{
          tabBarLabel: 'Reflect',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="✍️" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="📊" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="👤" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple emoji-based tab icon (no icon library dependency)
function TabIcon({ emoji }) {
  return (
    <React.Fragment>
      {React.createElement(
        require('react-native').Text,
        { style: { fontSize: 20 } },
        emoji
      )}
    </React.Fragment>
  );
}

export default function AppNavigator({ isSignedIn }) {
  return (
    <NavigationContainer>
      {isSignedIn ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
