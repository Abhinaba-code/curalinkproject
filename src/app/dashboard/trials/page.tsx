'use client';

import { useEffect, useState } from 'react';
import { searchClinicalTrials } from '@/lib/api';
import type { ClinicalTrial } from '@/lib/types';
import TrialCard from './trial-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListFilter, Loader2, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export default function TrialsPage() {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('cancer');

  useEffect(() => {
    async function fetchTrials() {
      setLoading(true);
      const fetchedTrials = await searchClinicalTrials(searchQuery);
      setTrials(fetchedTrials);
      setLoading(false);
    }
    fetchTrials();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
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

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <Input 
            placeholder="Search by condition, keyword..." 
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trials.map((trial) => (
            <TrialCard key={trial.id} trial={trial} />
          ))}
        </div>
      )}
    </div>
  );
}
