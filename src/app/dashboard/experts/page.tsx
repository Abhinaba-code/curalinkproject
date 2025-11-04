'use client';

import { useEffect, useState } from 'react';
import type { Expert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building, ExternalLink, Loader2, Microscope, Search, BookCheck } from 'lucide-react';
import { searchExperts } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

function ExpertCard({ expert }: { expert: Expert }) {
    const initials = expert.name.split(' ').map(n => n[0]).join('');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{expert.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4" />
                        {expert.affiliation}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookCheck className="h-4 w-4" />
                    <span>{expert.publicationCount} publication{expert.publicationCount > 1 ? 's' : ''}</span>
                 </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" asChild size="sm">
                    <a href={expert.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Publications
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [researchField, setResearchField] = useState('');
    const [location, setLocation] = useState('');

    const [submittedQuery, setSubmittedQuery] = useState({ name: '', researchField: '', location: '' });

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            const fetchedExperts = await searchExperts('', 'cancer', '', 12);
            setExperts(fetchedExperts);
            setLoading(false);
        }
        fetchInitialData();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmittedQuery({ name, researchField, location });
        const fetchedExperts = await searchExperts(name, researchField, location, 12);
        setExperts(fetchedExperts);
        setLoading(false);
    };

    const hasSearched = submittedQuery.name || submittedQuery.researchField || submittedQuery.location;

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

            <Card>
                <form onSubmit={handleSearch}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Name</label>
                                <Input id="name" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                             <div>
                                <label htmlFor="research" className="text-sm font-medium text-muted-foreground">Research Field</label>
                                <Input id="research" placeholder="e.g. immunology" value={researchField} onChange={(e) => setResearchField(e.target.value)} />
                            </div>
                             <div>
                                <label htmlFor="location" className="text-sm font-medium text-muted-foreground">Location / Affiliation</label>
                                <Input id="location" placeholder="e.g. Boston, MA" value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                        </div>
                        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search Experts
                        </Button>
                    </CardContent>
                </form>
            </Card>

            {loading ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </CardHeader>
                             <CardContent>
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-8 w-36" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : experts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {experts.map((expert, index) => (
                        <ExpertCard key={`${expert.id}-${index}`} expert={expert} />
                    ))}
                </div>
            ) : hasSearched ? (
                 <Card className="flex items-center justify-center h-64 border-dashed col-span-full">
                    <div className="text-center">
                        <p className="text-lg font-medium">No Experts Found</p>
                        <p className="text-sm text-muted-foreground">Your search did not return any results. Try different keywords.</p>
                    </div>
                </Card>
            ) : (
                 <Card className="flex items-center justify-center h-64 border-dashed col-span-full">
                    <div className="text-center">
                         <Microscope className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">Search for Experts</p>
                        <p className="text-sm text-muted-foreground">Use the filters above to find researchers.</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
