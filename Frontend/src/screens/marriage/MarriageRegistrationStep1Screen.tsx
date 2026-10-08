import React, { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Card, Field } from '../../components/enroll/formParts';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveMarriageDraft } from '../../actions/marriageAction';
import { patchGroom, setApplicant, setApplicantIsGroom } from '../../reducers/marriageReducer';
import { searchCitizens, type CitizenListItem } from '../../services/citizenService';
import type { MaritalStatus, MarriagePerson } from '../../types/marriage';
import { ageFrom, displayToIso, isoToDisplay } from '../../utils/marriageForm';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MARITAL_OPTIONS: MaritalStatus[] = ['Single', 'Widowed', 'Divorced'];
const maritalLabel = (m: MaritalStatus) => (m === 'Single' ? 'Single / Bachelor' : m);

const STAGES: { n: number; line1: string; line2?: string }[] = [
  { n: 1, line1: 'Groom' },
  { n: 2, line1: 'Bride &', line2: 'So.' },
  { n: 3, line1: 'Witnesses' },
];

const TABS: { label: string; icon: IconName; activeIcon: IconName }[] = [
  { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { label: 'News', icon: 'newspaper-outline', activeIcon: 'newspaper' },
  { label: 'Notification', icon: 'notifications-outline', activeIcon: 'notifications' },
  { label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

function CardHeader({
  icon,
  title,
  badge,
}: {
  icon: IconName;
  title: string;
  badge?: string;
}) {
  return (
    <View style={styles.cardHead}>
      <View style={styles.cardHeadLeft}>
        <Ionicons name={icon} size={16} color={colors.navy} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function MaritalStatusDropdown({
  value,
  onChange,
}: {
  value: MaritalStatus;
  onChange: (v: MaritalStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={styles.fieldLabel}>Marital Status</Text>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.selectBox}
        accessibilityRole="button"
        accessibilityLabel="Marital Status"
      >
        <Text style={styles.selectValue}>{maritalLabel(value)}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text} />
      </Pressable>
      {open ? (
        <View style={styles.selectMenu}>
          {MARITAL_OPTIONS.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                style={[styles.selectOption, selected && styles.selectOptionOn]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.selectOptionText, selected && styles.selectOptionTextOn]}>
                  {maritalLabel(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function ApplicantSearch() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitizenListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    if (query.trim().length < 2) {
      setError('Enter an NIC or at least 2 letters of the name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await searchCitizens(query.trim()));
    } catch (e) {
      setResults(null);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onPick = (c: CitizenListItem) => {
    dispatch(
      setApplicant({
        citizenId: c.citizen_id,
        fullName: c.full_name,
        nic: c.nic ?? '',
        dob: isoToDisplay(c.date_of_birth),
        address: c.address ?? '',
      }),
    );
  };

  return (
    <View style={styles.searchWrap}>
      <Field
        label="Find Applicant (NIC or Name)"
        required
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        autoCapitalize="characters"
        placeholder="e.g. 198507312345"
        right={
          <Pressable onPress={onSearch} hitSlop={8} accessibilityRole="button" accessibilityLabel="Search citizen">
            {loading ? (
              <ActivityIndicator size="small" color={colors.navy} />
            ) : (
              <Ionicons name="search" size={18} color={colors.navy} />
            )}
          </Pressable>
        }
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {results && results.length === 0 ? (
        <Text style={styles.hintText}>No citizen found. Check the NIC or the spelling of the name.</Text>
      ) : null}
      {results?.map((c) => (
        <Pressable
          key={c.citizen_id}
          onPress={() => onPick(c)}
          style={styles.resultRow}
          accessibilityRole="button"
          accessibilityLabel={`Select ${c.full_name}`}
        >
          <View style={styles.flex}>
            <Text style={styles.resultName}>{c.full_name}</Text>
            <Text style={styles.resultMeta}>
              {c.nic} · {isoToDisplay(c.date_of_birth)} · {c.gender}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.navy} />
        </Pressable>
      ))}
    </View>
  );
}

export default function MarriageRegistrationStep1Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { form, status, error, appRef } = useAppSelector((s) => s.marriage);
  const { applicant, applicantIsGroom, groom } = form;
  const [formError, setFormError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const setGroomField = <K extends keyof MarriagePerson>(key: K, value: MarriagePerson[K]) => {
    dispatch(patchGroom({ key, value } as Parameters<typeof patchGroom>[0]));
  };

  const groomLocked = applicantIsGroom && applicant !== null;
  const groomAge = ageFrom(groom.dob);

  const onNext = () => {
    const missing: string[] = [];
    if (!applicant) missing.push('applicant');
    if (!groom.fullName.trim()) missing.push("groom's full name");
    if (!groom.nic.trim()) missing.push("groom's NIC");
    if (!displayToIso(groom.dob)) missing.push("groom's date of birth (DD/MM/YYYY)");
    if (missing.length) {
      setFormError(`Please complete: ${missing.join(', ')}.`);
      return;
    }
    setFormError(null);
    navigation.navigate('MarriageRegistrationStep2');
  };

  const onSaveDraft = () => {
    setFormError(null);
    dispatch(saveMarriageDraft());
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.appBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerIconBtn}
            hitSlop={8}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </Pressable>
          <View style={styles.appBarText}>
            <Text style={styles.appBarTitle} numberOfLines={1}>
              Marriage Registration
            </Text>
            <Text style={styles.appBarSub} numberOfLines={1}>
              Step 1: Groom's Particulars
            </Text>
          </View>
          <View style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={14} color={colors.white} />
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTop}>
            <Text style={styles.workflowKicker}>REGISTRATION WORKFLOW</Text>
            <View style={styles.progressPctWrap}>
              <Text style={styles.progressPct}>33%</Text>
              <Text style={styles.progressPctLabel}>Completed</Text>
            </View>
          </View>
          <Text style={styles.progressTitle}>Step 1: Groom Particulars</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: '33%' }]} />
          </View>
          <View style={styles.pillRow}>
            {STAGES.map((s, i) => {
              const active = i === 0;
              return (
                <View key={s.n} style={[styles.stagePill, active && styles.stagePillOn]}>
                  <Text style={[styles.stagePillText, active && styles.stagePillTextOn]}>
                    {s.n}. {s.line1}
                    {s.line2 ? `\n${s.line2}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <CardHeader icon="person-add-outline" title="Applicant's Personal Details" badge="LODGER" />

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Applicant is the Groom</Text>
              <Switch
                value={applicantIsGroom}
                onValueChange={(on) => {
                  dispatch(setApplicantIsGroom(on));
                }}
                trackColor={{ false: '#C8CDD6', true: colors.navy }}
                thumbColor={colors.white}
                ios_backgroundColor="#C8CDD6"
                accessibilityLabel="Applicant is the Groom"
              />
            </View>

            {applicant ? (
              <>
                <Field label="Applicant Full Name" value={applicant.fullName} editable={false} />
                <Field label="Applicant NIC (National Identity Card)" value={applicant.nic} editable={false} />
                <Field
                  label="Applicant Date of Birth"
                  value={applicant.dob}
                  editable={false}
                  rightIcon="calendar-outline"
                />
                <Field label="Applicant Address" value={applicant.address} editable={false} multiline />
                <Pressable
                  onPress={() => dispatch(setApplicant(null))}
                  style={styles.changeBtn}
                  accessibilityRole="button"
                >
                  <Ionicons name="swap-horizontal" size={14} color={colors.navy} />
                  <Text style={styles.changeText}>Change applicant</Text>
                </Pressable>
              </>
            ) : (
              <ApplicantSearch />
            )}
          </Card>

          <Card>
            <CardHeader icon="person-outline" title="Groom's Particulars" badge="PART 1" />

            <Field
              label="Groom's Full Legal Name"
              required
              value={groom.fullName}
              onChangeText={(v) => setGroomField('fullName', v)}
              editable={!groomLocked}
              placeholder="Full legal name"
            />
            <Field
              label="Male NIC (National Identity Card)"
              required
              value={groom.nic}
              onChangeText={(v) => setGroomField('nic', v)}
              editable={!groomLocked}
              autoCapitalize="characters"
              maxLength={12}
              placeholder="NIC number"
            />
            <Field
              label="Date of Birth"
              required
              value={groom.dob}
              onChangeText={(v) => setGroomField('dob', v)}
              editable={!groomLocked}
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              rightIcon="calendar-outline"
            />
            <Field
              label="Age (Completed Years)"
              value={groomAge === null ? '' : String(groomAge)}
              editable={false}
              placeholder="Calculated from date of birth"
            />
            <Field
              label="Occupation / Profession"
              value={groom.occupation}
              onChangeText={(v) => setGroomField('occupation', v)}
              placeholder="Occupation"
            />
            <Field
              label="Permanent Address"
              value={groom.address}
              onChangeText={(v) => setGroomField('address', v)}
              editable={!groomLocked}
              multiline
              placeholder="Permanent address"
            />
            <Field
              label="Religion / Faith"
              value={groom.religion}
              onChangeText={(v) => setGroomField('religion', v)}
              placeholder="Religion"
            />
            <Field
              label="Nationality"
              value={groom.nationality}
              onChangeText={(v) => setGroomField('nationality', v)}
              placeholder="Nationality"
            />

            <MaritalStatusDropdown
              value={groom.maritalStatus}
              onChange={(v) => setGroomField('maritalStatus', v)}
            />
          </Card>

          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.navy} />
            <Text style={styles.noticeText}>
              Applicant and groom identification will be verified against the official National Civil
              Registry database.
            </Text>
          </View>

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {status === 'failed' && error ? <Text style={styles.errorText}>{error}</Text> : null}
          {status === 'saved' ? (
            <Text style={styles.savedText}>Draft saved{appRef ? ` (${appRef})` : ''}.</Text>
          ) : null}

          <Pressable accessibilityRole="button" style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextBtnText}>Next: Bride & Solemnization Details</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={[styles.draftBtn, status === 'saving' && styles.disabled]}
            onPress={onSaveDraft}
            disabled={status === 'saving'}
          >
            {status === 'saving' ? (
              <ActivityIndicator size="small" color={colors.navy} />
            ) : (
              <Ionicons name="save-outline" size={14} color={colors.navy} />
            )}
            <Text style={styles.draftText}>{status === 'saving' ? 'Saving...' : 'Save as Draft'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => {
          const active = t.label === 'Home';
          return (
            <View key={t.label} style={styles.tab} accessibilityLabel={t.label}>
              <Ionicons
                name={active ? t.activeIcon : t.icon}
                size={22}
                color={active ? colors.navy : colors.muted}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelOn]}>{t.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  headerSafe: { backgroundColor: colors.navy },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarText: { flex: 1 },
  appBarTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  appBarSub: { color: '#C9D1E3', fontSize: 11, marginTop: 2 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 8,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  workflowKicker: { fontSize: 9, letterSpacing: 0.9, color: '#AEB8D0', fontWeight: '600', paddingTop: 4 },
  progressPctWrap: { alignItems: 'flex-end' },
  progressPct: { fontSize: 18, fontWeight: '700', color: colors.white },
  progressPctLabel: { fontSize: 11, color: '#C9D1E3', marginTop: 1 },
  progressTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.white },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.white },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  stagePill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stagePillOn: { backgroundColor: colors.white },
  stagePillText: { fontSize: 11, lineHeight: 15, color: '#C9D1E3', fontWeight: '500' },
  stagePillTextOn: { color: colors.navy, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 20, gap: 12 },

  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  badge: {
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, color: colors.green },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.soft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },

  fieldLabel: { fontSize: 11.5, fontWeight: '600', color: colors.text, marginBottom: 6 },
  selectBox: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E8EE',
    backgroundColor: colors.field,
    paddingHorizontal: 12,
  },
  selectValue: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: 12 },
  selectMenu: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E8EE',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  selectOption: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
  },
  selectOptionOn: { backgroundColor: colors.soft },
  selectOptionText: { fontSize: 13, color: colors.text },
  selectOptionTextOn: { fontWeight: '700', color: colors.navy },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6DEEA',
    backgroundColor: '#F0F4FA',
    padding: 12,
  },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.muted },

  nextBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: { fontSize: 13, fontWeight: '600', color: colors.white },

  draftBtn: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  draftText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  disabled: { opacity: 0.6 },

  searchWrap: { gap: 8 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E8EE',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultName: { fontSize: 13, fontWeight: '600', color: colors.text },
  resultMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  changeText: { fontSize: 12, fontWeight: '600', color: colors.navy },
  errorText: { fontSize: 12, lineHeight: 17, color: '#B3261E' },
  hintText: { fontSize: 12, lineHeight: 17, color: colors.muted },
  savedText: { fontSize: 12, lineHeight: 17, fontWeight: '600', color: colors.green },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10, color: colors.muted },
  tabLabelOn: { color: colors.navy, fontWeight: '600' },
});
