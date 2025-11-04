import { ClinicalTrial, Publication } from './types';

const CLINICAL_TRIALS_API_BASE_URL = 'https://clinicaltrials.gov/api/v2';
const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';


// A mapping from the API's status to the app's status
const statusMapping: { [key: string]: ClinicalTrial['status'] } = {
  RECRUITING: 'Recruiting',
  ACTIVE_NOT_RECRUITING: 'Active, not recruiting',
  COMPLETED: 'Completed',
};

// A utility function to format a single trial from the API response
const formatTrial = (study: any): ClinicalTrial => {
  const protocol = study.protocolSection;
  const status = protocol.statusModule.overallStatus;
  const eligibility = protocol.eligibilityModule;

  return {
    id: protocol.identificationModule.nctId,
    title: protocol.identificationModule.briefTitle,
    description: protocol.descriptionModule.briefSummary || 'No description available.',
    status: statusMapping[status] || status,
    phase: protocol.designModule.phases?.join(', ') || 'N/A',
    eligibility: eligibility.eligibilityCriteria || 'No eligibility criteria available.',
    location: protocol.contactsLocationsModule.locations?.[0]?.city || 'N/A',
    contact: protocol.contactsLocationsModule.centralContacts?.[0]?.name || 'N/A',
    tags: protocol.conditionsModule.conditions || [],
  };
};

// Function to fetch and format clinical trials
export async function searchClinicalTrials(
  query: string = 'cancer',
  pageSize: number = 9
): Promise<ClinicalTrial[]> {
  try {
    const response = await fetch(
      `${CLINICAL_TRIALS_API_BASE_URL}/studies?query.cond=${query}&pageSize=${pageSize}&filter.overallStatus=RECRUITING`
    );
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

// A utility function to format a single publication from the API response
const formatPublication = (id: string, data: any): Publication => {
  return {
    id: id,
    title: data.title || 'No title available.',
    authors: data.authors?.map((a: { name: string }) => a.name) || [],
    journal: data.source || 'N/A',
    year: new Date(data.pubdate).getFullYear() || 'N/A',
    doi: data.elocationid?.replace('doi: ', '') || '',
    // PubMed e-summary does not provide an abstract. A more complex call would be needed.
    abstract: 'No abstract available from this API endpoint. Full text link might be available.', 
  };
};


// Function to fetch and format publications from PubMed
export async function searchPublications(
  query: string = 'cancer',
  pageSize: number = 10
): Promise<Publication[]> {
  try {
    // Step 1: Search for publication IDs
    const searchResponse = await fetch(
      `${PUBMED_API_BASE_URL}/esearch.fcgi?db=pubmed&term=${query}&retmax=${pageSize}&retmode=json`
    );
    if (!searchResponse.ok) {
      throw new Error(`HTTP error! status: ${searchResponse.status}`);
    }
    const searchData = await searchResponse.json();
    
    // The API can return a response without a `result` field.
    if (!searchData.result) {
        console.error('PubMed API returned no result for query:', query, searchData);
        return [];
    }

    const ids = searchData.result.idlist;

    if (!ids || ids.length === 0) {
      return [];
    }

    // Step 2: Fetch summaries for the found IDs
    const summaryResponse = await fetch(
      `${PUBMED_API_BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    );
    if (!summaryResponse.ok) {
      throw new Error(`HTTP error! status: ${summaryResponse.status}`);
    }
    const summaryData = await summaryResponse.json();
    
    // Step 3: Format the data
    return ids.map((id: string) => formatPublication(id, summaryData.result[id]));
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    return []; // Return an empty array on error
  }
}
