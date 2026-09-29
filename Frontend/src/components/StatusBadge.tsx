import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type Status = 'Pending' | 'Approved' | 'Rejected';
const tone: Record<Status, string> = { Pending: colors.warning, Approved: colors.success, Rejected: colors.danger };

export function StatusBadge({ status }: { status: Status }) {
  return (
    <View style={[styles.badge, { borderColor: tone[status] }]}>
      <Text style={[styles.text, { color: tone[status] }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '600' },
});
