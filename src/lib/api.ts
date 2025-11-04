
import { ClinicalTrial, Publication, Expert } from './types';
import { XMLParser } from 'fast-xml-parser';

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
  location?: string
): Promise<ClinicalTrial[]> {
  try {
    let url = `${CLINICAL_TRIALS_API_BASE_URL}/studies?pageSize=${pageSize}&filter.overallStatus=RECRUITING`;
    
    const queryParts = [];
    if (query) {
        queryParts.push(`query.cond=${encodeURIComponent(query)}`);
    }
    if (location) {
        // ClinicalTrials.gov API uses 'query.locn' for location-based searches which can include city, state, country.
        queryParts.push(`query.locn=${encodeURIComponent(location)}`);
    }
    
    if (queryParts.length > 0) {
        url += `&${queryParts.join('&')}`;
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
const formatPublication = (articleData: any): Publication => {
  const pmid = articleData.MedlineCitation.PMID;
  const article = articleData.MedlineCitation.Article;

  let abstract = 'No abstract available.';
  if (article.Abstract?.AbstractText) {
    if (Array.isArray(article.Abstract.AbstractText)) {
      abstract = article.Abstract.AbstractText.map((part: any) => part['#text'] || part).join(' ');
    } else if (typeof article.Abstract.AbstractText === 'object') {
       abstract = article.Abstract.AbstractText['#text'];
    }
    else {
      abstract = article.Abstract.AbstractText;
    }
  }
  
  const doi = article.ELocationID?.find((id: any) => id.EIdType === 'doi')?.['#text'] || '';

  const authors = article.AuthorList.Author;
  const authorNames = Array.isArray(authors)
    ? authors.map(author => `${author.ForeName} ${author.LastName}`)
    : authors ? [`${authors.ForeName} ${author.LastName}`] : [];

  return {
    id: pmid,
    title: article.ArticleTitle || 'No title available.',
    authors: authorNames,
    journal: article.Journal.Title || 'N/A',
    year: new Date(article.Journal.JournalIssue.PubDate.Year, article.Journal.JournalIssue.PubDate.Month ? parseInt(article.Journal.JournalIssue.PubDate.Month, 10) - 1 : 0).getFullYear() || 'N/A',
    doi: doi,
    abstract: abstract, 
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
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
    
    if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
        return [];
    }

    const ids = searchData.esearchresult.idlist;

    // Step 2: Fetch full details for the found IDs using efetch
    const fetchResponse = await fetch(
      `${PUBMED_API_BASE_URL}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`
    );

    if (!fetchResponse.ok) {
      throw new Error(`PubMed fetch API error! status: ${fetchResponse.status}`);
    }
    const xmlData = await fetchResponse.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      parseAttributeValue: true,
      isArray: (name, jpath) => {
        return ['Author', 'AbstractText', 'ELocationID'].includes(name);
      }
    });
    const jsonData = parser.parse(xmlData);

    if (!jsonData.PubmedArticleSet?.PubmedArticle) {
      return [];
    }

    const articles = Array.isArray(jsonData.PubmedArticleSet.PubmedArticle)
      ? jsonData.PubmedArticleSet.PubmedArticle
      : [jsonData.PubmedArticleSet.PubmedArticle];

    // Step 3: Format the data
    return articles.map(formatPublication);
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    return []; // Return an empty array on error
  }
}

// Simple hash function to get a number from a string
function simpleHash(str: string) {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// New function to fetch detailed person data from ORCID
async function getOrcidPersonDetails(orcid: string): Promise<Partial<Expert>> {
  try {
    const response = await fetch(
      `${ORCID_API_BASE_URL}/${orcid}/person`, 
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) return {};
    const data = await response.json();

    const name = `${data.name?.['given-names']?.value || ''} ${data.name?.['family-name']?.value || ''}`.trim();
    
    const keywordsResponse = await fetch(
      `${ORCID_API_BASE_URL}/${orcid}/keywords`,
      { headers: { 'Accept': 'application/json' } }
    );
    let researchAreas: string[] = [];
    if(keywordsResponse.ok) {
        const keywordsData = await keywordsResponse.json();
        researchAreas = (keywordsData.keyword || []).map((k: any) => k.content).slice(0, 3);
    }
    
    const affiliationsResponse = await fetch(
      `${ORCID_API_BASE_URL}/${orcid}/employments`,
      { headers: { 'Accept': 'application/json' } }
    );
    let institution = "N/A";
    if (affiliationsResponse.ok) {
        const affiliationsData = await affiliationsResponse.json();
        if (affiliationsData['employment-summary']?.[0]?.['organization']?.name) {
            institution = affiliationsData['employment-summary'][0]['organization'].name;
        }
    }
    
    return {
      name: name || "Unnamed Researcher",
      researchAreas,
      institution,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ORCID ${orcid}:`, error);
    return {};
  }
}

export async function searchExperts(
  query: string,
  limit: number = 9
): Promise<Expert[]> {
  if (!query) {
    return [];
  }
  try {
    const formattedQuery = `keyword:${encodeURIComponent(query)}`;
    const response = await fetch(
      `${ORCID_API_BASE_URL}/search?q=${formattedQuery}&rows=${limit}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) {
      throw new Error(`ORCID API error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const results = data.result || [];
    if (results.length === 0) return [];

    const expertPromises = results.map(async (result: any) => {
        const orcid = result['orcid-id'];
        const details = await getOrcidPersonDetails(orcid);

        const seed = simpleHash(orcid);
        const specialties = ['Oncology', 'Immunology', 'Genetics', 'Neurology', 'Cardiology', 'Pulmonology', 'Nephrology'];

        return {
            id: orcid,
            name: details.name || "Unnamed Researcher",
            specialties: details.researchAreas && details.researchAreas.length > 0 ? details.researchAreas.slice(0,1) : [specialties[seed % specialties.length]],
            institution: details.institution || 'N/A',
            publicationCount: seed % 250 + 10, // Placeholder
            avatarUrl: `https://picsum.photos/seed/${orcid}/200/200`,
            researchAreas: details.researchAreas || [],
            clinicalTrialCount: seed % 25, // Placeholder
            url: `https://orcid.org/${orcid}`,
        }
    });

    return Promise.all(expertPromises);

  } catch (error) {
    console.error('Failed to fetch experts from ORCID:', error);
    return [];
  }
}

    