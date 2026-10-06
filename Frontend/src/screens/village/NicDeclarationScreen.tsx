import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { readNicDocumentDraft } from './NicDocumentsScreen';
import { readNicPersonalDraft } from './NicPersonalDetailsScreen';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

interface Authorization {
  username: string;
  serviceNo: string;
}

let savedAuthorization: Authorization | null = null;

export function readNicAuthorization() {
  return savedAuthorization;
}

export function clearNicAuthorization() {
  savedAuthorization = null;
}

export default function NicDeclarationScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const summary = useMemo(() => {
    const personal = readNicPersonalDraft();
    const documents = readNicDocumentDraft();
    const year = new Date().getFullYear();
    const serial = String((personal?.fullName?.length ?? 1) * 97 + year).slice(-4);
    return {
      applicant: personal?.fullName?.trim() || 'Applicant',
      nicType: documents.previous ? 'Renewal' : 'New',
      reference: `REF: NIC-${year}-${serial}`,
    };
  }, []);
  const [username, setUsername] = useState('');
  const [serviceNo, setServiceNo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; serviceNo?: string; password?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!username.trim()) next.username = 'Enter the officer username.';
    if (!serviceNo.trim()) next.serviceNo = 'Enter the service or cadre number.';
    if (!/^\d{6,}$/.test(password)) next.password = 'Enter a PIN of at least 6 digits.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    savedAuthorization = { username: username.trim(), serviceNo: serviceNo.trim() };
    setPassword('');
    nav.navigate('NicReceipt');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.mark} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.title}>Review And Declaration</Text>
          <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Profile' })} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.step}>STEP 4 OF 4: OFFICER AUTHORIZATION</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>100%</Text>
          </View>
        </View>
        <View style={styles.track}>
          <View style={styles.trackOn} />
          <View style={styles.trackOn} />
          <View style={styles.trackOn} />
          <View style={styles.trackOn} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle}>Application Summary</Text>
            <Text style={styles.reference}>{summary.reference}</Text>
          </View>
          <View style={styles.summaryCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.caption}>APPLICANT NAME</Text>
              <Text style={styles.summaryValue}>{summary.applicant}</Text>
            </View>
            <View>
              <Text style={styles.caption}>NIC TYPE</Text>
              <Text style={styles.summaryValue}>{summary.nicType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.verify}>
          <View style={styles.verifyIcon}>
            <Ionicons name="shield-checkmark" size={18} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.verifyTitle}>Authorizing Officer Verification</Text>
            <Text style={styles.verifyBody}>
              Enter officer credentials to authorize and route this application to the District Registrar Dashboard for pending review.
            </Text>
          </View>
        </View>

        <Field
          label="OFFICER USERNAME"
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            setErrors((current) => ({ ...current, username: undefined }));
          }}
          placeholder="officer.senaratne"
          autoCapitalize="none"
          error={errors.username}
        />
        <Field
          label="SERVICE NO / CADRE NO"
          value={serviceNo}
          onChangeText={(value) => {
            setServiceNo(value);
            setErrors((current) => ({ ...current, serviceNo: undefined }));
          }}
          placeholder="e.g. AG-884210 / GN-4412"
          autoCapitalize="characters"
          error={errors.serviceNo}
        />
        <Field
          label="OFFICER PASSWORD / PIN"
          hint="Min 6 Digits"
          value={password}
          onChangeText={(value) => {
            setPassword(value.replace(/\D/g, ''));
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          placeholder="Enter PIN"
          secureTextEntry
          keyboardType="number-pad"
          error={errors.password}
        />

        <Pressable onPress={submit} accessibilityRole="button" style={styles.submit}>
          <Text style={styles.submitText}>AUTHORIZE & SUBMIT</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </Pressable>
        <Pressable onPress={() => nav.goBack()} accessibilityRole="button" style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel & Return to Form</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  hint,
  error,
  ...input
}: React.ComponentProps<typeof TextInput> & { label: string; hint?: string; error?: string }) {
  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <TextInput placeholderTextColor="#9AA1AD" style={[styles.input, error ? styles.inputBad : null]} {...input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.navy, paddingBottom: 16 },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  mark: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '700' },
  avatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, gap: 8 },
  step: { flex: 1, color: '#D5DCE8', fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  pill: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  track: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginTop: 10 },
  trackOn: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.white },

  content: { padding: 16, paddingBottom: 28, gap: 14 },
  summary: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 12 },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  reference: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  summaryCols: { flexDirection: 'row', gap: 12 },
  caption: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, color: colors.muted },
  summaryValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },

  verify: { borderRadius: 16, backgroundColor: colors.navy, padding: 14, flexDirection: 'row', gap: 10 },
  verifyIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  verifyTitle: { color: colors.white, fontSize: 15, fontWeight: '700' },
  verifyBody: { color: '#D5DCE8', fontSize: 12, lineHeight: 17, marginTop: 4 },

  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, color: '#5C6570' },
  hint: { fontSize: 11, color: colors.muted },
  input: {
    minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: '#E4E7EE', backgroundColor: '#F7F8FA',
    paddingHorizontal: 14, fontSize: 15, color: colors.text,
  },
  inputBad: { borderColor: colors.red },
  error: { color: colors.red, fontSize: 12, marginTop: 4 },

  submit: {
    height: 48, borderRadius: 10, backgroundColor: colors.navy, marginTop: 6,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: colors.navy, fontSize: 14, fontWeight: '600' },
});
