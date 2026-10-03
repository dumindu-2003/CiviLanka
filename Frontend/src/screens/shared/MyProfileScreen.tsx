import React from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../actions/authAction';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const dash = (s?: string) => (s && s.trim() ? s : '-');
const soon = (name: string) => Alert.alert(name, 'This screen is not available yet.');

function Section({ icon, title, tag, children }: { icon: IconName; title: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={16} color={colors.white} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {tag}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function FieldRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <View style={[styles.fieldRow, !last && styles.fieldDivider]}>{children}</View>;
}

function Field({ label, value, icon }: { label: string; value: string; icon?: IconName }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.valueRow}>
        {icon ? <Ionicons name={icon} size={12} color={colors.navy} /> : null}
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon, label, right, onPress }: { icon: IconName; label: string; right?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.settingRow}>
      <Ionicons name={icon} size={16} color={colors.white} />
      <Text style={styles.settingText}>{label}</Text>
      {right ? (
        <View style={styles.settingPill}>
          <Text style={styles.settingPillText}>{right}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={14} color={colors.white} />
    </Pressable>
  );
}

export default function MyProfileScreen() {
  const dispatch = useAppDispatch();
  const nav = useNavigation<any>();
  const user = useAppSelector((s) =>
    (s.auth as {
      user?: {
        fullName?: string;
        designation?: string;
        email?: string;
        nic?: string;
        dateOfBirth?: string;
        gender?: string;
        phone?: string;
        address?: string;
        employeeId?: string;
        department?: string;
        officeLocation?: string;
      };
    }).user,
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Navy header: app bar + avatar block */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.appBar}>
            <Pressable onPress={() => nav.navigate('Home')} style={styles.backBtn} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={18} color={colors.navy} />
            </Pressable>
            <Text style={styles.appBarTitle}>My Profile</Text>
            <View style={styles.appBarRight}>
              <Pressable onPress={() => soon('Edit profile')} hitSlop={8} accessibilityLabel="Edit profile">
                <Ionicons name="pencil" size={18} color={colors.white} />
              </Pressable>
              <View style={styles.avatarSmall}>
                <Ionicons name="person" size={16} color={colors.white} />
              </View>
            </View>
          </View>

          <View style={styles.hero}>
            <View>
              <View style={styles.photo}>
                <Ionicons name="person" size={46} color="#D0D0D0" />
              </View>
              <View style={styles.photoBadge}>
                <Ionicons name="camera" size={10} color={colors.white} />
              </View>
            </View>

            <Pressable onPress={() => soon('Change photo')} style={styles.changePhoto}>
              <Ionicons name="cloud-upload-outline" size={11} color={colors.white} />
              <Text style={styles.changePhotoText}>CHANGE PHOTO</Text>
            </Pressable>

            <Text style={styles.name}>{dash(user?.fullName)}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{dash(user?.designation)}</Text>
            </View>
            <Text style={styles.email}>{dash(user?.email)}</Text>
          </View>
        </SafeAreaView>

        {/* Personal */}
        <Section icon="id-card-outline" title="Personal Information" tag={<Text style={styles.secTag}>SEC 01</Text>}>
          <FieldRow>
            <Field label="FULL NAME" value={dash(user?.fullName)} />
          </FieldRow>
          <FieldRow>
            <Field label="NIC NUMBER" value={dash(user?.nic)} />
          </FieldRow>
          <FieldRow last>
            <Field label="DATE OF BIRTH" value={dash(user?.dateOfBirth)} />
            <Field label="GENDER" value={dash(user?.gender)} />
          </FieldRow>
        </Section>

        {/* Contact */}
        <Section icon="call-outline" title="Contact Information" tag={<Text style={styles.secTag}>SEC 02</Text>}>
          <FieldRow>
            <Field label="EMAIL" value={dash(user?.email)} />
          </FieldRow>
          <FieldRow>
            <Field label="PHONE" value={dash(user?.phone)} />
          </FieldRow>
          <FieldRow last>
            <Field label="ADDRESS" value={dash(user?.address)} />
          </FieldRow>
        </Section>

        {/* Employment */}
        <Section
          icon="business-outline"
          title="Employment Information"
          tag={
            <View style={styles.activePill}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          }
        >
          <FieldRow>
            <Field label="EMPLOYEE ID" value={dash(user?.employeeId)} />
            <Field label="DESIGNATION" value={dash(user?.designation)} />
          </FieldRow>
          <FieldRow>
            <Field label="DEPARTMENT" value={dash(user?.department)} />
          </FieldRow>
          <FieldRow last>
            <Field label="OFFICE LOCATION" value={dash(user?.officeLocation)} icon="location-outline" />
          </FieldRow>
        </Section>

        {/* Account settings */}
        <Section icon="settings-outline" title="Account Settings">
          <View style={styles.settings}>
            <SettingRow icon="lock-closed-outline" label="Change Password" onPress={() => soon('Change Password')} />
            <SettingRow icon="notifications-outline" label="Notification Settings" onPress={() => soon('Notification Settings')} />
            <SettingRow icon="globe-outline" label="Language Preference" right="English" onPress={() => soon('Language Preference')} />
            <SettingRow icon="shield-outline" label="Privacy Policy" onPress={() => soon('Privacy Policy')} />
            <SettingRow icon="help-circle-outline" label="Help & Support" onPress={() => soon('Help & Support')} />
          </View>
        </Section>

        {/* Logout */}
        <Pressable onPress={() => dispatch(logout())} accessibilityRole="button" style={styles.logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.white} />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </Pressable>

        <Text style={styles.footer}>GovDoc Tracker v2.4.1</Text>
        <Text style={[styles.footer, { fontSize: 10, marginTop: 2 }]}>Department of Registrar General</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // header
  header: { backgroundColor: colors.navy },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: 16, fontWeight: '600' },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
  photo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  photoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  changePhotoText: { color: colors.white, fontSize: 9, letterSpacing: 0.6 },
  name: { color: colors.white, fontSize: 18, fontWeight: '700', marginTop: 12 },
  rolePill: {
    marginTop: 6,
    height: 20,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#E3E1EC',
    justifyContent: 'center',
  },
  roleText: { fontSize: 10, color: colors.navy },
  email: { color: colors.white, fontSize: 11, marginTop: 8 },

  // sections
  section: { marginHorizontal: 16, marginTop: 16, borderRadius: 12, overflow: 'hidden' },
  sectionHead: {
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.white, fontSize: 14, fontWeight: '600' },
  secTag: { color: colors.white, fontSize: 9, letterSpacing: 0.6 },
  activePill: { height: 18, paddingHorizontal: 8, borderRadius: 4, backgroundColor: '#E8E8E9', justifyContent: 'center' },
  activeText: { fontSize: 9, color: colors.navy },
  sectionBody: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E8E8E8',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  fieldRow: { flexDirection: 'row', gap: 16, paddingVertical: 10 },
  fieldDivider: { borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  fieldLabel: { fontSize: 9, letterSpacing: 0.6, color: colors.muted },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  fieldValue: { fontSize: 13, color: colors.text },

  // settings
  settings: { paddingVertical: 8, gap: 2 },
  settingRow: {
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  settingText: { flex: 1, color: colors.white, fontSize: 13 },
  settingPill: { height: 18, paddingHorizontal: 10, borderRadius: 4, backgroundColor: '#E8E8E9', justifyContent: 'center' },
  settingPillText: { fontSize: 9, color: colors.navy },

  // logout + footer
  logout: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: colors.white, fontSize: 13, letterSpacing: 0.6, fontWeight: '500' },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 14 },
});