import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { Card, Field, SelectField, Segmented } from '../../components/enroll/formParts';

type MaritalStatus = 'Single' | 'Widowed' | 'Divorced';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const RELIGIONS = ['Buddhist', 'Hindu', 'Islam', 'Roman Catholic', 'Christian', 'Other'];
const NATIONALITIES = ['Sri Lankan', 'Other'];

const STAGES: { n: number; line1: string; line2?: string }[] = [
  { n: 1, line1: 'Groom' },
  { n: 2, line1: 'Bride &', line2: 'Selection' },
  { n: 3, line1: 'Witnesses &', line2: 'Sign-off' },
];

const TABS: { label: string; icon: IconName }[] = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'News', icon: 'newspaper-outline' },
  { label: 'Notification', icon: 'notifications-outline' },
  { label: 'Profile', icon: 'person-outline' },
];

const BRIDE = {
  fullName: 'Thilini Menaka Senanayake',
  nic: '199628302198',
  dateOfBirth: '09/22/1992',
  age: '31 yrs',
  occupation: 'Chartered Accountant',
  address: '77/1, Flower Road, Colombo 07',
  religion: 'Buddhist',
  nationality: 'Sri Lankan',
  maritalStatus: 'Single' as MaritalStatus,
};

const SOLEMNIZATION = {
  dateOfMarriage: '01/18/2024',
  placeOfMarriage: 'Divisional Secretariat, Colombo Fort',
  registrar: 'Mr. W. M. Banduna, Justice of Peace / Registrar',
  registrationNumber: 'REG/COL/2024/0982',
};

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

export default function MarriageRegistrationStep2Screen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [bride, setBride] = useState(BRIDE);
  const [solemnization, setSolemnization] = useState(SOLEMNIZATION);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const patchBride = <K extends keyof typeof bride>(key: K, value: (typeof bride)[K]) => {
    setBride((b) => ({ ...b, [key]: value }));
  };

  const patchSolemnization = <K extends keyof typeof solemnization>(
    key: K,
    value: (typeof solemnization)[K],
  ) => {
    setSolemnization((s) => ({ ...s, [key]: value }));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.appBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerIconBtn}
            hitSlop={8}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            Marriage Registration
          </Text>
          <View style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={14} color={colors.white} />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.progressBlock}>
        <View style={styles.progressTop}>
          <Text style={styles.progressTitle}>
            {'Step 2 of 3: Bride &\nSelection'}
          </Text>
          <View style={styles.progressPctWrap}>
            <Text style={styles.progressPct}>66%</Text>
            <Text style={styles.progressPctLabel}>Completed</Text>
          </View>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: '66%' }]} />
        </View>
        <View style={styles.pillRow}>
          {STAGES.map((s, i) => {
            const active = i === 1;
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

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <CardHeader icon="female-outline" title="Bride's Details" badge="Mandatory" />

            <Field
              label="Bride's Full Legal Name"
              required
              value={bride.fullName}
              onChangeText={(v) => patchBride('fullName', v)}
              placeholder="Full legal name"
            />
            <Field
              label="Female NIC"
              required
              value={bride.nic}
              onChangeText={(v) => patchBride('nic', v)}
              autoCapitalize="characters"
              placeholder="NIC number"
            />
            <Field
              label="Date of Birth"
              required
              value={bride.dateOfBirth}
              onChangeText={(v) => patchBride('dateOfBirth', v)}
              placeholder="MM/DD/YYYY"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              rightIcon="calendar-outline"
            />
            <Field label="Age (Completed Years)" required value={bride.age} editable={false} />
            <Field
              label="Occupation"
              required
              value={bride.occupation}
              onChangeText={(v) => patchBride('occupation', v)}
              placeholder="Occupation"
            />
            <Field
              label="Permanent Address"
              required
              value={bride.address}
              onChangeText={(v) => patchBride('address', v)}
              placeholder="Permanent address"
            />
            <SelectField
              label="Religion"
              required
              value={bride.religion}
              placeholder="Select religion"
              options={RELIGIONS}
              onSelect={(v) => patchBride('religion', v)}
            />
            <SelectField
              label="Nationality"
              required
              value={bride.nationality}
              placeholder="Select nationality"
              options={NATIONALITIES}
              onSelect={(v) => patchBride('nationality', v)}
            />

            <View>
              <Text style={styles.fieldLabel}>Marital Status *</Text>
              <Segmented
                value={bride.maritalStatus}
                onChange={(v) => patchBride('maritalStatus', v)}
                options={[{ value: 'Single' }, { value: 'Widowed' }, { value: 'Divorced' }]}
              />
            </View>
          </Card>

          <Card>
            <CardHeader icon="heart-outline" title="Solemnization Details" />

            <Field
              label="Date of Marriage"
              required
              value={solemnization.dateOfMarriage}
              onChangeText={(v) => patchSolemnization('dateOfMarriage', v)}
              placeholder="MM/DD/YYYY"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              rightIcon="calendar-outline"
            />
            <Field
              label="Place of Marriage"
              required
              value={solemnization.placeOfMarriage}
              onChangeText={(v) => patchSolemnization('placeOfMarriage', v)}
              placeholder="Place of marriage"
            />
            <Field
              label="Marriage Registrar (Name & Title)"
              required
              value={solemnization.registrar}
              onChangeText={(v) => patchSolemnization('registrar', v)}
              placeholder="Registrar name and title"
            />
            <Field
              label="Registration Number"
              required
              value={solemnization.registrationNumber}
              onChangeText={(v) => patchSolemnization('registrationNumber', v)}
              autoCapitalize="characters"
              placeholder="Registration number"
            />
          </Card>

          <View style={styles.notice}>
            <Ionicons name="shield-checkmark" size={18} color={colors.navy} />
            <View style={styles.noticeTextWrap}>
              <Text style={styles.noticeTitle}>Identity Validation Synced</Text>
              <Text style={styles.noticeText}>
                Data matching Department for Registration of Persons (DRP) has been automatically
                retrieved for verification.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.nextBtn}
            onPress={() => undefined}
          >
            <Text style={styles.nextBtnText}>Next: Witnesses & Sign-off</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={14} color={colors.navy} />
              <Text style={styles.secondaryText}>Back to Groom's Details</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryBtn}
              onPress={() => Alert.alert('Saved as draft', 'Draft save is UI only for now.')}
            >
              <Ionicons name="save-outline" size={14} color={colors.navy} />
              <Text style={styles.secondaryText}>Save as Draft</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => (
          <View key={t.label} style={styles.tab} accessibilityLabel={t.label}>
            <Ionicons name={t.icon} size={22} color={colors.navy} />
            <Text style={styles.tabLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  headerSafe: { backgroundColor: colors.white },
  appBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressBlock: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  progressTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  progressTitle: { flex: 1, fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.white },
  progressPctWrap: { alignItems: 'flex-end', paddingTop: 2 },
  progressPct: { fontSize: 18, fontWeight: '700', color: colors.white },
  progressPctLabel: { fontSize: 11, color: '#C9D1E3', marginTop: 1 },
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

  fieldLabel: { fontSize: 11.5, fontWeight: '600', color: colors.text, marginBottom: 6 },

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
  noticeTextWrap: { flex: 1, gap: 2 },
  noticeTitle: { fontSize: 12, fontWeight: '700', color: colors.text },
  noticeText: { fontSize: 11, lineHeight: 16, color: colors.muted },

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

  secondaryRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  secondaryText: { fontSize: 12, fontWeight: '600', color: colors.navy, textAlign: 'center' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10, color: colors.muted },
});
