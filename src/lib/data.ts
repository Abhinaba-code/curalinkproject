import type { ClinicalTrial, Publication, Expert } from './types';

export const mockClinicalTrials: ClinicalTrial[] = [
  {
    id: 'NCT04848928',
    title: 'A Study of a New Drug for Early-Stage Lung Cancer',
    description: 'This is a phase 3 clinical trial to evaluate the efficacy and safety of a new investigational drug, in combination with standard chemotherapy, for patients with early-stage non-small cell lung cancer.',
    status: 'Recruiting',
    phase: 'Phase 3',
    eligibility: 'Ages 18+, diagnosed with Stage I-IIIA NSCLC.',
    location: 'Multiple locations, USA',
    contact: 'Jane Doe, RN at 1-800-555-1234',
    tags: ['Lung Cancer', 'Chemotherapy', 'Immunotherapy']
  },
  {
    id: 'NCT05011111',
    title: 'Cognitive Training for Adults With Mild Cognitive Impairment',
    description: 'This study will test the effectiveness of a new brain-training game to improve memory and cognitive function in older adults with mild cognitive impairment.',
    status: 'Recruiting',
    phase: 'Phase 2',
    eligibility: 'Ages 65-85, diagnosis of MCI.',
    location: 'Stanford University, CA',
    contact: 'Dr. John Smith at mci-study@stanford.edu',
    tags: ['Alzheimer\'s', 'Cognitive Health', 'Geriatrics']
  },
  {
    id: 'NCT03999888',
    title: 'Gene Therapy for Cystic Fibrosis',
    description: 'A phase 1/2 study to assess the safety and efficacy of a novel gene therapy approach for patients with cystic fibrosis having specific gene mutations.',
    status: 'Active, not recruiting',
    phase: 'Phase 1/2',
    eligibility: 'Ages 12+, confirmed diagnosis of CF with F508del mutation.',
    location: 'Boston Children\'s Hospital, MA',
    contact: 'CF Research Team at 1-888-555-4321',
    tags: ['Cystic Fibrosis', 'Gene Therapy', 'Pediatrics']
  }
];

export const mockPublications: Publication[] = [
  {
    id: 'PMID33567220',
    title: 'The safety and immunogenicity of a BNT162b2 mRNA Covid-19 vaccine',
    authors: ['Polack, FP', 'Thomas, SJ', 'Kitchin, N', 'Absalon, J'],
    journal: 'New England Journal of Medicine',
    abstract: 'The BNT162b2 mRNA vaccine has shown high efficacy in preventing Covid-19. This article reports the safety and immunogenicity data from the pivotal phase 3 trial.',
    doi: '10.1056/NEJMoa2034577',
    year: 2020
  },
  {
    id: 'PMID31320259',
    title: 'Deep learning for health informatics',
    authors: ['Ravì, D', 'Wong, C', 'Deligianni, F', 'Berti-Equille, L'],
    journal: 'Journal of Biomedical Informatics',
    abstract: 'This review provides a comprehensive overview of the state-of-the-art deep learning techniques applied in health informatics, covering key challenges and future directions.',
    doi: '10.1016/j.jbi.2016.11.009',
    year: 2017
  },
  {
    id: 'PMID29699054',
    title: 'CRISPR-Cas9 gene editing for inherited diseases',
    authors: ['Anzalone, AV', 'Randolph, PB', 'Davis, JR'],
    journal: 'Nature',
    abstract: 'This paper discusses the advancements and potential of CRISPR-Cas9 technology as a therapeutic tool for a wide range of inherited human diseases.',
    doi: '10.1038/s41586-018-0062-8',
    year: 2018
  }
];

export const mockExperts: Expert[] = [
  {
    id: 'expert-1',
    name: 'Dr. Evelyn Reed',
    specialties: ['Oncology', 'Immunology'],
    institution: 'Dana-Farber Cancer Institute',
    publicationCount: 152,
    avatarUrl: 'https://picsum.photos/seed/expert1/200/200',
    researchAreas: ['Cancer immunotherapy', 'Tumor microenvironment']
  },
  {
    id: 'expert-2',
    name: 'Dr. Ben Carter',
    specialties: ['Neurology', 'Genetics'],
    institution: 'Johns Hopkins University',
    publicationCount: 98,
    avatarUrl: 'https://picsum.photos/seed/expert2/200/200',
    researchAreas: ['Neurodegenerative diseases', 'CRISPR']
  },
  {
    id: 'expert-3',
    name: 'Dr. Sofia Hernandez',
    specialties: ['Cardiology', 'Metabolic Diseases'],
    institution: 'Cleveland Clinic',
    publicationCount: 210,
    avatarUrl: 'https://picsum.photos/seed/expert3/200/200',
    researchAreas: ['Atherosclerosis', 'Diabetes', 'Lipid metabolism']
  }
];
