import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../actions/authAction';
import { AppButton } from '../../components/AppButton';
import { colors, spacing } from '../../theme';

// Basic version (own profile + logout). DEV4 extends it from Figma "My Profile".
export default function MyProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.meta}>{user?.designation}</Text>
      <Text style={styles.meta}>Service No: {user?.serviceNo}</Text>
      <AppButton title="Logout" variant="outline" onPress={() => dispatch(logout())} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  name: { fontSize: 22, fontWeight: '700', color: colors.primary },
  meta: { color: colors.muted, marginBottom: spacing.sm },
});
