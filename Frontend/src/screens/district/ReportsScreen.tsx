import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import { downloadReportPdf } from '../../utils/reportPdf';
import {
  ReportRow,
  ReportType,
  generateReport,
  getReportList,
  getReportTrend,
} from '../../services/districtService';
import { colors } from '../../theme/colors';

const TYPES: ReportType[] = ['All', 'Birth', 'Death', 'Marriage', 'NIC'];

type Result = Awaited<ReturnType<typeof generateReport>>;
type RecentRow = ReportRow & { generated_by_name: string | null };

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isRealDate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const day = (s?: string) => (s ? String(s).slice(0, 10) : '-');

function Tile({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const today = new Date();
  const officerName = useAppSelector((st) => st.auth.user?.fullName) ?? '';
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [type, setType] = useState<ReportType>('All');
  const [from, setFrom] = useState(ymd(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(ymd(today));
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [trend, setTrend] = useState<{ month: string; total: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadExtras = useCallback(async () => {
    try {
      const [list, tr] = await Promise.all([getReportList(), getReportTrend()]);
      setRecent(list ?? []);
      setTrend(tr ?? []);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load previous reports.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExtras();
    }, [loadExtras]),
  );

  const generate = async () => {
    if (!isRealDate(from) || !isRealDate(to)) return Alert.alert('Check the dates', 'Use the format YYYY-MM-DD, for example 2026-10-01.');
    if (from > to) return Alert.alert('Check the dates', 'The "From" date must be on or before the "To" date.');
    setBusy(true);
    try {
      setResult(await generateReport(type, from, to));
      await loadExtras();
    } catch (e: any) {
      Alert.alert('Report not generated', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const savePdf = async (key: string, r: ReportRow, cats: Result['byCategory'] | null, by: string) => {
    setPdfBusy(key);
    try {
      await downloadReportPdf(r, cats, by);
    } catch (e: any) {
      Alert.alert('PDF not created', e?.message ?? 'Please try again.');
    } finally {
      setPdfBusy(null);
    }
  };

  const maxTrend = Math.max(1, ...trend.map((t) => t.total));

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadExtras();
          }}
        />
      }
    >
      {/* generate */}
      <View style={styles.card}>
        <Text style={styles.heading}>Generate Report</Text>

        <Text style={styles.label}>CERTIFICATE TYPE</Text>
        <View style={styles.chips}>
          {TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[styles.chip, type === t && styles.chipOn]}>
              <Text style={[styles.chipText, type === t && { color: colors.white }]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.dates}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>FROM (YYYY-MM-DD)</Text>
            <TextInput value={from} onChangeText={setFrom} style={styles.input} autoCapitalize="none" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>TO (YYYY-MM-DD)</Text>
            <TextInput value={to} onChangeText={setTo} style={styles.input} autoCapitalize="none" keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        <Pressable onPress={generate} disabled={busy} style={[styles.btn, busy && { opacity: 0.6 }]}>
          {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>GENERATE REPORT</Text>}
        </Pressable>
      </View>

      {error ? (
        <Pressable onPress={loadExtras} style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={[styles.errorText, { fontWeight: '700', marginTop: 4 }]}>Tap to retry</Text>
        </Pressable>
      ) : null}

      {/* result */}
      {result ? (
        <View style={styles.card}>
          <Text style={styles.heading}>
            {result.report.report_type} report  ·  {day(result.report.from_date)} to {day(result.report.to_date)}
          </Text>
          <View style={styles.tiles}>
            <Tile label="TOTAL" value={result.report.total_applications} />
            <Tile label="APPROVED" value={result.report.approved_count} tone={colors.green} />
            <Tile label="PENDING" value={result.report.pending_count} />
            <Tile label="REJECTED" value={result.report.rejected_count} tone={colors.red} />
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>BY CERTIFICATE TYPE</Text>
          {result.byCategory.length === 0 ? (
            <Text style={styles.muted}>No applications in this period.</Text>
          ) : (
            result.byCategory.map((c) => (
              <View key={c.category} style={styles.catRow}>
                <Text style={styles.catName}>{c.category}</Text>
                <Text style={styles.catNums}>
                  {c.total} total · {c.approved} approved · {c.pending} pending · {c.rejected} rejected
                </Text>
              </View>
            ))
          )}

          <Pressable
            onPress={() => savePdf('current', result.report, result.byCategory, officerName)}
            disabled={pdfBusy !== null}
            style={[styles.btn, { marginTop: 14 }, pdfBusy !== null && { opacity: 0.6 }]}
          >
            {pdfBusy === 'current' ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>DOWNLOAD PDF</Text>}
          </Pressable>
        </View>
      ) : null}

      {/* trend */}
      {trend.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.heading}>Applications - last 6 months</Text>
          {trend.map((t) => (
            <View key={t.month} style={styles.trendRow}>
              <Text style={styles.trendMonth}>{t.month}</Text>
              <View style={styles.trendTrack}>
                <View style={[styles.trendBar, { width: `${Math.max(4, (t.total / maxTrend) * 100)}%` }]} />
              </View>
              <Text style={styles.trendNum}>{t.total}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* previous reports */}
      <View style={styles.card}>
        <Text style={styles.heading}>Recent reports</Text>
        {recent.length === 0 ? (
          <Text style={styles.muted}>No reports generated yet.</Text>
        ) : (
          recent.map((r) => (
            <View key={r.report_id} style={styles.recentRow}>
              <Text style={styles.recentTitle}>
                {r.report_type}  ·  {day(r.from_date)} to {day(r.to_date)}
              </Text>
              <Text style={styles.catNums}>
                {r.total_applications} total · {r.approved_count} approved · {r.pending_count} pending · {r.rejected_count} rejected
              </Text>
              <Text style={styles.muted}>By {r.generated_by_name ?? 'Officer'} on {day(r.created_at)}</Text>
              <Pressable
                onPress={() => savePdf(`r${r.report_id}`, r, null, r.generated_by_name ?? '')}
                disabled={pdfBusy !== null}
                style={[styles.pdfLink, pdfBusy !== null && { opacity: 0.6 }]}
              >
                {pdfBusy === `r${r.report_id}` ? (
                  <ActivityIndicator color={colors.navy} />
                ) : (
                  <Text style={styles.pdfLinkText}>Download PDF</Text>
                )}
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8', padding: 14 },
  heading: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 10 },
  label: { fontSize: 9, letterSpacing: 0.6, color: colors.muted, marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.navy, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.navy },
  chipText: { fontSize: 12, color: colors.navy },
  dates: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.field,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  btn: { height: 44, borderRadius: 10, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 13, fontWeight: '600', letterSpacing: 0.6 },
  errorBox: { padding: 12, borderRadius: 8, backgroundColor: '#FDECEA' },
  errorText: { color: colors.red, fontSize: 12 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: 8, backgroundColor: colors.field, padding: 10, alignItems: 'center' },
  tileLabel: { fontSize: 8, letterSpacing: 0.6, color: colors.muted },
  tileValue: { fontSize: 20, fontWeight: '700', color: colors.navy, marginTop: 4 },
  catRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  catName: { fontSize: 13, fontWeight: '600', color: colors.text },
  catNums: { fontSize: 11, color: colors.muted, marginTop: 2 },
  muted: { fontSize: 11, color: colors.muted, marginTop: 2 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  trendMonth: { width: 64, fontSize: 11, color: colors.muted },
  trendTrack: { flex: 1, height: 12, borderRadius: 6, backgroundColor: colors.soft, overflow: 'hidden' },
  trendBar: { height: 12, borderRadius: 6, backgroundColor: colors.navy },
  trendNum: { width: 32, textAlign: 'right', fontSize: 12, color: colors.text },
  recentRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  pdfLink: { alignSelf: 'flex-start', height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.navy, justifyContent: 'center', marginTop: 8 },
  pdfLinkText: { fontSize: 11, color: colors.navy, fontWeight: '600' },
  recentTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
});