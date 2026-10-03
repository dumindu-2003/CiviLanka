import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { label: string; icon: IconName }[] = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'News', icon: 'newspaper-outline' },
  { label: 'Notification', icon: 'notifications-outline' },
  { label: 'Profile', icon: 'person-outline' },
];

// Visual bottom bar for the public (pre-login) home screen.
// Every tab except Home asks the visitor to log in.
export function LandingTabBar({ onTabPress }: { onTabPress: (label: string) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((t) => (
        <Pressable
          key={t.label}
          onPress={() => onTabPress(t.label)}
          accessibilityRole="tab"
          accessibilityLabel={t.label}
          style={styles.tab}
        >
          <Ionicons name={t.icon} size={22} color={colors.navy} />
          <Text style={styles.label}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10, color: colors.muted },
});