

'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Search, Loader2, List, Map as MapIcon, Maximize, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Expert } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { searchExperts } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle, MarkerClusterer } from '@react-google-maps/api';
import { Label } from '@/components/ui/label';

const MAP_CENTER_DEFAULT = { lat: 40.7128, lng: -74.0060 }; // New York City
const RADIUS_OPTIONS = [25, 50, 75, 100];
const DEFAULT_RADIUS = 50;

function SearchControls({
    onSearch,
    loading,
    initialQuery,
    initialRadius,
    onUseMyLocation
}: {
    onSearch: (query: string, radius: number) => void;
    loading: boolean;
    initialQuery: string;
    initialRadius: number;
    onUseMyLocation: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [radius, setRadius] = useState(initialRadius);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, radius);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                <div className="space-y-2 lg:col-span-1">
                    <Label htmlFor="search-query">
                    Condition, Specialty, or Name
                    </Label>
                    <div className="relative">
                    <Input
                        id="search-query"
                        placeholder="e.g., 'heart', 'cardiologist'..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                    </div>
                </div>
                 <div className="space-y-2 lg:col-span-1">
                    <Label>Location</Label>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={onUseMyLocation}
                        disabled={loading}
                    >
                        <CircleDot className="mr-2 h-4 w-4" />
                        Use My Location
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">or search will default to a sample area</p>
                </div>
                <div className="space-y-2 lg:col-span-1">
                    <Label>Radius</Label>
                    <div className="flex flex-col sm:flex-row justify-around gap-2">
                    {RADIUS_OPTIONS.map((r) => (
                        <Button
                        key={r}
                        type="button"
                        variant={radius === r ? 'default' : 'outline'}
                        onClick={() => setRadius(r)}
                        className="flex-1"
                        >
                        {r} km
                        </Button>
                    ))}
                    </div>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Apply Filters
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

function MapView({
  center,
  radius,
  experts,
  searchParams,
}: {
  center: { lat: number; lng: number };
  radius: number;
  experts: Expert[];
  searchParams: URLSearchParams;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geocoding'],
  });

  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [expertPositions, setExpertPositions] = useState<{[key: string]: {lat: number, lng: number}}>({});

  useEffect(() => {
    if (!isLoaded || experts.length === 0) return;
    
    const geocoder = new window.google.maps.Geocoder();
    const newPositions: {[key: string]: {lat: number, lng: number}} = {};
    let processedCount = 0;

    experts.forEach((expert) => {
      // Skip if we already have the position
      if (expertPositions[expert.id]) {
        newPositions[expert.id] = expertPositions[expert.id];
        processedCount++;
        if (processedCount === experts.length) {
            setExpertPositions(current => ({...current, ...newPositions}));
        }
        return;
      }

      const fullAddress = `${expert.address}, ${expert.city}, ${expert.state} ${expert.zip}`;
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        processedCount++;
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          newPositions[expert.id] = { lat: location.lat(), lng: location.lng() };
        } else {
            // Fallback for demonstration: generate random coordinates if geocoding fails
            const r = (radius / 111320) * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const lat = center.lat + r * Math.cos(theta);
            const lng = center.lng + r * Math.sin(theta);
            newPositions[expert.id] = { lat, lng };
            console.warn('Geocode was not successful for the following reason: ' + status, `Faking location for ${expert.name}`);
        }
        
        if (processedCount === experts.length) {
          setExpertPositions(current => ({...current, ...newPositions}));
        }
      });
    });

  }, [isLoaded, experts, center, radius, expertPositions]);


  const fullMapUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return `/dashboard/experts/map/full?${params.toString()}`;
  }, [searchParams]);

  if (loadError) {
    return (
      <Card className="relative h-96 md:h-full w-full flex items-center justify-center bg-destructive/10 text-destructive-foreground">
        <p>Error loading maps. Please check the API key.</p>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="relative h-96 md:h-full w-full flex items-center justify-center bg-muted/50">
        <div className="z-10 flex flex-col items-center gap-2 text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative h-96 md:h-[500px] w-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={9}
        options={{
            disableDefaultUI: true,
            zoomControl: true,
        }}
      >
        <Circle
          center={center}
          radius={radius * 1000} // radius in meters
          options={{
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.15,
          }}
        />
        <MarkerClusterer>
          {(clusterer) =>
            experts.map((expert) => {
              const position = expertPositions[expert.id];
              if (!position) return null;

              return (
                 <Marker
                    key={expert.id}
                    position={position}
                    clusterer={clusterer}
                    onClick={() => setSelectedExpert(expert)}
                />
              );
            })
          }
        </MarkerClusterer>

        {selectedExpert && expertPositions[selectedExpert.id] && (
          <InfoWindow
            position={expertPositions[selectedExpert.id]}
            onCloseClick={() => setSelectedExpert(null)}
          >
            <div className='p-1'>
                <h4 className='font-bold'>{selectedExpert.name}</h4>
                <p className='text-sm text-muted-foreground'>{selectedExpert.specialty}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" className="absolute top-4 right-4 z-10">
              <a href={fullMapUrl} target="_blank" rel="noopener noreferrer">
                <Maximize />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open full map</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Card>
  );
}


function ResultsList({
    experts,
    loading
}: {
    experts: Expert[];
    loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-bold text-lg"><Skeleton className="h-6 w-48" /></h2>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex gap-4 p-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (experts.length === 0) {
      return (
        <Card className="flex h-48 items-center justify-center text-center">
            <div>
                <p className="font-semibold">No Experts Found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or increasing the radius.</p>
            </div>
        </Card>
      )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Showing {experts.length} Experts</h2>
      {experts.map((expert) => (
        <Card key={expert.id} className="p-4">
            <div className="flex gap-4 items-center">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                    <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h3 className="font-bold">{expert.name}</h3>
                    <p className="text-sm text-primary">{expert.specialty}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {expert.city}, {expert.state}
                    </p>
                </div>
                <Button variant="outline">View Profile</Button>
            </div>
        </Card>
      ))}
    </div>
  );
}

function HealthExpertsMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const query = searchParams.get('q') || 'heart disease';
  const lat = parseFloat(searchParams.get('lat') || `${MAP_CENTER_DEFAULT.lat}`);
  const lng = parseFloat(searchParams.get('lng') || `${MAP_CENTER_DEFAULT.lng}`);
  const radius = parseInt(searchParams.get('radius') || `${DEFAULT_RADIUS}`, 10);
  
  const mapCenter = useMemo(() => ({ lat, lng }), [lat, lng]);
  const currentParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  useEffect(() => {
    setLoading(true);
    searchExperts(query, 1, 50) // Fetch more results for map density
      .then((data) => {
        setExperts(data.results);
        setTotalResults(data.totalCount);
      })
      .catch((err) => {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Failed to fetch experts',
          description: 'There was an error fetching data from the NPI registry.',
        });
      })
      .finally(() => setLoading(false));
  }, [query, toast]);
  
  const handleSearch = (newQuery: string, newRadius: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', newQuery);
    params.set('radius', newRadius.toString());
    router.push(`/dashboard/experts/map?${params.toString()}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
        toast({ variant: 'destructive', title: 'Geolocation not supported' });
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const params = new URLSearchParams(searchParams.toString());
            params.set('lat', latitude.toString());
            params.set('lng', longitude.toString());
            router.push(`/dashboard/experts/map?${params.toString()}`);
            toast({ title: 'Location updated!', description: 'Searching near your current location.'});
        },
        (error) => {
            toast({ variant: 'destructive', title: 'Could not get location', description: error.message });
        }
    );
  };


  return (
    <div className="flex flex-col h-full gap-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Health Experts Near Me</h1>
        <p className="text-muted-foreground">Find specialists by condition and location.</p>
      </header>
      
      <SearchControls
          onSearch={handleSearch}
          loading={loading}
          initialQuery={query}
          initialRadius={radius}
          onUseMyLocation={handleUseMyLocation}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <MapView center={mapCenter} radius={radius} experts={experts} searchParams={currentParams} />
        </div>
        <div className="overflow-y-auto max-h-[500px]">
            <ResultsList experts={experts} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <HealthExpertsMapPage />
        </Suspense>
    )
}
