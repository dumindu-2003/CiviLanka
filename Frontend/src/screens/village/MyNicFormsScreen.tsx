import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { getNicList, type NicListItem } from '../../services/nicService';
import { colors } from '../../theme/colors';

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

export default function MyNicFormsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [rows, setRows] = useState<NicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setRows((await getNicList()) ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load the NIC forms.');
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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle}>Filled NIC Forms</Text>
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.navy} />}
      >
        <Text style={styles.note}>NIC forms you submitted from this account.</Text>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : error ? (
          <Text style={styles.empty}>{error}</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.empty}>No NIC forms filled yet.</Text>
        ) : (
          <View style={styles.list}>
            {rows.map((row) => (
              <Pressable
                key={row.app_id}
                onPress={() => nav.navigate('MyNicFormDetail', { appId: row.app_id })}
                accessibilityRole="button"
                style={styles.row}
              >
                <View style={styles.rowBody}>
                  <Text style={styles.rowName}>{row.name || '—'}</Text>
                  <Text style={styles.rowMeta}>
                    {row.app_ref} • {formatDate(row.created_at)}
                  </Text>
                  <Text style={[styles.rowStatus, { color: statusColor(row.status) }]}>{row.status}</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 17, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 28 },
  note: { fontSize: 13, color: colors.muted, marginBottom: 12 },
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
});
