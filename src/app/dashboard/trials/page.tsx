'use client';

import { useEffect, useState } from 'react';
import { searchClinicalTrials } from '@/lib/api';
import type { ClinicalTrial } from '@/lib/types';
import TrialCard from './trial-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, Loader2, Search, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function TrialsPage() {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState('50'); // Default 50 miles

  useEffect(() => {
    async function fetchTrials() {
      if (!searchQuery) {
        setTrials([]);
        return;
      };
      setLoading(true);
      const geo = lat && lon && radius ? { lat, lon, radius } : undefined;
      const fetchedTrials = await searchClinicalTrials(searchQuery, 9, geo);
      setTrials(fetchedTrials);
      setLoading(false);
    }
    fetchTrials();
  }, [searchQuery, lat, lon, radius]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };
  
  const handleGeoSearch = () => {
    // This will trigger the useEffect to refetch with geo parameters
    setSearchQuery(searchTerm || 'cancer');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Discover Clinical Trials
        </h1>
        <p className="text-muted-foreground">
          Find research studies relevant to you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
            <Input 
              placeholder="e.g. lung cancer, diabetes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Recruiting</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Active, not recruiting</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="lat" className="text-sm font-medium text-muted-foreground">Latitude</label>
                  <Input id="lat" placeholder="e.g. 39.0997" value={lat} onChange={(e) => setLat(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="lon" className="text-sm font-medium text-muted-foreground">Longitude</label>
                  <Input id="lon" placeholder="e.g. -94.5786" value={lon} onChange={(e) => setLon(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="radius" className="text-sm font-medium text-muted-foreground">Radius (miles)</label>
                  <Input id="radius" placeholder="e.g. 50" value={radius} onChange={(e) => setRadius(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleGeoSearch} className="w-full" disabled={!lat || !lon || !radius}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Search by Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
          ))}
        </div>
      ) : trials.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trials.map((trial) => (
            <TrialCard key={trial.id} trial={trial} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center h-64 border-dashed col-span-full">
            <div className="text-center">
                <p className="text-lg font-medium">No Trials Found</p>
                <p className="text-sm text-muted-foreground">Enter a search term to begin, or adjust your filters.</p>
            </div>
        </Card>
      )}
    </div>
  );
}
