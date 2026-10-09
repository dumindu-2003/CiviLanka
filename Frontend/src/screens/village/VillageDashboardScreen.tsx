import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import { getVillageDashboard } from '../../services/villageService';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type CertKind = 'BIRTH' | 'DEATH' | 'MARRIAGE';

interface Certificate {
  id: string;
  kind: CertKind;
  date: string;
  name: string;
  ref: string;
  status: string;
}

const CERT_ICON: Record<CertKind, IconName> = {
  BIRTH: 'happy-outline',
  DEATH: 'sad-outline',
  MARRIAGE: 'heart-outline',
};

const KIND_FROM_API: Record<string, CertKind> = {
  Birth: 'BIRTH',
  Death: 'DEATH',
  Marriage: 'MARRIAGE',
};

const statusColor = (status: string) => {
  if (status === 'Approved') return '#1B8A3E';
  if (status === 'Rejected') return colors.red;
  if (status === 'Pending') return '#8A8F98';
  return colors.muted;
};

const dateOnly = (value: string) => {
  if (!value) return '';
  return value.split('T')[0].split(' ')[0];
};

function OutlineButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.outlineBtn}>
      <Ionicons name={icon} size={18} color={colors.white} />
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

function CertificateCard({ item, onPress }: { item: Certificate; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.certCard}>
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
        <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </Pressable>
  );
}

export default function VillageDashboardScreen() {
  const nav = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const greeting = user?.designation || 'Village Officer';

  const [menuOpen, setMenuOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [pendingNic, setPendingNic] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getVillageDashboard();
      const rows = (data?.recentCertificates ?? [])
        .map((row, index) => {
          const kind = KIND_FROM_API[row.category];
          if (!kind) return null;
          return {
            id: row.app_ref || String(index),
            kind,
            date: dateOnly(String(row.created_at ?? '')),
            name: row.name || '—',
            ref: row.app_ref,
            status: row.status || 'Pending',
          };
        })
        .filter((row): row is Certificate => row !== null);
      setCertificates(rows);
      setPendingNic(data?.myPendingNic?.my_pending_nic ?? 0);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load the village dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const goTab = (name: 'News' | 'Notification' | 'Profile') => {
    setMenuOpen(false);
    nav.navigate(name);
  };

  const openNicForm = () => {
    setMenuOpen(false);
    nav.navigate('NicPersonalDetails');
  };

  const openFilledNic = () => {
    setMenuOpen(false);
    nav.navigate('MyNicForms');
  };

  const openPreview = (kind: CertKind, ref?: string) => {
    if (ref) nav.navigate('CertificateDetail', { kind, ref });
    else nav.navigate('CertificatePreview', { kind });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable style={styles.iconBtn} onPress={() => setMenuOpen(true)} accessibilityLabel="Menu">
            <Ionicons name="menu" size={26} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle}>Dashboard</Text>
          <Pressable onPress={() => goTab('Profile')} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.navy} />}
      >
        <View style={styles.hero}>
          <View style={styles.portalRow}>
            <Ionicons name="location-outline" size={14} color="#D5DCE8" />
            <Text style={styles.portalText}>GRAMA NILADHARI PORTAL</Text>
          </View>
          <Text style={styles.welcome}>Welcome, {greeting}</Text>
          <Text style={styles.subtitle}>View certificates and manage NIC forms</Text>

          <View style={styles.actions}>
            <OutlineButton icon="happy-outline" label="View Birth Certificate" onPress={() => openPreview('BIRTH')} />
            <OutlineButton icon="sad-outline" label="View Death Certificate" onPress={() => openPreview('DEATH')} />
            <OutlineButton icon="heart-outline" label="View Married Certificate" onPress={() => openPreview('MARRIAGE')} />
          </View>
        </View>

        <View style={styles.body}>
          <Pressable onPress={openNicForm} accessibilityRole="button" style={styles.fillBtn}>
            <Ionicons name="document-text-outline" size={18} color={colors.navy} />
            <Text style={styles.fillText}>Fill NIC Form</Text>
          </Pressable>
          <Pressable onPress={openFilledNic} accessibilityRole="button" style={styles.viewNicBtn}>
            <Ionicons name="folder-open-outline" size={18} color={colors.navy} />
            <Text style={styles.viewNicText}>View Filled NIC Forms</Text>
          </Pressable>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Certificates</Text>
            <Text style={styles.sectionNote}>Showing {certificates.length} records</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.navy} style={styles.loader} />
          ) : error ? (
            <Text style={styles.empty}>{error}</Text>
          ) : certificates.length === 0 ? (
            <Text style={styles.empty}>No recent certificates yet.</Text>
          ) : (
            <View style={styles.list}>
              {certificates.map((item) => (
                <CertificateCard key={item.id} item={item} onPress={() => openPreview(item.kind, item.ref)} />
              ))}
            </View>
          )}

          <View style={styles.nicCard}>
            <View style={styles.nicHead}>
              <View style={styles.nicIcon}>
                <Ionicons name="id-card-outline" size={22} color={colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nicTitle}>NIC Form</Text>
                <Text style={styles.nicBody}>
                  National Identity Card application assistance and verification for local division residents.
                  {pendingNic !== null ? ` ${pendingNic} pending with the district registrar.` : ''}
                </Text>
              </View>
            </View>
            <Pressable onPress={openNicForm} accessibilityRole="button" style={styles.startBtn}>
              <Ionicons name="document-text-outline" size={16} color={colors.white} />
              <Text style={styles.startText}>Start NIC Form</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.sidebarWrap}>
          <View style={styles.sidebar}>
            <SafeAreaView edges={['top', 'bottom']} style={styles.sidebarSafe}>
              <View style={styles.sidebarHead}>
                <Text style={styles.sidebarName}>{user?.fullName || greeting}</Text>
                <Text style={styles.sidebarRole}>{greeting}</Text>
              </View>
              <MenuRow icon="home-outline" label="Dashboard" onPress={() => setMenuOpen(false)} />
              <MenuRow icon="happy-outline" label="Birth Certificate" onPress={() => { setMenuOpen(false); openPreview('BIRTH'); }} />
              <MenuRow icon="sad-outline" label="Death Certificate" onPress={() => { setMenuOpen(false); openPreview('DEATH'); }} />
              <MenuRow icon="heart-outline" label="Married Certificate" onPress={() => { setMenuOpen(false); openPreview('MARRIAGE'); }} />
              <MenuRow icon="document-text-outline" label="Fill NIC Form" onPress={openNicForm} />
              <MenuRow icon="folder-open-outline" label="Filled NIC Forms" onPress={openFilledNic} />
              <MenuRow icon="newspaper-outline" label="News" onPress={() => goTab('News')} />
              <MenuRow icon="notifications-outline" label="Notifications" onPress={() => goTab('Notification')} />
              <MenuRow icon="person-outline" label="Profile" onPress={() => goTab('Profile')} />
            </SafeAreaView>
          </View>
          <Pressable style={styles.sidebarBackdrop} onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu" />
        </View>
      </Modal>
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.menuRow}>
      <Ionicons name={icon} size={20} color={colors.navy} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
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
  viewNicBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E4E7EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewNicText: { color: colors.navy, fontSize: 15, fontWeight: '700' },

  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionNote: { fontSize: 12, color: colors.muted },
  list: { gap: 12 },
  loader: { marginVertical: 24 },
  empty: { fontSize: 14, lineHeight: 20, color: colors.muted, marginBottom: 8 },

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

  sidebarWrap: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 280, maxWidth: '82%', backgroundColor: colors.card },
  sidebarSafe: { flex: 1 },
  sidebarBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sidebarHead: { backgroundColor: colors.navy, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20 },
  sidebarName: { color: colors.white, fontSize: 18, fontWeight: '700' },
  sidebarRole: { color: '#C9D1E0', fontSize: 13, marginTop: 4 },
  menuRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 18,
  },
  menuLabel: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' },
});
