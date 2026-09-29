import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

const CARDS = [
  { title: 'Our Vision', body: 'Reliable, secure and transparent civil registration for every citizen.' },
  { title: 'Our Goals', body: 'Faster processing, real-time data collection and 100% accountability.' },
  { title: 'Our Mission', body: 'Reduce manual work with a simple, role-based digital tracker.' },
];

// Public home page shown before login. Refine using the Figma "Home Screen".
export default function LandingScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>GovernReg Digital System</Text>
      <Text style={styles.sub}>Documentation Tracker · Restricted access</Text>
      {CARDS.map((c) => (
        <View key={c.title} style={styles.card}>
          <Text style={styles.cardTitle}>{c.title}</Text>
          <Text style={styles.cardBody}>{c.body}</Text>
        </View>
      ))}
      <AppButton title="Log in" onPress={() => nav.navigate('Login')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  brand: { fontSize: 24, fontWeight: '700', color: colors.primary, marginTop: spacing.lg },
  sub: { color: colors.muted, marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: spacing.md, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardBody: { color: colors.muted },
});
