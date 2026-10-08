import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { stackScreens } from './screenRegistry';
import MainTabs from './MainTabs';
import LandingScreen from '../screens/shared/LandingScreen';
import LoginScreen from '../screens/shared/LoginScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      {Object.entries(stackScreens).map(([key, screen]) => (
        <Stack.Screen
          key={key}
          name={key as keyof RootStackParamList}
          component={screen.component}
          options={{
            title: screen.title,
            headerShown: screen.headerShown ?? true,
          }}
        />
      ))}
    </Stack.Navigator>
  );
}
