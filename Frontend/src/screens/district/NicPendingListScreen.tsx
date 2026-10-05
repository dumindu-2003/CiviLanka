import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { LandingTabBar } from '../../components/landing/LandingTabBar';
import { getNicPendingList, type NicPendingItem } from '../../services/districtService';
import { colors } from '../../theme/colors';

const ALL = 'All divisions';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const [datePart] = iso.split('T');
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return iso;
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
};

export default function NicPendingListScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState(ALL);
  const [newestFirst, setNewestFirst] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [applications, setApplications] = useState<NicPendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await getNicPendingList());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load NIC pending applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const divisions = useMemo(
    () => [ALL, ...Array.from(new Set(applications.map((a) => a.division).filter((d): d is string => Boolean(d))))],
    [applications],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications
      .filter((a) => {
        if (division !== ALL && a.division !== division) return false;
        if (!q) return true;
        return `${a.id} ${a.applicantName} ${a.submittedBy ?? ''} ${a.division ?? ''}`.toLowerCase().includes(q);
      })
      .sort((a, b) => (newestFirst ? b.submittedOn.localeCompare(a.submittedOn) : a.submittedOn.localeCompare(b.submittedOn)));
  }, [applications, query, division, newestFirst]);

  const goTab = (name: string) => (nav as any).navigate('MainTabs', { screen: name });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.backBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            NIC Pending Applications
          </Text>
          <View style={styles.appBarRight}>
            <Pressable onPress={() => setPickerOpen(true)} hitSlop={8} accessibilityLabel="Filters">
              <Ionicons name="options-outline" size={20} color={colors.white} />
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
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={colors.navy} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search App Ref, Citizen Name, or Officer..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <View style={styles.filterRow}>
          <Pressable onPress={() => setPickerOpen(true)} style={[styles.filterBtn, { flex: 1 }]} accessibilityRole="button">
            <Ionicons name="location-outline" size={14} color={colors.white} />
            <Text style={styles.filterText} numberOfLines={1}>
              {division}
            </Text>
            <Ionicons name="caret-down" size={10} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => setNewestFirst((v) => !v)} style={styles.filterBtn} accessibilityRole="button">
            <Ionicons name="reorder-three-outline" size={14} color={colors.white} />
            <Text style={styles.filterText}>SLA</Text>
            <Ionicons name={newestFirst ? 'arrow-down' : 'arrow-up'} size={11} color={colors.white} />
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {visible.length === 0 && !loading ? <Text style={styles.empty}>No pending applications found.</Text> : null}

        {visible.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.ref}>{a.id}</Text>
              <Text style={styles.date}>{fmtDate(a.submittedOn)}</Text>
            </View>

            <Text style={styles.name}>{a.applicantName}</Text>
            <Text style={styles.meta}>{[a.type ?? 'NIC Application', a.place].filter(Boolean).join(' - ')}</Text>

            <View style={styles.officerBox}>
              <View style={styles.rowBetween}>
                <Text style={styles.officerText}>Officer: {a.submittedBy ?? '-'}</Text>
                <Text style={styles.officerText}>{a.status}</Text>
              </View>
              <Text style={[styles.officerText, { marginTop: 2 }]}>{a.division ?? '-'}</Text>
            </View>

            <Pressable
              onPress={() => nav.navigate('NicApplicationReview', { applicationId: a.id })}
              accessibilityRole="button"
              style={styles.reviewBtn}
            >
              <Text style={styles.reviewText}>Review & Authorize</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.white} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => Alert.alert('Export Pending Digest', 'This feature is not available yet.')}
          accessibilityRole="button"
          style={styles.exportBtn}
        >
          <Ionicons name="download-outline" size={16} color={colors.navy} />
          <Text style={styles.exportText}>Export Pending Digest (PDF)</Text>
        </Pressable>
        <Text style={styles.caption}>
          Showing {visible.length} of {applications.length} pending applications
        </Text>
      </ScrollView>

      <LandingTabBar onTabPress={goTab} />

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select division</Text>
            {divisions.map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  setDivision(d);
                  setPickerOpen(false);
                }}
                style={styles.sheetRow}
              >
                <Text style={[styles.sheetText, d === division && { fontWeight: '700' }]}>{d}</Text>
                {d === division ? <Ionicons name="checkmark" size={18} color={colors.navy} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: { flex: 1, color: colors.white, fontSize: 16, fontWeight: '600' },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.field,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', gap: 6, marginTop: 8, marginBottom: 14 },
  filterBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: { flex: 0, color: colors.white, fontSize: 12 },
  error: { color: colors.red, fontSize: 12, marginBottom: 10 },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 12, marginVertical: 24 },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ref: { fontSize: 11, letterSpacing: 0.3, color: colors.muted },
  date: { fontSize: 11, color: colors.muted },
  name: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 10 },
  meta: { fontSize: 11.5, color: colors.muted, marginTop: 3 },
  officerBox: { marginTop: 12, borderRadius: 8, backgroundColor: colors.soft, paddingHorizontal: 10, paddingVertical: 8 },
  officerText: { fontSize: 11, color: colors.muted },
  reviewBtn: {
    marginTop: 12,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reviewText: { color: colors.white, fontSize: 12 },
  exportBtn: {
    marginTop: 8,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5B6785',
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportText: { fontSize: 12, color: colors.muted },
  caption: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 8, paddingHorizontal: 20 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 28 },
  sheetTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  sheetRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sheetText: { fontSize: 13, color: colors.text },
});
