
'use client';

import { useEffect, useState } from 'react';
import { searchExperts } from '@/lib/api';
import type { Expert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Plus, Loader2, Search, Heart, Activity, Brain, FlaskConical, ExternalLink, Bot, Wand2, MapPin, Microscope } from "lucide-react"
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getExpertRecommendations } from '@/ai/flows/ai-powered-expert-recommendations';

const specialties = [
    { name: "Cardiology", icon: Heart, query: "cardiology" },
    { name: "Nephrology", icon: Activity, query: "nephrology" },
    { name: "Pulmonology", icon: Brain, query: "pulmonology" },
    { name: "Neurology", icon: Brain, query: "neurology" },
    { name: "Oncology", icon: Activity, query: "oncology" },
];

function ExpertCard({ expert }: { expert: Expert }) {
  const fallback = expert.name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className='flex gap-4 items-start'>
          <Avatar className="h-16 w-16 border-4 border-primary/20">
            <AvatarImage src={expert.avatarUrl} alt={expert.name} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <CardTitle className="font-headline text-xl">{expert.name}</CardTitle>
            {expert.specialties[0] && <CardDescription className='font-medium text-primary'>{expert.specialties[0]}</CardDescription>}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{expert.institution}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
          <div className="flex items-start gap-2 text-sm">
            <Microscope className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <h4 className='font-semibold'>Research</h4>
              <p className='text-muted-foreground'>{expert.researchAreas.join(', ')}</p>
            </div>
          </div>
      </CardContent>
      <CardFooter className="pt-4 flex justify-end gap-2 p-4">
        <Button size="sm" variant="outline" asChild>
          <a href={expert.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View ORCID
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function AiRecommendations() {
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetRecommendations = async () => {
    if (!interests) return;
    setLoading(true);
    setRecommendations([]);
    try {
      const result = await getExpertRecommendations({ researchInterests: interests });
      setRecommendations(result.expertRecommendations);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      // You could add a toast notification here to inform the user.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Wand2 className='text-primary' />
          AI-Powered Recommendations
        </CardTitle>
        <CardDescription>
          Describe your research interests, and our AI will suggest potential collaborators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., 'I'm researching novel immunotherapies for glioblastoma and am interested in the tumor microenvironment...'"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          rows={3}
        />
        <Button onClick={handleGetRecommendations} disabled={loading || !interests}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
          Get Recommendations
        </Button>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div className="pt-4">
            <h3 className="font-semibold mb-2">Here are your AI-suggested experts:</h3>
            <ul className="list-disc list-inside bg-muted/50 p-4 rounded-md text-sm">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
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
      const fetchedExperts = await searchExperts(searchQuery, 9);
      setExperts(fetchedExperts);
      setLoading(false);
    }
    fetchExperts();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };
  
  const handleSpecialtySearch = (specialtyQuery: string) => {
    setSearchTerm(specialtyQuery);
    setSearchQuery(specialtyQuery);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Connect with Experts
        </h1>
        <p className="text-muted-foreground">
          Find collaborators and specialists in your field, or let our AI recommend some for you.
        </p>
      </div>

      <AiRecommendations />

      <Card>
        <CardHeader>
          <CardTitle>Manual Search</CardTitle>
          <CardDescription>Search for experts by name or keyword.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
            <Input
                placeholder="e.g. cancer, cardiology, John Smith..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">Popular fields:</p>
              {specialties.map(spec => (
                  <Button key={spec.name} variant="outline" size="sm" onClick={() => handleSpecialtySearch(spec.query)}>
                      <spec.icon className="mr-2 h-4 w-4" />
                      {spec.name}
                  </Button>
              ))}
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row gap-4 items-start">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className='flex-1 space-y-2'>
                           <Skeleton className="h-6 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <div className="flex items-start gap-2">
                           <Skeleton className="h-4 w-4 mt-0.5" />
                           <div className="flex-1 space-y-1">
                               <Skeleton className="h-4 w-16" />
                               <Skeleton className="h-4 w-full" />
                           </div>
                       </div>
                    </CardContent>
                     <CardFooter className="pt-4 flex justify-end gap-2 p-4">
                        <Skeleton className="h-9 w-28" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : experts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      ) : searchQuery && !loading ? (
        <Card className="flex items-center justify-center h-40 border-dashed">
            <div className="text-center">
                <p className="text-lg font-medium">No Experts Found</p>
                <p className="text-sm text-muted-foreground">Your search for "{searchQuery}" did not return any results.</p>
            </div>
        </Card>
      ) : null}
    </div>
  )
}
