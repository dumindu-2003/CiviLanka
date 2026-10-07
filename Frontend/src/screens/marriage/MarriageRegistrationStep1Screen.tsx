import React, { useLayoutEffect, useState } from 'react';
import {
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

type MaritalStatus = 'Single / Bachelor' | 'Widowed' | 'Divorced';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const MARITAL_OPTIONS: MaritalStatus[] = ['Single / Bachelor', 'Widowed', 'Divorced'];

const APPLICANT = {
  fullName: 'Kavinda Ravishan Jayasuriya',
  nic: '199841201824',
  dob: '14/05/1989',
  address: 'No. 18/B, Circular Road, Nawala, Rajagiriya',
};

const GROOM = {
  fullName: 'Kavinda Ravishan Jayasuriya',
  nic: '199841201824',
  dob: '14/05/1989',
  age: '34',
  occupation: 'Software Architect',
  address: 'No. 18/B, Circular Road, Nawala, Rajagiriya',
  religion: 'Buddhist',
  nationality: 'Sri Lankan',
  maritalStatus: 'Single / Bachelor' as MaritalStatus,
};

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
  const [open, setOpen] = useState(true);

  return (
    <View>
      <Text style={styles.fieldLabel}>Marital Status</Text>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.selectBox}
        accessibilityRole="button"
        accessibilityLabel="Marital Status"
      >
        <Text style={styles.selectValue}>{value}</Text>
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
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default function MarriageRegistrationStep1Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [applicantIsGroom, setApplicantIsGroom] = useState(true);
  const [groom, setGroom] = useState(GROOM);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const patchGroom = <K extends keyof typeof groom>(key: K, value: (typeof groom)[K]) => {
    setGroom((g) => ({ ...g, [key]: value }));
  };

  const onToggleApplicantIsGroom = (on: boolean) => {
    setApplicantIsGroom(on);
    if (on) {
      setGroom((g) => ({
        ...g,
        fullName: APPLICANT.fullName,
        nic: APPLICANT.nic,
        dob: APPLICANT.dob,
        address: APPLICANT.address,
      }));
    }
  };

  const groomLocked = applicantIsGroom;

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
                onValueChange={onToggleApplicantIsGroom}
                trackColor={{ false: '#C8CDD6', true: colors.navy }}
                thumbColor={colors.white}
                ios_backgroundColor="#C8CDD6"
                accessibilityLabel="Applicant is the Groom"
              />
            </View>

            <Field label="Applicant Full Name" value={APPLICANT.fullName} editable={false} />
            <Field label="Applicant NIC (National Identity Card)" value={APPLICANT.nic} editable={false} />
            <Field
              label="Applicant Date of Birth"
              value={APPLICANT.dob}
              editable={false}
              rightIcon="calendar-outline"
            />
            <Field label="Applicant Address" value={APPLICANT.address} editable={false} multiline />
          </Card>

          <Card>
            <CardHeader icon="person-outline" title="Groom's Particulars" badge="PART 1" />

            <Field
              label="Groom's Full Legal Name"
              value={groom.fullName}
              onChangeText={(v) => patchGroom('fullName', v)}
              editable={!groomLocked}
              placeholder="Full legal name"
            />
            <Field
              label="Male NIC (National Identity Card)"
              value={groom.nic}
              onChangeText={(v) => patchGroom('nic', v)}
              editable={!groomLocked}
              autoCapitalize="characters"
              placeholder="NIC number"
            />
            <Field
              label="Date of Birth"
              value={groom.dob}
              onChangeText={(v) => patchGroom('dob', v)}
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              rightIcon="calendar-outline"
            />
            <Field label="Age (Completed Years)" value={groom.age} editable={false} />
            <Field
              label="Occupation / Profession"
              value={groom.occupation}
              onChangeText={(v) => patchGroom('occupation', v)}
              placeholder="Occupation"
            />
            <Field
              label="Permanent Address"
              value={groom.address}
              onChangeText={(v) => patchGroom('address', v)}
              editable={!groomLocked}
              multiline
              placeholder="Permanent address"
            />
            <Field
              label="Religion / Faith"
              value={groom.religion}
              onChangeText={(v) => patchGroom('religion', v)}
              placeholder="Religion"
            />
            <Field
              label="Nationality"
              value={groom.nationality}
              onChangeText={(v) => patchGroom('nationality', v)}
              placeholder="Nationality"
            />

            <MaritalStatusDropdown
              value={groom.maritalStatus}
              onChange={(v) => patchGroom('maritalStatus', v)}
            />
          </Card>

          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.navy} />
            <Text style={styles.noticeText}>
              Applicant and groom identification will be verified against the official National Civil
              Registry database.
            </Text>
          </View>

          <Pressable accessibilityRole="button" style={styles.nextBtn} onPress={() => undefined}>
            <Text style={styles.nextBtnText}>Next: Bride & Solemnization Details</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>

          <Pressable accessibilityRole="button" style={styles.draftBtn} onPress={() => undefined}>
            <Ionicons name="save-outline" size={14} color={colors.navy} />
            <Text style={styles.draftText}>Save as Draft</Text>
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
