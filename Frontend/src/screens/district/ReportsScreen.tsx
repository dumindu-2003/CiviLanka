import React, { useCallback, useState } from 'react';
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
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
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
});