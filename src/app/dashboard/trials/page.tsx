

'use client';

import { useEffect, useState } from 'react';
import { searchClinicalTrials } from '@/lib/api';
import type { ClinicalTrial } from '@/lib/types';
import TrialCard from './trial-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, Loader2, Search, MapPin, Crosshair } from 'lucide-react';
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
import { useHistory } from '@/context/history-provider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';

type RecruitmentStatus = 'Recruiting' | 'Active, not recruiting' | 'Completed';
const ALL_STATUSES: RecruitmentStatus[] = ['Recruiting', 'Active, not recruiting', 'Completed'];

export default function TrialsPage() {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('health');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const { addHistoryItem } = useHistory();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [locationQuery, setLocationQuery] = useState('');
  const [statuses, setStatuses] = useState<RecruitmentStatus[]>(['Recruiting']);

  useEffect(() => {
    async function fetchTrials() {
      setLoading(true);
      let fetchedTrials = await searchClinicalTrials(searchQuery, 9, locationQuery, statuses);
      
      // Premium user sorting logic
      if (user?.isPremium) {
        fetchedTrials = fetchedTrials.sort((a, b) => {
            if (a.status === 'Recruiting' && b.status !== 'Recruiting') return -1;
            if (a.status !== 'Recruiting' && b.status === 'Recruiting') return 1;
            return 0;
        });
      }
      
      setTrials(fetchedTrials);
      setLoading(false);
    }
    fetchTrials();
  }, [searchQuery, locationQuery, statuses, user?.isPremium]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = searchTerm.trim() || 'health'; // Use only the search term or a default
    setSearchQuery(finalQuery);
    
    const locationParts = [city, country].filter(Boolean);
    setLocationQuery(locationParts.join(', '));

    addHistoryItem({
      type: 'trial_search',
      query: finalQuery,
      link: '/dashboard/trials'
    });
  };

  const handleStatusChange = (status: RecruitmentStatus, checked: boolean) => {
    setStatuses(prev => {
        if (checked) {
            return [...prev, status];
        } else {
            return prev.filter(s => s !== status);
        }
    });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support location services.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geoQuery = `distance(${latitude},${longitude},50mi)`;
        
        const finalQuery = searchTerm.trim() || 'health';
        setSearchQuery(finalQuery);

        setLocationQuery(geoQuery);
        setCity(''); // Clear city/country fields
        setCountry('');
        toast({
            title: 'Location Found',
            description: 'Searching for trials within a 50-mile radius.',
        });
      },
      (error) => {
        let description;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            description = "You denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            description = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            description = "The request to get user location timed out.";
            break;
          default:
            description = "An unknown error occurred.";
            break;
        }
        toast({
          variant: 'destructive',
          title: 'Could not get location',
          description,
        });
      }
    );
  };

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
        <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-lg relative">
                    <Input 
                    placeholder="e.g. lung cancer, diabetes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    />
                    <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
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
                    {ALL_STATUSES.map(status => (
                       <DropdownMenuCheckboxItem 
                          key={status}
                          checked={statuses.includes(status)}
                          onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                       >
                         {status}
                       </DropdownMenuCheckboxItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="text-sm font-medium text-muted-foreground">City</label>
                        <Input id="city" placeholder="e.g. Boston" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="country" className="text-sm font-medium text-muted-foreground">Country</label>
                        <Input id="country" placeholder="e.g. United States" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Search by Location
                    </Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={handleUseLocation} disabled={loading}>
                        {loading && locationQuery && !city && !country ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crosshair className="mr-2 h-4 w-4" />}
                        Use My Location
                    </Button>
                </div>
            </CardContent>
            </Card>
        </form>
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
