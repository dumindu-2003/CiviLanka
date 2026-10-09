import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {
  approveApplication,
  getDistrictQueue,
  rejectApplication,
} from '../../services/districtService';
import type {
  ApplicationItem,
  Category,
  Decision,
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

  // record + decision waiting for the authorizing officer's sign-off
  const [target, setTarget] = useState<{
    item: ApplicationItem;
    decision: Decision;
  } | null>(null);

  const [saving, setSaving] = useState(false);

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

  const handleConfirm = async (c: {
    serviceNo: string;
    username: string;
    password: string;
    reason: string;
  }) => {
    if (!target) {
      return;
    }

    const credentials = {
      officerUserName: c.username,
      authorizingServiceNo: c.serviceNo,
      officerPassword: c.password,
    };

    setSaving(true);

    try {
      if (target.decision === 'APPROVE') {
        await approveApplication(target.item.id, credentials);
      } else {
        await rejectApplication(
          target.item.id,
          c.reason,
          credentials,
        );
      }

      const done =
        target.decision === 'APPROVE'
          ? 'approved'
          : 'rejected';

      const id = target.item.id;

      setTarget(null);
      await loadRecords();

      Alert.alert('Status updated', `${id} was ${done}.`);
    } catch (error) {
      Alert.alert(
        'Could not change status',
        error instanceof Error
          ? error.message
          : 'Status change failed.',
      );
    } finally {
      setSaving(false);
    }
  };

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
                onApprove={() =>
                  setTarget({ item, decision: 'APPROVE' })
                }
                onReject={() =>
                  setTarget({ item, decision: 'REJECT' })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <StatusChangeModal
        visible={!!target}
        busy={saving}
        decision={target?.decision ?? 'APPROVE'}
        recordId={target?.item.id ?? ''}
        onCancel={() => {
          if (!saving) {
            setTarget(null);
          }
        }}
        onSubmit={handleConfirm}
      />
    </SafeAreaView>
  );
}

function RecordCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApplicationItem;
  onApprove: () => void;
  onReject: () => void;
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

      <View style={styles.actionRow}>
        <Pressable
          onPress={onApprove}
          disabled={status === 'Approved'}
          accessibilityRole="button"
          style={[
            styles.actionButton,
            { backgroundColor: colors.green },
            status === 'Approved' && styles.actionDisabled,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={14}
            color={colors.white}
          />

          <Text style={styles.actionText}>Approve</Text>
        </Pressable>

        <Pressable
          onPress={onReject}
          disabled={status === 'Rejected'}
          accessibilityRole="button"
          style={[
            styles.actionButton,
            { backgroundColor: colors.red },
            status === 'Rejected' && styles.actionDisabled,
          ]}
        >
          <Ionicons
            name="close"
            size={14}
            color={colors.white}
          />

          <Text style={styles.actionText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Sign-off popup: the authorizing officer confirms the status change.
// A rejection also needs a reason.
function StatusChangeModal({
  visible,
  busy,
  decision,
  recordId,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  busy: boolean;
  decision: Decision;
  recordId: string;
  onCancel: () => void;
  onSubmit: (c: {
    serviceNo: string;
    username: string;
    password: string;
    reason: string;
  }) => void;
}) {
  const [serviceNo, setServiceNo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  const reject = decision === 'REJECT';

  const submit = () => {
    if (reject && !reason.trim()) {
      Alert.alert(
        'Reason required',
        'Enter the reason for rejecting this record.',
      );
      return;
    }

    if (!serviceNo.trim() || !username.trim() || !password) {
      Alert.alert(
        'Credentials required',
        'Enter the authorizing officer service no, username and password.',
      );
      return;
    }

    onSubmit({
      serviceNo: serviceNo.trim(),
      username: username.trim(),
      password,
      reason: reason.trim(),
    });

    setPassword('');
  };

  const close = () => {
    setPassword('');
    setReason('');
    onCancel();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>
                {reject ? 'Reject record' : 'Approve record'}
              </Text>

              <Text style={styles.modalSub}>
                {recordId} • Digital sign-off protocol
              </Text>
            </View>

            <Pressable
              onPress={close}
              hitSlop={8}
              accessibilityLabel="Close"
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.white}
              />
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            {reject ? (
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>
                  REASON FOR REJECTION
                </Text>

                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Enter the reason"
                  placeholderTextColor="#9A9A9A"
                  multiline
                  maxLength={250}
                  style={[
                    styles.modalInput,
                    { minHeight: 60, textAlignVertical: 'top' },
                  ]}
                />
              </View>
            ) : null}

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>
                AUTHORIZING OFFICER SERVICE NO
              </Text>

              <TextInput
                value={serviceNo}
                onChangeText={setServiceNo}
                placeholder="e.g. DR-0001"
                placeholderTextColor="#9A9A9A"
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>
                OFFICER USERNAME
              </Text>

              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#9A9A9A"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>
                OFFICER PASSWORD / PIN
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password or PIN"
                placeholderTextColor="#9A9A9A"
                autoCapitalize="none"
                secureTextEntry
                style={styles.modalInput}
              />
            </View>

            <Pressable
              onPress={submit}
              disabled={busy}
              accessibilityRole="button"
              style={[
                styles.modalSubmit,
                {
                  backgroundColor: reject
                    ? colors.red
                    : colors.green,
                },
                busy && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.modalSubmitText}>
                {busy
                  ? 'Submitting...'
                  : reject
                    ? 'Authorize & Reject'
                    : 'Authorize & Approve'}
              </Text>
            </Pressable>

            <Pressable
              onPress={close}
              disabled={busy}
              accessibilityRole="button"
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  actionDisabled: {
    opacity: 0.35,
  },

  actionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },

  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.navy,
    padding: 14,
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },

  modalSub: {
    fontSize: 10,
    color: '#C9D1E3',
    marginTop: 1,
  },

  modalBody: {
    padding: 16,
    gap: 10,
  },

  modalField: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E8EE',
    backgroundColor: colors.field,
    overflow: 'hidden',
  },

  modalLabel: {
    fontSize: 8,
    letterSpacing: 0.5,
    color: colors.muted,
    paddingHorizontal: 10,
    paddingTop: 6,
  },

  modalInput: {
    minHeight: 36,
    fontSize: 13,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  modalSubmit: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  modalSubmitText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },

  modalCancel: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
});