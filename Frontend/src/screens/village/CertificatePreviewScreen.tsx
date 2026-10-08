import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { getVillageCertificates, type VillageCertificatePreview } from '../../services/villageService';
import { colors } from '../../theme/colors';
import { CATEGORY, LIST_TITLE, TITLE, listDate, show, statusColor, type CertificateKind } from './certificateFields';

export default function CertificatePreviewScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CertificatePreview'>>();
  const kind: CertificateKind = route.params.kind;

  const [rows, setRows] = useState<VillageCertificatePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (asRefresh = false) => {
      if (asRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        setRows((await getVillageCertificates(CATEGORY[kind])) ?? []);
      } catch (e: any) {
        setError(e?.message ?? 'Could not load these certificates.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [kind],
  );

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
          <Text style={styles.appBarTitle}>{TITLE[kind]}</Text>
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.navy} />}
      >
        <Text style={styles.listTitle}>{LIST_TITLE[kind]}</Text>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : error ? (
          <Text style={styles.empty}>{error}</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.empty}>No {CATEGORY[kind].toLowerCase()} certificates in the register.</Text>
        ) : (
          <View style={styles.list}>
            {rows.map((row) => (
              <View key={row.app_ref} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowName}>{show(row.subject_name)}</Text>
                  <Text style={styles.rowMeta}>
                    {row.app_ref} • {listDate(kind, row)}
                  </Text>
                  <Text style={[styles.rowStatus, { color: statusColor(row.status) }]}>{row.status}</Text>
                </View>
                <Pressable
                  onPress={() => nav.navigate('CertificateDetail', { kind, ref: row.app_ref })}
                  accessibilityRole="button"
                  style={styles.viewBtn}
                >
                  <Text style={styles.viewText}>View</Text>
                </Pressable>
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
  scroll: { padding: 16, paddingBottom: 24 },
  loader: { marginTop: 40 },
  empty: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 8 },
  listTitle: { marginBottom: 12, fontSize: 18, fontWeight: '700', color: colors.text },
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
  viewBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});
