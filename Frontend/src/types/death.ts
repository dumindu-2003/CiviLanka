export type DeathStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface DeathSummary {
  newEntries: number;
  pending: number;
  approved: number;
  totalRecords: number;
}

export interface DeathApplicationPayload {
  certificateType: string;
  informantName: string;
  nic: string;
  relationship: string;
  informantContact: string;
  informantAddress: string;
  placeOfDemise: string;
  dateOfDemise: string;
  timeOfDemise: string;
  deceasedNic: string;
  deceasedName: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  occupation: string;
  deceasedAddress: string;
  causeOfDeath: string;
}

export interface DeathApplication extends DeathApplicationPayload {
  id: string;
  status: DeathStatus;
  submittedOn: string;
}
