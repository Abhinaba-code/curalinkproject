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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  
  // NPI API has a hard limit of 1200 results total.
  // Calculate the skip based on the requested page and the API's own limit (200).
  // We can't just use our own limit/page for skip, we have to fetch in chunks of 200.
  const apiPage = Math.floor(((page - 1) * limit) / API_RESULT_LIMIT) + 1;
  const skipWithinApiPage = ((page - 1) * limit) % API_RESULT_LIMIT;

  const apiSkip = (apiPage - 1) * API_RESULT_LIMIT;

  if (apiSkip >= MAX_RESULTS) {
    return NextResponse.json({ results: [], totalCount: 0 });
  }

  const apiParams = new URLSearchParams({
    version: '2.1',
    limit: API_RESULT_LIMIT.toString(), // Always fetch the max allowed by the API
    skip: apiSkip.toString(),
  });

  // Use a broad search if a query is provided
  if (query) {
    // The API is finicky. A general search works best with one parameter.
    // We will use taxonomy_description for categories and organization_name for general search.
    if (['Cardiology', 'Oncology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Radiology'].includes(query)) {
        apiParams.set('taxonomy_description', query);
    } else {
        // Search by both first name and last name for individuals, and organization name for orgs
        apiParams.set('first_name', `*${query}*`);
        apiParams.set('last_name', `*${query}*`);
        apiParams.set('organization_name', `*${query}*`);
    }
  } else {
    // If no query, return a default set of results (e.g., from a specific state).
    apiParams.set('state', 'NY');
  }

  try {
    const apiUrl = `${NPI_REGISTRY_API_BASE_URL}?${apiParams.toString()}`;
    const apiResponse = await fetch(apiUrl, { cache: 'no-store' });
    
    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.Errors && errorJson.Errors.some((e: any) => e.description.includes("No results found"))) {
                return NextResponse.json({ results: [], totalCount: 0 });
            }
        } catch(e) {
            // Not a JSON error, fall through to general error handling
        }
        console.error(`NPI API Error: ${apiResponse.status} ${errorText}`);
        return NextResponse.json({ error: `NPI API Error: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    if (data.result_count === 0 || !data.results) {
        return NextResponse.json({ results: [], totalCount: 0 });
    }

    const allFormattedResults = data.results
      .map(formatNPIRecord)
      .filter((expert: any | null): expert is any => expert !== null);

    // Now, apply our internal pagination to the chunk we fetched.
    const paginatedResults = allFormattedResults.slice(skipWithinApiPage, skipWithinApiPage + limit);
      
    // The API returns the total count for the query, but we cap it at MAX_RESULTS.
    const totalCount = Math.min(data.result_count, MAX_RESULTS);

    return NextResponse.json({ results: paginatedResults, totalCount });
  } catch (error) {
    console.error('Error in NPI proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
