
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
    : authors ? [`${authors.ForeName} ${authors.LastName}`] : [];

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


const formatExpertFromOrcid = (result: any): Expert | null => {
  const orcidId = result['orcid-id'];
  if (!orcidId) return null;

  const name = result['given-names'] && result['family-name'] ? `${result['given-names']} ${result['family-name']}` : 'Name not available';
  const affiliation = result['institution-name'] ? (Array.isArray(result['institution-name']) ? result['institution-name'][0] : result['institution-name']) : null;
  
  return {
      id: orcidId,
      name: name,
      affiliation: affiliation,
      url: `https://orcid.org/${orcidId}`,
      avatarUrl: `https://picsum.photos/seed/${orcidId}/200/200`,
  };
};

export async function searchExperts(
  name: string,
  researchField: string,
  location: string, // This will be treated as affiliation
  pageSize: number = 12
): Promise<Expert[]> {
  const queryParts = [];
  if (name) {
      // Basic name parsing, works for "First Last"
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
          queryParts.push(`(given-names:${nameParts[0]} AND family-name:${nameParts.slice(1).join(' ')})`);
      } else {
          queryParts.push(`(given-names:${name} OR family-name:${name})`);
      }
  }
  if (researchField) {
      queryParts.push(`keyword:${researchField}`);
  }
  if (location) {
      queryParts.push(`affiliation-org-name:"${location}"`);
  }

  const query = queryParts.join(' OR ');
  if (!query) return [];

  try {
      const url = `${ORCID_API_BASE_URL}/search?q=${encodeURIComponent(query)}&rows=${pageSize}`;
      const response = await fetch(url, {
          headers: {
              'Accept': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error(`ORCID API error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data['result'] || data['result'].length === 0) {
          return [];
      }

      const experts: Expert[] = data.result
        .map((res: any) => formatExpertFromOrcid(res))
        .filter((expert: Expert | null): expert is Expert => expert !== null);
      
      return experts;

  } catch (error) {
      console.error('Failed to fetch experts from ORCID:', error);
      return [];
  }
}
