import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { stackScreens } from './screenRegistry';
import MainTabs from './MainTabs';
import SplashScreen from '../screens/shared/SplashScreen';
import OnboardingScreen from '../screens/shared/OnboardingScreen';
import LoginScreen from '../screens/shared/LoginScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const user = useAppSelector((s) => s.auth.user);
  const allowedScreens = useAppSelector((s) => s.auth.allowedScreens);

  if (!user) {
    return (
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    );
  }

  // Only screens allowed by the backend are registered
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      {allowedScreens
        .filter((key) => stackScreens[key])
        .map((key) => (
          <Stack.Screen
            key={key}
            name={key as keyof RootStackParamList}
            component={stackScreens[key].component}
            options={{ title: stackScreens[key].title }}
          />
        ))}
    </Stack.Navigator>
  );
}
