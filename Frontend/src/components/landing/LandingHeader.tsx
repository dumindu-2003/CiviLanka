import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Fixed navy app bar: logo + brand name + black "Log in" button
export function AppBar({ onLogin }: { onLogin: () => void }) {
  return (
    <View style={styles.bar}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Ionicons name="grid-outline" size={18} color={colors.white} />
        </View>
        <Text style={styles.brand} numberOfLines={1}>
          GovernReg Digital System
        </Text>
      </View>
      <Pressable
        onPress={onLogin}
        accessibilityRole="button"
        hitSlop={6}
        style={styles.loginBtn}
      >
        <Text style={styles.loginText}>Log in</Text>
      </Pressable>
    </View>
  );
}

// Grey panel: "RESTRICTED ACCESS • OFFICIAL PORTAL / Documentation Tracker" + "Log in →" pill
export function PortalBanner({ onLogin }: { onLogin: () => void }) {
  return (
    <View style={styles.panel}>
      <View style={{ flex: 1 }}>
        <Text style={styles.caption}>RESTRICTED ACCESS • OFFICIAL PORTAL</Text>
        <Text style={styles.panelTitle}>Documentation Tracker</Text>
      </View>
      <Pressable onPress={onLogin} accessibilityRole="button" hitSlop={6} style={styles.pill}>
        <Text style={styles.pillText}>Log in</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.navy} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.white, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  loginBtn: {
    minHeight: 37,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: { color: colors.white, fontSize: 13, fontWeight: '500' },

  panel: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: colors.soft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  caption: { fontSize: 9, letterSpacing: 0.5, color: colors.muted },
  panelTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 1 },
  pill: {
    height: 33,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colors.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillText: { fontSize: 12, color: colors.muted },
});