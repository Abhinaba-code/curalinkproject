
import { ClinicalTrial, Publication, Expert } from './types';
import { XMLParser } from 'fast-xml-parser';

const CLINICAL_TRIALS_API_BASE_URL = 'https://clinicaltrials.gov/api/v2';
const PUBMED_API_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const NPI_REGISTRY_API_BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';

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

const extractTextFromNode = (node: any): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'object' && node !== null) {
      if ('#text' in node) {
        // Handle cases like { '#text': 'Some text', i: 'italic part' }
        let text = node['#text'];
        for (const key in node) {
          if (key !== '#text' && typeof node[key] === 'string') {
            text += ` ${node[key]}`;
          }
        }
        return text;
      }
      // Handle cases with nested tags like { sub: "2" } or arrays
      return Object.values(node).flat().map(extractTextFromNode).join('');
    }
    return '';
};


// A utility function to format a single publication from the API response
const formatPublication = (articleData: any): Publication => {
  const pmidNode = articleData.MedlineCitation.PMID;
  const pmid = typeof pmidNode === 'object' ? pmidNode['#text'] : pmidNode;
  const article = articleData.MedlineCitation.Article;

  let abstract = 'No abstract available.';
  if (article.Abstract?.AbstractText) {
    if (Array.isArray(article.Abstract.AbstractText)) {
      abstract = article.Abstract.AbstractText.map(extractTextFromNode).join(' ');
    } else {
      abstract = extractTextFromNode(article.Abstract.AbstractText);
    }
  }
  
  const doi = article.ELocationID?.find((id: any) => id.EIdType === 'doi')?.['#text'] || '';

  const authors = article.AuthorList?.Author;
  const authorNames = Array.isArray(authors)
    ? authors.map(author => `${author.ForeName} ${author.LastName}`)
    : authors ? [`${authors.ForeName} ${authors.LastName}`] : [];

  const title = extractTextFromNode(article.ArticleTitle) || 'No title available.';

  return {
    id: pmid.toString(),
    title: title,
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
      },
      tagValueProcessor: (tagName, tagValue) => {
        // This prevents the parser from converting numbers into actual number types
        if (tagName === 'PMID' || tagName === 'Year') {
          return tagValue;
        }
        return;
      },
    });
    const jsonData = parser.parse(xmlData);

    if (!jsonData.PubmedArticleSet?.PubmedArticle) {
      return [];
    }

    const articles = Array.isArray(jsonData.PubmedArticleSet.PubmedArticle)
      ? jsonData.PubmedArticleSet.PubmedArticle
      : [jsonData.PubmedArticleSet.PubmedArticle];

    // Step 3: Format the data
    return articles.map(formatPublication).filter(p => p.id);
  } catch (error) {
    console.error('Failed to fetch publications:', error);
    return []; // Return an empty array on error
  }
}

export async function searchExperts(
  specialty: string,
  city: string,
  state: string,
  pageSize: number = 12
): Promise<Expert[]> {
  const params = new URLSearchParams({
    limit: pageSize.toString(),
  });

  if (specialty) {
    params.set('specialty', specialty);
  }
  if (city) {
    params.set('city', city);
  }
  if (state) {
    params.set('state', state);
  }

  try {
    const url = `/api/npi?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `NPI Registry API error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results;

  } catch (error) {
    console.error('Failed to fetch experts:', error);
    return [];
  }
}
