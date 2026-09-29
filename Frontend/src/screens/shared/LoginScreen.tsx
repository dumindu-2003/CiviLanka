import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../actions/authAction';
import { TextField } from '../../components/TextField';
import { AppButton } from '../../components/AppButton';
import { colors, spacing } from '../../theme';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [username, setUsername] = useState('');
  const [serviceNo, setServiceNo] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = username.trim() && serviceNo.trim() && password;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Officer Authentication</Text>
      <Text style={styles.sub}>Enter your authorized government service credentials.</Text>

      <TextField label="Government Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextField label="Service No" value={serviceNo} onChangeText={setServiceNo} autoCapitalize="characters" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        title="Sign In to System"
        loading={status === 'loading'}
        disabled={!canSubmit}
        onPress={() => dispatch(login({ username: username.trim(), serviceNo: serviceNo.trim(), password }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.card, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  sub: { color: colors.muted, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
});
