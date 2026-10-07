import React, { useCallback, useState } from 'react';
<<<<<<< HEAD
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../theme/colors';
import {
  generateReport,
  getReportList,
  type ReportRow,
  type ReportType,
} from '../../services/districtService';
import type { RootStackParamList } from '../../navigation/types';

const REPORT_TYPES: ReportType[] = [
  'All',
  'Birth',
  'Death',
  'Marriage',
  'NIC',
];

const pad = (value: number) => String(value).padStart(2, '0');

const getToday = () => {
  const date = new Date();

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
};

const getYearStart = () => {
  const date = new Date();

  return `${date.getFullYear()}-01-01`;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type GeneratedReport = ReportRow & {
  generated_by_name: string | null;
};

export default function ReportsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [reportType, setReportType] = useState<ReportType>('All');

  const [fromDate, setFromDate] = useState(getYearStart());
  const [toDate, setToDate] = useState(getToday());

  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const [generatedReport, setGeneratedReport] =
    useState<ReportRow | null>(null);

  const [reports, setReports] = useState<GeneratedReport[]>([]);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);

    try {
      const result = await getReportList();

      setReports(result ?? []);
    } catch (error) {
      Alert.alert(
        'Unable to load reports',
        error instanceof Error
          ? error.message
          : 'Unable to load generated reports.',
      );
    } finally {
      setLoadingReports(false);
=======
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
>>>>>>> 74380a1f1690c3b61a3d5836430bed390a595505
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
<<<<<<< HEAD
      void loadReports();
    }, [loadReports]),
  );

  const validateDates = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(fromDate)) {
      Alert.alert(
        'Invalid From Date',
        'Please enter the date using YYYY-MM-DD format.',
      );
      return false;
    }

    if (!dateRegex.test(toDate)) {
      Alert.alert(
        'Invalid To Date',
        'Please enter the date using YYYY-MM-DD format.',
      );
      return false;
    }

    if (fromDate > toDate) {
      Alert.alert(
        'Invalid Date Range',
        'From Date cannot be after To Date.',
      );
      return false;
    }

    return true;
  };

  const handleGenerateReport = async () => {
    if (!validateDates()) {
      return;
    }

    setLoading(true);

    try {
      const result = await generateReport(
        reportType,
        fromDate,
        toDate,
      );

      if (!result?.report) {
        throw new Error('The server did not return a report.');
      }

      setGeneratedReport(result.report);

      await loadReports();

      Alert.alert(
        'Report Generated',
        `Report #${result.report.report_id} has been generated successfully.`,
      );
    } catch (error) {
      Alert.alert(
        'Generate Report Failed',
        error instanceof Error
          ? error.message
          : 'Unable to generate the report.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.root}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.navy}
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Generate Report
          </Text>

          <Text style={styles.headerSubtitle}>
            District registration reports
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Report Type */}
        <Text style={styles.sectionTitle}>
          Report Type
        </Text>

        <View style={styles.typeContainer}>
          {REPORT_TYPES.map((type) => {
            const active = reportType === type;

            return (
              <Pressable
                key={type}
                onPress={() => setReportType(type)}
                style={[
                  styles.typeButton,
                  active && styles.typeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    active && styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Date Range */}
        <Text style={styles.sectionTitle}>
          Date Range
        </Text>

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.label}>From Date</Text>

            <TextInput
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.label}>To Date</Text>

            <TextInput
              value={toDate}
              onChangeText={setToDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* Generate */}
        <Pressable
          disabled={loading}
          onPress={handleGenerateReport}
          style={[
            styles.generateButton,
            loading && styles.disabledButton,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color={colors.white}
            />
          ) : (
            <>
              <Ionicons
                name="document-text-outline"
                size={19}
                color={colors.white}
              />

              <Text style={styles.generateButtonText}>
                Generate Report
              </Text>
            </>
          )}
        </Pressable>

        {/* Generated Report */}
        {generatedReport && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>
                  Report #{generatedReport.report_id}
                </Text>

                <Text style={styles.resultSubtitle}>
                  {generatedReport.report_type}
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={25}
                color={colors.green}
              />
            </View>

            <Text style={styles.dateRange}>
              {generatedReport.from_date} →{' '}
              {generatedReport.to_date}
            </Text>

            <View style={styles.statsContainer}>
              <ReportStat
                label="Total"
                value={generatedReport.total_applications}
              />

              <ReportStat
                label="Approved"
                value={generatedReport.approved_count}
              />

              <ReportStat
                label="Pending"
                value={generatedReport.pending_count}
              />

              <ReportStat
                label="Rejected"
                value={generatedReport.rejected_count}
              />
            </View>
          </View>
        )}

        {/* Previous Reports */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Generated Reports
          </Text>

          <Pressable
            onPress={() => void loadReports()}
            hitSlop={10}
          >
            <Ionicons
              name="refresh"
              size={19}
              color={colors.navy}
            />
          </Pressable>
        </View>

        {loadingReports ? (
          <ActivityIndicator
            style={styles.loading}
            color={colors.navy}
          />
        ) : reports.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="document-outline"
              size={32}
              color={colors.muted}
            />

            <Text style={styles.emptyText}>
              No previously generated reports.
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <View
              key={report.report_id}
              style={styles.reportCard}
            >
              <View style={styles.reportCardTop}>
                <Text style={styles.reportType}>
                  {report.report_type}
                </Text>

                <Text style={styles.reportId}>
                  #{report.report_id}
                </Text>
              </View>

              <Text style={styles.reportDate}>
                {report.from_date} → {report.to_date}
              </Text>

              <View style={styles.reportBottom}>
                <Text style={styles.reportRecords}>
                  {report.total_applications} records
                </Text>

                <Text style={styles.reportCreated}>
                  {report.generated_by_name ?? 'District Officer'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    height: 64,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#D7DFEC',
    fontSize: 10,
    marginTop: 2,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 22,
  },

  typeButton: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  typeButtonActive: {
    backgroundColor: colors.amber,
  },

  typeButtonText: {
    color: colors.white,
    fontSize: 12,
  },

  typeButtonTextActive: {
    color: colors.navy,
    fontWeight: '700',
  },

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  dateBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingTop: 6,
  },

  label: {
    fontSize: 9,
    color: colors.muted,
  },

  input: {
    height: 38,
    fontSize: 12,
    color: colors.text,
  },

  generateButton: {
    height: 46,
    borderRadius: 9,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  generateButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  resultCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  resultSubtitle: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  dateRange: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 10,
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },

  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 10,
  },

  statLabel: {
    color: colors.muted,
    fontSize: 10,
  },

  statValue: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 3,
  },

  listHeader: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  loading: {
    marginTop: 20,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 20,
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },

  reportCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
  },

  reportCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  reportType: {
    color: colors.navy,
    fontWeight: '700',
    fontSize: 13,
  },

  reportId: {
    color: colors.muted,
    fontSize: 10,
  },

  reportDate: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 4,
  },

  reportBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  reportRecords: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },

  reportCreated: {
    color: colors.muted,
    fontSize: 10,
  },
=======
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
  recentTitle: { fontSize: 13, fontWeight: '600', color: colors.text },
>>>>>>> 74380a1f1690c3b61a3d5836430bed390a595505
});