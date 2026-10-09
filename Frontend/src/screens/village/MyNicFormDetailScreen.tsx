import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { getNicById, type NicDocument, type NicRecord } from '../../services/nicService';
import { colors } from '../../theme/colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOC_LABEL: Record<string, string> = {
  birth: 'Birth certificate',
  address: 'Address proof',
  photo: 'Photograph',
  previous: 'Previous NIC',
};

const show = (value: string | number | boolean | null | undefined) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const text = String(value ?? '').trim();
  return text || '—';
};

const formatDate = (value: string | null | undefined) => {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  const [datePart] = text.split('T');
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return text;
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
};

const statusColor = (status: string) => {
  if (status === 'Approved') return '#1B8A3E';
  if (status === 'Rejected') return colors.red;
  if (status === 'Draft') return colors.navy;
  return '#8A6A00';
};

function documentsOf(record: NicRecord): NicDocument[] {
  const value = record.documents as NicDocument[] | string | null | undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function linesFor(record: NicRecord) {
  const docs = documentsOf(record);
  const lines = [
    { label: 'Full name', value: show(record.full_name) },
    { label: 'Date of birth', value: formatDate(record.date_of_birth) },
    { label: 'Gender', value: show(record.gender) },
    { label: 'Place of birth', value: show(record.place_of_birth) },
    { label: 'District', value: show(record.district) },
    { label: 'Religion', value: show(record.religion) },
    { label: 'Occupation', value: show(record.occupation) },
    { label: 'Permanent address', value: show(record.permanent_address) },
    { label: 'Current address', value: show(record.current_address) },
    { label: 'Same as permanent', value: show(record.same_as_permanent) },
    { label: 'Phone', value: show(record.phone) },
    { label: 'Email', value: show(record.email) },
    { label: 'Father', value: show(record.father_name) },
    { label: "Father's NIC", value: show(record.father_nic) },
    { label: 'Mother', value: show(record.mother_name) },
    { label: "Mother's NIC", value: show(record.mother_nic) },
    { label: 'Marital status', value: show(record.marital_status) },
    { label: 'NIC type', value: show(record.nic_type) },
    { label: 'Submitted on', value: formatDate(record.created_at) },
  ];
  if (record.rejection_reason) lines.push({ label: 'Rejection reason', value: show(record.rejection_reason) });
  if (docs.length === 0) lines.push({ label: 'Documents', value: '—' });
  else docs.forEach((doc) => lines.push({ label: DOC_LABEL[doc.document_key] ?? doc.document_key, value: show(doc.original_file_name) }));
  return lines;
}

export default function MyNicFormDetailScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MyNicFormDetail'>>();
  const appId = route.params.appId;

  const [record, setRecord] = useState<NicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecord(await getNicById(appId));
    } catch (e: any) {
      setRecord(null);
      setError(e?.message ?? 'Could not open this NIC form.');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const lines = record ? linesFor(record) : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle}>NIC Form</Text>
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : error || !record ? (
          <Text style={styles.empty}>{error ?? 'This NIC form could not be opened.'}</Text>
        ) : (
          <View style={styles.paper}>
            <Text style={styles.kicker}>National Identity Card application</Text>
            <Text style={styles.ref}>{record.app_ref}</Text>
            <View style={[styles.stamp, { borderColor: statusColor(record.status) }]}>
              <Text style={[styles.stampText, { color: statusColor(record.status) }]}>{record.status}</Text>
            </View>
            {lines.map((line) => (
              <View key={line.label} style={styles.field}>
                <Text style={styles.fieldLabel}>{line.label}</Text>
                <Text style={styles.fieldValue}>{line.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  loader: { marginTop: 40 },
  empty: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 24 },
  paper: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
  },
  kicker: { textAlign: 'center', fontSize: 12, color: colors.muted, fontWeight: '600' },
  ref: { textAlign: 'center', marginTop: 6, fontSize: 20, fontWeight: '700', color: colors.navy },
  stamp: {
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  stampText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  field: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingVertical: 10 },
  fieldLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', letterSpacing: 0.3 },
  fieldValue: { marginTop: 2, fontSize: 16, color: colors.text, fontWeight: '500' },
});
