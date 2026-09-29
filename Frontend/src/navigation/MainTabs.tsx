import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { dashboards, NotAvailableScreen } from './screenRegistry';
import NewsScreen from '../screens/shared/NewsScreen';
import NotificationScreen from '../screens/shared/NotificationScreen';
import MyProfileScreen from '../screens/shared/MyProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  News: 'newspaper',
  Notification: 'notifications',
  Profile: 'person',
};

export default function MainTabs() {
  const homeScreen = useAppSelector((s) => s.auth.homeScreen);
  const Dashboard = (homeScreen && dashboards[homeScreen]) || NotAvailableScreen;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}
