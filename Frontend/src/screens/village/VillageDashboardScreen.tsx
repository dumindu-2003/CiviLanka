import React from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type CertKind = 'BIRTH' | 'DEATH' | 'MARRIAGE';
type CertStatus = 'Pending' | 'Approved';

interface Certificate {
  id: string;
  kind: CertKind;
  date: string;
  name: string;
  ref: string;
  status: CertStatus;
}

const CERT_ICON: Record<CertKind, IconName> = {
  BIRTH: 'happy-outline',
  DEATH: 'sad-outline',
  MARRIAGE: 'heart-outline',
};

const STATUS_COLOR: Record<CertStatus, string> = {
  Pending: '#8A8F98',
  Approved: '#1B8A3E',
};

// Shown until the village dashboard API is connected.
const RECENT: Certificate[] = [
  { id: '1', kind: 'BIRTH', date: '2026-09-01', name: 'Baby Perera', ref: 'BR-2026-8942', status: 'Pending' },
  { id: '2', kind: 'DEATH', date: '2026-08-28', name: 'Nimal Silva', ref: 'DR-2026-1029', status: 'Approved' },
  { id: '3', kind: 'MARRIAGE', date: '2026-08-25', name: 'Kasun Perera', ref: 'MR-2026-0418', status: 'Approved' },
];

const soon = (name: string) => Alert.alert(name, 'This screen is not available yet.');

function OutlineButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.outlineBtn}>
      <Ionicons name={icon} size={18} color={colors.white} />
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

function CertificateCard({ item }: { item: Certificate }) {
  return (
    <View style={styles.certCard}>
      <View style={styles.certIcon}>
        <Ionicons name={CERT_ICON[item.kind]} size={20} color={colors.navy} />
      </View>
      <View style={styles.certBody}>
        <Text style={styles.certMeta}>
          {item.kind} • {item.date}
        </Text>
        <Text style={styles.certName}>{item.name}</Text>
        <Text style={styles.certRef}>Ref: {item.ref}</Text>
      </View>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );
}

export default function VillageDashboardScreen() {
  const nav = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const greeting = user?.designation || 'Village Officer';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable style={styles.iconBtn} onPress={() => soon('Menu')} accessibilityLabel="Menu">
            <Ionicons name="menu" size={26} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle}>Dashboard</Text>
          <Pressable onPress={() => nav.navigate('Profile')} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.portalRow}>
            <Ionicons name="location-outline" size={14} color="#D5DCE8" />
            <Text style={styles.portalText}>GRAMA NILADHARI PORTAL</Text>
          </View>
          <Text style={styles.welcome}>Welcome, {greeting}</Text>
          <Text style={styles.subtitle}>View certificates and manage NIC forms</Text>

          <View style={styles.actions}>
            <OutlineButton icon="happy-outline" label="View Birth Certificate" onPress={() => soon('View Birth Certificate')} />
            <OutlineButton icon="sad-outline" label="View Death Certificate" onPress={() => soon('View Death Certificate')} />
            <OutlineButton icon="heart-outline" label="View Married Certificate" onPress={() => soon('View Married Certificate')} />
          </View>
        </View>

        <View style={styles.body}>
          <Pressable onPress={() => nav.navigate('NicPersonalDetails')} accessibilityRole="button" style={styles.fillBtn}>
            <Ionicons name="document-text-outline" size={18} color={colors.navy} />
            <Text style={styles.fillText}>Fill NIC Form</Text>
          </Pressable>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Certificates</Text>
            <Text style={styles.sectionNote}>Showing {RECENT.length} records</Text>
          </View>

          <View style={styles.list}>
            {RECENT.map((item) => (
              <CertificateCard key={item.id} item={item} />
            ))}
          </View>

          <View style={styles.nicCard}>
            <View style={styles.nicHead}>
              <View style={styles.nicIcon}>
                <Ionicons name="id-card-outline" size={22} color={colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nicTitle}>NIC Form</Text>
                <Text style={styles.nicBody}>
                  National Identity Card application assistance and verification for local division residents.
                </Text>
              </View>
            </View>
            <Pressable onPress={() => nav.navigate('NicPersonalDetails')} accessibilityRole="button" style={styles.startBtn}>
              <Ionicons name="document-text-outline" size={16} color={colors.white} />
              <Text style={styles.startText}>Start NIC Form</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  scroll: { paddingBottom: 28 },

  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 18, fontWeight: '600' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: { backgroundColor: colors.navy, paddingHorizontal: 20, paddingBottom: 28 },
  portalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  portalText: { color: '#D5DCE8', fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
  welcome: { color: colors.white, fontSize: 26, lineHeight: 32, fontWeight: '700', marginTop: 14 },
  subtitle: { color: '#C9D1E0', fontSize: 14, marginTop: 4 },
  actions: { marginTop: 22, gap: 12 },
  outlineBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineText: { color: colors.white, fontSize: 15, fontWeight: '500' },

  body: { paddingHorizontal: 16, marginTop: -22 },
  fillBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F5C400',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  fillText: { color: colors.navy, fontSize: 16, fontWeight: '700' },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionNote: { fontSize: 12, color: colors.muted },
  list: { gap: 12 },

  certCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  certIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certBody: { flex: 1 },
  certMeta: { fontSize: 11, letterSpacing: 0.4, color: colors.muted, fontWeight: '600' },
  certName: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  certRef: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, color: colors.muted },

  nicCard: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nicHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  nicIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  nicBody: { fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 4 },
  startBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
