import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeathRegisterForm from '../death/DeathRegisterForm';
import type { RootStackParamList } from '../../navigation/types';
import { deathService, getDeathList, type DeathListItem } from '../../services/deathService';
import type { SignOffCredentials } from '../../types/auth';
import type { DeathApplication, DeathApplicationPayload } from '../../types/death';
import { colors } from '../../theme/colors';
import { errorMessage } from '../../utils/errorMessage';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (value: string) => {
  const [datePart] = String(value ?? '').split('T');
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return value || '—';
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
};

const statusColor = (status: string) => {
  if (status === 'Approved') return '#1B8A3E';
  if (status === 'Rejected') return colors.red;
  if (status === 'Draft') return colors.navy;
  return '#8A6A00';
};

function toPayload(application: DeathApplication): DeathApplicationPayload {
  return {
    informantName: application.informantName,
    nic: application.nic,
    relationship: application.relationship,
    informantContact: application.informantContact,
    placeOfDemise: application.placeOfDemise,
    dateOfDemise: application.dateOfDemise,
    timeOfDemise: application.timeOfDemise,
    deceasedNic: application.deceasedNic,
    deceasedName: application.deceasedName,
    gender: application.gender,
    dateOfBirth: application.dateOfBirth,
    ageAtDeath: application.ageAtDeath,
    causeOfDeath: application.causeOfDeath,
    maritalStatus: application.maritalStatus,
    deceasedAddress: application.deceasedAddress,
  };
}

export default function DeathReportScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [rows, setRows] = useState<DeathListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<DeathApplication | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setRows((await getDeathList()) ?? []);
    } catch (e) {
      setError(errorMessage(e, 'Could not load death reports.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!creating && !selected) load();
    }, [creating, load, selected]),
  );

  const openReport = async (row: DeathListItem) => {
    try {
      setSelected(await deathService.get(String(row.app_id)));
    } catch (e) {
      Alert.alert('Unable to open the report', errorMessage(e));
    }
  };

  const closeForm = () => {
    setCreating(false);
    setSelected(null);
    void load();
  };

  if (creating || (selected && selected.status !== 'Approved')) {
    const draft = selected?.status === 'Draft';
    return (
      <DeathRegisterForm
        title="Death Report"
        subtitle="This report is sent to the Death Registrar. You can edit it until it is approved."
        submitLabel="Send to Death Registrar"
        initialData={selected ? toPayload(selected) : undefined}
        onBack={closeForm}
        onSaveDraft={
          selected
            ? undefined
            : async (payload) => {
                await deathService.create(payload, 'Draft');
                Alert.alert('Draft saved', 'The death report is saved. Send it when the details are complete.');
                closeForm();
              }
        }
        onUpdate={
          selected
            ? async (payload) => {
                await deathService.update(selected.id, payload);
                Alert.alert(
                  'Report updated',
                  selected.status === 'Rejected'
                    ? 'The corrected report was sent to the Death Registrar again.'
                    : 'The Death Registrar still has this report, with your changes.',
                );
                closeForm();
              }
            : undefined
        }
        onSubmit={
          !selected || draft
            ? async (payload: DeathApplicationPayload, credentials: SignOffCredentials) => {
                if (draft && selected) {
                  await deathService.update(selected.id, payload);
                  await deathService.submit(selected.id, credentials);
                } else {
                  await deathService.create(payload, 'Pending', credentials);
                }
                Alert.alert('Report sent', 'The Death Registrar can now review this death report.');
                closeForm();
              }
            : undefined
        }
      />
    );
  }

  if (selected?.status === 'Approved') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
        <SafeAreaView edges={['top']} style={styles.top}>
          <View style={styles.appBar}>
            <Pressable onPress={() => setSelected(null)} style={styles.iconBtn} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </Pressable>
            <Text style={styles.appBarTitle}>Death Report</Text>
            <View style={styles.iconBtn} />
          </View>
        </SafeAreaView>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.locked}>
            <Text style={styles.lockedText}>Approved. This report can no longer be edited.</Text>
          </View>
          <Text style={styles.ref}>{selected.appRef}</Text>
          <Detail label="Deceased" value={selected.deceasedName} />
          <Detail label="NIC" value={selected.deceasedNic} />
          <Detail label="Date of death" value={selected.dateOfDemise} />
          <Detail label="Time of death" value={selected.timeOfDemise} />
          <Detail label="Place" value={selected.placeOfDemise} />
          <Detail label="Cause" value={selected.causeOfDeath} />
          <Detail label="Informant" value={selected.informantName} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle}>Death Reports</Text>
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.navy} />}
      >
        <Pressable onPress={() => setCreating(true)} style={styles.sendBtn} accessibilityRole="button">
          <Ionicons name="paper-plane-outline" size={18} color={colors.navy} />
          <Text style={styles.sendText}>Send a Death Report</Text>
        </Pressable>
        <Text style={styles.note}>
          Reports stay editable until the Death Registrar approves them.
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : error ? (
          <Text style={styles.empty}>{error}</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.empty}>No death reports sent yet.</Text>
        ) : (
          <View style={styles.list}>
            {rows.map((row) => (
              <Pressable key={row.app_id} onPress={() => openReport(row)} accessibilityRole="button" style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowName}>{row.name || '—'}</Text>
                  <Text style={styles.rowMeta}>
                    {row.app_ref} • {formatDate(row.created_at)}
                  </Text>
                  <Text style={[styles.rowStatus, { color: statusColor(row.status) }]}>
                    {row.status === 'Approved' ? 'Approved — locked' : row.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 17, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 28 },
  sendBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.amber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendText: { color: colors.navy, fontSize: 16, fontWeight: '700' },
  note: { fontSize: 13, color: colors.muted, marginTop: 12, marginBottom: 12 },
  loader: { marginTop: 40 },
  empty: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8 },
  list: { gap: 10 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowMeta: { marginTop: 3, fontSize: 12, color: colors.muted },
  rowStatus: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  locked: {
    backgroundColor: '#E8F7EF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  lockedText: { color: '#16804B', fontSize: 14, fontWeight: '700' },
  ref: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  detail: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  detailLabel: { fontSize: 12, color: colors.muted },
  detailValue: { marginTop: 2, fontSize: 15, fontWeight: '600', color: colors.text },
});
