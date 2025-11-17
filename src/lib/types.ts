
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'researcher';
  avatarUrl: string;
  walletBalance?: number;
  isPremium?: boolean;
  // Patient fields
  dob?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  medications?: string[];
  allergies?: string[];
  pastMedicalTests?: string[];
  // Researcher fields
  affiliation?: string;
  specialties?: string[];
  researchInterests?: string[];
  orcidId?: string;
  researchGateProfile?: string;
};

export type StoredUser = User & {
  password?: string;
};

export type ClinicalTrial = {
  id: string;
  title: string;
  description: string;
  status: string;
  phase: string;
  eligibility: string;
  location: string;
  contact: string;
  tags: string[];
  url: string;
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  abstract: string;
  doi: string;
  year: number | string;
  url: string;
};

export type Expert = {
  id: string; // NPI number
  name: string;
  specialty: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  url: string;
  avatarUrl: string;
};
