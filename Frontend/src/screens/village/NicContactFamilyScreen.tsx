import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { rememberNicContact, saveNicFormDraft } from '../../services/nicFormSync';
import { colors } from '../../theme/colors';

interface ContactFamily {
  permanentAddress: string;
  currentAddress: string;
  sameAsPermanent: boolean;
  phone: string;
  email: string;
  fatherName: string;
  fatherNic: string;
  motherName: string;
  motherNic: string;
  maritalStatus: string;
}

const EMPTY: ContactFamily = {
  permanentAddress: '',
  currentAddress: '',
  sameAsPermanent: false,
  phone: '',
  email: '',
  fatherName: '',
  fatherNic: '',
  motherName: '',
  motherNic: '',
  maritalStatus: '',
};

const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed'];
const STEPS = [
  { label: '1. Personal', state: 'done' as const },
  { label: '2. Contact & Family', state: 'now' as const },
  { label: '3. Documents', state: 'later' as const },
  { label: '4. Review', state: 'later' as const },
];

let savedDraft: ContactFamily | null = null;

export function readNicContactDraft() {
  return savedDraft;
}

export function clearNicContactDraft() {
  savedDraft = null;
}

function formatPhone(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('94')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean);
  return parts.length ? `+94 ${parts.join(' ')}` : '';
}

function isSriLankanMobile(value: string) {
  return /^947\d{8}$/.test(value.replace(/\D/g, ''));
}

function isNic(value: string) {
  const nic = value.trim().toUpperCase();
  return /^\d{12}$/.test(nic) || /^\d{9}[VX]$/.test(nic);
}

function isEmail(value: string) {
  if (!value.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validate(form: ContactFamily) {
  const errors: Partial<Record<keyof ContactFamily, string>> = {};
  if (!form.permanentAddress.trim()) errors.permanentAddress = 'Enter the permanent address.';
  if (!form.sameAsPermanent && !form.currentAddress.trim()) errors.currentAddress = 'Enter the current address.';
  if (!isSriLankanMobile(form.phone)) errors.phone = 'Enter a Sri Lankan mobile number, like +94 77 123 4567.';
  if (!isEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.fatherName.trim()) errors.fatherName = "Enter the father's full name.";
  if (!isNic(form.fatherNic)) errors.fatherNic = 'Enter a NIC as 196812345678 or 651234567V.';
  if (!form.motherName.trim()) errors.motherName = "Enter the mother's full name.";
  if (!isNic(form.motherNic)) errors.motherNic = 'Enter a NIC as 196812345678 or 681234567V.';
  if (!form.maritalStatus) errors.maritalStatus = 'Select a marital status.';
  return errors;
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Area({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  editable = true,
  side,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  error?: string;
  editable?: boolean;
  side?: React.ReactNode;
}) {
  return (
    <View>
      <View style={styles.labelRow}>
        <Label>{label}</Label>
        {side}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA1AD"
        editable={editable}
        multiline
        textAlignVertical="top"
        style={[styles.area, !editable && styles.areaLocked, error ? styles.bad : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function NicContactFamilyScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [form, setForm] = useState<ContactFamily>(savedDraft ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFamily, string>>>({});
  const [maritalOpen, setMaritalOpen] = useState(false);
  const saving = useRef(false);

  const set = <K extends keyof ContactFamily>(key: K, value: ContactFamily[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const setPermanent = (value: string) => {
    setForm((current) => ({
      ...current,
      permanentAddress: value,
      currentAddress: current.sameAsPermanent ? value : current.currentAddress,
    }));
    setErrors((current) => ({ ...current, permanentAddress: undefined }));
  };

  const toggleSame = () => {
    setForm((current) => {
      const same = !current.sameAsPermanent;
      return {
        ...current,
        sameAsPermanent: same,
        currentAddress: same ? current.permanentAddress : current.currentAddress,
      };
    });
    setErrors((current) => ({ ...current, currentAddress: undefined }));
  };

  const continueNext = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (saving.current) return;
    saving.current = true;
    savedDraft = { ...form };
    rememberNicContact(savedDraft);
    try {
      await saveNicFormDraft();
      nav.navigate('NicDocuments');
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : 'The application was not saved.');
    } finally {
      saving.current = false;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.mark} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.title}>Residential Address</Text>
          <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Profile' })} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.step}>STEP 2 OF 4 • Contact & Family</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>50%</Text>
          </View>
        </View>
        <View style={styles.stepper}>
          {STEPS.map((step) => (
            <View key={step.label} style={styles.stepItem}>
              <View style={[styles.stepBar, step.state !== 'later' && styles.stepBarOn]} />
              <Text style={[styles.stepLabel, step.state === 'now' && styles.stepLabelOn, step.state === 'later' && styles.stepLabelLater]} numberOfLines={1}>
                {step.state === 'done' ? '✓ ' : ''}
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="home-outline" size={16} color={colors.navy} />
              <Text style={styles.cardTitle}>2. CONTACT INFORMATION</Text>
            </View>
            <Area
              label="PERMANENT ADDRESS *"
              value={form.permanentAddress}
              onChangeText={setPermanent}
              placeholder="Enter your permanent address"
              error={errors.permanentAddress}
            />
            <Area
              label="CURRENT ADDRESS *"
              value={form.currentAddress}
              onChangeText={(v) => set('currentAddress', v)}
              placeholder="Enter your current address"
              error={errors.currentAddress}
              editable={!form.sameAsPermanent}
              side={
                <Pressable onPress={toggleSame} accessibilityRole="checkbox" accessibilityState={{ checked: form.sameAsPermanent }} style={styles.checkRow}>
                  <View style={[styles.check, form.sameAsPermanent && styles.checkOn]}>
                    {form.sameAsPermanent ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                  </View>
                  <Text style={styles.checkText}>Same as permanent</Text>
                </Pressable>
              }
            />
            <View>
              <Label>PHONE NUMBER *</Label>
              <View style={[styles.inputBox, errors.phone ? styles.bad : null]}>
                <Ionicons name="call-outline" size={16} color={colors.navy} />
                <TextInput
                  value={form.phone}
                  onChangeText={(v) => set('phone', formatPhone(v))}
                  placeholder="+94 XX XXX XXXX"
                  placeholderTextColor="#9AA1AD"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
              {errors.phone ? <Text style={styles.error}>{errors.phone}</Text> : null}
              <Text style={styles.help}>SMS alerts will be dispatched to this verified Sri Lankan mobile number.</Text>
            </View>
            <View>
              <Label>EMAIL ADDRESS (OPTIONAL)</Label>
              <TextInput
                value={form.email}
                onChangeText={(v) => set('email', v)}
                placeholder="Enter your email"
                placeholderTextColor="#9AA1AD"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.line, errors.email ? styles.bad : null]}
              />
              {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="people-outline" size={16} color={colors.navy} />
              <Text style={styles.cardTitle}>FAMILY PARTICULARS</Text>
            </View>
            <Text style={styles.record}>FATHER'S RECORD</Text>
            <View>
              <Label>Father's Full Name *</Label>
              <TextInput
                value={form.fatherName}
                onChangeText={(v) => set('fatherName', v)}
                placeholder="Enter father's full name as in birth cert"
                placeholderTextColor="#9AA1AD"
                style={[styles.line, errors.fatherName ? styles.bad : null]}
              />
              {errors.fatherName ? <Text style={styles.error}>{errors.fatherName}</Text> : null}
            </View>
            <View>
              <Label>Father's NIC Number *</Label>
              <TextInput
                value={form.fatherNic}
                onChangeText={(v) => set('fatherNic', v.toUpperCase())}
                placeholder="E.G. 196812345678 OR 651234567V"
                placeholderTextColor="#9AA1AD"
                autoCapitalize="characters"
                style={[styles.line, errors.fatherNic ? styles.bad : null]}
              />
              {errors.fatherNic ? <Text style={styles.error}>{errors.fatherNic}</Text> : null}
            </View>
            <Text style={styles.record}>MOTHER'S RECORD</Text>
            <View>
              <Label>Mother's Full Name *</Label>
              <TextInput
                value={form.motherName}
                onChangeText={(v) => set('motherName', v)}
                placeholder="Enter mother's maiden / full name"
                placeholderTextColor="#9AA1AD"
                style={[styles.line, errors.motherName ? styles.bad : null]}
              />
              {errors.motherName ? <Text style={styles.error}>{errors.motherName}</Text> : null}
            </View>
            <View>
              <Label>Mother's NIC Number *</Label>
              <TextInput
                value={form.motherNic}
                onChangeText={(v) => set('motherNic', v.toUpperCase())}
                placeholder="E.G. 196812345678 OR 681234567V"
                placeholderTextColor="#9AA1AD"
                autoCapitalize="characters"
                style={[styles.line, errors.motherNic ? styles.bad : null]}
              />
              {errors.motherNic ? <Text style={styles.error}>{errors.motherNic}</Text> : null}
            </View>
            <View>
              <Label>MARITAL STATUS *</Label>
              <Pressable onPress={() => setMaritalOpen(true)} accessibilityRole="button" style={[styles.inputBox, errors.maritalStatus ? styles.bad : null]}>
                <Text style={[styles.input, !form.maritalStatus && styles.placeholder]}>{form.maritalStatus || 'Select marital status'}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.navy} />
              </Pressable>
              {errors.maritalStatus ? <Text style={styles.error}>{errors.maritalStatus}</Text> : null}
            </View>
            <View style={styles.note}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.navy} />
              <Text style={styles.noteText}>
                All family lineage data will be verified directly against the Department of Registrar General civil database registrars.
              </Text>
            </View>
          </View>

          <Pressable onPress={continueNext} accessibilityRole="button" style={styles.continueBtn}>
            <Text style={styles.continueText}>CONTINUE TO DOCUMENTS</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => nav.goBack()} accessibilityRole="button" style={styles.backBtn}>
            <Ionicons name="arrow-back" size={16} color={colors.navy} />
            <Text style={styles.backText}>BACK TO STEP 1</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={maritalOpen} animationType="fade" onRequestClose={() => setMaritalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMaritalOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Marital status</Text>
            {MARITAL.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  set('maritalStatus', option);
                  setMaritalOpen(false);
                }}
                style={styles.sheetRow}
                accessibilityRole="button"
              >
                <Text style={[styles.sheetText, option === form.maritalStatus && styles.sheetTextOn]}>{option}</Text>
                {option === form.maritalStatus ? <Ionicons name="checkmark" size={16} color={colors.navy} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.navy, paddingBottom: 14 },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  mark: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '700' },
  avatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  step: { color: '#D5DCE8', fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  pill: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  stepper: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginTop: 10 },
  stepItem: { flex: 1, gap: 4 },
  stepBar: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
  stepBarOn: { backgroundColor: colors.white },
  stepLabel: { color: '#D5DCE8', fontSize: 9, fontWeight: '600' },
  stepLabelOn: { color: colors.white },
  stepLabelLater: { color: 'rgba(255,255,255,0.55)' },

  content: { padding: 16, paddingBottom: 28, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4, color: colors.text },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, color: '#5C6570', marginBottom: 6 },
  area: {
    minHeight: 72, borderRadius: 10, borderWidth: 1, borderColor: '#E4E7EE', backgroundColor: '#F7F8FA',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text,
  },
  areaLocked: { color: colors.muted },
  line: {
    minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: '#E4E7EE', backgroundColor: '#F7F8FA',
    paddingHorizontal: 14, fontSize: 15, color: colors.text,
  },
  inputBox: {
    minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: '#E4E7EE', backgroundColor: '#F7F8FA',
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12 },
  placeholder: { color: '#9AA1AD' },
  bad: { borderColor: colors.red },
  error: { color: colors.red, fontSize: 12, marginTop: 4 },
  help: { fontSize: 12, lineHeight: 16, color: colors.muted, marginTop: 6 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  check: { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: '#C5CAD3', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  checkText: { fontSize: 12, color: colors.muted },
  record: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.navy, marginTop: 4 },

  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.muted },

  continueBtn: {
    height: 48, borderRadius: 10, backgroundColor: colors.navy, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  continueText: { color: colors.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  backBtn: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  backText: { color: colors.navy, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  sheet: { borderRadius: 14, backgroundColor: colors.white, padding: 8 },
  sheetTitle: { fontSize: 13, fontWeight: '700', color: colors.text, padding: 12 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 13 },
  sheetText: { fontSize: 15, color: colors.text },
  sheetTextOn: { fontWeight: '700', color: colors.navy },
});
