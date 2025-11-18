

import { ClinicalTrial, Publication, Expert } from './types';
import { XMLParser } from 'fast-xml-parser';

const CLINICAL_TRIALS_API_BASE_URL = 'https://clinicaltrials.gov/api/v2';

// A mapping from the API's status to the app's status
const statusMapping: { [key: string]: ClinicalTrial['status'] } = {
  RECRUITING: 'Recruiting',
  ACTIVE_NOT_RECRUITING: 'Active, not recruiting',
  COMPLETED: 'Completed',
};

const appToApiStatusMapping: { [key in ClinicalTrial['status']]: string } = {
  'Recruiting': 'RECRUITING',
  'Active, not recruiting': 'ACTIVE_NOT_RECRUITING',
  'Completed': 'COMPLETED',
};

// A utility function to format a single trial from the API response
const formatTrial = (study: any): ClinicalTrial => {
  const protocol = study.protocolSection;
  const status = protocol.statusModule.overallStatus;
  const eligibility = protocol.eligibilityModule;
  const nctId = protocol.identificationModule.nctId;

  return {
    id: nctId,
    title: protocol.identificationModule.briefTitle,
    description: protocol.descriptionModule.briefSummary || 'No description available.',
    status: statusMapping[status] || status,
    phase: protocol.designModule.phases?.join(', ') || 'N/A',
    eligibility: eligibility.eligibilityCriteria || 'No eligibility criteria available.',
    location: protocol.contactsLocationsModule?.locations?.[0]?.city || 'N/A',
    contact: protocol.contactsLocationsModule?.centralContacts?.[0]?.name || 'N/A',
    tags: protocol.conditionsModule.conditions || [],
    url: `https://clinicaltrials.gov/study/${nctId}`,
  };
};

// Function to fetch and format clinical trials
export async function searchClinicalTrials(
  query: string,
  pageSize: number = 9,
  location?: string,
  statuses?: ClinicalTrial['status'][]
): Promise<ClinicalTrial[]> {
  try {
    const params = new URLSearchParams();
    params.set('pageSize', pageSize.toString());

    let expression = query;
    if (location && !location.startsWith('distance(')) {
        expression += ` AND AREA[LocationCity]${location}`
    }
    params.set('query.cond', expression);
    
    if (location && location.startsWith('distance(')) {
        params.set('filter.geo', location);
    }
    
    if (statuses && statuses.length > 0) {
        const apiStatuses = statuses.map(s => appToApiStatusMapping[s]).filter(Boolean);
        if (apiStatuses.length > 0) {
            params.set('filter.overallStatus', apiStatuses.join(','));
        }
    }
    
    let url = `${CLINICAL_TRIALS_API_BASE_URL}/studies?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.studies.map(formatTrial);
  } catch (error) {
    console.error('Failed to fetch clinical trials:', error);
    return []; // Return an empty array on error
  }
}

// Function to fetch and format publications from PubMed via our proxy
export async function searchPublications(
  query: string,
  pageSize: number = 10
): Promise<Publication[]> {
  if (!query) return [];
  try {
    const params = new URLSearchParams({
      query: query,
      pageSize: pageSize.toString(),
    });
    const response = await fetch(`/api/publications?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Proxy API error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Failed to fetch publications via proxy:', error);
    return []; // Return an empty array on error
  }
}

export async function searchExperts(
  query?: string,
  page: number = 1,
  pageSize: number = 12,
): Promise<{results: Expert[], totalCount: number}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
  });

  if (query) {
    params.set('query', query);
  }

  try {
    const url = `/api/npi?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `NPI Registry API error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Failed to fetch experts:', error);
    return { results: [], totalCount: 0 };
  }
}
