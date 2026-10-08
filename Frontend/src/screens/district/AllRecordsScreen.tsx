import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
import { getDistrictQueue } from '../../services/districtService';
import type {
  ApplicationItem,
  Category,
} from '../../types/district';
import type { RootStackParamList } from '../../navigation/types';

const FILTERS: Category[] = [
  'All',
  'Birth',
  'Death',
  'Marriage',
];

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function AllRecordsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [filter, setFilter] =
    useState<Category>('All');

  const [records, setRecords] =
    useState<ApplicationItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getDistrictQueue(filter);

      setRecords(result ?? []);
    } catch (error) {
      Alert.alert(
        'Unable to Load Records',
        error instanceof Error
          ? error.message
          : 'Unable to load records.',
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      void loadRecords();
    }, [loadRecords]),
  );

  const handleFilterChange = (value: Category) => {
    if (value === filter) {
      return;
    }

    setFilter(value);
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

        <View style={styles.headerContent}>
          <Text style={styles.title}>
            All Records
          </Text>

          <Text style={styles.subtitle}>
            Civil registration records
          </Text>
        </View>

        <View style={styles.countContainer}>
          <Text style={styles.count}>
            {records.length}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRecords}
            tintColor={colors.navy}
          />
        }
      >
        {/* Filters */}
        <View style={styles.filters}>
          {FILTERS.map((value) => {
            const active = filter === value;

            return (
              <Pressable
                key={value}
                onPress={() =>
                  handleFilterChange(value)
                }
                style={[
                  styles.filterButton,
                  active && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Loading */}
        {loading && records.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.navy}
            />

            <Text style={styles.loadingText}>
              Loading records...
            </Text>
          </View>
        ) : records.length === 0 ? (
          /* Empty */
          <View style={styles.empty}>
            <Ionicons
              name="folder-open-outline"
              size={42}
              color={colors.muted}
            />

            <Text style={styles.emptyTitle}>
              No Records Found
            </Text>

            <Text style={styles.emptyText}>
              There are no {filter === 'All' ? '' : filter.toLowerCase() + ' '}
              records available.
            </Text>

            <Pressable
              onPress={() => void loadRecords()}
              style={styles.retryButton}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={colors.white}
              />

              <Text style={styles.retryText}>
                Refresh
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Records */
          <View>
            {records.map((item) => (
              <RecordCard
                key={`${item.category}-${item.id}`}
                item={item}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecordCard({
  item,
}: {
  item: ApplicationItem;
}) {
  const status = item.status;

  let statusColor = colors.muted;

  if (status === 'Approved') {
    statusColor = colors.green;
  } else if (status === 'Rejected') {
    statusColor = colors.red;
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.idRow}>
          <Text style={styles.id}>
            {item.id}
          </Text>

          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: statusColor,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: statusColor,
              },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      <Text style={styles.applicantName}>
        {item.applicantName}
      </Text>

      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-outline"
          size={13}
          color={colors.muted}
        />

        <Text style={styles.date}>
          Submitted: {item.submittedOn || '—'}
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

  headerContent: {
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

  countContainer: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  count: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: '700',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  filters: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 15,
  },

  filterButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: colors.amber,
  },

  filterText: {
    color: colors.white,
    fontSize: 11,
  },

  filterTextActive: {
    color: colors.navy,
    fontWeight: '700',
  },

  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },

  loadingText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 10,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 65,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  retryButton: {
    marginTop: 18,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  retryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 14,
    marginBottom: 9,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  id: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '700',
  },

  categoryTag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  categoryText: {
    color: colors.muted,
    fontSize: 9,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  applicantName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 11,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },

  date: {
    color: colors.muted,
    fontSize: 10,
  },
});