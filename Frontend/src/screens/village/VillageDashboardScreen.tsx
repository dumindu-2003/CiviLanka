import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { portal } from '../../theme/portal';

type CertType = 'BIRTH' | 'DEATH' | 'MARRIAGE';
type CertStatus = 'Pending' | 'Approved';

const RECORDS: {
  id: string;
  type: CertType;
  date: string;
  name: string;
  status: CertStatus;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'BR-2026-8842', type: 'BIRTH', date: '2026-09-01', name: 'Baby Perera', status: 'Pending', icon: 'person-outline' },
  { id: 'DN-2026-1029', type: 'DEATH', date: '2026-08-28', name: 'Nimal Silva', status: 'Approved', icon: 'person-outline' },
  { id: 'MR-2026-0418', type: 'MARRIAGE', date: '2026-08-25', name: 'Kasun Perera', status: 'Approved', icon: 'heart-outline' },
];

const ACTIONS: { type: CertType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'BIRTH', label: 'View Birth Certificate', icon: 'person-outline' },
  { type: 'DEATH', label: 'View Death Certificate', icon: 'person-outline' },
  { type: 'MARRIAGE', label: 'View Married Certificate', icon: 'heart-outline' },
];

export default function VillageDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const scrollRef = useRef<ScrollView>(null);
  const nicOffset = useRef(0);
  const [filter, setFilter] = useState<CertType | null>(null);

  const records = filter ? RECORDS.filter((item) => item.type === filter) : RECORDS;

  const openNic = () => {
    scrollRef.current?.scrollTo({ y: Math.max(nicOffset.current - 12, 0), animated: true });
  };

  return (
    <View style={styles.screen}>
      <View style={{ height: insets.top, backgroundColor: portal.white }} />
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Ionicons name="menu" size={24} color={portal.navy} />
        </View>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Pressable
          style={styles.headerSide}
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Profile"
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color={portal.navy} />
          </View>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.kickerRow}>
            <Ionicons name="location-outline" size={14} color="#D5DDEA" />
            <Text style={styles.kicker}>GRAMA NILADHARI PORTAL</Text>
          </View>
          <Text style={styles.welcome}>Welcome, Village Officer</Text>
          <Text style={styles.heroSub}>View certificates and manage NIC forms</Text>

          {ACTIONS.map((action) => {
            const active = filter === action.type;
            return (
              <Pressable
                key={action.type}
                onPress={() => setFilter(active ? null : action.type)}
                style={[styles.heroAction, active && styles.heroActionOn]}
                accessibilityRole="button"
              >
                <Ionicons name={action.icon} size={18} color={portal.white} />
                <Text style={styles.heroActionText}>{action.label}</Text>
              </Pressable>
            );
          })}

          <Pressable onPress={openNic} style={styles.fillBtn} accessibilityRole="button">
            <Ionicons name="document-text-outline" size={18} color={portal.navy} />
            <Text style={styles.fillText}>Fill NIC Form</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Recent Certificates</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>
              Showing {records.length} {records.length === 1 ? 'record' : 'records'}
            </Text>
            </View>
          </View>

          {records.map((item, index) => (
            <View key={item.id} style={[styles.record, index > 0 && styles.recordBorder]}>
              <View style={styles.recordIcon}>
                <Ionicons name={item.icon} size={18} color={portal.navy} />
              </View>
              <View style={styles.recordBody}>
                <Text style={styles.recordMeta}>{item.type}  •  {item.date}</Text>
                <Text style={styles.recordName}>{item.name}</Text>
                <Text style={styles.recordRef}>Ref: {item.id}</Text>
              </View>
              <StatusPill status={item.status} />
            </View>
          ))}
        </View>

        <View
          style={styles.card}
          onLayout={(event) => {
            nicOffset.current = event.nativeEvent.layout.y;
          }}
        >
          <View style={styles.nicHead}>
            <View style={styles.nicIcon}>
              <Ionicons name="id-card-outline" size={22} color={portal.navy} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>NIC Form</Text>
              <Text style={styles.nicBody}>
                National Identity Card application assistance and verification for local division residents.
              </Text>
            </View>
          </View>
          <Pressable onPress={openNic} style={styles.nicBtn} accessibilityRole="button">
            <View style={styles.nicArrow}>
              <Ionicons name="arrow-forward" size={14} color={portal.white} />
            </View>
            <Text style={styles.nicBtnText}>Start NIC Form</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function StatusPill({ status }: { status: CertStatus }) {
  const approved = status === 'Approved';
  return (
    <View style={[styles.pill, approved ? styles.pillApproved : styles.pillPending]}>
      <View style={[styles.dot, approved ? styles.dotApproved : styles.dotPending]} />
      <Text style={[styles.pillText, approved ? styles.pillTextApproved : styles.pillTextPending]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  flex: { flex: 1 },
  header: {
    backgroundColor: portal.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: portal.line,
  },
  headerSide: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: portal.ink, fontSize: 18, fontWeight: '800' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: portal.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, paddingBottom: 28 },
  hero: {
    backgroundColor: portal.navy,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
  },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  kicker: { color: '#D5DDEA', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  welcome: { color: portal.white, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: '#C9D2E3', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  heroAction: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  heroActionOn: { backgroundColor: 'rgba(255,255,255,0.12)' },
  heroActionText: { color: portal.white, fontSize: 16, fontWeight: '600' },
  fillBtn: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#F5C400',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fillText: { color: portal.navy, fontSize: 16, fontWeight: '800' },
  card: {
    backgroundColor: portal.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  cardTitle: { color: portal.ink, fontSize: 18, fontWeight: '800' },
  countPill: { backgroundColor: '#F2F4F7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: portal.muted, fontSize: 12, fontWeight: '600' },
  record: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  recordBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: portal.line },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBody: { flex: 1 },
  recordMeta: { color: portal.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, marginBottom: 2 },
  recordName: { color: portal.ink, fontSize: 16, fontWeight: '800' },
  recordRef: { color: portal.muted, fontSize: 13, marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  pillPending: { backgroundColor: '#FFF6D8' },
  pillApproved: { backgroundColor: '#E7F6EE' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotPending: { backgroundColor: '#E0A800' },
  dotApproved: { backgroundColor: '#1F9D55' },
  pillText: { fontSize: 12, fontWeight: '700' },
  pillTextPending: { color: '#A16207' },
  pillTextApproved: { color: '#157A3E' },
  nicHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  nicIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicBody: { color: portal.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  nicBtn: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: portal.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nicArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: portal.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicBtnText: { color: portal.white, fontSize: 16, fontWeight: '700' },
});
