import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../../theme/colors';
import {
  Card, DISTRICTS, EnrollForm, Field, InfoNote, NavRow, PrimaryButton, ROLES, Segmented, SectionTitle, SelectField, SetFn,
} from '../../../components/enroll/formParts';

export interface StepProps {
  form: EnrollForm;
  set: SetFn;
  onNext: () => void;
  onBack: () => void;
  goTo: (n: number) => void;
}

// ---------------- validation ----------------
export const isoDob = (d: string) => {
  const m = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(d.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : d;
};

export function validate(step: number, f: EnrollForm): string | null {
  if (step === 0) {
    if (f.fullName.trim().length < 3) return 'Enter the full name (with initials).';
    if (!/^(\d{9}[vVxX]|\d{12})$/.test(f.nic.trim())) return 'Enter a valid NIC number (e.g. 199012345678 or 901234567V).';
    const m = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(f.dob.trim());
    if (!m || +m[1] < 1 || +m[1] > 31 || +m[2] < 1 || +m[2] > 12) return 'Enter the date of birth as DD / MM / YYYY.';
    const dt = new Date(+m[3], +m[2] - 1, +m[1]);
    if (dt.getFullYear() !== +m[3] || dt.getMonth() !== +m[2] - 1 || dt.getDate() !== +m[1] || dt > new Date())
      return 'Enter a real date of birth (DD / MM / YYYY).';
  }
  if (step === 1) {
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid personal email address.';
    if (!/^\+?[\d\s]{9,15}$/.test(f.phone.trim())) return 'Enter a valid mobile number (e.g. +94 77 123 4567).';
    if (f.phone.replace(/\s/g, '').length > 15) return 'The mobile number is too long (max 15 characters).';
    if (f.address.trim().length < 5) return 'Enter the permanent home address.';
    if (!f.district) return 'Select a district.';
  }
  if (step === 2) {
    if (!f.role) return 'Select the designated user role.';
    if (f.password.length < 8 || !/\d/.test(f.password) || !/[^A-Za-z0-9]/.test(f.password))
      return 'Password needs at least 8 characters with a number and a symbol.';
    if (f.password !== f.confirm) return 'The two passwords do not match.';
  }
  if (step === 3) {
    if (!f.cadreNo.trim()) return 'Enter the employee / cadre service number.';
    if (f.cadreNo.trim().length > 20) return 'The service number can be at most 20 characters.';
    if (!f.department.trim()) return 'Enter the government department / ministry.';
    if (!f.designation.trim()) return 'Enter the official designation.';
    if (!f.workAddress.trim()) return 'Enter the official work address.';
    if (!/^\S+@\S+\.gov\.lk$/i.test(f.govEmail.trim())) return 'Enter a valid official email ending with .gov.lk.';
    // the part before @ becomes the login username
    if (!/^[A-Za-z0-9._-]{1,50}$/.test(f.govEmail.trim().split('@')[0]))
      return 'The part of the official email before @ is the login username: use letters, numbers, . - _ only.';
    if (!/^[\d\s+/A-Za-z.-]{6,}$/.test(f.officeLine.trim())) return 'Enter the office direct line.';
  }
  if (step === 4) {
    if (!f.declare1 || !f.declare2) return 'Tick both declarations to continue.';
  }
  return null;
}

// ---------------- photo (camera / gallery) ----------------
const pickPhoto = async (fromCamera: boolean, set: SetFn) => {
  try {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera permission needed', 'Allow camera access in your phone settings to take a photo.');
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
    set('photo', { uri: a.uri, name: a.fileName ?? `photo_${Date.now()}.jpg`, type: a.mimeType ?? 'image/jpeg' });
  } catch (e: any) {
    Alert.alert('Photo not added', e?.message ?? 'Please try again.');
  }
};

const choosePhoto = (set: SetFn) =>
  Alert.alert('Official Identification Photo', 'Choose how to add the photo', [
    { text: 'Take photo', onPress: () => pickPhoto(true, set) },
    { text: 'Choose from gallery', onPress: () => pickPhoto(false, set) },
    { text: 'Cancel', style: 'cancel' },
  ]);

// ---------------- step 1 ----------------
export function StepPersonal({ form, set, onNext }: StepProps) {
  return (
    <>
      <Card>
        <View style={s.photoWrap}>
          <Pressable onPress={() => choosePhoto(set)} style={s.photoCircle} accessibilityLabel="Upload photo">
            {form.photo ? (
              <Image source={{ uri: form.photo.uri }} style={s.photoImg} resizeMode="cover" />
            ) : (
              <Ionicons name="image-outline" size={34} color={colors.navy} />
            )}
            <View style={s.cameraBadge}>
              <Ionicons name="camera" size={11} color={colors.white} />
            </View>
          </Pressable>
          <Text style={s.photoTitle}>Official Identification Photo</Text>
          <Text style={s.photoSub}>Upload Passport Size Photo (JPG/PNG, max 2MB)</Text>
        </View>

        <Field
          label="Full Name (with Initials)"
          required
          value={form.fullName}
          onChangeText={(v) => set('fullName', v)}
          placeholder="e.g. K. M. Janaka Perera"
          help="Enter name strictly as displayed on national civil records"
        />
        <Field
          label="NIC Number (National Identity Card)"
          required
          value={form.nic}
          onChangeText={(v) => set('nic', v)}
          placeholder="E.G. 199012345678 OR 901234567V"
          autoCapitalize="characters"
          rightIcon="card-outline"
        />
        <Field
          label="Date of Birth"
          required
          value={form.dob}
          onChangeText={(v) => set('dob', v)}
          placeholder="DD / MM / YYYY"
          keyboardType="numbers-and-punctuation"
          maxLength={14}
          rightIcon="calendar-outline"
        />

        <View>
          <Text style={s.groupLabel}>Gender *</Text>
          <Segmented
            value={form.gender}
            onChange={(v) => set('gender', v)}
            options={[
              { value: 'Male', icon: 'male' },
              { value: 'Female', icon: 'female' },
              { value: 'Other', icon: 'transgender' },
            ]}
          />
        </View>

        <View>
          <View style={s.langHead}>
            <Text style={s.groupLabel}>Preferred Language *</Text>
            <Text style={s.langHint}>Primary official communication</Text>
          </View>
          <Segmented pill value={form.language} onChange={(v) => set('language', v)} options={[{ value: 'Sinhala' }, { value: 'English' }, { value: 'Tamil' }]} />
        </View>

        <InfoNote
          icon="shield-checkmark-outline"
          title="Strict Verification Active"
          text="Identity inputs will be validated against civil registration database upon final submission."
        />
      </Card>

      <PrimaryButton label="Continue to Contact Details" onPress={onNext} />
      <Text style={s.stepCaption}>Step 1 of 5 • Next: Contact & Residential Info</Text>
    </>
  );
}

// ---------------- step 2 ----------------
export function StepContact({ form, set, onNext, onBack }: StepProps) {
  return (
    <>
      <Card>
        <SectionTitle icon="chatbox-outline" text="VERIFIED CHANNELS" />
        <Field
          label="Personal Email Address"
          icon="mail-outline"
          value={form.email}
          onChangeText={(v) => set('email', v)}
          placeholder="e.g. janaka.perera@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          help="Used for official status updates and verification tokens."
        />
        <Field
          label="Mobile Phone Number"
          icon="phone-portrait-outline"
          value={form.phone}
          onChangeText={(v) => set('phone', v)}
          placeholder="+94 77X XXX XXXX"
          keyboardType="phone-pad"
          help="SMS two-factor credentials will be routed here."
        />

        <SectionTitle icon="home-outline" text="RESIDENTIAL RESIDENCY" />
        <Field
          label="Permanent Home Address"
          value={form.address}
          onChangeText={(v) => set('address', v)}
          placeholder="Enter residential address, street, city"
          multiline
        />
        <SelectField label="District" icon="business-outline" value={form.district} placeholder="Select District" options={DISTRICTS} onSelect={(v) => set('district', v)} />

        <View>
          <Text style={s.groupLabel}>Frequent Regions</Text>
          <View style={s.chipRow}>
            {['Colombo', 'Gampaha', 'Kandy', 'Galle'].map((d) => (
              <Pressable key={d} onPress={() => set('district', d)} style={[s.regionChip, form.district === d && s.regionChipOn]} accessibilityRole="button">
                <Text style={s.regionText}>{d}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <InfoNote text="Sri Lanka Government Gazetted records require current domicile accuracy. False declarations will halt departmental clearance." />
      </Card>
      <NavRow nextLabel="Continue to Account Security" onBack={onBack} onNext={onNext} />
    </>
  );
}

// ---------------- step 3 ----------------
const strengthOf = (p: string) => {
  if (!p) return 0;
  let n = 0;
  if (p.length >= 8) n++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++;
  if (/\d/.test(p)) n++;
  if (/[^A-Za-z0-9]/.test(p)) n++;
  return n;
};
const STRENGTH_LABEL = ['Awaiting entry', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['#C9C9C9', colors.red, colors.amber, colors.amber, colors.green];

export function StepSecurity({ form, set, onNext, onBack }: StepProps) {
  const [show, setShow] = useState(false);
  const str = strengthOf(form.password);
  const match = form.confirm.length > 0 && form.confirm === form.password;

  return (
    <>
      <Card>
        <View style={s.roleHead}>
          <Text style={s.groupLabel}>Designated User Role</Text>
          <View style={s.tieredTag}>
            <Ionicons name="shield-checkmark" size={10} color={colors.muted} />
            <Text style={s.tieredText}>Tiered Access</Text>
          </View>
        </View>
        <SelectField label="Role" value={form.role} placeholder="Select functional designation..." options={ROLES} onSelect={(v) => set('role', v)} />
        <InfoNote icon="information-circle-outline" text="Roles determine clearance level, departmental scopes, and authorized digital certificate signing limits." />

        <Field
          label="Create Password"
          icon="lock-closed-outline"
          value={form.password}
          onChangeText={(v) => set('password', v)}
          placeholder="Min. 8 characters with numbers & symbols"
          secureTextEntry={!show}
          autoCapitalize="none"
          right={
            <Pressable onPress={() => setShow((x) => !x)} style={s.eyeBtn} hitSlop={6} accessibilityLabel="Show or hide password">
              <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.white} />
            </Pressable>
          }
        />
        <View>
          <View style={s.barRow}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[s.bar, i <= str && { backgroundColor: STRENGTH_COLOR[str] }]} />
            ))}
          </View>
          <View style={s.strengthRow}>
            <Text style={s.strengthLabel}>Security Strength</Text>
            <Text style={s.strengthLabel}>{STRENGTH_LABEL[str]}</Text>
          </View>
        </View>

        <Field
          label="Confirm Password"
          icon="reload-circle-outline"
          value={form.confirm}
          onChangeText={(v) => set('confirm', v)}
          placeholder="Re-enter secure password"
          secureTextEntry={!show}
          autoCapitalize="none"
          right={<Ionicons name="checkmark-circle-outline" size={18} color={match ? colors.green : '#B5B5B5'} />}
        />

        <InfoNote
          icon="settings-outline"
          title="Compliance Advisory"
          text="Password must comply with Sri Lanka Government Digital Security Standard (SL-GDSS-v2). Rotation required every 90 days."
        />
      </Card>
      <NavRow nextLabel="Continue to Role Details" onBack={onBack} onNext={onNext} />
    </>
  );
}

// ---------------- step 4 ----------------
export function StepRole({ form, set, onNext, onBack }: StepProps) {
  return (
    <>
      <View>
        <Text style={s.bigTitle}>Officer Enrollment</Text>
        <Text style={s.bigSub}>Role-Specific Verification & Official Deployment</Text>
      </View>

      <InfoNote title="Government Authority Portal" text="Credentials will be cross-referenced against the central Public Cadre Registry." />

      <Card>
        <Field
          label="Employee / Cadre Service Number"
          labelIcon="id-card-outline"
          value={form.cadreNo}
          onChangeText={(v) => set('cadreNo', v)}
          placeholder="e.g. EMP-2024-9941 / AG-884210"
          autoCapitalize="characters"
          help="Authorized service number as noted on departmental appointment letter."
          rightIcon="card-outline"
        />
        <Field
          label="Government Department / Ministry"
          labelIcon="business-outline"
          value={form.department}
          onChangeText={(v) => set('department', v)}
          placeholder="e.g. Department of Registration of Persons / Divisional Secretariat"
          multiline
          rightIcon="library-outline"
        />
        <Field
          label="Official Designation / Title"
          labelIcon="ribbon-outline"
          value={form.designation}
          onChangeText={(v) => set('designation', v)}
          placeholder="e.g. Assistant Registrar / Management Service Officer"
          rightIcon="briefcase-outline"
        />
        <Field
          label="Official Work Address"
          labelIcon="business-outline"
          value={form.workAddress}
          onChangeText={(v) => set('workAddress', v)}
          placeholder="e.g. 4th Floor, District Secretariat Complex, Kandy"
          rightIcon="location-outline"
        />
        <Field
          label="Official Gov Email (.gov.lk)"
          labelIcon="mail-outline"
          tag="Required"
          value={form.govEmail}
          onChangeText={(v) => set('govEmail', v)}
          placeholder="e.g. j.perera@moha.gov.lk"
          keyboardType="email-address"
          autoCapitalize="none"
          rightIcon="at"
        />
        <Field
          label="Office Direct Line / Ext."
          labelIcon="call-outline"
          value={form.officeLine}
          onChangeText={(v) => set('officeLine', v)}
          placeholder="e.g. +94 11 234 5678 / Ext 402"
          keyboardType="phone-pad"
          rightIcon="call-outline"
        />
        <InfoNote icon="shield-checkmark-outline" title="Two-Tier Data Encryption" text="Stored with departmental cryptographic seals" rightIcon="lock-closed-outline" />
      </Card>
      <NavRow nextLabel="Continue to Terms & Submit" onBack={onBack} onNext={onNext} />
    </>
  );
}

// ---------------- step 5 ----------------
function KV({ label, value, flex }: { label: string; value: string; flex?: boolean }) {
  return (
    <View style={flex ? { flex: 1 } : undefined}>
      <Text style={s.kvLabel}>{label}</Text>
      <Text style={s.kvValue}>{value || '-'}</Text>
    </View>
  );
}

function EditBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.editBtn} accessibilityRole="button">
      <Text style={s.editText}>{label}</Text>
      <Ionicons name="create-outline" size={11} color={colors.white} />
    </Pressable>
  );
}

function Check({ on, onPress, text }: { on: boolean; onPress: () => void; text: string }) {
  return (
    <Pressable onPress={onPress} style={s.checkRow} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      <View style={[s.box, on && s.boxOn]}>{on ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}</View>
      <Text style={s.checkText}>{text}</Text>
    </Pressable>
  );
}

export function StepReview({ form, set, onNext, onBack, goTo }: StepProps) {
  const ready = form.declare1 && form.declare2;
  return (
    <>
      <Card>
        <View style={s.cardHead}>
          <View style={s.rowCenter}>
            <Ionicons name="person-circle-outline" size={16} color={colors.navy} />
            <Text style={s.cardTitle}>Personal & Identity</Text>
          </View>
          <EditBtn label="Edit Step 1" onPress={() => goTo(0)} />
        </View>
        <View style={s.rowTop}>
          <View style={s.reviewPhoto}>
            {form.photo ? (
              <Image source={{ uri: form.photo.uri }} style={s.reviewPhotoImg} resizeMode="cover" />
            ) : (
              <Ionicons name="person" size={26} color="#C8C8C8" />
            )}
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={s.reviewName}>{form.fullName}</Text>
            <View style={s.twoCol}>
              <KV flex label="NIC NUMBER" value={form.nic} />
              <KV flex label="DOB" value={isoDob(form.dob)} />
            </View>
            <View style={s.twoCol}>
              <KV flex label="GENDER" value={form.gender} />
              <KV flex label="LANGUAGE" value={form.language} />
            </View>
          </View>
        </View>
      </Card>

      <Card>
        <View style={s.cardHead}>
          <View style={s.rowCenter}>
            <Ionicons name="location-outline" size={16} color={colors.navy} />
            <Text style={s.cardTitle}>Contact & Residence</Text>
          </View>
          <EditBtn label="Edit Step 2" onPress={() => goTo(1)} />
        </View>
        <KV label="PERMANENT RESIDENTIAL ADDRESS" value={form.address} />
        <View style={s.twoCol}>
          <KV flex label="PRIMARY MOBILE" value={form.phone} />
          <KV flex label="ELECTORAL DISTRICT" value={`${form.district} District`} />
        </View>
        <KV label="PERSONAL VERIFIED EMAIL" value={form.email} />
      </Card>

      <Card>
        <View style={s.cardHead}>
          <View style={s.rowCenter}>
            <Ionicons name="briefcase-outline" size={16} color={colors.navy} />
            <Text style={s.cardTitle}>Cadre & Deployment</Text>
          </View>
          <EditBtn label="Edit Step 3/4" onPress={() => goTo(3)} />
        </View>
        <View style={s.cadreBox}>
          <View style={{ flex: 1 }}>
            <Text style={s.kvLabel}>PUBLIC SERVICE CADRE NO.</Text>
            <Text style={s.cadreValue}>{form.cadreNo || '-'}</Text>
          </View>
          <Ionicons name="card-outline" size={22} color={colors.navy} />
        </View>
        <View style={s.twoCol}>
          <KV flex label="DESIGNATION" value={form.designation} />
          <KV flex label="OFFICE CONTACT" value={form.officeLine} />
        </View>
        <KV label="MINISTRY / GOVERNING DEPARTMENT" value={form.department} />
      </Card>

      <Card>
        <View style={s.rowCenter}>
          <View style={s.declIcon}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.navy} />
          </View>
          <View>
            <Text style={s.cardTitle}>Statutory Legal Declaration</Text>
            <Text style={s.declSub}>Government Gazette • Electronic Records Registry</Text>
          </View>
        </View>
        <Check
          on={form.declare1}
          onPress={() => set('declare1', !form.declare1)}
          text="I hereby certify that all particulars provided herein are true, accurate, and correspond to official gazetted public cadre records."
        />
        <Check
          on={form.declare2}
          onPress={() => set('declare2', !form.declare2)}
          text="I agree to the Digital Governance Service Terms, Official Secrets Act, and Computer Crimes Act No. 24 of 2007 regulations."
        />
        <InfoNote icon="information-circle-outline" text="Submission requires digital sign-off from a presiding Authorizing Officer. Have supervising credentials ready." />
      </Card>

      <NavRow nextLabel="Submit for Officer Sign-Off" onBack={onBack} onNext={onNext} nextDisabled={!ready} />
    </>
  );
}

const s = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTop: { flexDirection: 'row', gap: 12 },
  twoCol: { flexDirection: 'row', gap: 12 },
  groupLabel: { fontSize: 11.5, fontWeight: '600', color: colors.text, marginBottom: 6 },

  photoWrap: { alignItems: 'center', gap: 6, paddingTop: 4 },
  photoImg: { width: 80, height: 80, borderRadius: 40 },
  photoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'center' },
  cameraBadge: { position: 'absolute', right: 0, bottom: 2, width: 22, height: 22, borderRadius: 6, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  photoTitle: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 4 },
  photoSub: { fontSize: 9.5, color: colors.muted },

  langHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langHint: { fontSize: 9, color: colors.muted, marginBottom: 6 },
  stepCaption: { fontSize: 10, color: colors.muted, textAlign: 'center' },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  regionChip: { height: 30, paddingHorizontal: 14, borderRadius: 6, backgroundColor: colors.navy, justifyContent: 'center', borderWidth: 2, borderColor: colors.navy },
  regionChipOn: { borderColor: colors.amber },
  regionText: { fontSize: 11, color: colors.white },

  roleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tieredTag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 4, backgroundColor: colors.chip, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 },
  tieredText: { fontSize: 9, color: colors.muted },
  eyeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  barRow: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#D9D9D9' },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  strengthLabel: { fontSize: 9.5, color: colors.muted },

  bigTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  bigSub: { fontSize: 12, color: colors.muted, marginTop: 2 },

  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 4, backgroundColor: colors.navy, paddingHorizontal: 8, paddingVertical: 4 },
  editText: { fontSize: 9, color: colors.white },
  reviewPhotoImg: { width: 56, height: 56, borderRadius: 10 },
  reviewPhoto: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'center' },
  reviewName: { fontSize: 15, fontWeight: '700', color: colors.text },
  kvLabel: { fontSize: 8.5, letterSpacing: 0.5, color: colors.muted },
  kvValue: { fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 2 },
  cadreBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, backgroundColor: colors.soft, padding: 12 },
  cadreValue: { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: 2 },
  declIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  declSub: { fontSize: 9.5, color: colors.muted, marginTop: 1 },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#B5B5B5', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  checkText: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.muted },
});