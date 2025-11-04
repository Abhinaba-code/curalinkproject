export type User = {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'researcher';
  avatarUrl: string;
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
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  abstract: string;
  doi: string;
  year: number | string;
};

export type Expert = {
  id: string;
  name: string;
  specialties: string[];
  institution: string;
  publicationCount: number;
  avatarUrl: string;
  researchAreas: string[];
};
