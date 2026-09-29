import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type Props = {
  label: string; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'outline' | 'success' | 'danger'; style?: ViewStyle;
};
export default function AppButton({ label, onPress, icon, variant = 'primary', style }: Props) {
  const bg = { primary: colors.navy, outline: colors.white, success: colors.green, danger: colors.red }[variant];
  const fg = variant === 'outline' ? colors.navy : colors.white;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}
      style={[s.btn, { backgroundColor: bg }, variant === 'outline' && s.outline, style]}>
      {icon && <Ionicons name={icon} size={16} color={fg} />}
      <Text style={[s.txt, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  btn: { height: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outline: { borderWidth: 1, borderColor: colors.navy },
  txt: { fontSize: 14, fontWeight: '500' },
});
