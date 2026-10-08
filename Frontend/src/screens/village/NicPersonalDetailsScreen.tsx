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
import { DISTRICTS } from '../../components/enroll/formParts';
import { rememberNicPersonal, saveNicFormDraft } from '../../services/nicFormSync';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Gender = 'Male' | 'Female' | 'Other';

interface PersonalDetails {
  fullName: string;
  dob: string;
  gender: Gender;
  placeOfBirth: string;
  district: string;
  religion: string;
  occupation: string;
}

const EMPTY: PersonalDetails = {
  fullName: '',
  dob: '',
  gender: 'Male',
  placeOfBirth: '',
  district: '',
  religion: '',
  occupation: '',
};

const RELIGIONS = ['Buddhist', 'Hindu', 'Islam', 'Roman Catholic', 'Christian', 'Other'];
const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

let savedDraft: PersonalDetails | null = null;

export function readNicPersonalDraft() {
  return savedDraft;
}

export function clearNicPersonalDraft() {
  savedDraft = null;
}

function formatDob(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidDob(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    year >= 1900 &&
    date <= today
  );
}

function validate(form: PersonalDetails) {
  const errors: Partial<Record<keyof PersonalDetails, string>> = {};
  if (!form.fullName.trim()) errors.fullName = 'Enter the applicant’s full name.';
  if (!isValidDob(form.dob)) errors.dob = 'Enter a valid date as DD/MM/YYYY.';
  if (!form.placeOfBirth.trim()) errors.placeOfBirth = 'Enter the place of birth.';
  if (!form.district) errors.district = 'Select a district.';
  if (!form.religion) errors.religion = 'Select a religion.';
  if (!form.occupation.trim()) errors.occupation = 'Enter the occupation.';
  return errors;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  right,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  error?: string;
  right?: React.ReactNode;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <View style={[styles.inputBox, error ? styles.inputError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA1AD"
          style={styles.input}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'number-pad' ? 'none' : 'words'}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  error,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  error?: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={[styles.inputBox, error ? styles.inputError : null]}
      >
        <Text style={[styles.input, styles.selectText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.navy} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  style={styles.sheetRow}
                  accessibilityRole="button"
                >
                  <Text style={[styles.sheetText, option === value && styles.sheetTextOn]}>{option}</Text>
                  {option === value ? <Ionicons name="checkmark" size={16} color={colors.navy} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function NicPersonalDetailsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [form, setForm] = useState<PersonalDetails>(savedDraft ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalDetails, string>>>({});
  const saving = useRef(false);

  const set = <K extends keyof PersonalDetails>(key: K, value: PersonalDetails[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const openProfile = () => nav.navigate('MainTabs', { screen: 'Profile' });

  const saveDraft = async () => {
    savedDraft = { ...form };
    rememberNicPersonal(savedDraft);
    if (!form.fullName.trim()) {
      Alert.alert('Draft saved', 'Enter the full name to write this application to the register.');
      return;
    }
    if (saving.current) return;
    saving.current = true;
    try {
      await saveNicFormDraft();
      Alert.alert('Draft saved', 'Personal details were written to the NIC application register.');
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : 'The application was not saved.');
    } finally {
      saving.current = false;
    }
  };

  const continueNext = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (saving.current) return;
    saving.current = true;
    savedDraft = { ...form };
    rememberNicPersonal(savedDraft);
    try {
      await saveNicFormDraft();
      nav.navigate('NicContactFamily');
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
          <Text style={styles.title}>Personal Details</Text>
          <Pressable onPress={openProfile} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.step}>STEP 1 OF 4: PERSONAL DETAILS</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>25%</Text>
          </View>
        </View>
        <View style={styles.track}>
          <View style={styles.trackOn} />
          <View style={styles.trackOff} />
          <View style={styles.trackOff} />
          <View style={styles.trackOff} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionIcon}>
              <Ionicons name="id-card-outline" size={16} color={colors.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>1. Applicant's Personal Details</Text>
              <Text style={styles.sectionSub}>Ensure details match your civil register documents exactly.</Text>
            </View>
          </View>

          <TextField
            label="FULL NAME"
            value={form.fullName}
            onChangeText={(v) => set('fullName', v)}
            placeholder="Enter your full name"
            error={errors.fullName}
          />
          <TextField
            label="DATE OF BIRTH"
            value={form.dob}
            onChangeText={(v) => set('dob', formatDob(v))}
            placeholder="DD/MM/YYYY"
            error={errors.dob}
            keyboardType="number-pad"
            right={<Ionicons name="calendar-outline" size={18} color={colors.navy} />}
          />

          <View>
            <FieldLabel>GENDER</FieldLabel>
            <View style={styles.genders}>
              {GENDERS.map((gender) => {
                const selected = form.gender === gender;
                return (
                  <Pressable
                    key={gender}
                    onPress={() => set('gender', gender)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.gender, selected && styles.genderOn]}
                  >
                    <View style={[styles.radio, selected && styles.radioOn]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={[styles.genderText, selected && styles.genderTextOn]}>{gender}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label="PLACE OF BIRTH"
            value={form.placeOfBirth}
            onChangeText={(v) => set('placeOfBirth', v)}
            placeholder="Enter your birth city"
            error={errors.placeOfBirth}
          />
          <SelectField
            label="DISTRICT"
            value={form.district}
            placeholder="Select your district"
            options={DISTRICTS}
            error={errors.district}
            onSelect={(v) => set('district', v)}
          />
          <SelectField
            label="RELIGION"
            value={form.religion}
            placeholder="Select your religion"
            options={RELIGIONS}
            error={errors.religion}
            onSelect={(v) => set('religion', v)}
          />
          <TextField
            label="OCCUPATION"
            value={form.occupation}
            onChangeText={(v) => set('occupation', v)}
            placeholder="Enter your occupation"
            error={errors.occupation}
          />

          <Pressable onPress={continueNext} accessibilityRole="button" style={styles.continueBtn}>
            <Text style={styles.continueText}>CONTINUE TO CONTACT DETAILS</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.navy} />
          </Pressable>
          <Pressable onPress={saveDraft} accessibilityRole="button" style={styles.draftBtn}>
            <Ionicons name="save-outline" size={16} color={colors.white} />
            <Text style={styles.draftText}>SAVE AS DRAFT</Text>
          </Pressable>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Ionicons name="lock-closed-outline" size={12} color={colors.muted} />
              <Text style={styles.footerMeta}>NIC-FORM-REG-V4.2.1 • SESSION ID: 9482-4D3</Text>
            </View>
            <Text style={styles.footerNote}>Department for Registration of Persons • Official Electronic Portal</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.navy, paddingBottom: 16 },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, color: colors.white, fontSize: 20, fontWeight: '700' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 4 },
  step: { color: '#D5DCE8', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  pill: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  track: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginTop: 10 },
  trackOn: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.white },
  trackOff: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' },

  content: { padding: 16, paddingBottom: 28, gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF1F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionSub: { fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2 },

  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, color: '#5C6570', marginBottom: 6 },
  inputBox: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EE',
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputError: { borderColor: colors.red },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12 },
  selectText: { paddingVertical: 14 },
  placeholder: { color: '#9AA1AD' },
  error: { color: colors.red, fontSize: 12, marginTop: 4 },

  genders: { flexDirection: 'row', gap: 8 },
  gender: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ECEEF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  genderOn: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E4E7EE' },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C5CAD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.text },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text },
  genderText: { fontSize: 14, color: colors.muted },
  genderTextOn: { color: colors.text, fontWeight: '600' },

  continueBtn: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  continueText: { color: colors.navy, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  draftBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  draftText: { color: colors.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  footer: { alignItems: 'center', marginTop: 8, gap: 4 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerMeta: { fontSize: 11, color: colors.muted },
  footerNote: { fontSize: 11, color: colors.muted, textAlign: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  sheet: { maxHeight: '70%', borderRadius: 14, backgroundColor: colors.white, padding: 8 },
  sheetTitle: { fontSize: 13, fontWeight: '700', color: colors.text, padding: 12 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 13 },
  sheetText: { fontSize: 15, color: colors.text },
  sheetTextOn: { fontWeight: '700', color: colors.navy },
});
