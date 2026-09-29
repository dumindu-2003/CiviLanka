import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, MIN_TOUCH } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'outline' ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: colors.primary, opacity: disabled ? 0.5 : 1 },
        variant === 'outline' && { borderWidth: 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.text, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: MIN_TOUCH, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 6 },
  text: { fontWeight: '600', fontSize: 16 },
});
