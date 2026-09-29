import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

// Temporary screen. Replace with the real UI from Figma.
export function PlaceholderScreen({ title, owner, note }: { title: string; owner: string; note?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>TODO ({owner}): build this screen from Figma</Text>
      {note ? <Text style={styles.sub}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  sub: { color: colors.muted, textAlign: 'center' },
});
