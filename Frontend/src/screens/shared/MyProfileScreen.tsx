import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../actions/authAction';
import { changePassword } from '../../services/authService';
import {
  OfficerProfile,
  deleteProfilePhoto,
  getMyProfile,
  getProfilePhotoSource,
  updateMyProfile,
  uploadProfilePhoto,
} from '../../services/profileService';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type PhotoSource = { uri: string; headers: Record<string, string> };

const dash = (s?: string | null) => (s && s.trim() ? s : '-');
const soon = (name: string) => Alert.alert(name, 'This screen is not available yet.');
const GENDERS = ['Male', 'Female', 'Other'];

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

// bottom sheet used by the three pop-ups (edit profile / change password / photo options)
function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.navy} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Input(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numbers-and-punctuation';
  multiline?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#9AA0A6"
        secureTextEntry={props.secure}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={props.keyboardType ?? 'default'}
        multiline={props.multiline}
        editable={props.editable !== false}
        style={[styles.input, props.multiline && { height: 64, textAlignVertical: 'top' }, props.editable === false && { opacity: 0.6 }]}
      />
    </View>
  );
}

function PrimaryButton({ label, onPress, busy, outline }: { label: string; onPress: () => void; busy?: boolean; outline?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={busy} style={[styles.btn, outline && styles.btnOutline, busy && { opacity: 0.6 }]}>
      {busy ? <ActivityIndicator color={outline ? colors.navy : colors.white} /> : <Text style={[styles.btnText, outline && { color: colors.navy }]}>{label}</Text>}
    </Pressable>
  );
}

const isRealDate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s && d.getTime() <= Date.now() && d.getUTCFullYear() >= 1900;
};

export default function MyProfileScreen() {
  const dispatch = useAppDispatch();
  const nav = useNavigation<any>();
  const user = useAppSelector((s) => (s.auth as { user?: { fullName?: string; designation?: string; officeLocation?: string } }).user);

  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [photo, setPhoto] = useState<PhotoSource | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // pop-ups
  const [photoMenu, setPhotoMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  // edit form
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fAddress, setFAddress] = useState('');
  const [fDob, setFDob] = useState('');
  const [fGender, setFGender] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // password form
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const p = await getMyProfile();
      setProfile(p);
      setLoadError(null);
      setPhoto(p.has_photo ? await getProfilePhotoSource() : null);
    } catch (e: any) {
      setLoadError(e?.message ?? 'Could not load the profile.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // ---------------------------------------------------------------- photo
  const pickPhoto = async (fromCamera: boolean) => {
    setPhotoMenu(false);
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access for Expo Go in your phone settings to take a photo.');
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // small file: the server accepts max 2 MB
      };
      const res = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const a = res.assets[0];
      setBusy(true);
      await uploadProfilePhoto({
        uri: a.uri,
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
      });
      await load();
    } catch (e: any) {
      Alert.alert('Photo not saved', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoMenu(false);
    try {
      setBusy(true);
      await deleteProfilePhoto();
      await load();
    } catch (e: any) {
      Alert.alert('Could not remove photo', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------------------- edit profile
  const openEdit = () => {
    if (!profile) {
      Alert.alert('Please wait', 'The profile is still loading.');
      return;
    }
    setFName(profile.officer_name ?? '');
    setFPhone(profile.officer_phone ?? '');
    setFEmail(profile.email ?? '');
    setFAddress(profile.address ?? '');
    setFDob(profile.date_of_birth ?? '');
    setFGender(profile.gender ?? '');
    setEditError(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const name = fName.trim();
    const phone = fPhone.trim();
    const email = fEmail.trim();
    const dob = fDob.trim();
    if (!name) return setEditError('Full name is required.');
    if (phone && !/^\+?[0-9]{9,14}$/.test(phone)) return setEditError('Phone must be 9-14 digits (example 0711234567).');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setEditError('Email address is not valid.');
    if (dob && !isRealDate(dob)) return setEditError('Date of birth must be a real date as YYYY-MM-DD.');

    setBusy(true);
    setEditError(null);
    try {
      await updateMyProfile({
        officer_name: name,
        officer_phone: phone,
        email,
        address: fAddress.trim(),
        gender: fGender || undefined,
        date_of_birth: dob || undefined,
      });
      setEditOpen(false);
      await load();
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e: any) {
      setEditError(e?.message ?? 'Could not save the profile.');
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------------------------------------------- change password
  const openPwd = () => {
    setCurPwd('');
    setNewPwd('');
    setNewPwd2('');
    setShowPwd(false);
    setPwdError(null);
    setPwdOpen(true);
  };

  const savePwd = async () => {
    if (!curPwd) return setPwdError('Enter your current password.');
    if (newPwd.length < 8) return setPwdError('New password must be at least 8 characters.');
    if (newPwd === curPwd) return setPwdError('New password must be different from the current one.');
    if (newPwd !== newPwd2) return setPwdError('New password and confirmation do not match.');

    setBusy(true);
    setPwdError(null);
    try {
      await changePassword(curPwd, newPwd);
      setPwdOpen(false);
      Alert.alert('Password changed', 'Use your new password the next time you sign in.');
    } catch (e: any) {
      setPwdError(e?.message ?? 'Could not change the password.');
    } finally {
      setBusy(false);
    }
  };

  const name = profile?.officer_name ?? user?.fullName;
  const role = profile?.role_name ?? user?.designation;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        {/* Navy header: app bar + avatar block */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.appBar}>
            <Pressable onPress={() => nav.navigate('Home')} style={styles.backBtn} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={18} color={colors.navy} />
            </Pressable>
            <Text style={styles.appBarTitle}>My Profile</Text>
            <View style={styles.appBarRight}>
              <Pressable onPress={openEdit} hitSlop={8} accessibilityLabel="Edit profile">
                <Ionicons name="pencil" size={18} color={colors.white} />
              </Pressable>
              <View style={styles.avatarSmall}>
                <Ionicons name="person" size={16} color={colors.white} />
              </View>
            </View>
          </View>

          <View style={styles.hero}>
            <Pressable onPress={() => setPhotoMenu(true)} accessibilityLabel="Change photo">
              <View style={styles.photo}>
                {photo ? (
                  <Image source={photo} style={styles.photoImg} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={46} color="#D0D0D0" />
                )}
                {busy ? (
                  <View style={styles.photoBusy}>
                    <ActivityIndicator color={colors.white} />
                  </View>
                ) : null}
              </View>
              <View style={styles.photoBadge}>
                <Ionicons name="camera" size={10} color={colors.white} />
              </View>
            </Pressable>

            <Pressable onPress={() => setPhotoMenu(true)} style={styles.changePhoto}>
              <Ionicons name="cloud-upload-outline" size={11} color={colors.white} />
              <Text style={styles.changePhotoText}>CHANGE PHOTO</Text>
            </Pressable>

            <Text style={styles.name}>{dash(name)}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{dash(role)}</Text>
            </View>
            <Text style={styles.email}>{dash(profile?.email)}</Text>
          </View>
        </SafeAreaView>

        {loadError ? (
          <Pressable onPress={load} style={styles.errorBox}>
            <Text style={styles.errorText}>{loadError}</Text>
            <Text style={[styles.errorText, { fontWeight: '700', marginTop: 4 }]}>Tap to retry</Text>
          </Pressable>
        ) : null}

        {/* Personal */}
        <Section icon="id-card-outline" title="Personal Information" tag={<Text style={styles.secTag}>SEC 01</Text>}>
          <FieldRow>
            <Field label="FULL NAME" value={dash(name)} />
          </FieldRow>
          <FieldRow>
            <Field label="NIC NUMBER" value={dash(profile?.nic)} />
          </FieldRow>
          <FieldRow last>
            <Field label="DATE OF BIRTH" value={dash(profile?.date_of_birth)} />
            <Field label="GENDER" value={dash(profile?.gender)} />
          </FieldRow>
        </Section>

        {/* Contact */}
        <Section icon="call-outline" title="Contact Information" tag={<Text style={styles.secTag}>SEC 02</Text>}>
          <FieldRow>
            <Field label="EMAIL" value={dash(profile?.email)} />
          </FieldRow>
          <FieldRow>
            <Field label="PHONE" value={dash(profile?.officer_phone)} />
          </FieldRow>
          <FieldRow last>
            <Field label="ADDRESS" value={dash(profile?.address)} />
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
            <Field label="EMPLOYEE ID" value={dash(profile?.employee_id)} />
            <Field label="DESIGNATION" value={dash(role)} />
          </FieldRow>
          <FieldRow>
            <Field label="DEPARTMENT" value={dash(profile?.department)} />
          </FieldRow>
          <FieldRow last>
            <Field label="OFFICE LOCATION" value={dash(profile?.unit_name ?? user?.officeLocation)} icon="location-outline" />
          </FieldRow>
        </Section>

        {/* Account settings */}
        <Section icon="settings-outline" title="Account Settings">
          <View style={styles.settings}>
            <SettingRow icon="lock-closed-outline" label="Change Password" onPress={openPwd} />
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

      {/* ---------------- photo options ---------------- */}
      <Sheet visible={photoMenu} title="Profile photo" onClose={() => setPhotoMenu(false)}>
        <PrimaryButton label="Take a photo (camera)" onPress={() => pickPhoto(true)} />
        <View style={{ height: 10 }} />
        <PrimaryButton label="Choose from gallery" onPress={() => pickPhoto(false)} outline />
        {profile?.has_photo ? (
          <>
            <View style={{ height: 10 }} />
            <PrimaryButton label="Remove photo" onPress={removePhoto} outline />
          </>
        ) : null}
        <View style={{ height: 8 }} />
      </Sheet>

      {/* ---------------- edit profile ---------------- */}
      <Sheet visible={editOpen} title="Edit profile" onClose={() => setEditOpen(false)}>
        <Input label="FULL NAME" value={fName} onChangeText={setFName} />
        <Input label="NIC NUMBER (cannot be changed)" value={profile?.nic ?? ''} onChangeText={() => {}} editable={false} />
        <Input label="PHONE" value={fPhone} onChangeText={setFPhone} keyboardType="phone-pad" placeholder="0711234567" />
        <Input label="EMAIL" value={fEmail} onChangeText={setFEmail} keyboardType="email-address" placeholder="name@example.com" />
        <Input label="ADDRESS" value={fAddress} onChangeText={setFAddress} multiline />
        <Input label="DATE OF BIRTH (YYYY-MM-DD)" value={fDob} onChangeText={setFDob} keyboardType="numbers-and-punctuation" placeholder="1990-05-21" />
        <Text style={styles.inputLabel}>GENDER</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <Pressable key={g} onPress={() => setFGender(g)} style={[styles.genderChip, fGender === g && styles.genderChipOn]}>
              <Text style={[styles.genderText, fGender === g && { color: colors.white }]}>{g}</Text>
            </Pressable>
          ))}
        </View>
        {editError ? <Text style={styles.formError}>{editError}</Text> : null}
        <PrimaryButton label="Save changes" onPress={saveEdit} busy={busy} />
        <View style={{ height: 8 }} />
      </Sheet>

      {/* ---------------- change password ---------------- */}
      <Sheet visible={pwdOpen} title="Change password" onClose={() => setPwdOpen(false)}>
        <Input label="CURRENT PASSWORD" value={curPwd} onChangeText={setCurPwd} secure={!showPwd} />
        <Input label="NEW PASSWORD (min 8 characters)" value={newPwd} onChangeText={setNewPwd} secure={!showPwd} />
        <Input label="CONFIRM NEW PASSWORD" value={newPwd2} onChangeText={setNewPwd2} secure={!showPwd} />
        <Pressable onPress={() => setShowPwd((v) => !v)} style={styles.showRow}>
          <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.navy} />
          <Text style={styles.showText}>{showPwd ? 'Hide passwords' : 'Show passwords'}</Text>
        </Pressable>
        {pwdError ? <Text style={styles.formError}>{pwdError}</Text> : null}
        <PrimaryButton label="Update password" onPress={savePwd} busy={busy} />
        <View style={{ height: 8 }} />
      </Sheet>
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
  photoImg: { width: 76, height: 76 },
  photoBusy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
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

  errorBox: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#FDECEA' },
  errorText: { color: colors.red, fontSize: 12 },

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
  fieldValue: { fontSize: 13, color: colors.text, flexShrink: 1 },

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

  // pop-up sheets
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
    sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    maxHeight: '88%',
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.navy },
  inputLabel: { fontSize: 9, letterSpacing: 0.6, color: colors.muted, marginBottom: 4 },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.field,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  genderChip: { paddingHorizontal: 16, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.navy, justifyContent: 'center' },
  genderChipOn: { backgroundColor: colors.navy },
  genderText: { fontSize: 12, color: colors.navy },
  showRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  showText: { fontSize: 12, color: colors.navy },
  formError: { color: colors.red, fontSize: 12, marginBottom: 10 },
  btn: { height: 44, borderRadius: 10, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.navy },
  btnText: { color: colors.white, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
});