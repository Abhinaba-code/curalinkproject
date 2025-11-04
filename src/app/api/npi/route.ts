
import { NextResponse } from 'next/server';

const NPI_REGISTRY_API_BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';

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
  const specialty = searchParams.get('specialty');
  const name = searchParams.get('name');
  const limit = searchParams.get('limit') || '12';

  const apiParams = new URLSearchParams({
    version: '2.1',
    limit: limit,
    city: 'New York', // Default city to ensure some results
    state: 'NY',      // Default state
  });

  if (specialty) {
    apiParams.set('taxonomy_description', specialty);
  } else if (!name) { 
    // If no specialty or name, use a default to get some results
    apiParams.set('taxonomy_description', 'Cardiology');
  }

  if (name) {
    // The NPI registry doesn't have a single 'name' field, so we split it
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      apiParams.set('first_name', nameParts[0]);
      apiParams.set('last_name', nameParts.slice(1).join(' '));
    } else {
      // If only one word, search it as organization name or last name
      apiParams.set('organization_name', name);
    }
  }

  try {
    const apiUrl = `${NPI_REGISTRY_API_BASE_URL}?${apiParams.toString()}`;
    const apiResponse = await fetch(apiUrl, { cache: 'no-store' });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: `NPI API Error: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    if (data.result_count === 0 || !data.results) {
        return NextResponse.json({ results: [] });
    }

    const formattedResults = data.results
      .map(formatNPIRecord)
      .filter((expert: any | null): expert is any => expert !== null);

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Error in NPI proxy route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
