
import { ClinicalTrial, Publication, Expert } from './types';

const CLINICAL_TRIALS_API_BASE_URL = 'https://clinicaltrials.gov/api/v2';
const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ORCID_API_BASE_URL = 'https://pub.orcid.org/v3.0';


// A mapping from the API's status to the app's status
const statusMapping: { [key: string]: ClinicalTrial['status'] } = {
  RECRUITING: 'Recruiting',
  ACTIVE_NOT_RECRUITUITING: 'Active, not recruiting',
  COMPLETED: 'Completed',
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
    location: protocol.contactsLocationsModule.locations?.[0]?.city || 'N/A',
    contact: protocol.contactsLocationsModule.centralContacts?.[0]?.name || 'N/A',
    tags: protocol.conditionsModule.conditions || [],
    url: `https://clinicaltrials.gov/study/${nctId}`,
  };
};

// Function to fetch and format clinical trials
export async function searchClinicalTrials(
  query: string,
  pageSize: number = 9,
  geo?: { lat: string, lon: string, radius: string }
): Promise<ClinicalTrial[]> {
    if (!query) return [];
  try {
    let url = `${CLINICAL_TRIALS_API_BASE_URL}/studies?query.cond=${query}&pageSize=${pageSize}&filter.overallStatus=RECRUITING`;
    if (geo) {
        url += `&filter.geo=distance(${geo.lat},${geo.lon},${geo.radius}mi)`;
    }
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

// A utility function to format a single publication from the API response
const formatPublication = (id: string, data: any): Publication => {
  const article = data.result[id];
  const doi = article.elocationid?.replace('doi: ', '') || '';
  return {
    id: id,
    title: article.title || 'No title available.',
    authors: article.authors?.map((a: { name: string }) => a.name) || [],
    journal: article.source || 'N/A',
    year: new Date(article.pubdate).getFullYear() || 'N/A',
    doi: doi,
    // PubMed e-summary does not provide an abstract. A more complex call would be needed.
    abstract: 'No abstract available from this API endpoint. Full text link might be available.', 
    url: `https://pubmed.ncbi.nlm.nih.gov/${id}`,
  };
};


// Function to fetch and format publications from PubMed
export async function searchPublications(
  query: string,
  pageSize: number = 10
): Promise<Publication[]> {
    if (!query) return [];
  try {
    // Step 1: Search for publication IDs
    const searchResponse = await fetch(
      `${PUBMED_API_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${pageSize}&retmode=json`
    );

    if (!searchResponse.ok) {
      throw new Error(`PubMed search API error! status: ${searchResponse.status}`);
    }
    const searchData = await searchResponse.json();
    
    if (!searchData.esearchresult || !searchData.esearchresult.idlist) {
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

const formatExpertFromOrcid = (person: any): Expert => {
  const orcid = person['orcid-identifier']?.path;
  const givenName = person.person?.name?.['given-names']?.value || '';
  const familyName = person.person?.name?.['family-name']?.value || '';
  const name = `${givenName} ${familyName}`.trim();

  // Simulated data for richer profiles, as the basic search doesn't provide these.
  const specialties = ['Oncology', 'Immunology', 'Genetics'];
  const researchAreas = ['Cancer Research', 'T-cell therapy', 'Clinical Trials'];
  const institutions = ['Memorial Sloan Kettering', 'Stanford University', 'MIT'];

  return {
    id: orcid,
    name: name || "Name not found",
    specialties: [specialties[Math.floor(Math.random() * specialties.length)]],
    institution: institutions[Math.floor(Math.random() * institutions.length)],
    publicationCount: Math.floor(Math.random() * 200) + 10,
    avatarUrl: `https://picsum.photos/seed/${orcid}/200/200`,
    researchAreas: researchAreas.slice(0, Math.floor(Math.random() * 2) + 1),
    clinicalTrialCount: Math.floor(Math.random() * 20),
    url: `https://orcid.org/${orcid}`,
  };
};

export async function searchExperts(
  query: string,
  limit: number = 9
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
    
    const results = data.result || [];
    if (results.length === 0) return [];
    
    return results.map(formatExpertFromOrcid);

  } catch (error) {
    console.error('Failed to fetch experts from ORCID:', error);
    return [];
  }
}
