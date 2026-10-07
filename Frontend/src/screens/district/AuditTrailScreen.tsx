import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuditEntry, getAuditList } from '../../services/auditService';
import { colors } from '../../theme/colors';

const TONE: Record<string, string> = {
  Create: colors.green,
  Update: colors.blue,
  Delete: colors.red,
  Login: colors.navy,
  Approve: colors.green,
  Reject: colors.red,
  Verify: colors.blue,
  RoleChange: '#B26A00',
};

const pad = (n: number) => String(n).padStart(2, '0');

// created_at is stored in UTC (SYSUTCDATETIME) -> show the phone's local time
const formatTime = (s: string) => {
  if (!s) return '';
  const iso = s.replace(/(\.\d{3})\d+/, '$1');
  const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(d.getTime())) return s;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AuditTrailScreen() {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [table, setTable] = useState('All');

  const load = useCallback(async () => {
    try {
      const data = await getAuditList();
      setRows(data ?? []);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load the audit trail.');
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

  const tables = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.table_name))).sort()], [rows]);
  const shown = useMemo(() => (table === 'All' ? rows : rows.filter((r) => r.table_name === table)), [rows, table]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {tables.map((t) => (
            <Pressable key={t} onPress={() => setTable(t)} style={[styles.chip, table === t && styles.chipOn]}>
              <Text style={[styles.chipText, table === t && { color: colors.white }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <Pressable onPress={load} style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={[styles.errorText, { fontWeight: '700', marginTop: 4 }]}>Tap to retry</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={shown}
        keyExtractor={(r) => String(r.audit_id)}
        contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={!error ? <Text style={styles.empty}>No audit entries found.</Text> : null}
        renderItem={({ item }) => {
          const tone = TONE[item.action] ?? colors.muted;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.pill, { borderColor: tone }]}>
                  <Text style={[styles.pillText, { color: tone }]}>{item.action}</Text>
                </View>
                <Text style={styles.time}>{formatTime(item.created_at)}</Text>
              </View>
              <Text style={styles.desc}>{item.description || '-'}</Text>
              <Text style={styles.meta}>
                {item.table_name}
                {item.record_id != null ? `  #${item.record_id}` : ''}
              </Text>
              <Text style={styles.meta}>By: {item.officer_name ?? (item.user_id ? `Officer ${item.user_id}` : 'System')}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  chipBar: { paddingVertical: 10, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  chip: { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.navy, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.navy },
  chipText: { fontSize: 12, color: colors.navy },
  errorBox: { margin: 12, padding: 12, borderRadius: 8, backgroundColor: '#FDECEA' },
  errorText: { color: colors.red, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: '#E8E8E8', padding: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { height: 22, paddingHorizontal: 10, borderRadius: 11, borderWidth: 1, justifyContent: 'center' },
  pillText: { fontSize: 11, fontWeight: '600' },
  time: { fontSize: 11, color: colors.muted },
  desc: { fontSize: 13, color: colors.text, marginTop: 8 },
  meta: { fontSize: 11, color: colors.muted, marginTop: 4 },
});