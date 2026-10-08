import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { EnrollForm, HeaderCfg, IconName, initialForm, SetFn, StepHeader } from '../../components/enroll/formParts';
import { isoDob, StepContact, StepPersonal, StepReview, StepRole, StepSecurity, validate } from './addProfile/steps';
import { createOfficer } from '../../services/districtService';
import { colors } from '../../theme/colors';

const CFG: HeaderCfg[] = [
  { title: 'Registration Step 1: Personal Details', kicker: 'OFFICER ENROLLMENT', heading: 'Step 1 of 5: Personal Details', headingRight: '20% Complete', pct: 20 },
  {
    title: 'Registration Step 2: Contact Details', kicker: 'STEP 2 OF 5', kickerRight: '40% Completed',
    heading: 'Contact Details', sub: 'Provide verified communication channels for emergency dispatches and administrative notices.', pct: 40,
  },
  {
    title: 'Registration Step 3: Account Security', kicker: 'OFFICER ENROLLMENT', kickerRight: 'Step 3 of 5',
    heading: 'Account Security', headingRight: '60% Complete', pct: 60,
  },
  { title: 'Registration Step 4: Role Details', kicker: 'STEP 4 OF 5', kickerRight: '80% Completed', pct: 80 },
  {
    title: 'Registration Step 5: Terms & Submit', kicker: 'STEP 5 OF 5', kickerRight: '100% Completed • Final Stage',
    eyebrow: 'OFFICER ENROLLMENT', heading: 'Review Summary & Statutory Declaration',
    sub: 'Please review the information provided across all sections before declaring compliance and submitting for authorizing sign-off.', pct: 100,
  },
];

// ---------------- authorizing officer modal ----------------
function SignField({ label, icon, ...props }: { label: string; icon: IconName } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={m.field}>
      <Text style={m.fieldLabel}>{label}</Text>
      <View style={m.fieldRow}>
        <Ionicons name={icon} size={16} color={colors.navy} />
        <TextInput placeholderTextColor="#9A9A9A" autoCapitalize="none" {...props} style={m.fieldInput} />
      </View>
    </View>
  );
}

function AuthorizeModal({ visible, busy, onCancel, onSubmit }: {
  visible: boolean;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (c: { serviceNo: string; username: string; password: string }) => void;
}) {
  const [serviceNo, setServiceNo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = () => {
    if (!serviceNo.trim() || !username.trim() || !password) {
      Alert.alert('Credentials required', 'Enter the authorizing officer service no, username and password.');
      return;
    }
    onSubmit({ serviceNo: serviceNo.trim(), username: username.trim(), password });
    setPassword('');
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={m.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={m.card}>
          <View style={m.head}>
            <View style={m.headIcon}>
              <Ionicons name="shield-checkmark" size={16} color={colors.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={m.title}>Authorizing Officer Verification</Text>
              <Text style={m.sub}>Digital Sign-Off Protocol</Text>
            </View>
            <Pressable onPress={onCancel} hitSlop={8} accessibilityLabel="Close">
              <Ionicons name="close" size={18} color={colors.white} />
            </Pressable>
          </View>

          <View style={m.body}>
            <SignField label="AUTHORIZING OFFICER SERVICE NO" icon="card-outline" value={serviceNo} onChangeText={setServiceNo} placeholder="e.g. AG-OFFICER-7721" autoCapitalize="characters" />
            <SignField label="OFFICER USERNAME" icon="person-circle-outline" value={username} onChangeText={setUsername} placeholder="e.g. sup.fernando" />
            <View>
              <SignField label="OFFICER PASSWORD / PIN" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="Password or PIN" secureTextEntry={!show} />
              <Pressable onPress={() => setShow((x) => !x)} style={m.eye} hitSlop={8} accessibilityLabel="Show or hide password">
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.navy} />
              </Pressable>
            </View>

            <Pressable disabled={busy} onPress={submit} accessibilityRole="button" style={[m.submit, busy && { opacity: 0.6 }]}>
              <Ionicons name="shield-checkmark" size={15} color={colors.white} />
              <Text style={m.submitText}>{busy ? 'Submitting...' : 'Authorize & Submit'}</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={onCancel} accessibilityRole="button" style={m.cancel}>
              <Text style={m.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------- screen ----------------
export default function AddProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scroll = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EnrollForm>(initialForm);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const set: SetFn = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const go = (n: number) => {
    setStep(n);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const exit = () => {
    const dirty = form.fullName || form.nic || form.email || form.cadreNo;
    if (!dirty) return nav.goBack();
    Alert.alert('Discard enrollment?', 'The details you entered will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => nav.goBack() },
    ]);
  };

  const back = () => (step === 0 ? exit() : go(step - 1));

  const next = () => {
    const err = validate(step, form);
    if (err) return Alert.alert('Check your details', err);
    if (step === 4) return setModal(true);
    go(step + 1);
  };

  // Android hardware back = previous step
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (modal) setModal(false);
      else back();
      return true;
    });
    return () => sub.remove();
  });

  const authorize = async (c: { serviceNo: string; username: string; password: string }) => {
    setBusy(true);
    try {
      await createOfficer(
        {
          username: form.govEmail.trim().split('@')[0].toLowerCase(), // the form has no username field: the official email name is used
          password: form.password,
          service_number: form.cadreNo.trim().toUpperCase(),
          role_name: form.role,
          officer_name: form.fullName.trim(),
          officer_phone: form.phone.replace(/\s/g, ''),
          unit_name: form.district,
          nic: form.nic.trim().toUpperCase(),
          date_of_birth: isoDob(form.dob),
          gender: form.gender,
          email: form.email.trim(),
          address: form.address.trim(),
        },
        { officerUserName: c.username, authorizingServiceNo: c.serviceNo, officerPassword: c.password },
      );
      setModal(false);
      Alert.alert('Officer profile created', `The profile of ${form.fullName} was saved successfully.`, [
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Could not submit', e?.message ?? 'Sign-off failed');
    } finally {
      setBusy(false);
    }
  };

  const p = { form, set, onNext: next, onBack: back, goTo: go };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <StepHeader cfg={CFG[step]} onBack={back} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 0 && <StepPersonal {...p} />}
          {step === 1 && <StepContact {...p} />}
          {step === 2 && <StepSecurity {...p} />}
          {step === 3 && <StepRole {...p} />}
          {step === 4 && <StepReview {...p} />}
        </ScrollView>
      </KeyboardAvoidingView>

      <AuthorizeModal visible={modal} busy={busy} onCancel={() => !busy && setModal(false)} onSubmit={authorize} />
    </View>
  );
}

const m = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  card: { borderRadius: 16, backgroundColor: colors.white, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.navy, padding: 14 },
  headIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: colors.white },
  sub: { fontSize: 10, color: '#C9D1E3', marginTop: 1 },
  body: { padding: 16, gap: 10 },
  field: { borderRadius: 8, borderWidth: 1, borderColor: '#E5E8EE', backgroundColor: colors.field, overflow: 'hidden' },
  fieldLabel: { fontSize: 8, letterSpacing: 0.5, color: colors.muted, paddingHorizontal: 10, paddingTop: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  fieldInput: { flex: 1, minHeight: 36, fontSize: 13, color: colors.text, paddingVertical: 4 },
  eye: { position: 'absolute', right: 10, bottom: 11 },
  submit: { height: 46, borderRadius: 8, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  submitText: { fontSize: 13, fontWeight: '600', color: colors.white },
  cancel: { height: 42, borderRadius: 8, borderWidth: 1, borderColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 13, fontWeight: '600', color: colors.navy },
});