'use client';

import { useEffect, useState } from 'react';
import type { Expert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Microscope, ExternalLink, Loader2, Search, Pin, Star } from 'lucide-react';
import { searchExperts } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/context/favorites-provider';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 12;

const CATEGORIES = [
    "Cardiology",
    "Oncology",
    "Neurology",
    "Pediatrics",
    "Dermatology",
    "Orthopedics",
    "Radiology",
];

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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentQuery, setCurrentQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    
    useEffect(() => {
        let isMounted = true;
        async function fetchData(query: string, page: number) {
            setLoading(true);
            const { results, totalCount } = await searchExperts(query, page, PAGE_SIZE);
            if (isMounted) {
                setExperts(results);
                setTotalResults(totalCount);
                setLoading(false);
            }
        }

        fetchData(currentQuery, currentPage);

        return () => {
            isMounted = false;
        };
    }, [currentQuery, currentPage]);
    
    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        setCurrentPage(1);
        setCurrentQuery(searchTerm);
    };

    const handleCategoryClick = (category: string) => {
        setSearchTerm(category);
        setCurrentPage(1);
        setCurrentQuery(category);
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">
                    Connect with Health Experts
                </h1>
                <p className="text-muted-foreground">
                    Find healthcare providers in the US via the NPI Registry. Search by name, specialty, or location.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Specialty</CardTitle>
                    <CardDescription>Select a category to find experts in that field.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {CATEGORIES.map(category => (
                        <Button
                            key={category}
                            variant={currentQuery === category ? 'default' : 'outline'}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <form onSubmit={handleSearch}>
                <div className="flex gap-4">
                    <Input 
                        id="expert-search" 
                        placeholder="Or type a custom search, e.g. Dr. John Doe..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <Button type="submit" disabled={loading}>
                        {loading && searchTerm === currentQuery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </div>
            </form>

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
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {experts.map((expert) => (
                            <ExpertCard key={expert.id} expert={expert} />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                 <Card className="flex items-center justify-center h-64 border-dashed col-span-full">
                    <div className="text-center">
                        <p className="text-lg font-medium">No Providers Found</p>
                        <p className="text-sm text-muted-foreground">
                            {currentQuery 
                                ? `Your search for "${currentQuery}" did not return any results. Try a different category or search term.`
                                : "Select a category or enter a search term to find health experts."
                            }
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
