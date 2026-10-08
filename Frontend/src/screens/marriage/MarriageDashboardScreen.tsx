import React, { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { useAppDispatch } from '../../store/hooks';
import { resetDraft } from '../../reducers/marriageReducer';

type RegStatus = 'Approved' | 'Pending';

// Mock data (UI only, not connected to the backend yet)
const STATS = { newEntries: 4, pending: 2, approved: 10 };

const RECENT: { id: string; names: string; date: string; status: RegStatus }[] = [
  { id: 'M001', names: 'Kasun Perera & Amaya Silva', date: '2026-08-25', status: 'Approved' },
  { id: 'M002', names: 'Sahan Fernando & Dilini Jayawardena', date: '2026-08-30', status: 'Pending' },
];

function StatCard({ icon, value, label, dot }: { icon: React.ReactNode; value: number; label: string; dot: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        {icon}
        <View style={[styles.statDot, { backgroundColor: dot }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: RegStatus }) {
  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusDot, { backgroundColor: status === 'Approved' ? colors.black : colors.muted }]} />
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

export default function MarriageDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable style={styles.menuBtn} accessibilityLabel="Menu">
            <Ionicons name="menu" size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            Marriage Registrar
          </Text>
          <Pressable style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>Welcome, Marriage Registrar</Text>
        <Text style={styles.subtitle}>Manage marriage registrations</Text>

        <View style={styles.statsBox}>
          <StatCard
            icon={<MaterialCommunityIcons name="new-box" size={18} color={colors.navy} />}
            value={STATS.newEntries}
            label="New"
            dot={colors.black}
          />
          <StatCard
            icon={<Ionicons name="hourglass-outline" size={16} color={colors.navy} />}
            value={STATS.pending}
            label="Pending"
            dot={colors.muted}
          />
          <StatCard
            icon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.navy} />}
            value={STATS.approved}
            label="Approved"
            dot={colors.black}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={styles.actionBtn}
            onPress={() => {
              dispatch(resetDraft());
              navigation.navigate('MarriageRegistrationStep1');
            }}
          >
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.actionText}>New Marriage Registration</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.actionBtn}>
            <Ionicons name="document-text-outline" size={16} color={colors.white} />
            <Text style={styles.actionText}>View All Marriage Certificates</Text>
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Registrations</Text>
          <Text style={styles.sectionNote}>Showing {RECENT.length} latest</Text>
        </View>

        {RECENT.map((r) => (
          <View key={r.id} style={styles.regCard}>
            <View style={styles.rowBetween}>
              <View style={styles.idTag}>
                <Text style={styles.idText}>{r.id}</Text>
              </View>
              <StatusPill status={r.status} />
            </View>
            <Text style={styles.names}>{r.names}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.navy} />
              <Text style={styles.date}>{r.date}</Text>
            </View>
            <Pressable accessibilityRole="button" style={styles.viewBtn}>
              <Text style={styles.viewText}>View</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.white} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  // app bar
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  menuBtn: { width: 40, height: 40, justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 18, fontWeight: '700' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // welcome
  welcome: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.text, marginTop: 2 },

  // stat cards
  statsBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statValue: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.text, marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },

  // action buttons
  actions: { marginTop: 22, gap: 8 },
  actionBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: { color: colors.white, fontSize: 13, fontWeight: '500' },

  // recent registrations
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  sectionNote: { fontSize: 10, color: colors.muted },
  regCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idTag: { height: 16, paddingHorizontal: 7, borderRadius: 4, backgroundColor: colors.chip, justifyContent: 'center' },
  idText: { fontSize: 9, color: colors.muted },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 16,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.chip,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, color: colors.muted },
  names: { fontSize: 14, color: colors.text, marginTop: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  date: { fontSize: 12, color: colors.muted },
  viewBtn: {
    height: 32,
    marginTop: 14,
    borderRadius: 6,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  viewText: { color: colors.white, fontSize: 12, fontWeight: '500' },
});
