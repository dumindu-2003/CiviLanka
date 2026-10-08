// Marriage registration form (Step 1 + Step 2). Dates are typed as DD/MM/YYYY.
export type MaritalStatus = 'Single' | 'Widowed' | 'Divorced'; // DB check constraint values

export interface MarriagePerson {
  fullName: string;
  nic: string;
  dob: string;
  occupation: string;
  address: string;
  religion: string;
  nationality: string;
  maritalStatus: MaritalStatus;
}

// Citizen who lodges the application (citizens.citizen_id -> applicant_id)
export interface MarriageApplicant {
  citizenId: number;
  fullName: string;
  nic: string;
  dob: string;
  address: string;
}

export interface Solemnization {
  marriageDate: string;
  marriagePlace: string;
  registrar: string;
  registrationNumber: string;
}

export interface MarriageForm {
  applicant: MarriageApplicant | null;
  applicantIsGroom: boolean;
  groom: MarriagePerson;
  bride: MarriagePerson;
  solemnization: Solemnization;
}
