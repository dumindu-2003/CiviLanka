import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { decideApplication, loadDashboard } from '../../actions/districtAction';
import { StatTile } from '../../components/StatTile';
import { StatusBadge } from '../../components/StatusBadge';
import { AppButton } from '../../components/AppButton';
import { AuthorizeSignOffModal } from '../../components/AuthorizeSignOffModal';
import type { RootStackParamList } from '../../navigation/types';
import type { SignOffCredentials } from '../../types/auth';
import type { ApplicationItem, Category, Decision } from '../../types/district';
import { colors, spacing } from '../../theme';

const CATEGORIES: Category[] = ['All', 'Birth', 'Death', 'Marriage'];

export default function DistrictDashboardScreen() {
  const dispatch = useAppDispatch();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { summary, queue, category, status, error } = useAppSelector((s) => s.district);
  const user = useAppSelector((s) => s.auth.user);

  const [pending, setPending] = useState<{ id: string; decision: Decision } | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadDashboard(category));
    }, [dispatch, category]),
  );

  const confirm = async (credentials: SignOffCredentials) => {
    if (!pending) return;
    const result = await dispatch(decideApplication({ ...pending, credentials }));
    setPending(null);
    if (decideApplication.rejected.match(result)) {
      Alert.alert('Not authorized', result.error.message ?? 'Action failed');
    }
  };

  const renderItem = ({ item }: { item: ApplicationItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>{item.id} · {item.category}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.muted}>{item.applicantName} · {item.submittedOn}</Text>
      <View style={styles.row}>
        <AppButton
          title="View"
          variant="outline"
          style={styles.flex}
          onPress={() => nav.navigate('NicApplicationReview', { applicationId: item.id })}
        />
        <AppButton
          title="Approve"
          style={styles.flex}
          disabled={item.status !== 'Pending'}
          onPress={() => setPending({ id: item.id, decision: 'APPROVE' })}
        />
        <AppButton
          title="Reject"
          variant="danger"
          style={styles.flex}
          disabled={item.status !== 'Pending'}
          onPress={() => setPending({ id: item.id, decision: 'REJECT' })}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={queue}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshing={status === 'loading'}
        onRefresh={() => dispatch(loadDashboard(category))}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={
          <>
            <Text style={styles.welcome}>Welcome, {user?.fullName}</Text>
            <View style={styles.tiles}>
              <StatTile label="Pending Approvals" value={summary?.pending ?? '-'} />
              <StatTile label="Approved" value={summary?.approved ?? '-'} />
              <StatTile label="Rejected" value={summary?.rejected ?? '-'} />
              <StatTile label="Total Records" value={summary?.totalRecords ?? '-'} />
            </View>

            <Text style={styles.section}>Queue Filters</Text>
            <View style={styles.row}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => dispatch(loadDashboard(c))}
                  style={[styles.chip, c === category && styles.chipActive]}
                >
                  <Text style={[styles.chipText, c === category && { color: '#fff' }]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.section}>Applications Queue</Text>
            {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
          </>
        }
        ListFooterComponent={
          <View style={{ marginTop: spacing.md }}>
            <AppButton title="Generate Report" onPress={() => nav.navigate('Reports')} />
            <AppButton title="NIC Requests" variant="outline" onPress={() => nav.navigate('NicPendingList')} />
          </View>
        }
      />

      <AuthorizeSignOffModal
        visible={!!pending}
        title={pending?.decision === 'APPROVE' ? 'Authorize Approval' : 'Authorize Rejection'}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  welcome: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  section: { fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  flex: { flex: 1 },
  chip: { paddingHorizontal: 14, minHeight: 44, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: colors.primary },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: spacing.md, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginVertical: 6 },
});
