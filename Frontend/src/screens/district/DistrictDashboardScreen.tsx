import React, { useCallback, useMemo, useState } from 'react';
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
import type { RootStackParamList } from '../../navigation/types';
import { getDistrictSummary } from '../../services/districtService';

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type ActionItem = {
  label: string;
  icon: IconName;
  route?: keyof RootStackParamList;
  tab?: string;
};

type SummaryData = {
  total?: number;
  birth?: number;
  death?: number;
  marriage?: number;
  nic?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
};

const ACTIONS: ActionItem[] = [
  {
    label: 'View All Records',
    icon: 'grid-outline',
    route: 'AllRecords',
  },
  {
    label: 'Generate Report',
    icon: 'document-text-outline',
    route: 'Reports',
  },
  {
    label: 'Audit Trail',
    icon: 'time-outline',
    route: 'AuditTrail',
  },
  {
    label: 'Add Profile',
    icon: 'person-add-outline',
    route: 'AddProfile',
  },
  {
    label: 'Find People',
    icon: 'search-outline',
    route: 'FindPeople',
  },
  {
    label: 'View Profile',
    icon: 'person-circle-outline',
    tab: 'Profile',
  },
  {
    label: 'NIC Request',
    icon: 'id-card-outline',
    route: 'NicPendingList',
  },
];

export default function DistrictDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [summary, setSummary] = useState<SummaryData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await getDistrictSummary();

      if (result) {
        setSummary(result);
      }
    } catch (error) {
      console.error(
        'District dashboard loading error:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadDashboard();
  }, [loadDashboard]);

  const totalRecords = useMemo(() => {
    if (typeof summary.total === 'number') {
      return summary.total;
    }

    return (
      (summary.birth ?? 0) +
      (summary.death ?? 0) +
      (summary.marriage ?? 0) +
      (summary.nic ?? 0)
    );
  }, [summary]);

  const runAction = useCallback(
    (action: ActionItem) => {
      if (action.route) {
        navigation.navigate(action.route as any);
        return;
      }

      if (action.tab) {
        /*
         * If your parent navigator has a Profile tab,
         * this attempts to navigate to it.
         */
        try {
          navigation.navigate(
            'MainTabs' as any,
            {
              screen: action.tab,
            } as any,
          );
        } catch (error) {
          console.error(
            'Unable to navigate to tab:',
            error,
          );

          Alert.alert(
            'Navigation',
            `${action.label} is not available from this screen.`,
          );
        }

        return;
      }

      Alert.alert(
        action.label,
        'This feature is not available yet.',
      );
    },
    [navigation],
  );

  return (
    <SafeAreaView
      style={styles.root}
      edges={['top', 'bottom']}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="business-outline"
              size={22}
              color={colors.navy}
            />
          </View>

          <View>
            <Text style={styles.headerTitle}>
              District Dashboard
            </Text>

            <Text style={styles.headerSubtitle}>
              Civil Registration System
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.notificationButton}
          onPress={() => {
            Alert.alert(
              'Notifications',
              'No new notifications.',
            );
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color={colors.white}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.navy}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            WELCOME
        ====================================================== */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            District Overview
          </Text>

          <Text style={styles.welcomeText}>
            Manage civil registration records and district
            activities.
          </Text>
        </View>

        {/* =====================================================
            SUMMARY CARD
        ====================================================== */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>
                Total Records
              </Text>

              <Text style={styles.summaryDescription}>
                Current district records
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="documents-outline"
                size={22}
                color={colors.navy}
              />
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              style={styles.summaryLoader}
              color={colors.navy}
            />
          ) : (
            <Text style={styles.totalNumber}>
              {totalRecords}
            </Text>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryStats}>
            <SummaryItem
              label="Birth"
              value={summary.birth ?? 0}
              icon="happy-outline"
            />

            <SummaryItem
              label="Death"
              value={summary.death ?? 0}
              icon="heart-outline"
            />

            <SummaryItem
              label="Marriage"
              value={summary.marriage ?? 0}
              icon="people-outline"
            />

            <SummaryItem
              label="NIC"
              value={summary.nic ?? 0}
              icon="card-outline"
            />
          </View>
        </View>

        {/* =====================================================
            STATUS
        ====================================================== */}
        <Text style={styles.sectionTitle}>
          Application Status
        </Text>

        <View style={styles.statusRow}>
          <StatusCard
            label="Pending"
            value={summary.pending ?? 0}
            icon="time-outline"
          />

          <StatusCard
            label="Approved"
            value={summary.approved ?? 0}
            icon="checkmark-circle-outline"
          />

          <StatusCard
            label="Rejected"
            value={summary.rejected ?? 0}
            icon="close-circle-outline"
          />
        </View>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}
        <View style={styles.actionsHeader}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <Text style={styles.actionCount}>
            {ACTIONS.length} actions
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          {ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => runAction(action)}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name={action.icon}
                  size={23}
                  color={colors.navy}
                />
              </View>

              <Text style={styles.actionLabel}>
                {action.label}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={colors.muted}
              />
            </Pressable>
          ))}
        </View>

        {/* =====================================================
            RECENT ACTIVITY
        ====================================================== */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>
            Recent Activity
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate('AuditTrail')
            }
          >
            <Text style={styles.viewAllText}>
              View All
            </Text>
          </Pressable>
        </View>

        <View style={styles.activityCard}>
          <ActivityRow
            icon="document-text-outline"
            title="District records"
            subtitle="View and manage all records"
            onPress={() =>
              navigation.navigate('AllRecords')
            }
          />

          <View style={styles.activityDivider} />

          <ActivityRow
            icon="time-outline"
            title="Audit trail"
            subtitle="Review recent system activity"
            onPress={() =>
              navigation.navigate('AuditTrail')
            }
          />

          <View style={styles.activityDivider} />

          <ActivityRow
            icon="bar-chart-outline"
            title="Reports"
            subtitle="Generate district reports"
            onPress={() =>
              navigation.navigate('Reports')
            }
          />
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   SUMMARY ITEM
============================================================ */

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: IconName;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons
        name={icon}
        size={15}
        color={colors.navy}
      />

      <Text style={styles.summaryItemValue}>
        {value}
      </Text>

      <Text style={styles.summaryItemLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ============================================================
   STATUS CARD
============================================================ */

function StatusCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: IconName;
}) {
  return (
    <View style={styles.statusCard}>
      <Ionicons
        name={icon}
        size={19}
        color={colors.navy}
      />

      <Text style={styles.statusValue}>
        {value}
      </Text>

      <Text style={styles.statusLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ============================================================
   ACTIVITY ROW
============================================================ */

function ActivityRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.activityRow,
        pressed && styles.activityRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.activityIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={colors.navy}
        />
      </View>

      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>
          {title}
        </Text>

        <Text style={styles.activitySubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={colors.muted}
      />
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    height: 70,
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#D7DFEC',
    fontSize: 10,
    marginTop: 2,
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  welcomeSection: {
    marginBottom: 15,
  },

  welcomeTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },

  welcomeText: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 17,
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 20,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  summaryDescription: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryLoader: {
    marginTop: 20,
    marginBottom: 20,
  },

  totalNumber: {
    color: colors.navy,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 13,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 13,
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  summaryItemValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },

  summaryItemLabel: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },

  statusCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  statusValue: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 5,
  },

  statusLabel: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },

  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  actionCount: {
    color: colors.muted,
    fontSize: 10,
  },

  actionsGrid: {
    gap: 8,
  },

  actionCard: {
    minHeight: 58,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  actionIconContainer: {
    width: 39,
    height: 39,
    borderRadius: 9,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  recentHeader: {
    marginTop: 23,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAllText: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: '700',
  },

  activityCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingHorizontal: 13,
  },

  activityRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityRowPressed: {
    opacity: 0.65,
  },

  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  activityText: {
    flex: 1,
  },

  activityTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  activitySubtitle: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 3,
  },

  activityDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  bottomSpace: {
    height: 20,
  },
});