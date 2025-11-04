
'use client';

import { useEffect, useState } from 'react';
import type { Expert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Microscope, ExternalLink, Loader2, Search, Pin, Star } from 'lucide-react';
import { searchExperts } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFavorites } from '@/context/favorites-provider';


const specialties = [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", 
    "Neurology", "Oncology", "Orthopedics", "Pediatrics", 
    "Psychiatry", "Pulmonology", "Radiology", "Urology"
];

const randomSpecialties = ["Cardiology", "Neurology", "Oncology", "Pediatrics", "Dermatology"];

function ExpertCard({ expert }: { expert: Expert }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const initials = expert.name ? expert.name.split(' ').map(n => n[0]).join('') : '??';
    const favorite = isFavorite(expert.id);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{expert.name || 'Name not available'}</CardTitle>
                    {expert.specialty && (
                         <CardDescription className="flex items-center gap-2 mt-1">
                            <Microscope className="h-4 w-4" />
                            {expert.specialty}
                        </CardDescription>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    {expert.address}, {expert.city}, {expert.state} {expert.zip}
                 </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                 <Button variant="outline" asChild size="sm">
                    <a href={expert.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on NPI Registry
                    </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(expert, 'expert')}>
                    <Star className={`h-5 w-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchForm, setSearchForm] = useState({ specialty: '', city: '', state: '' });
    const [submittedQuery, setSubmittedQuery] = useState({ specialty: '', city: '', state: '' });
    
    useEffect(() => {
        const randomSpecialty = randomSpecialties[Math.floor(Math.random() * randomSpecialties.length)];
        setSubmittedQuery({ specialty: randomSpecialty, city: '', state: '' });
    }, []);

    useEffect(() => {
        if (!submittedQuery.specialty && !submittedQuery.city && !submittedQuery.state) {
            setLoading(false);
            return;
        };

        async function fetchInitialData() {
            setLoading(true);
            const fetchedExperts = await searchExperts(submittedQuery.specialty, submittedQuery.city, submittedQuery.state, 12);
            setExperts(fetchedExperts);
            setLoading(false);
        }

        fetchInitialData();
    }, [submittedQuery]);

    const handleInputChange = (name: string, value: string) => {
        setSearchForm(prev => ({...prev, [name]: value}));
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedQuery(searchForm);
    };

    const hasSearched = submittedQuery.specialty || submittedQuery.city || submittedQuery.state;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">
                    Connect with Experts
                </h1>
                <p className="text-muted-foreground">
                    Find healthcare providers in the US via the NPI Registry.
                </p>
            </div>

            <Card>
                <form onSubmit={handleSearch}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="specialty" className="text-sm font-medium text-muted-foreground">Category</label>
                                <Select value={searchForm.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                                    <SelectTrigger id="specialty">
                                        <SelectValue placeholder="Select a specialty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specialties.map(spec => (
                                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <label htmlFor="city" className="text-sm font-medium text-muted-foreground">City</label>
                                <Input id="city" placeholder="e.g. New York" value={searchForm.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                            </div>
                             <div>
                                <label htmlFor="state" className="text-sm font-medium text-muted-foreground">State (2-letter code)</label>
                                <Input id="state" placeholder="e.g. NY" value={searchForm.state} onChange={(e) => handleInputChange('state', e.target.value)} maxLength={2}/>
                            </div>
                        </div>
                        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search Providers
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
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-8 w-36" />
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
            ) : hasSearched ? (
                 <Card className="flex items-center justify-center h-64 border-dashed col-span-full">
                    <div className="text-center">
                        <p className="text-lg font-medium">No Providers Found</p>
                        <p className="text-sm text-muted-foreground">Your search did not return any results. Try different or broader criteria.</p>
                    </div>
                </Card>
            ) : (
                 <Card className="flex items-center justify-center h-64 border-dashed col-span-full">
                    <div className="text-center">
                         <Microscope className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">Search for Providers</p>
                        <p className="text-sm text-muted-foreground">Use the filters above to find healthcare providers.</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
