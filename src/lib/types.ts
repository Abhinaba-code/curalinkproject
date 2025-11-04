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
  id: string; // Using name + affiliation as a unique ID
  name: string;
  affiliation: string;
  publicationCount: number;
  latestPublicationId: string;
  url: string;
  avatarUrl: string;
};
