import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../actions/authAction';
import { BrandMark } from '../../components/BrandMark';
import { portal } from '../../theme/portal';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [serviceNo, setServiceNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = Boolean(username.trim() && serviceNo.trim() && password);
  const loading = status === 'loading';

  const submit = () => {
    if (!canSubmit || loading) return;
    dispatch(login({ username: username.trim(), serviceNo: serviceNo.trim(), password }));
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={{ height: insets.top, backgroundColor: portal.navy }} />
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.headerTitle}>Civil Registration Tracker</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
              <View style={styles.card}>
                <Text style={styles.kicker}>CIVIL REGISTRATION TRACKER  •  OFFICIAL PORTAL</Text>
                <Text style={styles.title}>Civil Registration Tracker</Text>
                <Text style={styles.sub}>
                  Enter your official credentials to track birth, marriage, and death registrations across Sri Lanka.
                </Text>

                <Field
                  label="Officer Username"
                  icon="person-outline"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter officer username (e.g. j.perera)"
                />
                <Field
                  label="NIC / Service No"
                  icon="card-outline"
                  value={serviceNo}
                  onChangeText={setServiceNo}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="e.g. 991234567V"
                />
                <Field
                  label="Password"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  right={
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={portal.icon} />
                    </Pressable>
                  }
                />

                <View style={styles.help}>
                  <Ionicons name="information-circle-outline" size={18} color={portal.icon} />
                  <Text style={styles.helpText}>
                    Need help? Contact the Divisional Secretariat or District Registrar
                  </Text>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={portal.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={submit}
                  disabled={!canSubmit || loading}
                  accessibilityRole="button"
                  style={styles.signIn}
                >
                  {loading ? (
                    <ActivityIndicator color={portal.white} />
                  ) : (
                    <>
                      <Text style={styles.signInText}>Sign in to Tracker</Text>
                      <Ionicons name="arrow-forward" size={18} color={portal.white} />
                    </>
                  )}
                </Pressable>
              </View>

              <View style={styles.card}>
                <View style={styles.noticeHead}>
                  <View style={styles.warnBadge}>
                    <Ionicons name="warning" size={18} color={portal.goldText} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.noticeTitle}>Official Access Notice & Legal Warning</Text>
                    <Text style={styles.noticeKicker}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Account Registration Protocol</Text>
                <Text style={styles.sectionBody}>
                  Accounts are issued by the Divisional Secretariat or District Registrar. If you do not have an official
                  account, contact your district office with your NIC and service credentials.
                </Text>

                <Text style={styles.sectionTitle}>Statutory Computer Crimes Warning</Text>
                <Text style={styles.sectionBody}>
                  Unauthorized access or attempted unauthorized entry into this system is strictly prohibited under the
                  Computer Crimes Act No. 24 of 2007 of Sri Lanka. Violations will face immediate revocation of
                  credentials, administrative action, and criminal prosecution by courts in Sri Lanka.
                </Text>
              </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  icon,
  right,
  ...input
}: TextInputProps & { label: string; icon: keyof typeof Ionicons.glyphMap; right?: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={portal.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={portal.icon}
          {...input}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: portal.page },
  flex: { flex: 1 },
  header: {
    backgroundColor: portal.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: portal.white, fontSize: 17, fontWeight: '700', flex: 1 },
  scroll: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: portal.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: portal.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  kicker: {
    color: portal.goldText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  title: { color: portal.ink, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  sub: { color: portal.muted, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  field: { marginBottom: 14 },
  label: { color: portal.ink, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputRow: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: portal.line,
    borderRadius: 12,
    backgroundColor: portal.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  input: { flex: 1, color: portal.ink, fontSize: 15, paddingVertical: 12 },
  help: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16, marginTop: 2 },
  helpText: { flex: 1, color: portal.muted, fontSize: 13, lineHeight: 18 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: portal.dangerBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { flex: 1, color: portal.danger, fontSize: 13, lineHeight: 18 },
  signIn: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: portal.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInText: { color: portal.white, fontSize: 16, fontWeight: '700' },
  noticeHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 6 },
  warnBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8EFCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTitle: { color: portal.ink, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  noticeKicker: {
    color: portal.goldText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  sectionTitle: { color: portal.ink, fontSize: 14, fontWeight: '800', marginTop: 14, marginBottom: 4 },
  sectionBody: { color: portal.muted, fontSize: 13, lineHeight: 20 },
});
