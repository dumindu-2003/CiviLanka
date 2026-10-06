import React, { useMemo } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearNicContactDraft } from './NicContactFamilyScreen';
import { clearNicDocumentDraft } from './NicDocumentsScreen';
import { clearNicAuthorization, readNicAuthorization } from './NicDeclarationScreen';
import { clearNicPersonalDraft, readNicPersonalDraft } from './NicPersonalDetailsScreen';
import type { RootStackParamList } from '../../navigation/types';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/colors';

function referenceNo() {
  const year = new Date().getFullYear();
  const serial = String(Date.now() % 100000).padStart(5, '0');
  return `NIC-${year}-${serial}`;
}

function submittedAt(date: Date) {
  const time = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `Just now • ${time.replace(',', '')}`;
}

export default function NicReceiptScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector((s) => s.auth.user);
  const receipt = useMemo(() => {
    const personal = readNicPersonalDraft();
    const signed = readNicAuthorization();
    const when = new Date();
    const serviceNo = signed?.serviceNo || user?.serviceNo;
    return {
      reference: referenceNo(),
      applicant: personal?.fullName?.trim() || 'Applicant',
      officer: serviceNo ? `GN Officer ${serviceNo}` : user?.fullName || 'Grama Niladhari',
      destination: `District Registrar Office - ${personal?.district?.trim() || 'Colombo'}`,
      submitted: submittedAt(when),
    };
  }, [user]);

  const receiptText = [
    `Application reference: ${receipt.reference}`,
    `Applicant: ${receipt.applicant}`,
    `Authorizing officer: ${receipt.officer}`,
    `Routed destination: ${receipt.destination}`,
    'Current status: PENDING APPROVAL',
    `Submission: ${receipt.submitted}`,
  ].join('\n');

  const printReceipt = async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
        window.print();
        return;
      }
      await Share.share({ title: receipt.reference, message: receiptText });
    } catch {
      Alert.alert(receipt.reference, receiptText);
    }
  };

  const viewDashboard = () => {
    nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Home' } }] }));
  };

  const startNew = () => {
    clearNicPersonalDraft();
    clearNicContactDraft();
    clearNicDocumentDraft();
    clearNicAuthorization();
    nav.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'MainTabs' }, { name: 'NicPersonalDetails' }],
      }),
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.appBar}>
          <Pressable onPress={() => nav.goBack()} style={styles.mark} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </Pressable>
          <Text style={styles.title}>Application Receipt</Text>
          <Pressable onPress={() => nav.navigate('MainTabs', { screen: 'Profile' })} style={styles.avatar} accessibilityLabel="Profile">
            <Ionicons name="person" size={16} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.successWrap}>
            <View style={styles.success}>
              <Ionicons name="checkmark" size={34} color={colors.white} />
            </View>
            <View style={styles.badge}>
              <Ionicons name="document-text" size={12} color={colors.white} />
            </View>
          </View>
          <Text style={styles.heroTitle}>Application Submitted to District Registrar</Text>
          <Text style={styles.heroBody}>
            The NIC Application has been successfully authorized and queued in the District Registrar's Pending Review list.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.refBar}>
            <Text style={styles.refLabel}>APPLICATION REFERENCE</Text>
            <Text style={styles.refValue}>{receipt.reference}</Text>
          </View>
          <Row label="Applicant" value={receipt.applicant} />
          <Row label="Authorizing Officer" value={receipt.officer} />
          <Row label="Routed Destination" value={receipt.destination} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current Status</Text>
            <View style={styles.status}>
              <Text style={styles.statusText}>PENDING APPROVAL</Text>
            </View>
          </View>
          <Row label="Submission" value={receipt.submitted} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.milesTitle}>VERIFICATION MILESTONES</Text>
          <Milestone
            state="done"
            title="Step 1: Submission & Officer Sign-off"
            detail="Completed & validated by Grama Niladhari"
          />
          <Milestone
            state="active"
            title="Step 2: Registrar Document Review"
            detail="Under queue for official identity clearance"
          />
          <Milestone
            state="waiting"
            title="Step 3: Biometrics & Production"
            detail="Awaiting Step 2 authorization"
            last
          />
        </View>

        <Pressable onPress={viewDashboard} accessibilityRole="button" style={styles.outlineBtn}>
          <Text style={styles.outlineText}>VIEW DISTRICT REGISTRAR DASHBOARD</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.navy} />
        </Pressable>
        <Pressable onPress={printReceipt} accessibilityRole="button" style={styles.printBtn}>
          <Ionicons name="print-outline" size={16} color={colors.navy} />
          <Text style={styles.printText}>PRINT APPLICATION RECEIPT</Text>
        </Pressable>
        <Pressable onPress={startNew} accessibilityRole="button" style={styles.newBtn}>
          <Text style={styles.newText}>Start New Application</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Milestone({
  state,
  title,
  detail,
  last,
}: {
  state: 'done' | 'active' | 'waiting';
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.mile, !last && styles.mileLine]}>
      <View style={[styles.dot, state === 'done' && styles.dotDone, state === 'active' && styles.dotActive]}>
        {state === 'done' ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
        {state === 'active' ? <View style={styles.dotCore} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.mileTitleRow}>
          <Text style={styles.mileTitle}>{title}</Text>
          {state === 'active' ? (
            <View style={styles.activePill}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.mileDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.navy },
  appBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  mark: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '700' },
  avatar: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },

  content: { padding: 16, paddingBottom: 28, gap: 14 },
  hero: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 8 },
  successWrap: { width: 78, height: 78, marginBottom: 14 },
  success: {
    width: 72, height: 72, borderRadius: 18, backgroundColor: colors.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', right: 0, bottom: 2, width: 24, height: 24, borderRadius: 8,
    backgroundColor: '#F5A623', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg,
  },
  heroTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: colors.text, textAlign: 'center' },
  heroBody: { fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center', marginTop: 8 },

  card: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' },
  refBar: { backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 12 },
  refLabel: { color: '#D5DCE8', fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  refValue: { color: colors.white, fontSize: 18, fontWeight: '700', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: '#F0F1F4' },
  rowLabel: { fontSize: 12, color: colors.muted },
  rowValue: { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
  status: { borderRadius: 999, backgroundColor: '#EEF1F8', paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: colors.navy, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  milesTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: colors.text, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  mile: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  mileLine: { borderBottomWidth: 1, borderBottomColor: '#F0F1F4' },
  dot: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#D5D8DE',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  dotDone: { backgroundColor: colors.navy, borderColor: colors.navy },
  dotActive: { borderColor: colors.blue },
  dotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  mileTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  mileTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text },
  mileDetail: { fontSize: 12, color: colors.muted, marginTop: 2 },
  activePill: { borderRadius: 999, borderWidth: 1, borderColor: colors.blue, paddingHorizontal: 8, paddingVertical: 2 },
  activeText: { color: colors.blue, fontSize: 10, fontWeight: '700' },

  outlineBtn: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: colors.navy, backgroundColor: colors.white,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 10,
  },
  outlineText: { color: colors.navy, fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  printBtn: {
    height: 48, borderRadius: 10, backgroundColor: '#F5C400',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  printText: { color: colors.navy, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  newBtn: {
    height: 48, borderRadius: 10, backgroundColor: colors.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  newText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
