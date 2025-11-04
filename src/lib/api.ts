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
    url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${id}`,
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

const formatExpertFromPublication = (authorName: string, pub: Publication, query: string): Expert => {
    const orcidId = `${authorName.replace(' ', '-')}`; // Simplistic slug
    return {
      id: `${authorName}-${pub.id}`, // Create a pseudo-unique ID
      name: authorName,
      specialties: [query], // Use the query as a specialty
      institution: 'N/A', // Not reliably provided for authors
      publicationCount: 1, // Can't easily calculate total, so we start with 1
      avatarUrl: `https://picsum.photos/seed/${authorName}/200/200`, // Placeholder image
      researchAreas: [pub.title], // Use publication title as a research area
      clinicalTrialCount: 0,
      url: `https://orcid.org/orcid-search/quick-search/?searchQuery=${encodeURIComponent(authorName)}`
    };
  };

// Function to fetch and format experts from PubMed based on publications
export async function searchExperts(
  query: string,
  limit: number = 20
): Promise<Expert[]> {
  if (!query) {
    return [];
  }
  try {
    const publications = await searchPublications(query, limit);
    if (!publications || publications.length === 0) {
      return [];
    }

    const expertsMap: Map<string, Expert> = new Map();

    publications.forEach(pub => {
      pub.authors.forEach(authorName => {
        if (expertsMap.has(authorName)) {
          const expert = expertsMap.get(authorName)!;
          expert.publicationCount += 1;
          if(!expert.researchAreas.includes(pub.title)) {
            expert.researchAreas.push(pub.title);
          }
          if(!expert.specialties.includes(query)){
            expert.specialties.push(query);
          }

        } else {
          const newExpert = formatExpertFromPublication(authorName, pub, query);
          expertsMap.set(authorName, newExpert);
        }
      });
    });

    const expertList = Array.from(expertsMap.values());
    // The following block is very slow and has been removed for performance.
    // We can add it back in a more performant way later if needed.
    /*
    for (const expert of expertList) {
        try {
            const trialsResponse = await fetch(
              `${CLINICAL_TRIALS_API_BASE_URL}/studies?query.term=${encodeURIComponent(expert.name)}&pageSize=10`
            );
            if (trialsResponse.ok) {
              const trialsData = await trialsResponse.json();
              expert.clinicalTrialCount = trialsData.studies.length;
            }
        } catch (error) {
            console.error(`Failed to fetch clinical trials for ${expert.name}:`, error);
        }
    }
    */

    // Return the most published authors from the result set, up to the limit
    const sortedExperts = expertList.sort((a, b) => b.publicationCount - a.publicationCount);
    return sortedExperts.slice(0, limit);

  } catch (error) {
    console.error('Failed to fetch experts via PubMed:', error);
    return [];
  }
}
