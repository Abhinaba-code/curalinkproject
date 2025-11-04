
'use client';

import { useEffect, useState } from 'react';
import { searchPublications } from '@/lib/api';
import type { Publication } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Search, Share2, Star, ExternalLink, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { summarizeMedicalPublication } from '@/ai/flows/ai-summarize-medical-publications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFavorites } from '@/context/favorites-provider';
import { useToast } from '@/hooks/use-toast';

function PublicationCard({ pub }: { pub: Publication }) {
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { toast } = useToast();
    const favorite = isFavorite(pub.id);

    const handleSummarize = async () => {
        setIsLoadingSummary(true);
        setIsDialogOpen(true);
        try {
            // The abstract might be short or unavailable, so we pass title and journal too.
            const contentToSummarize = `${pub.title}. Journal: ${pub.journal}. Abstract: ${pub.abstract}`;
            const result = await summarizeMedicalPublication({ publicationContent: contentToSummarize });
            setSummary(result.summary);
        } catch (error) {
            console.error('AI summary failed:', error);
            setSummary('Sorry, we were unable to generate a summary for this publication.');
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const copyLinkToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(pub.url);
            toast({
              title: 'Link Copied!',
              description: 'The publication link has been copied to your clipboard.',
            });
        } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Copy Failed',
              description: 'Could not copy the link to your clipboard.',
            });
        }
    }

    const handleShare = async () => {
        const shareData = {
          title: pub.title,
          text: `Check out this publication: ${pub.title}`,
          url: pub.url,
        };
    
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (error) {
            // If share fails, copy to clipboard
            await copyLinkToClipboard();
          }
        } else {
            // Fallback for browsers that don't support navigator.share
            await copyLinkToClipboard();
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">{pub.title}</CardTitle>
                    <CardDescription>{pub.authors.join(", ")} &middot; <span className="italic">{pub.journal}, {pub.year}</span></CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{pub.abstract}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={handleSummarize} disabled={isLoadingSummary}>
                            <Bot className="mr-2 h-4 w-4" />
                            AI Summary
                        </Button>
                         <Button variant="ghost" size="sm" asChild>
                            <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Source
                            </a>
                        </Button>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(pub, 'publication')}>
                             <Star className={`h-5 w-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">AI Summary</DialogTitle>
                        <DialogDescription>This summary is generated by AI and may not be fully accurate.</DialogDescription>
                    </DialogHeader>
                    {isLoadingSummary ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="prose prose-sm max-h-[60vh] overflow-y-auto rounded-md border p-4">
                            <p>{summary}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}


export default function PublicationsPage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('health');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        async function fetchPublications() {
            if (!searchQuery) {
                setPublications([]);
                 setLoading(false);
                return;
            };
            setLoading(true);
            const fetchedPublications = await searchPublications(searchQuery);
            setPublications(fetchedPublications);
            setLoading(false);
        }
        fetchPublications();
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const location = [city, country].filter(Boolean).join(', ');
        const fullQuery = [searchTerm, location].filter(Boolean).join(' ');
        setSearchQuery(fullQuery || 'health');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">
                    Explore Medical Publications
                </h1>
                <p className="text-muted-foreground">
                    Stay up-to-date with the latest medical research.
                </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-lg relative">
                        <Input
                            placeholder="e.g. cancer therapy, immunology..."
                            className="pr-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                            <label htmlFor="city" className="text-sm font-medium text-muted-foreground">City</label>
                            <Input id="city" placeholder="e.g. Boston" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                            <div>
                            <label htmlFor="country" className="text-sm font-medium text-muted-foreground">Country</label>
                            <Input id="country" placeholder="e.g. United States" value={country} onChange={(e) => setCountry(e.target.value)} />
                            </div>
                        </div>
                        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Search by Location
                        </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {loading ? (
                <div className="grid gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-5/6" />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <Skeleton className="h-8 w-28" />
                                <div className="flex gap-2">
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 publications.length > 0 ? (
                    <div className="grid gap-6">
                        {publications.map((pub) => (
                            <PublicationCard key={pub.id} pub={pub} />
                        ))}
                    </div>
                ) : searchQuery && !loading ? (
                    <Card className="flex items-center justify-center h-64 border-dashed">
                        <div className="text-center">
                            <p className="text-lg font-medium">No Publications Found</p>
                            <p className="text-sm text-muted-foreground">Your search for "{searchQuery}" did not return any results.</p>
                        </div>
                    </Card>
                ) : (
                     <Card className="flex items-center justify-center h-64 border-dashed">
                        <div className="text-center">
                            <p className="text-lg font-medium">Search for Publications</p>
                            <p className="text-sm text-muted-foreground">Enter a term in the search bar to find medical publications.</p>
                        </div>
                    </Card>
                )
            )}
        </div>
    )
}
