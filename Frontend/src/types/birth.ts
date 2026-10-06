export type BirthStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface BirthSummary {
  newEntries: number;
  pending: number;
  approved: number;
  totalRecords: number;
}

export interface BirthApplicationPayload {
  applicantName: string;
  applicantNic: string;
  applicantDob: string;
  applicantAddress: string;
  babyName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: 'Male' | 'Female';
  birthWeight: string;
  fatherName: string;
  fatherNic: string;
  fatherOccupation: string;
  fatherAddress: string;
  motherName: string;
  motherNic: string;
  motherOccupation: string;
  motherAddress: string;
  medicalOfficer: string;
  registrationDate: string;
}

export interface BirthApplication extends BirthApplicationPayload {
  id: string;
  status: BirthStatus;
  submittedOn: string;
}
