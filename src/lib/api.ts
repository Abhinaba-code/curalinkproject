
import { ClinicalTrial, Publication, Expert } from './types';

const CLINICAL_TRIALS_API_BASE_URL = 'https://clinicaltrials.gov/api/v2';
const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ORCID_API_BASE_URL = 'https://pub.orcid.org/v3.0';


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
  const article = data.result[id];
  return {
    id: id,
    title: article.title || 'No title available.',
    authors: article.authors?.map((a: { name: string }) => a.name) || [],
    journal: article.source || 'N/A',
    year: new Date(article.pubdate).getFullYear() || 'N/A',
    doi: article.elocationid?.replace('doi: ', '') || '',
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
      throw new Error(`PubMed search API error! status: ${searchResponse.status}`);
    }
    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult || !searchData.esearchresult.idlist) {
        console.warn('PubMed API returned no result for query:', query);
        return [];
    }

    const ids = searchData.esearchresult.idlist;

    if (ids.length === 0) {
      return [];
    }

    // Step 2: Fetch summaries for the found IDs
    const summaryResponse = await fetch(
      `${PUBMED_API_BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    );

    if (!summaryResponse.ok) {
      throw new Error(`PubMed summary API error! status: ${summaryResponse.status}`);
    }
    const summaryData = await summaryResponse.json();
    
    if (!summaryData.result) {
      console.error('PubMed summary API returned no result for IDs:', ids);
      return [];
    }

    // Step 3: Format the data
    return ids.map((id: string) => formatPublication(id, summaryData));
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    return []; // Return an empty array on error
  }
}

// A utility function to format a single expert from the ORCID API response
const formatExpert = (author: any): Expert => {
  const name = `${author['given-names']?.value || ''} ${author['family-name']?.value || ''}`.trim();
  return {
    id: author['orcid-id'],
    name: name,
    specialties: [], // Not provided by ORCID search
    institution: author['institution-name']?.[0] || 'N/A',
    publicationCount: 0, // Not provided by ORCID search
    avatarUrl: `https://picsum.photos/seed/${author['orcid-id']}/200/200`, // Placeholder image
    researchAreas: [], // Not provided by ORCID search
  };
};


// Function to fetch and format experts from ORCID
export async function searchExperts(
  query: string,
  limit: number = 12
): Promise<Expert[]> {
  if (!query) {
    return [];
  }
  try {
    const response = await fetch(
      `${ORCID_API_BASE_URL}/search?q=${encodeURIComponent(query)}&rows=${limit}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) {
      throw new Error(`ORCID API error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.result) return [];
    
    // Filter out results that don't have an orcid-id to prevent key errors
    const validResults = data.result.filter((author: any) => author['orcid-id']);
    
    return validResults.map(formatExpert);
  } catch (error) {
    console.error('Failed to fetch experts:', error);
    return [];
  }
}
