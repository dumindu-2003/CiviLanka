import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type Props = { title: string; onBack?: () => void; right?: React.ReactNode };
export default function Header({ title, onBack, right }: Props) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingTop: top + 8 }]}>
      <View style={s.side}>
        {onBack && (
          <TouchableOpacity style={s.back} onPress={onBack}>
            <Ionicons name="chevron-back" size={18} color={colors.navy} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={s.title}>{title}</Text>
      <View style={[s.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}
const s = StyleSheet.create({
  bar: { backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  side: { width: 44 },
  back: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 18, fontWeight: '600' },
});
