'use client';

import { useEffect, useState } from 'react';
import { searchExperts } from '@/lib/api';
import type { Expert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Plus, Loader2, Search } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton';

function ExpertCard({ expert }: { expert: Expert }) {
  const fallback = expert.name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <Card key={expert.id} className="text-center flex flex-col">
      <CardHeader className="items-center">
        <Avatar className="h-24 w-24 border-4 border-primary/20">
          <AvatarImage src={expert.avatarUrl} alt={expert.name} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        <CardTitle className="font-headline text-2xl">{expert.name}</CardTitle>
        <CardDescription>{expert.institution}</CardDescription>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {expert.specialties.map(specialty => (
            <Badge key={specialty} variant="secondary">{specialty}</Badge>
          ))}
        </div>
      </CardContent>
      <div className="pt-4 flex justify-center gap-2 p-6">
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Follow
        </Button>
        <Button size="sm" variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Contact
        </Button>
      </div>
    </Card>
  );
}


export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchExperts() {
      if (!searchQuery) {
        setExperts([]);
        return;
      };
      setLoading(true);
      const fetchedExperts = await searchExperts(searchQuery);
      setExperts(fetchedExperts);
      setLoading(false);
    }
    fetchExperts();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Connect with Experts
        </h1>
        <p className="text-muted-foreground">
          Find collaborators and specialists in your field.
        </p>
      </div>

       <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <Input
              placeholder="e.g. John Doe, cancer research..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
      </div>
      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="items-center">
                        <Skeleton className="h-24 w-24 rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-2 items-center flex flex-col">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                           <Skeleton className="h-5 w-20" />
                           <Skeleton className="h-5 w-24" />
                        </div>
                    </CardContent>
                     <div className="pt-4 flex justify-center gap-2 p-6">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </Card>
            ))}
        </div>
      ) : experts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center h-64 border-dashed">
            <div className="text-center">
                <p className="text-lg font-medium">No Experts Found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search terms.</p>
            </div>
        </Card>
      )}
    </div>
  )
}
