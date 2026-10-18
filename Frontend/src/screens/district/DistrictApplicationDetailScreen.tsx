import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import BirthApplicationForm from '../birth/BirthApplicationForm';
import DeathRegisterForm from '../death/DeathRegisterForm';
import { AuthorizeSignOffModal } from '../../components/AuthorizeSignOffModal';
import { approveApplication, getApplicationDetail, rejectApplication } from '../../services/districtService';
import type { BirthApplicationPayload } from '../../types/birth';
import type { DeathApplicationPayload } from '../../types/death';
import type { SignOffCredentials } from '../../types/auth';
import type { Decision } from '../../types/district';
import { colors } from '../../theme/colors';

type DetailRoute = RouteProp<RootStackParamList, 'DistrictApplicationDetail'>;
type DetailNavigation = NativeStackNavigationProp<RootStackParamList>;

const FIELD_LABELS: Record<string, string> = {
  app_ref: 'Application Reference',
  app_id: 'Application ID',
  birth_app_id: 'Application ID',
  death_app_id: 'Application ID',
  marriage_app_id: 'Application ID',
  name: 'Applicant / Subject Name',
  baby_full_name: "Child's Full Name",
  date_of_birth: 'Date of Birth',
  time_of_birth: 'Time of Birth',
  place_of_birth: 'Place of Birth',
  birth_weight: 'Birth Weight',
  father_name: "Father's Name",
  father_nic: "Father's NIC",
  father_occupation: "Father's Occupation",
  father_address: "Father's Address",
  mother_name: "Mother's Name",
  mother_nic: "Mother's NIC",
  mother_occupation: "Mother's Occupation",
  mother_address: "Mother's Address",
  hospital_name: 'Hospital',
  registration_date: 'Registration Date',
  deceased_name: "Deceased Person's Name",
  deceased_nic: "Deceased Person's NIC",
  date_of_death: 'Date of Death',
  time_of_death: 'Time of Death',
  place_of_death: 'Place of Death',
  age_at_death: 'Age at Death',
  cause_of_death: 'Cause of Death',
  marital_status: 'Marital Status',
  permanent_address: 'Permanent Address',
  informant_name: "Informant's Name",
  informant_nic: "Informant's NIC",
  informant_relationship: "Informant's Relationship",
  informant_contact: "Informant's Contact",
  applicant_name: 'Applicant Name',
  applicant_id: 'Applicant ID',
  submitted_on: 'Submitted On',
  created_at: 'Created On',
  updated_at: 'Last Updated',
  rejection_reason: 'Rejection Reason',
};

const formatLabel = (key: string) =>
  FIELD_LABELS[key.toLowerCase()] ??
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatValue = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
};

const readText = (record: Record<string, unknown>, key: string): string => {
  const value = record[key];
  return value === null || value === undefined ? '' : String(value);
};

const toBirthPayload = (record: Record<string, unknown>): BirthApplicationPayload => ({
  babyName: readText(record, 'baby_full_name'),
  birthDate: readText(record, 'date_of_birth').slice(0, 10),
  birthTime: readText(record, 'time_of_birth').split('T').pop() ?? '',
  birthPlace: readText(record, 'place_of_birth'),
  gender: readText(record, 'gender'),
  birthWeight: readText(record, 'birth_weight'),
  fatherName: readText(record, 'father_name'),
  fatherNic: readText(record, 'father_nic'),
  fatherOccupation: readText(record, 'father_occupation'),
  fatherAddress: readText(record, 'father_address'),
  motherName: readText(record, 'mother_name'),
  motherNic: readText(record, 'mother_nic'),
  motherOccupation: readText(record, 'mother_occupation'),
  motherAddress: readText(record, 'mother_address'),
  hospitalName: readText(record, 'hospital_name'),
  registrationDate: readText(record, 'registration_date').slice(0, 10),
});

const toDeathPayload = (record: Record<string, unknown>): DeathApplicationPayload => ({
  informantName: readText(record, 'informant_name'),
  nic: readText(record, 'informant_nic'),
  relationship: readText(record, 'informant_relationship'),
  informantContact: readText(record, 'informant_contact'),
  placeOfDemise: readText(record, 'place_of_death'),
  dateOfDemise: readText(record, 'date_of_death').slice(0, 10),
  timeOfDemise: readText(record, 'time_of_death').split('T').pop() ?? '',
  deceasedNic: readText(record, 'deceased_nic'),
  deceasedName: readText(record, 'deceased_name'),
  gender: readText(record, 'gender'),
  dateOfBirth: readText(record, 'date_of_birth').slice(0, 10),
  ageAtDeath: readText(record, 'age_at_death'),
  causeOfDeath: readText(record, 'cause_of_death'),
  maritalStatus: readText(record, 'marital_status'),
  deceasedAddress: readText(record, 'permanent_address'),
});

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryField}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function DistrictApplicationDetailScreen() {
  const navigation = useNavigation<DetailNavigation>();
  const { params } = useRoute<DetailRoute>();
  const [retryCount, setRetryCount] = useState(0);
  const [editingApplication, setEditingApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(params.status);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [requestState, setRequestState] = useState<{
    applicationId: string;
    attempt: number;
    detail: Record<string, unknown> | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;

    getApplicationDetail(params.applicationId)
      .then((record) => {
        if (active) {
          setRequestState({
            applicationId: params.applicationId,
            attempt: retryCount,
            detail: record,
            error: null,
          });
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setRequestState({
            applicationId: params.applicationId,
            attempt: retryCount,
            detail: null,
            error:
              requestError instanceof Error
                ? requestError.message
                : 'Unable to load this application. Please try again.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [params.applicationId, retryCount]);

  const currentRequest =
    requestState?.applicationId === params.applicationId &&
    requestState.attempt === retryCount
      ? requestState
      : null;
  const loading = currentRequest === null;
  const [editedDetail, setEditedDetail] = useState<Record<string, unknown> | null>(null);
  const detail = editedDetail ?? currentRequest?.detail ?? null;
  const fields = detail
    ? Object.entries(detail)
        .map(([key, value]) => ({ key, value: formatValue(value) }))
        .filter((field): field is { key: string; value: string } => field.value !== null)
    : [];
  const canEditPendingApplication =
    params.category !== 'Marriage' &&
    applicationStatus === 'Pending';

  const canSavePendingChanges = () => {
    if (!detail || !canEditPendingApplication) {
      throw new Error('Only your own pending application can be edited.');
    }
  };

  const finishPendingUpdate = (updatedFields: Record<string, unknown>) => {
    canSavePendingChanges();
    setEditedDetail((previous) => ({ ...(previous ?? detail), ...updatedFields }));
    setEditingApplication(false);
    Alert.alert(
      'Application updated',
    );
  };

  const saveBirthChanges = async (payload: BirthApplicationPayload) => {
    finishPendingUpdate({
      baby_full_name: payload.babyName,
      date_of_birth: payload.birthDate,
      time_of_birth: payload.birthTime,
      place_of_birth: payload.birthPlace,
      gender: payload.gender,
      birth_weight: payload.birthWeight,
      father_name: payload.fatherName,
      father_nic: payload.fatherNic,
      father_occupation: payload.fatherOccupation,
      father_address: payload.fatherAddress,
      mother_name: payload.motherName,
      mother_nic: payload.motherNic,
      mother_occupation: payload.motherOccupation,
      mother_address: payload.motherAddress,
      hospital_name: payload.hospitalName,
      registration_date: payload.registrationDate,
    });
  };

  const saveDeathChanges = async (payload: DeathApplicationPayload) => {
    finishPendingUpdate({
      informant_name: payload.informantName,
      informant_nic: payload.nic,
      informant_relationship: payload.relationship,
      informant_contact: payload.informantContact,
      place_of_death: payload.placeOfDemise,
      date_of_death: payload.dateOfDemise,
      time_of_death: payload.timeOfDemise,
      deceased_nic: payload.deceasedNic,
      deceased_name: payload.deceasedName,
      gender: payload.gender,
      date_of_birth: payload.dateOfBirth,
      age_at_death: payload.ageAtDeath,
      cause_of_death: payload.causeOfDeath,
      marital_status: payload.maritalStatus,
      permanent_address: payload.deceasedAddress,
    });
  };

  if (editingApplication && detail && canEditPendingApplication) {
    if (params.category === 'Birth') {
      return (
        <BirthApplicationForm
          initialData={toBirthPayload(detail)}
          onBack={() => setEditingApplication(false)}
          onUpdate={saveBirthChanges}
        />
      );
    }

    if (params.category === 'Death') {
      return (
        <DeathRegisterForm
          initialData={toDeathPayload(detail)}
          onBack={() => setEditingApplication(false)}
          onUpdate={saveDeathChanges}
        />
      );
    }
  }

  const startDecision = (nextDecision: Decision) => {
    if (applicationStatus !== 'Pending') return;
    setDecision(nextDecision);
    if (nextDecision === 'REJECT') {
      setReason('');
      setShowReasonModal(true);
    } else {
      setShowSignOffModal(true);
    }
  };

  const continueToSignOff = () => {
    if (!reason.trim()) {
      Alert.alert('Reason required', 'Enter a reason before rejecting this application.');
      return;
    }
    setShowReasonModal(false);
    setShowSignOffModal(true);
  };

  const confirmDecision = async (credentials: SignOffCredentials) => {
    if (!decision) return;
    setSubmittingDecision(true);
    try {
      if (decision === 'APPROVE') {
        await approveApplication(params.applicationId, credentials);
      } else {
        await rejectApplication(params.applicationId, reason.trim(), credentials);
      }
      const nextStatus = decision === 'APPROVE' ? 'Approved' : 'Rejected';
      setApplicationStatus(nextStatus);
      setShowSignOffModal(false);
      setDecision(null);
      Alert.alert(
        `Application ${nextStatus.toLowerCase()}`,
        `${params.applicationId} has been ${nextStatus.toLowerCase()}.`,
      );
    } catch (requestError) {
      Alert.alert(
        'Unable to update application',
        requestError instanceof Error ? requestError.message : 'Please try again.',
      );
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to applications"
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{params.category} Application</Text>
            <Text style={styles.reference}>{params.applicationId}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Application Details</Text>
        <Text style={styles.subtitle}>
          Full information for this {params.category.toLowerCase()} registration.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Application Summary</Text>
          <SummaryField label="Application Reference" value={params.applicationId} />
          <SummaryField label="Category" value={params.category} />
          <SummaryField label="Applicant / Subject" value={params.applicantName} />
          <SummaryField label="Submitted On" value={params.submittedOn || 'Not available'} />
          <SummaryField label="Current Status" value={applicationStatus} />
        </View>

        {applicationStatus === 'Pending' ? (
          <View style={styles.decisionRow}>
            <Pressable
              onPress={() => startDecision('APPROVE')}
              style={[styles.decisionButton, styles.approveButton]}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
              <Text style={styles.decisionText}>Approve</Text>
            </Pressable>
            <Pressable
              onPress={() => startDecision('REJECT')}
              style={[styles.decisionButton, styles.rejectButton]}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.white} />
              <Text style={styles.decisionText}>Reject</Text>
            </Pressable>
          </View>
        ) : null}

        {applicationStatus === 'Rejected' && reason.trim() ? (
          <View style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>Rejection Reason</Text>
            <Text style={styles.value}>{reason.trim()}</Text>
          </View>
        ) : null}

        <Text style={styles.detailHeading}>Submitted Application Details</Text>
        {loading ? (
          <ActivityIndicator color={colors.navy} size="large" style={styles.loader} />
        ) : currentRequest.error ? (
          <View style={styles.messageCard}>
            <Text style={styles.error}>{currentRequest.error}</Text>
            <Pressable
              onPress={() => setRetryCount((attempt) => attempt + 1)}
              style={styles.retryButton}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : fields.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.empty}>No application details were returned.</Text>
          </View>
        ) : (
          <View style={styles.detailCard}>
            {fields.map(({ key, value }, index) => (
              <View key={key} style={[styles.field, index > 0 && styles.divider]}>
                <Text style={styles.label}>{formatLabel(key)}</Text>
                <Text selectable style={styles.value}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showReasonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReasonModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.reasonModal}>
            <Text style={styles.modalTitle}>Reason for Rejection</Text>
            <Text style={styles.modalSubtitle}>A reason is required before this application can be rejected.</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Enter rejection reason"
              placeholderTextColor="#8A93A2"
              multiline
              textAlignVertical="top"
              style={styles.reasonInput}
              accessibilityLabel="Rejection reason"
            />
            <Pressable onPress={continueToSignOff} style={styles.modalPrimaryButton}>
              <Text style={styles.modalPrimaryText}>Continue to Authorization</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowReasonModal(false);
                setDecision(null);
              }}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <AuthorizeSignOffModal
        visible={showSignOffModal}
        title={decision === 'REJECT' ? 'Authorize Rejection' : 'Authorize Approval'}
        onCancel={() => {
          setShowSignOffModal(false);
          setDecision(null);
        }}
        onConfirm={(credentials) => void confirmDecision(credentials)}
      />
      {submittingDecision ? (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator color={colors.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.navy },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerText: { flex: 1, marginLeft: 8 },
  title: { color: colors.white, fontSize: 16, fontWeight: '700' },
  reference: { color: '#D7DFEC', fontSize: 11, marginTop: 2 },
  content: { padding: 16, paddingBottom: 32 },
  heading: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 18 },
  detailHeading: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  summaryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  cardTitle: { color: colors.navy, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  summaryField: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  decisionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  decisionButton: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 9 },
  approveButton: { backgroundColor: colors.green },
  rejectButton: { backgroundColor: colors.red },
  decisionText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  editButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    borderRadius: 9,
    backgroundColor: colors.navy,
  },
  reasonCard: { marginTop: 14, padding: 14, borderRadius: 10, backgroundColor: '#FDECEC', borderWidth: 1, borderColor: '#F2C5C5' },
  reasonTitle: { color: colors.red, fontSize: 12, fontWeight: '700', marginBottom: 5 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.55)' },
  reasonModal: { backgroundColor: colors.card, borderRadius: 14, padding: 20 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  modalSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 14 },
  reasonInput: { minHeight: 110, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.text, fontSize: 14 },
  modalPrimaryButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: 14, borderRadius: 8, backgroundColor: colors.navy },
  modalPrimaryText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  modalCancelButton: { alignItems: 'center', justifyContent: 'center', minHeight: 42, marginTop: 6 },
  modalCancelText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  submittingOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  loader: { marginTop: 36 },
  detailCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  field: { paddingVertical: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  label: { color: colors.muted, fontSize: 11, fontWeight: '500' },
  value: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 5 },
  messageCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  error: { color: colors.red, fontSize: 13, lineHeight: 19 },
  empty: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
  },
  retryText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
