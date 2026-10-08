import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { getVillageCertificates, type VillageCertificatePreview } from '../../services/villageService';
import { colors } from '../../theme/colors';
import { downloadCertificatePdf } from '../../utils/certificatePdf';
import { CATEGORY, TITLE, linesFor, statusColor, type CertificateKind } from './certificateFields';

export default function CertificateDetailScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CertificateDetail'>>();
  const kind: CertificateKind = route.params.kind;
  const ref = route.params.ref;

  const [row, setRow] = useState<VillageCertificatePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getVillageCertificates(CATEGORY[kind])) ?? [];
      const match = data.find((item) => item.app_ref === ref) ?? null;
      setRow(match);
      if (!match) setError('This certificate is no longer in the register.');
    } catch (e: any) {
      setError(e?.message ?? 'Could not load this certificate.');
    } finally {
      setLoading(false);
    }
  }, [kind, ref]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const backToList = () => {
    const state = nav.getState();
    const previous = state.routes[state.index - 1];
    if (previous?.name === 'CertificatePreview') {
      nav.goBack();
      return;
    }
    nav.replace('CertificatePreview', { kind });
  };

  const lines = row ? linesFor(kind, row) : [];

  const download = async () => {
    if (!row || downloading) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf(TITLE[kind], row.app_ref, row.status, lines);
    } catch (e: any) {
      Alert.alert('Download failed', e?.message ?? 'The certificate PDF could not be saved.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={backToList} style={styles.iconBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.appBarTitle}>{TITLE[kind]}</Text>
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : error || !row ? (
          <Text style={styles.empty}>{error ?? 'This certificate could not be opened.'}</Text>
        ) : (
          <View style={styles.paper}>
            <Text style={styles.republic}>Democratic Socialist Republic of Sri Lanka</Text>
            <Text style={styles.paperTitle}>{TITLE[kind]}</Text>
            <Text style={styles.ref}>Ref {row.app_ref}</Text>
            <View style={[styles.stamp, { borderColor: statusColor(row.status) }]}>
              <Text style={[styles.stampText, { color: statusColor(row.status) }]}>{row.status}</Text>
            </View>
            {lines.map((line) => (
              <View key={line.label} style={styles.field}>
                <Text style={styles.fieldLabel}>{line.label}</Text>
                <Text style={styles.fieldValue}>{line.value}</Text>
              </View>
            ))}
            <Pressable
              onPress={download}
              disabled={downloading}
              accessibilityRole="button"
              style={[styles.downloadBtn, downloading && styles.downloadBtnBusy]}
            >
              {downloading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="download-outline" size={18} color={colors.white} />
                  <Text style={styles.downloadText}>Download</Text>
                </>
              )}
            </Pressable>
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
  empty: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 24 },
  paper: {
    backgroundColor: '#FFFEF8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4D7B8',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 16,
  },
  republic: { textAlign: 'center', fontSize: 11, letterSpacing: 0.4, color: '#7A6844', fontWeight: '600' },
  paperTitle: { textAlign: 'center', marginTop: 8, fontSize: 22, fontWeight: '700', color: colors.navy },
  ref: { textAlign: 'center', marginTop: 4, fontSize: 13, color: colors.muted },
  stamp: {
    alignSelf: 'center',
    marginTop: 14,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  stampText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  field: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E6DCC4', paddingVertical: 10 },
  fieldLabel: { fontSize: 11, color: '#7A6844', fontWeight: '600', letterSpacing: 0.3 },
  fieldValue: { marginTop: 2, fontSize: 16, color: colors.text, fontWeight: '500' },
  downloadBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnBusy: { opacity: 0.7 },
  downloadText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
