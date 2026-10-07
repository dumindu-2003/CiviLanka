import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../theme/colors';
import { getAuditList } from '../../services/auditService';
import type { AuditEntry } from '../../services/auditService';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function AuditTrailScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getAuditList({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      setEntries(result ?? []);
    } catch (error) {
      Alert.alert(
        'Audit Trail',
        error instanceof Error
          ? error.message
          : 'Unable to load audit records.',
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useFocusEffect(
    useCallback(() => {
      void loadAudit();
    }, [loadAudit]),
  );

  return (
    <SafeAreaView
      style={styles.root}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.navy}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Audit Trail
          </Text>

          <Text style={styles.subtitle}>
            System activity and officer actions
          </Text>
        </View>

        <View style={styles.countBox}>
          <Text style={styles.countText}>
            {entries.length}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAudit}
            tintColor={colors.navy}
          />
        }
      >
        {/* Filters */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>
            Date Filter
          </Text>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.label}>
                From
              </Text>

              <TextInput
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.dateInput}>
              <Text style={styles.label}>
                To
              </Text>

              <TextInput
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Pressable
            style={styles.filterButton}
            onPress={() => void loadAudit()}
          >
            <Ionicons
              name="search"
              size={16}
              color={colors.white}
            />

            <Text style={styles.filterButtonText}>
              Apply Filter
            </Text>
          </Pressable>
        </View>

        {/* Loading */}
        {loading && entries.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={colors.navy}
            />

            <Text style={styles.loadingText}>
              Loading audit records...
            </Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={44}
              color={colors.muted}
            />

            <Text style={styles.emptyTitle}>
              No Audit Records
            </Text>

            <Text style={styles.emptyText}>
              No audit activity was found for the selected
              date range.
            </Text>

            <Pressable
              style={styles.refreshButton}
              onPress={() => void loadAudit()}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={colors.white}
              />

              <Text style={styles.refreshText}>
                Refresh
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {entries.map((entry) => (
              <AuditCard
                key={String(entry.audit_id)}
                entry={entry}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AuditCard({
  entry,
}: {
  entry: AuditEntry;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.actionContainer}>
          <Ionicons
            name="flash-outline"
            size={16}
            color={colors.navy}
          />

          <Text style={styles.action}>
            {entry.action}
          </Text>
        </View>

        <Text style={styles.auditId}>
          #{entry.audit_id}
        </Text>
      </View>

      <Text style={styles.description}>
        {entry.description}
      </Text>

      <View style={styles.metaRow}>
        <Ionicons
          name="person-outline"
          size={13}
          color={colors.muted}
        />

        <Text style={styles.meta}>
          {entry.officer_name ?? 'Unknown officer'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons
          name="server-outline"
          size={13}
          color={colors.muted}
        />

        <Text style={styles.meta}>
          {entry.table_name}
          {entry.record_id != null
            ? ` #${entry.record_id}`
            : ''}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons
          name="time-outline"
          size={13}
          color={colors.muted}
        />

        <Text style={styles.meta}>
          {entry.created_at}
        </Text>
      </View>
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

  headerText: {
    flex: 1,
  },

  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  subtitle: {
    color: '#D7DFEC',
    fontSize: 10,
    marginTop: 2,
  },

  countBox: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '700',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  filterCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 13,
    marginBottom: 14,
  },

  filterTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },

  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },

  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingTop: 5,
  },

  label: {
    color: colors.muted,
    fontSize: 9,
  },

  input: {
    height: 34,
    color: colors.text,
    fontSize: 11,
  },

  filterButton: {
    height: 38,
    marginTop: 9,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  filterButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  loading: {
    alignItems: 'center',
    paddingTop: 50,
  },

  loadingText: {
    marginTop: 9,
    color: colors.muted,
    fontSize: 11,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  emptyText: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },

  refreshButton: {
    marginTop: 17,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  refreshText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },

  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 13,
    marginBottom: 9,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  action: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  auditId: {
    color: colors.muted,
    fontSize: 9,
  },

  description: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },

  meta: {
    color: colors.muted,
    fontSize: 10,
  },
});