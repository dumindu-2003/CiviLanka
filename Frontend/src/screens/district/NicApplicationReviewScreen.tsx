import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { approveApplication, getApplicationDetail, rejectApplication } from '../../services/districtService';
import type { Decision } from '../../types/district';
import { colors } from '../../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ---------------- demo data (replace with an API call when the backend is ready) ----------------
interface Detail {
  id: string;
  submitted: string;
  division: string;
  officer: string;
  voNo: string;
  gn: string;
  name: string;
  initials: string;
  type: string;
  dob: string;
  age: number;
  phone: string;
  address: string;
}

const DETAILS: Detail[] = [
  {
    id: 'NIC-APP-2026-88841', submitted: '18 Oct 2026, 10:45 AM', division: 'Colombo Fort (Div 01)',
    officer: 'K. M. Bandara', voNo: 'VO-2024-8841', gn: 'GN Div 412 - Colombo Fort North',
    name: 'Saman Kumara Perera', initials: 'S. K. Perera', type: 'First-Time NIC',
    dob: '14/08/2006', age: 20, phone: '+94 77 123 4567', address: 'No. 42/B, Galle Road, Colombo 03',
  },
  {
    id: 'NIC-APP-2026-88938', submitted: '18 Oct 2026, 09:20 AM', division: 'Colombo Fort (Div 01)',
    officer: 'M. T. Hameed', voNo: 'VO-2023-5120', gn: 'GN Div 408 - Kompannaveediya',
    name: 'Nadeesha Dilrukshi Senanayake', initials: 'N. D. Senanayake', type: 'First-Time NIC',
    dob: '11/02/2010', age: 16, phone: '+94 71 555 0198', address: 'No. 7, Union Place, Slave Island',
  },
  {
    id: 'NIC-APP-2026-88915', submitted: '17 Oct 2026, 02:05 PM', division: 'Colombo Fort (Div 01)',
    officer: 'W. A. Sunil Shantha', voNo: 'VO-2021-3319', gn: 'GN Div 415 - Kollupitiya West',
    name: 'Kasun Dinesh Jayawardena', initials: 'K. D. Jayawardena', type: 'Replacement',
    dob: '22/03/1992', age: 34, phone: '+94 76 222 0145', address: 'No. 18, Galle Road, Kollupitiya',
  },
  {
    id: 'NIC-APP-2026-88890', submitted: '17 Oct 2026, 11:30 AM', division: 'Colombo Fort (Div 01)',
    officer: 'K. M. Bandara', voNo: 'VO-2024-8841', gn: 'GN Div 412 - Colombo Fort North',
    name: 'Fathima Rishana Mohamed', initials: 'F. R. Mohamed', type: 'First-Time NIC',
    dob: '30/06/2007', age: 19, phone: '+94 77 900 0321', address: 'No. 5, Chatham Street, Fort',
  },
];

const getDetail = (id: string): Detail => DETAILS.find((d) => d.id === id) ?? { ...DETAILS[0], id };
const pick = <T = any,>(row: Record<string, any> | null, ...keys: string[]): T | undefined => {
  if (!row) return undefined;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key] as T;
  }
  return undefined;
};

const hydrateDetail = (fallback: Detail, row: Record<string, any> | null): Detail => ({
  ...fallback,
  id: String(pick(row, 'id', 'app_ref', 'application_ref', 'application_id') ?? fallback.id),
  submitted: String(pick(row, 'submitted', 'submitted_on', 'created_at', 'submitted_date') ?? fallback.submitted),
  division: String(pick(row, 'division', 'gn_division', 'sub_area', 'district') ?? fallback.division),
  officer: String(pick(row, 'officer', 'officer_name', 'submitted_by', 'created_by_name') ?? fallback.officer),
  voNo: String(pick(row, 'voNo', 'vo_no', 'service_number', 'officer_service_number') ?? fallback.voNo),
  gn: String(pick(row, 'gn', 'gn_division', 'sub_area') ?? fallback.gn),
  name: String(pick(row, 'name', 'full_name', 'applicant_name', 'citizenName') ?? fallback.name),
  initials: String(pick(row, 'initials', 'name_with_initials') ?? fallback.initials),
  type: String(pick(row, 'type', 'application_type', 'request_type') ?? fallback.type),
  dob: String(pick(row, 'dob', 'date_of_birth') ?? fallback.dob),
  age: Number(pick(row, 'age') ?? fallback.age),
  phone: String(pick(row, 'phone', 'mobile_no', 'contact_no') ?? fallback.phone),
  address: String(pick(row, 'address', 'permanent_address') ?? fallback.address),
});

const officerInitials = (n: string) => {
  const p = n.replace(/\./g, '').split(' ').filter(Boolean);
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};
const officerHandle = (n: string) => `@gn_${n.split(' ').pop()!.toLowerCase()}_div01`;
const soon = (what: string) => Alert.alert(what, 'This feature is not available yet.');

// ---------------- small pieces ----------------
function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Caption({ children }: { children: React.ReactNode }) {
  return <Text style={styles.caption}>{children}</Text>;
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
      {sub ? <Text style={styles.fieldSub}>{sub}</Text> : null}
    </View>
  );
}

function DocRow({ icon, title, sub, action, actionIcon }: { icon: IconName; title: string; sub: string; action: string; actionIcon: IconName }) {
  return (
    <View style={styles.docRow}>
      <View style={styles.docIcon}>
        <Ionicons name={icon} size={16} color={colors.navy} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSub}>{sub}</Text>
      </View>
      <Pressable onPress={() => soon(title)} style={styles.docBtn} accessibilityRole="button">
        <Text style={styles.docBtnText}>{action}</Text>
        <Ionicons name={actionIcon} size={11} color={colors.white} />
      </Pressable>
    </View>
  );
}

function AuthField({ label, icon, ...props }: { label: string; icon?: IconName } & TextInputProps) {
  return (
    <View style={styles.authField}>
      <Text style={styles.authLabel}>{label}</Text>
      <View style={styles.authInputRow}>
        {icon ? <Ionicons name={icon} size={16} color={colors.navy} /> : null}
        <TextInput {...props} placeholderTextColor="#9A9A9A" style={[styles.authInput, props.style]} />
      </View>
    </View>
  );
}

// ---------------- screen ----------------
export default function NicApplicationReviewScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'NicApplicationReview'>>();
  const fallbackDetail = getDetail(params.applicationId);

  const [detailRow, setDetailRow] = useState<Record<string, any> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [username, setUsername] = useState('');
  const [serviceNo, setServiceNo] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoadError(null);
      getApplicationDetail(params.applicationId)
        .then((row) => {
          if (active) setDetailRow(row);
        })
        .catch((e: any) => {
          if (active) setLoadError(e?.message ?? 'Failed to load application details.');
        });
      return () => {
        active = false;
      };
    }, [params.applicationId]),
  );

  const d = hydrateDetail(fallbackDetail, detailRow);

  const submit = async (decision: Decision) => {
    if (!username.trim() || !serviceNo.trim() || !password) {
      Alert.alert('Credentials required', 'Enter your officer username, registrar service no and password.');
      return;
    }
    if (decision === 'REJECT' && !remarks.trim()) {
      Alert.alert('Remarks required', 'Please enter the rejection remarks.');
      return;
    }
    setBusy(true);
    try {
      const credentials = {
        officerUserName: username.trim(),
        authorizingServiceNo: serviceNo.trim(),
        officerPassword: password,
      };
      if (decision === 'APPROVE') await approveApplication(d.id, credentials);
      else await rejectApplication(d.id, remarks.trim(), credentials); // remarks box = rejection reason
      Alert.alert(
        decision === 'APPROVE' ? 'Application approved' : 'Application rejected',
        `${d.id} has been ${decision === 'APPROVE' ? 'authorized' : 'rejected'}.`,
        [{ text: 'OK', onPress: () => nav.goBack() }],
      );
    } catch (e: any) {
      Alert.alert('Not authorized', e?.message ?? 'Action failed');
    } finally {
      setBusy(false);
      setPassword(''); // do not keep the password in state
    }
  };

  const reVerify = () =>
    Alert.alert('Request re-verification', `Send this application back to ${d.officer}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: () => Alert.alert('Request sent', `${d.officer} has been asked to re-verify.`, [{ text: 'OK', onPress: () => nav.goBack() }]),
      },
    ]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      {/* App bar */}
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} hitSlop={8} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.appBarTitle}>NIC Application Review</Text>
            <View style={styles.statusRow}>
              <View style={styles.pendingPill}>
                <Text style={styles.pendingText}>PENDING APPROVAL</Text>
              </View>
              <Text style={styles.officerActive}>• Officer Active</Text>
            </View>
          </View>
          <Pressable onPress={() => soon('Menu')} hitSlop={8} accessibilityLabel="More">
            <Ionicons name="ellipsis-vertical" size={18} color={colors.white} />
          </Pressable>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color={colors.white} />
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {loadError ? <Text style={styles.loadError}>{loadError}</Text> : null}

          {/* Queue strip (text is a guess - the Figma text is unreadable) */}
          <View style={styles.queueStrip}>
            <View style={styles.rowCenter}>
              <View style={styles.stripDot} />
              <Text style={styles.stripText}>QUEUE POSITION #04 OF 18</Text>
            </View>
            <Text style={styles.stripText}>SLA: 4h Remaining</Text>
          </View>

          {/* Reference card */}
          <View style={styles.refCard}>
            <View style={styles.refTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.refLabel}>APPLICATION REFERENCE</Text>
                <Text style={styles.refValue}>{d.id}</Text>
              </View>
              <View style={styles.refPill}>
                <View style={styles.pillDot} />
                <Text style={styles.refPillText}>PENDING REGISTRAR APPROVAL</Text>
              </View>
            </View>
            <View style={styles.refDivider} />
            <View style={styles.rowGap}>
              <View style={{ flex: 1 }}>
                <Text style={styles.refLabel}>SUBMISSION DATE</Text>
                <Text style={styles.refSmall}>{d.submitted}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.refLabel}>SECRETARIAT DIVISION</Text>
                <Text style={styles.refSmall}>{d.division}</Text>
              </View>
            </View>
          </View>

          {/* Submitting village officer */}
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Caption>SUBMITTING VILLAGE OFFICER (VO)</Caption>
                <Text style={styles.helper}>Officer who verified applicant identity in the field</Text>
              </View>
              <Ionicons name="shield-checkmark" size={18} color={colors.navy} />
            </View>

            <View style={styles.officerBox}>
              <View style={styles.officerAvatar}>
                <Text style={styles.officerAvatarText}>{officerInitials(d.officer)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.officerName}>{d.officer}</Text>
                <Text style={styles.officerMeta}>
                  ID: {d.voNo} • {officerHandle(d.officer)}
                </Text>
              </View>
              <Pressable onPress={() => soon('Call officer')} style={styles.callBtn} accessibilityLabel="Call officer">
                <Ionicons name="call" size={16} color={colors.white} />
              </Pressable>
            </View>

            <View style={styles.gnBanner}>
              <View style={styles.rowCenter}>
                <Ionicons name="location-outline" size={13} color={colors.white} />
                <Text style={styles.gnText}>{d.gn}</Text>
              </View>
              <View style={styles.verifiedChip}>
                <Ionicons name="checkmark-circle" size={13} color={colors.navy} />
                <Text style={styles.verifiedText}>Identity & Physical Address Verified</Text>
              </View>
            </View>

            <View style={styles.logBox}>
              <View style={styles.rowCenter}>
                <Ionicons name="chatbox-ellipses-outline" size={11} color={colors.muted} />
                <Text style={styles.logLabel}>FIELD VERIFICATION LOG</Text>
              </View>
              <Text style={styles.logText}>
                “Applicant produced original birth certificate and proof of residence. Biometric matching threshold
                99.4%. Recommended for National Identity Card issuance.”
              </Text>
            </View>
          </Card>

          {/* Applicant identity */}
          <Card>
            <View style={styles.rowBetween}>
              <Caption>APPLICANT IDENTITY DETAILS</Caption>
              <Text style={styles.typeText}>{d.type}</Text>
            </View>

            <View style={styles.idBanner}>
              <View style={styles.photo}>
                <Ionicons name="person" size={34} color="#C8C8C8" />
                <View style={styles.icaoTag}>
                  <Text style={styles.icaoText}>ICAO</Text>
                </View>
              </View>
              <View style={styles.idInfo}>
                <Text style={styles.idName}>{d.name}</Text>
                <Text style={styles.idInitials}>Initials: {d.initials}</Text>
                <View style={styles.rowCenter}>
                  <View style={styles.idChip}>
                    <Text style={styles.idChipText}>Male</Text>
                  </View>
                  <View style={styles.idChip}>
                    <Text style={styles.idChipText}>Sri Lankan</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.detailBox}>
              <View style={styles.rowGap}>
                <Field label="DATE OF BIRTH" value={d.dob} sub={`Age: ${d.age} Years`} />
                <Field label="CONTACT TELEPHONE" value={d.phone} sub="OTP Validated" />
              </View>
              <View style={{ marginTop: 10 }}>
                <Field label="PERMANENT ADDRESS" value={d.address} />
              </View>
            </View>
          </Card>

          {/* Documents */}
          <Card>
            <View style={styles.rowBetween}>
              <Caption>ATTACHED & VERIFIED DOCUMENTS</Caption>
              <Text style={styles.typeText}>3 of 3 verified</Text>
            </View>
            <View style={{ gap: 6, marginTop: 10 }}>
              <DocRow
                icon="document-text-outline"
                title="Original Birth Certificate"
                sub={`BC-${d.dob.slice(-4)}-${d.id.slice(-4)} • Verified by VO`}
                action="View PDF"
                actionIcon="open-outline"
              />
              <DocRow icon="image-outline" title="Certified Biometric Photo" sub="ICAO Spec • Accepted" action="View Photo" actionIcon="eye-outline" />
              <DocRow
                icon="clipboard-outline"
                title="GN Verification Certificate"
                sub="Signed Digitally (Token ID 882)"
                action="View Doc"
                actionIcon="open-outline"
              />
            </View>
          </Card>

          {/* Registrar sign-off */}
          <Card>
            <View style={styles.rowBetween}>
              <Caption>REGISTRAR FINAL SIGN-OFF</Caption>
              <View style={styles.rowCenter}>
                <Ionicons name="key-outline" size={11} color={colors.navy} />
                <Text style={styles.typeText}>Secured Key PKI</Text>
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <AuthField
                label="Registrar Review Notes & Endorsement Remarks"
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Enter review notes or rejection remarks (optional if approved)..."
                multiline
                style={{ minHeight: 44, textAlignVertical: 'top' }}
              />
            </View>

            <View style={styles.authBox}>
              <View style={styles.rowBetween}>
                <View style={[styles.rowCenter, { flex: 1 }]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.navy} />
                  <Text style={styles.authTitle}>DISTRICT REGISTRAR AUTHORIZATION</Text>
                </View>
                <View style={styles.requiredPill}>
                  <Text style={styles.requiredText}>REQUIRED</Text>
                </View>
              </View>
              <Text style={styles.authHelp}>Enter your administration credentials to authorize approval & sign digital PDF form</Text>

              <AuthField label="OFFICER USERNAME" icon="business-outline" value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="e.g. dr.fernando" />
              <AuthField label="REGISTRAR SERVICE NO" icon="card-outline" value={serviceNo} onChangeText={setServiceNo} autoCapitalize="characters" placeholder="e.g. DR-2024-9812" />
              <AuthField label="OFFICER PASSWORD / PIN" icon="key-outline" value={password} onChangeText={setPassword} secureTextEntry placeholder="Password or PIN" />

              <View style={styles.secureNote}>
                <Ionicons name="shield" size={12} color={colors.navy} />
                <Text style={styles.secureText}>Secured via National Vital Registry PKI Certificate</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.navy} />
              <Text style={styles.infoText}>
                Upon approval, the official Digital NIC Form & Certified Application PDF will be generated and signed
                with your Registrar Digital Certificate.
              </Text>
            </View>

            <View style={{ gap: 8, marginTop: 12 }}>
              <Pressable disabled={busy} onPress={() => submit('APPROVE')} accessibilityRole="button" style={[styles.bigBtn, { backgroundColor: colors.green }, busy && { opacity: 0.6 }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
                <Text style={styles.bigBtnText}>AUTHORIZE & GENERATE PDF FORM</Text>
              </Pressable>
              <Pressable disabled={busy} onPress={() => submit('REJECT')} accessibilityRole="button" style={[styles.bigBtn, { backgroundColor: colors.red }, busy && { opacity: 0.6 }]}>
                <Ionicons name="ban-outline" size={18} color={colors.white} />
                <Text style={styles.bigBtnText}>REJECT APPLICATION</Text>
              </Pressable>
              <Pressable disabled={busy} onPress={reVerify} accessibilityRole="button" style={[styles.smallBtn, busy && { opacity: 0.6 }]}>
                <Ionicons name="refresh-outline" size={14} color={colors.white} />
                <Text style={styles.smallBtnText}>Request Re-Verification from Village Officer</Text>
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowGap: { flexDirection: 'row', gap: 12 },
  loadError: { color: colors.red, fontSize: 12 },

  // app bar
  appBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  appBarTitle: { color: colors.white, fontSize: 15, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  pendingPill: { height: 15, paddingHorizontal: 7, borderRadius: 999, backgroundColor: colors.white, justifyContent: 'center' },
  pendingText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.4, color: colors.navy },
  officerActive: { fontSize: 10, color: '#C9D1E3' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },

  // queue strip
  queueStrip: {
    minHeight: 26,
    borderRadius: 8,
    backgroundColor: colors.blue,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.white },
  stripText: { fontSize: 9, letterSpacing: 0.5, color: colors.white },

  // reference card
  refCard: { backgroundColor: colors.navy, borderRadius: 14, padding: 16 },
  refTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  refLabel: { fontSize: 8, letterSpacing: 0.6, color: '#AEB8D0' },
  refValue: { fontSize: 20, fontWeight: '700', color: colors.white, marginTop: 3 },
  refPill: {
    maxWidth: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#E3E1EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.navy },
  refPillText: { flexShrink: 1, fontSize: 7.5, fontWeight: '700', letterSpacing: 0.3, color: colors.navy },
  refDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 12 },
  refSmall: { fontSize: 12, fontWeight: '600', color: colors.white, marginTop: 3 },

  // cards
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16 },
  caption: { fontSize: 8.5, letterSpacing: 0.6, color: colors.muted },
  helper: { fontSize: 11, color: colors.muted, marginTop: 2 },
  typeText: { fontSize: 9, color: colors.muted },
  fieldLabel: { fontSize: 8, letterSpacing: 0.6, color: colors.muted },
  fieldValue: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 2 },
  fieldSub: { fontSize: 10, color: colors.muted, marginTop: 1 },

  // officer
  officerBox: { marginTop: 12, borderRadius: 10, backgroundColor: colors.soft, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  officerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  officerAvatarText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  officerName: { fontSize: 13, fontWeight: '700', color: colors.text },
  officerMeta: { fontSize: 10, color: colors.muted, marginTop: 2 },
  callBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  gnBanner: { marginTop: 8, borderRadius: 8, backgroundColor: colors.blue, padding: 8, gap: 6 },
  gnText: { fontSize: 11, color: colors.white },
  verifiedChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, backgroundColor: '#CFE2F8', paddingHorizontal: 8, paddingVertical: 4 },
  verifiedText: { fontSize: 10, color: colors.navy },
  logBox: { marginTop: 8, borderRadius: 10, backgroundColor: colors.soft, padding: 10 },
  logLabel: { fontSize: 8.5, letterSpacing: 0.5, color: colors.muted },
  logText: { fontSize: 11, lineHeight: 17, fontStyle: 'italic', color: colors.muted, marginTop: 4 },

  // identity
  idBanner: { marginTop: 10, flexDirection: 'row', borderRadius: 10, overflow: 'hidden', backgroundColor: colors.navy, minHeight: 90 },
  photo: { width: 75, backgroundColor: '#E6E6E6', alignItems: 'center', justifyContent: 'center' },
  icaoTag: { position: 'absolute', right: 4, bottom: 4, borderRadius: 3, backgroundColor: '#000', paddingHorizontal: 5, paddingVertical: 2 },
  icaoText: { fontSize: 7, color: colors.white },
  idInfo: { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  idName: { fontSize: 15, fontWeight: '700', color: colors.white },
  idInitials: { fontSize: 11, color: '#C9D1E3' },
  idChip: { borderRadius: 4, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 2 },
  idChipText: { fontSize: 8, color: colors.navy },
  detailBox: { marginTop: 8, borderRadius: 10, backgroundColor: colors.soft, padding: 12 },

  // documents
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, backgroundColor: colors.soft, padding: 8 },
  docIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontSize: 11.5, color: colors.text },
  docSub: { fontSize: 10, color: colors.muted, marginTop: 1 },
  docBtn: { height: 26, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', gap: 5 },
  docBtnText: { fontSize: 9.5, color: colors.white },

  // sign-off
  authField: { marginBottom: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E5E8EE', backgroundColor: colors.field, overflow: 'hidden' },
  authLabel: { fontSize: 8, letterSpacing: 0.5, color: colors.muted, paddingHorizontal: 10, paddingTop: 5 },
  authInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  authInput: { flex: 1, minHeight: 34, fontSize: 13, color: colors.text, paddingVertical: 4 },
  authBox: { marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E8EE', padding: 12 },
  authTitle: { flex: 1, fontSize: 8.5, letterSpacing: 0.5, color: colors.muted },
  requiredPill: { borderRadius: 999, backgroundColor: '#E3E1EC', paddingHorizontal: 8, paddingVertical: 3 },
  requiredText: { fontSize: 8, fontWeight: '700', color: colors.navy },
  authHelp: { fontSize: 10.5, fontStyle: 'italic', color: colors.muted, marginVertical: 8 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, backgroundColor: colors.field, padding: 8 },
  secureText: { fontSize: 9, color: colors.muted },
  infoBox: { marginTop: 10, flexDirection: 'row', gap: 8, borderRadius: 10, backgroundColor: '#E8E8E8', padding: 10 },
  infoText: { flex: 1, fontSize: 10, lineHeight: 15, color: colors.muted },

  // buttons
  bigBtn: { height: 46, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bigBtnText: { color: colors.white, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  smallBtn: { height: 38, borderRadius: 8, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  smallBtnText: { color: colors.white, fontSize: 11 },
});
