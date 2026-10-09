import React, { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { decideApplication, loadDashboard } from '../../actions/districtAction';
import { AuthorizeSignOffModal } from '../../components/AuthorizeSignOffModal';
import type { Status } from '../../components/StatusBadge';
import type { RootStackParamList } from '../../navigation/types';
import type { SignOffCredentials } from '../../types/auth';
import type { ApplicationItem, Category, Decision } from '../../types/district';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: Category[] = ['All', 'Birth', 'Death', 'Marriage'];

const STATUS_TONE: Record<Status, string> = {
  Pending: colors.muted,
  Approved: colors.green,
  Rejected: colors.red,
};

// Bottom action buttons. `route` = stack screen, `tab` = bottom tab. No target = "not available yet".
const ACTIONS: {
  label: string;
  icon: IconName;
  route?: keyof RootStackParamList;
  tab?: string;
}[] = [
  {
    label: 'View All Records',
    icon: 'grid-outline',
    route: 'AllRecords',
  },

  {
    label: 'Generate Report',
    icon: 'document-text-outline',
    route: 'Reports',
  },

  {
    label: 'Audit Trail',
    icon: 'time-outline',
    route: 'AuditTrail',
  },

  {
    label: 'Add Profile',
    icon: 'person-add-outline',
    route: 'AddProfile',
  },

  {
    label: 'Find People',
    icon: 'search-outline',
    route: 'FindPeople',
  },

  {
    label: 'View Profile',
    icon: 'person-circle-outline',
    tab: 'Profile',
  },

  {
    label: 'NIC Request',
    icon: 'id-card-outline',
    route: 'NicPendingList',
  },
];

function StatCard({ label, value, note, icon }: { label: string; value: number | string; note: string; icon: IconName }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <Ionicons name={icon} size={16} color={colors.navy} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: Status }) {
  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusDot, { backgroundColor: STATUS_TONE[status] }]} />
      <Text style={[styles.statusText, status !== 'Pending' && { color: STATUS_TONE[status] }]}>{status}</Text>
    </View>
  );
}

function QueueButton({
  label,
  icon,
  bg,
  onPress,
  disabled,
}: {
  label: string;
  icon: IconName;
  bg: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[styles.qBtn, { backgroundColor: bg, opacity: disabled ? 0.4 : 1 }]}
    >
      <Ionicons name={icon} size={14} color={colors.white} />
      <Text style={styles.qBtnText}>{label}</Text>
    </Pressable>
  );
}

export default function DistrictDashboardScreen() {
  const dispatch = useAppDispatch();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { summary, queue, category, status, error } = useAppSelector((s) => s.district);
  const user = useAppSelector((s) => s.auth.user);

  const [pending, setPending] = useState<{ id: string; decision: Decision } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadDashboard(category));
    }, [dispatch, category]),
  );

  const confirm = async (credentials: SignOffCredentials, reason?: string) => {
    if (!pending) return;
    const result = await dispatch(decideApplication({ ...pending, credentials, reason }));
    setPending(null);
    if (decideApplication.rejected.match(result)) {
      Alert.alert('Not authorized', result.error.message ?? 'Action failed');
    }
  };

  const goTab = (name: string) => (nav as any).navigate(name);
  const soon = (name: string) => Alert.alert(name, 'This screen is not available yet.');

  const runAction = (a: (typeof ACTIONS)[number]) => {
    if (a.route) nav.navigate(a.route as any);
    else if (a.tab) goTab(a.tab);
    else soon(a.label);
  };

  // menu item: close the side menu first, then open the screen
  const runMenuAction = (a: (typeof ACTIONS)[number]) => {
    setMenuOpen(false);
    runAction(a);
  };

  const roleTitle = user?.designation || 'District Registrar';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      {/* App bar */}
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(true)} accessibilityLabel="Menu">
            <Ionicons name="menu" size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            {roleTitle}
          </Text>
          <View style={styles.appBarRight}>
            <Pressable onPress={() => goTab('Notification')} hitSlop={8} accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={colors.white} />
            </Pressable>
            <Pressable onPress={() => goTab('Profile')} style={styles.avatar} accessibilityLabel="Profile">
              <Ionicons name="person" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={status === 'loading'} onRefresh={() => dispatch(loadDashboard(category))} />
        }
      >
        {/* Welcome */}
        <View style={styles.welcomeRow}>
          <Text style={styles.welcome}>Welcome, {user?.designation || 'District Registrar'}</Text>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Sync</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Manage all civil registration records</Text>

        {/* Stat cards */}
        <View style={styles.stats}>
          <StatCard label="Pending Approvals" value={summary?.pending ?? '-'} note="Requires review" icon="clipboard-outline" />
          <StatCard label="Approved" value={summary?.approved ?? '-'} note="Synchronized" icon="checkmark-circle-outline" />
          <StatCard label="Rejected" value={summary?.rejected ?? '-'} note="Action needed" icon="ban-outline" />
          <StatCard
            label="Total Records"
            value={summary?.totalRecords ?? '-'}
            note={`Fiscal ${new Date().getFullYear()}`}
            icon="folder-open-outline"
          />
        </View>

        {/* Queue filters */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Queue Filters</Text>
          <Text style={styles.sectionNote}>{CATEGORIES.length} Categories</Text>
        </View>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => dispatch(loadDashboard(c))}
              accessibilityRole="button"
              accessibilityState={{ selected: c === category }}
              style={[styles.chip, c === category && styles.chipActive]}
            >
              <Text style={styles.chipText}>{c}</Text>
            </Pressable>
          ))}
        </View>

        {/* Applications queue */}
        <View style={[styles.sectionRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Applications Queue</Text>
          <View style={styles.sortPill}>
            <Text style={styles.sortText}>Sort: Recent</Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.queueCard}>
          {queue.length === 0 && status !== 'loading' ? (
            <Text style={styles.empty}>No applications in this category.</Text>
          ) : null}
          {queue.map((item: ApplicationItem, i: number) => (
            <View key={item.id} style={[styles.queueItem, i > 0 && styles.queueDivider]}>
              <View style={styles.rowBetween}>
                <View style={styles.idRow}>
                  <Text style={styles.appId}>{item.id}</Text>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.category}</Text>
                  </View>
                </View>
                <StatusPill status={item.status} />
              </View>

              <View style={[styles.rowBetween, { marginTop: 10 }]}>
                <View>
                  <Text style={styles.caption}>SUBJECT / APPLICANT</Text>
                  <Text style={styles.name}>{item.applicantName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.caption}>SUBMITTED</Text>
                  <Text style={styles.date}>{item.submittedOn}</Text>
                </View>
              </View>

              <View style={styles.qBtnRow}>
                <QueueButton
                  label="View"
                  icon="eye-outline"
                  bg={colors.navy}
                  onPress={() => nav.navigate('NicApplicationReview', { applicationId: item.id })}
                />
                <QueueButton
                  label="Approve"
                  icon="checkmark"
                  bg={colors.green}
                  disabled={item.status !== 'Pending'}
                  onPress={() => setPending({ id: item.id, decision: 'APPROVE' })}
                />
                <QueueButton
                  label="Reject"
                  icon="close"
                  bg={colors.red}
                  disabled={item.status !== 'Pending'}
                  onPress={() => setPending({ id: item.id, decision: 'REJECT' })}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <Pressable key={a.label} onPress={() => runAction(a)} accessibilityRole="button" style={styles.actionBtn}>
              <Ionicons name={a.icon} size={16} color={colors.white} />
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Side menu (the hamburger button) */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuRoot}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.menuPanel}>
            <View style={styles.menuHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{roleTitle}</Text>
                <Text style={styles.menuSub}>Civil registration menu</Text>
              </View>
              <Pressable onPress={() => setMenuOpen(false)} hitSlop={10} accessibilityLabel="Close menu">
                <Ionicons name="close" size={22} color={colors.white} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ACTIONS.map((a) => (
                <Pressable key={a.label} onPress={() => runMenuAction(a)} accessibilityRole="button" style={styles.menuItem}>
                  <Ionicons name={a.icon} size={18} color={colors.white} />
                  <Text style={styles.menuItemText}>{a.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#8FA0C4" />
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
          <Pressable style={styles.menuScrim} onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu" />
        </View>
      </Modal>

      <AuthorizeSignOffModal
        visible={!!pending}
        title={pending?.decision === 'APPROVE' ? 'Authorize Approval' : 'Authorize Rejection'}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  // app bar
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  menuBtn: { width: 40, height: 40, justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 16, fontWeight: '600' },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // welcome
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  welcome: { flex: 1, fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.text },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#E3E1EC',
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#000' },
  liveText: { fontSize: 10, color: colors.muted },
  subtitle: { fontSize: 12, color: colors.text, marginTop: 2 },

  // stat cards
  stats: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 16, marginTop: 24 },
  statCard: {
    flexBasis: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { fontSize: 12, color: colors.muted },
  statValue: { fontSize: 32, lineHeight: 38, fontWeight: '700', color: colors.text, marginTop: 4 },
  statNote: { fontSize: 10, color: colors.muted, marginTop: 6 },

  // sections
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionNote: { fontSize: 10, color: colors.muted },

  // filter chips
  chips: { flexDirection: 'row', gap: 5, marginTop: 10 },
  chip: {
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
  },
  // remove this line to get the exact Figma look (all chips identical)
  chipActive: { borderBottomColor: colors.amber },
  chipText: { color: colors.white, fontSize: 12 },

  sortPill: { height: 20, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.navy, justifyContent: 'center' },
  sortText: { color: colors.white, fontSize: 10 },
  error: { color: colors.red, marginTop: 8 },

  // queue
  queueCard: {
    marginTop: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  empty: { padding: 16, color: colors.muted, fontSize: 12 },
  queueItem: { padding: 16 },
  queueDivider: { borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appId: { fontSize: 12, letterSpacing: 0.3, color: colors.muted },
  tag: { height: 16, paddingHorizontal: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  tagText: { fontSize: 9, color: colors.muted },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.chip,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, color: colors.muted },
  caption: { fontSize: 9, letterSpacing: 0.6, color: colors.muted },
  name: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 2 },
  date: { fontSize: 12, color: colors.muted, marginTop: 4 },
  qBtnRow: { flexDirection: 'row', gap: 5, marginTop: 14 },
  qBtn: {
    width: 92,
    height: 37,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  qBtnText: { color: colors.white, fontSize: 12, fontWeight: '500' },

  // side menu
  menuRoot: { flex: 1, flexDirection: 'row' },
  menuPanel: { width: '78%', backgroundColor: colors.navy },
  menuScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  menuHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  menuTitle: { fontSize: 17, fontWeight: '700', color: colors.white },
  menuSub: { fontSize: 11, color: '#AEB8D0', marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  menuItemText: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.white },

  // quick actions
  actions: { marginTop: 28, gap: 5 },
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
});