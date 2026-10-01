import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BrandMark } from '../../components/BrandMark';
import { hasSeenOnboarding } from '../../services/onboardingStorage';
import type { RootStackParamList } from '../../navigation/types';
import { portal } from '../../theme/portal';

const HOLD_MS = 1700;

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Splash'>>();
  const opacity = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  const leaving = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(lift, { toValue: 0, duration: 650, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    let cancel = false;
    const wait = new Promise((resolve) => setTimeout(resolve, HOLD_MS));
    Promise.all([hasSeenOnboarding(), wait]).then(([seen]) => {
      if (cancel || leaving.current) return;
      leaving.current = true;
      navigation.replace(seen ? 'Login' : 'Onboarding');
    });

    return () => {
      cancel = true;
    };
  }, [lift, navigation, opacity]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.View style={[styles.center, { opacity, transform: [{ translateY: lift }] }]}>
        <BrandMark size={88} />
        <Text style={styles.title}>Civil Registration Tracker</Text>
        <Text style={styles.sub}>Official portal for birth, marriage, and death registrations</Text>
        <View style={styles.rule} />
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotMid]} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
      <Text style={styles.footer}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: portal.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  center: { alignItems: 'center' },
  title: {
    marginTop: 22,
    color: portal.white,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    marginTop: 10,
    color: '#C9D2E3',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  rule: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: portal.gold,
    marginTop: 22,
  },
  dots: { flexDirection: 'row', gap: 8, marginTop: 28 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: portal.gold, opacity: 0.45 },
  dotMid: { opacity: 1, width: 18 },
  footer: {
    position: 'absolute',
    bottom: 36,
    color: portal.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
