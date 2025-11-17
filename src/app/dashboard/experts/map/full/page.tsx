
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GoogleMap, useJsApiLoader, Marker, Circle, MarkerClusterer, InfoWindow } from '@react-google-maps/api';
import type { Expert } from '@/lib/types';


const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

function FullScreenMap() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || 'Unknown Search';
    const radius = parseInt(searchParams.get('radius') || '50', 10);
    const lat = parseFloat(searchParams.get('lat') || '40.7128');
    const lng = parseFloat(searchParams.get('lng') || '-74.0060');

    const center = useMemo(() => ({ lat, lng }), [lat, lng]);
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

     const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });

    // This is a placeholder since we don't pass the experts data to the full page.
    // In a real app, this page would fetch its own data based on query params.
    const mockExperts: Expert[] = Array.from({ length: 50 }).map((_, i) => ({
      id: `expert-${i}`,
      name: `Dr. Mock Expert ${i + 1}`,
      specialty: 'Cardiology',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      url: '#',
      avatarUrl: `https://picsum.photos/seed/${i}/200/200`
    }));

    // A mock function to generate random coordinates around a center point for demonstration
    const generateRandomCoords = (expertId: string, center: { lat: number, lng: number }, radius: number) => {
        const r = (radius / 111320) * Math.sqrt(Math.random()); // radius in meters -> degrees
        const theta = Math.random() * 2 * Math.PI;
        const lat = center.lat + r * Math.cos(theta);
        const lng = center.lng + r * Math.sin(theta);
        return { lat, lng };
    };

    if (loadError) return <div className="fixed inset-0 bg-red-100 flex items-center justify-center text-red-800">Error loading map.</div>;
    if (!isLoaded) return <div className="fixed inset-0 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;


    return (
         <div className="fixed inset-0 bg-background flex flex-col">
            <header className="p-4 bg-background/80 backdrop-blur-lg z-10 border-b flex items-center justify-between">
                <h1 className="text-xl font-bold font-headline">Full Screen Map View</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">Query: {query}</Badge>
                    <Badge variant="secondary">Radius: {radius}km</Badge>
                </div>
            </header>
            <main className="flex-1">
                 <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={9}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
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
                            mockExperts.map((expert) => {
                            const position = generateRandomCoords(expert.id, center, radius * 1000);
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
                    {selectedExpert && (
                        <InfoWindow
                            position={generateRandomCoords(selectedExpert.id, center, radius*1000)}
                            onCloseClick={() => setSelectedExpert(null)}
                        >
                            <div className='p-1'>
                                <h4 className='font-bold'>{selectedExpert.name}</h4>
                                <p className='text-sm text-muted-foreground'>{selectedExpert.specialty}</p>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </main>
        </div>
    );
}

export default function FullScreenMapPage() {
    return (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <FullScreenMap />
        </Suspense>
    );
}
