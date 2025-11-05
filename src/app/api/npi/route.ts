import { NextResponse } from 'next/server';

const NPI_REGISTRY_API_BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';
const MAX_RESULTS = 1200;
const API_RESULT_LIMIT = 200; // The API can only return 200 records at a time.

const formatNPIRecord = (record: any): any | null => {
    if (!record || !record.number) return null;
  
    const { basic, addresses = [], taxonomies = [] } = record;
    const location = addresses.find(addr => addr.address_purpose === 'LOCATION');
  
    if (!location) return null;
  
    // Correctly determine the name. For individuals, first_name and last_name are reliable.
    // For organizations, organization_name is correct.
    const isPerson = !!(basic.first_name || basic.last_name);
    const name = isPerson 
        ? [basic.first_name, basic.last_name].filter(Boolean).join(' ')
        : basic.organization_name;

    const specialty = taxonomies[0]?.desc || 'Not specified';

    if (!name || name.trim() === '') return null;
  
    return {
      id: record.number.toString(),
      name: name,
      specialty: specialty,
      address: location.address_1,
      city: location.city,
      state: location.state,
      zip: location.postal_code,
      url: `https://npiregistry.cms.hhs.gov/provider-view/${record.number}`,
      avatarUrl: `https://picsum.photos/seed/${record.number}/200/200`,
    };
  }

async function fetchNpiData(params: URLSearchParams) {
    const apiUrl = `${NPI_REGISTRY_API_BASE_URL}?${params.toString()}`;
    const response = await fetch(apiUrl, { cache: 'no-store' });
    
    if (!response.ok) {
        let errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.Errors) {
                errorText = errorJson.Errors.map((e: any) => e.description).join(', ');
            }
        } catch(e) {
            // Not JSON, use the text as is
        }
        const error = new Error(`NPI API Error: ${errorText}`);
        (error as any).status = response.status;
        throw error;
    }
    
    return await response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  
  const apiPage = Math.floor(((page - 1) * limit) / API_RESULT_LIMIT) + 1;
  const skipWithinApiPage = ((page - 1) * limit) % API_RESULT_LIMIT;
  const apiSkip = (apiPage - 1) * API_RESULT_LIMIT;

  if (apiSkip >= MAX_RESULTS) {
    return NextResponse.json({ results: [], totalCount: 0 });
  }
  
  try {
    let data;
    try {
        const apiParams = new URLSearchParams({
            version: '2.1',
            limit: API_RESULT_LIMIT.toString(),
            skip: apiSkip.toString(),
        });
        if (query) {
            apiParams.set('taxonomy_description', query);
        } else {
            apiParams.set('state', 'NY'); // Default search
        }
        data = await fetchNpiData(apiParams);
    } catch (primaryError: any) {
        // If the primary search for "taxonomy_description" yields no results, try a broader name search.
        if (query && primaryError.message.includes("No results found")) {
            const fallbackParams = new URLSearchParams({
                version: '2.1',
                limit: API_RESULT_LIMIT.toString(),
                skip: apiSkip.toString(),
                first_name: `*${query}*`,
            });
            data = await fetchNpiData(fallbackParams);
        } else {
            // Re-throw other errors
            throw primaryError;
        }
    }

    if (!data || data.result_count === 0 || !data.results) {
        return NextResponse.json({ results: [], totalCount: 0 });
    }

    const allFormattedResults = data.results
      .map(formatNPIRecord)
      .filter((expert: any | null): expert is any => expert !== null);

    const paginatedResults = allFormattedResults.slice(skipWithinApiPage, skipWithinApiPage + limit);
    const totalCount = Math.min(data.result_count, MAX_RESULTS);

    return NextResponse.json({ results: paginatedResults, totalCount });

  } catch (error: any) {
    // This will catch errors from both primary and fallback fetches if they are not "No results found"
    console.error('Error in NPI proxy route:', error.message);
    const status = error.status || 500;
    // Ensure we always return a standard JSON error response
    return NextResponse.json({ error: 'Failed to fetch data from NPI Registry.', details: error.message }, { status });
  }
}
