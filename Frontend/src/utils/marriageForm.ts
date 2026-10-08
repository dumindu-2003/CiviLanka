import type { MarriageData } from '../services/marriageService';
import type { MarriageForm, MarriagePerson } from '../types/marriage';

export const emptyPerson = (): MarriagePerson => ({
  fullName: '',
  nic: '',
  dob: '',
  occupation: '',
  address: '',
  religion: '',
  nationality: 'Sri Lankan',
  maritalStatus: 'Single',
});

export const emptyMarriageForm = (): MarriageForm => ({
  applicant: null,
  applicantIsGroom: true,
  groom: emptyPerson(),
  bride: emptyPerson(),
  solemnization: { marriageDate: '', marriagePlace: '', registrar: '', registrationNumber: '' },
});

// "14/05/1989" -> "1989-05-14", or null when it is not a real date
export function displayToIso(value: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// "1989-05-14" or "1989-05-14T00:00:00" -> "14/05/1989"
export function isoToDisplay(value: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// Completed years today, or null when the date is incomplete / invalid
export function ageFrom(dob: string): number | null {
  const iso = displayToIso(dob);
  if (!iso) return null;
  const [y, mo, d] = iso.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) age -= 1;
  return age >= 0 ? age : null;
}

// Fields with a value that is not a valid DD/MM/YYYY date
export function invalidDates(form: MarriageForm): string[] {
  const dates: [string, string][] = [
    ["Groom's date of birth", form.groom.dob],
    ["Bride's date of birth", form.bride.dob],
    ['Date of marriage', form.solemnization.marriageDate],
  ];
  return dates.filter(([, v]) => v.trim() !== '' && !displayToIso(v)).map(([label]) => label);
}

const opt = (v: string) => (v.trim() === '' ? undefined : v.trim());

function personData(p: MarriagePerson, prefix: 'groom' | 'bride') {
  return {
    [`${prefix}_name`]: opt(p.fullName),
    [`${prefix}_nic`]: opt(p.nic.toUpperCase()),
    [`${prefix}_dob`]: displayToIso(p.dob) ?? undefined,
    [`${prefix}_age`]: ageFrom(p.dob) ?? undefined,
    [`${prefix}_occupation`]: opt(p.occupation),
    [`${prefix}_address`]: opt(p.address),
    [`${prefix}_religion`]: opt(p.religion),
    [`${prefix}_nationality`]: opt(p.nationality),
    [`${prefix}_marital_status`]: p.maritalStatus,
  };
}

// Form -> body "data" of POST /api/marriage/Create | Update (blank fields are left out -> NULL)
export function toMarriageData(form: MarriageForm, applicantId: number): MarriageData {
  const s = form.solemnization;
  return {
    applicant_id: applicantId,
    ...personData(form.groom, 'groom'),
    ...personData(form.bride, 'bride'),
    marriage_date: displayToIso(s.marriageDate) ?? undefined,
    marriage_place: opt(s.marriagePlace),
    marriage_registrar: opt(s.registrar),
    registration_number: opt(s.registrationNumber),
  } as MarriageData;
}
