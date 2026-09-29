import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flexBasis: '48%', flexGrow: 1, backgroundColor: colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 13 },
  value: { color: colors.primary, fontSize: 26, fontWeight: '700', marginTop: 4 },
});
