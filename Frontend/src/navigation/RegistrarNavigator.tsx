import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { RootStackParamList, TabParamList } from './types';
import LoginScreen from '../features/registrar/screens/LoginScreen';
import HomeScreen from '../features/registrar/screens/HomeScreen';
import DashboardScreen from '../features/registrar/screens/DashboardScreen';
import NicPendingScreen from '../features/registrar/screens/NicPendingScreen';
import NotificationsScreen from '../features/registrar/screens/NotificationsScreen';
import ProfileScreen from '../features/registrar/screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const icons = { Home: 'home', Notifications: 'notifications', Profile: 'person' } as const;

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false, tabBarActiveTintColor: colors.navy, tabBarInactiveTintColor: colors.muted,
      tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RegistrarNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="NicPending" component={NicPendingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
