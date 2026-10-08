import type {
  BirthCertificatePreview,
  DeathCertificatePreview,
  MarriageCertificatePreview,
  VillageCertificateCategory,
  VillageCertificatePreview,
} from '../../services/villageService';

export type CertificateKind = 'BIRTH' | 'DEATH' | 'MARRIAGE';

export const CATEGORY: Record<CertificateKind, VillageCertificateCategory> = {
  BIRTH: 'Birth',
  DEATH: 'Death',
  MARRIAGE: 'Marriage',
};

export const TITLE: Record<CertificateKind, string> = {
  BIRTH: 'Certificate of Birth',
  DEATH: 'Certificate of Death',
  MARRIAGE: 'Certificate of Marriage',
};

export const LIST_TITLE: Record<CertificateKind, string> = {
  BIRTH: 'Birth certificates',
  DEATH: 'Death certificates',
  MARRIAGE: 'Marriage certificates',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const show = (value: string | null | undefined) => {
  const text = (value ?? '').trim();
  return text || '—';
};

export const formatDate = (value: string | null | undefined) => {
  const text = (value ?? '').trim();
  if (!text) return '—';
  const [datePart] = text.split('T');
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return text;
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
};

const formatTime = (value: string | null | undefined) => {
  const text = (value ?? '').trim();
  if (!text) return '—';
  return text.slice(0, 5);
};

export const statusColor = (status: string) => {
  if (status === 'Approved') return '#1B8A3E';
  if (status === 'Rejected') return '#C62828';
  return '#8A6A00';
};

export function linesFor(kind: CertificateKind, item: VillageCertificatePreview): { label: string; value: string }[] {
  if (kind === 'BIRTH') {
    const row = item as BirthCertificatePreview;
    return [
      { label: 'Child', value: show(row.subject_name) },
      { label: 'Date of birth', value: formatDate(row.date_of_birth) },
      { label: 'Time of birth', value: formatTime(row.time_of_birth) },
      { label: 'Place of birth', value: show(row.place_of_birth) },
      { label: 'Gender', value: show(row.gender) },
      { label: 'Birth weight', value: show(row.birth_weight) },
      { label: 'Father', value: show(row.father_name) },
      { label: 'Mother', value: show(row.mother_name) },
      { label: 'Hospital', value: show(row.hospital_name) },
      { label: 'Registered on', value: formatDate(row.registration_date) },
    ];
  }
  if (kind === 'DEATH') {
    const row = item as DeathCertificatePreview;
    return [
      { label: 'Deceased', value: show(row.subject_name) },
      { label: 'NIC', value: show(row.deceased_nic) },
      { label: 'Date of death', value: formatDate(row.date_of_death) },
      { label: 'Time of death', value: formatTime(row.time_of_death) },
      { label: 'Place of death', value: show(row.place_of_death) },
      { label: 'Gender', value: show(row.gender) },
      { label: 'Age', value: show(row.age_at_death) },
      { label: 'Cause of death', value: show(row.cause_of_death) },
      { label: 'Address', value: show(row.permanent_address) },
    ];
  }
  const row = item as MarriageCertificatePreview;
  return [
    { label: 'Groom', value: show(row.groom_name) },
    { label: 'Bride', value: show(row.bride_name) },
    { label: 'Date of marriage', value: formatDate(row.marriage_date) },
    { label: 'Place', value: show(row.marriage_place) },
    { label: 'Registrar', value: show(row.marriage_registrar) },
    { label: 'Registration no.', value: show(row.registration_number) },
  ];
}

export function listDate(kind: CertificateKind, item: VillageCertificatePreview) {
  if (kind === 'BIRTH') return formatDate((item as BirthCertificatePreview).date_of_birth);
  if (kind === 'DEATH') return formatDate((item as DeathCertificatePreview).date_of_death);
  return formatDate((item as MarriageCertificatePreview).marriage_date);
}
