import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { AppBar, PortalBanner } from '../../components/landing/LandingHeader';
import { HeroCarousel, Slide } from '../../components/landing/HeroCarousel';
import { LandingTabBar } from '../../components/landing/LandingTabBar';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Placeholder photo. Replace with the Figma export, e.g.
// const HERO = require('../../../assets/images/landing-hero.png');
const HERO = {
  uri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
};

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Real-Time Document Tracking',
    body: 'Automated logging and tracking that drastically cuts operation times while maintaining stringent verification standards.',
    image: HERO,
  },
  {
    id: '2',
    title: 'Role-Based Authority',
    body: 'Every approval is signed off by a verified officer using their service number and credentials.',
    image: HERO,
  },
  {
    id: '3',
    title: 'Complete Audit Trail',
    body: 'Each action on a record is logged so that compliance reviews are quick and transparent.',
    image: HERO,
  },
];

const GOALS = [
  { value: '70%', label: 'Faster\nTurnaround' },
  { value: 'Real-\nTime', label: 'Data Collection' },
  { value: '100%', label: 'Audit & Authority' },
];

const CHIPS: { label: string; icon: IconName }[] = [
  { label: 'Reduced Ops Time', icon: 'checkmark-circle-outline' },
  { label: 'Real-Time Data', icon: 'location-outline' },
  { label: 'Easy Authority', icon: 'accessibility-outline' },
  { label: 'Role Flexibility', icon: 'speedometer-outline' },
];

function InfoCard({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color={colors.navy} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// Public home page shown before login (Figma "Home Screen").
export default function LandingScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const goLogin = () => nav.navigate('Login');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.top}>
        <AppBar onLogin={goLogin} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PortalBanner onLogin={goLogin} />

        <HeroCarousel slides={SLIDES} />

        <InfoCard icon="eye-outline" title="Our Vision">
          <Text style={styles.body}>
            To establish a secure, high-integrity governance framework that accelerates public documentation
            workflows. We envision seamless, real-time tracking that eliminates operational bottlenecks while
            enforcing strict role-based access.
          </Text>
        </InfoCard>

        <InfoCard icon="locate-outline" title="Our Goals">
          <View style={styles.tiles}>
            {GOALS.map((g) => (
              <View key={g.value} style={styles.tile}>
                <Text style={styles.tileValue}>{g.value}</Text>
                <Text style={styles.tileLabel}>{g.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.body, { lineHeight: 19, marginTop: 14 }]}>
            Drastically reducing operational turnaround times with instant data collection, audit compliance,
            and flexible authority controls for certified personnel.
          </Text>
        </InfoCard>

        <InfoCard icon="rocket-outline" title="Our Mission">
          <Text style={styles.body}>
            Empower authorized officers with intelligent, low-friction tools to track, verify, and approve
            official records securely in real time.
          </Text>
          <View style={styles.banner}>
            {CHIPS.map((c) => (
              <View key={c.label} style={styles.chip}>
                <Ionicons name={c.icon} size={14} color={colors.navy} />
                <Text style={styles.chipText}>{c.label}</Text>
              </View>
            ))}
          </View>
        </InfoCard>
      </ScrollView>

      <LandingTabBar onTabPress={(label) => label !== 'Home' && goLogin()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { paddingBottom: 32 },

  card: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 13, lineHeight: 22, color: colors.text, marginTop: 8 },

  tiles: { flexDirection: 'row', gap: 5, marginTop: 14 },
  tile: {
    flex: 1,
    minHeight: 80,
    borderRadius: 10,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  tileValue: { fontSize: 22, lineHeight: 26, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tileLabel: { fontSize: 9, lineHeight: 11, color: colors.muted, textAlign: 'center', marginTop: 2 },

  banner: {
    marginTop: 14,
    backgroundColor: colors.blue,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 7,
    rowGap: 4,
  },
  chip: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: { fontSize: 12, color: colors.muted },
});