export type BirthStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface BirthSummary {
  newEntries: number;
  pending: number;
  approved: number;
  totalRecords: number;
}

export interface BirthApplicationPayload {
  babyName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  birthWeight: string;
  fatherName: string;
  fatherNic: string;
  fatherOccupation: string;
  fatherAddress: string;
  motherName: string;
  motherNic: string;
  motherOccupation: string;
  motherAddress: string;
  hospitalName: string;
  registrationDate: string;
}

export interface BirthApplication extends BirthApplicationPayload {
  id: string;
  appRef: string;
  applicantId: string;
  status: BirthStatus;
  rejectionReason: string;
  submittedOn: string;
  submittedBy: string;
  signedOffBy: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
