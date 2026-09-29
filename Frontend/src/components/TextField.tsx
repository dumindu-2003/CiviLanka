import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string; // validation message shown next to the field
}

export function TextField({ label, error, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? { borderColor: colors.danger } : null]}
        placeholderTextColor={colors.muted}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, minHeight: 48, color: colors.text, backgroundColor: '#fff' },
  error: { color: colors.danger, marginTop: 4, fontSize: 12 },
});
