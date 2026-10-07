export type DeathStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface DeathSummary {
  newEntries: number;
  pending: number;
  approved: number;
  totalRecords: number;
}

export interface DeathApplicationPayload {
  informantName: string;
  nic: string;
  relationship: string;
  informantContact: string;
  placeOfDemise: string;
  dateOfDemise: string;
  timeOfDemise: string;
  deceasedNic: string;
  deceasedName: string;
  gender: string;
  dateOfBirth: string;
  ageAtDeath: string;
  causeOfDeath: string;
  maritalStatus: string;
  deceasedAddress: string;
}

export interface DeathApplication extends DeathApplicationPayload {
  id: string;
  appRef: string;
  applicantId: string;
  status: DeathStatus;
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
