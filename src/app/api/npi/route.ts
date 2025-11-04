import { NextResponse } from 'next/server';

const NPI_REGISTRY_API_BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';
const MAX_RESULTS = 1200; // NPI API limit

const formatNPIRecord = (record: any): any | null => {
    if (!record || !record.number) return null;
  
    const { basic, addresses = [], taxonomies = [] } = record;
    const location = addresses.find(addr => addr.address_purpose === 'LOCATION');
  
    if (!location) return null;
  
    const name = basic.organization_name || [basic.first_name, basic.last_name].filter(Boolean).join(' ');
    const specialty = taxonomies[0]?.desc || 'Not specified';

    if (!name) return null;
  
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
  const skip = (page - 1) * limit;

  // Prevent skipping beyond the API's limit
  if (skip >= MAX_RESULTS) {
    return NextResponse.json({ results: [], totalCount: 0 });
  }

  const apiParams = new URLSearchParams({
    version: '2.1',
    limit: limit.toString(),
    skip: skip.toString(),
  });

  if (query) {
    // Apply the query to multiple fields for a broad search
    apiParams.set('taxonomy_description', query);
    apiParams.set('first_name', query);
    apiParams.set('last_name', query);
    apiParams.set('organization_name', query);
    apiParams.set('city', query);
    apiParams.set('state', query);
  } else {
    // Default to a common search to show initial results if no query is provided
    apiParams.set('state', 'NY');
  }

  try {
    const apiUrl = `${NPI_REGISTRY_API_BASE_URL}?${apiParams.toString()}`;
    const apiResponse = await fetch(apiUrl, { cache: 'no-store' });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      // Gracefully handle "no results" which the API sometimes returns as an error
      if (apiResponse.status === 404 || errorText.includes("No results found")) {
         return NextResponse.json({ results: [], totalCount: 0 });
      }
      return NextResponse.json({ error: `NPI API Error: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    if (data.result_count === 0 || !data.results) {
        return NextResponse.json({ results: [], totalCount: 0 });
    }

    const formattedResults = data.results
      .map(formatNPIRecord)
      .filter((expert: any | null): expert is any => expert !== null);
      
    // The API returns the total count for the query, but caps it at MAX_RESULTS.
    const totalCount = Math.min(data.result_count, MAX_RESULTS);

    return NextResponse.json({ results: formattedResults, totalCount });
  } catch (error) {
    console.error('Error in NPI proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
