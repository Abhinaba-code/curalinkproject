
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchClinicalTrials, searchExperts, searchPublications } from '@/lib/api';
import type { ClinicalTrial, Expert, Publication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TrialCard from '../trials/trial-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, FlaskConical, Users, Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/language-provider';

function ExpertResultCard({ expert }: { expert: Expert }) {
    return (
        <Link href="/dashboard/experts" className="block border rounded-lg p-4 hover:bg-accent transition-colors">
            <p className="font-semibold">{expert.name}</p>
            <p className="text-sm text-muted-foreground">{expert.specialty}</p>
        </Link>
    );
}

function PublicationResultCard({ pub }: { pub: Publication }) {
    return (
        <Link href="/dashboard/publications" className="block border rounded-lg p-4 hover:bg-accent transition-colors">
            <p className="font-semibold">{pub.title}</p>
            <p className="text-sm text-muted-foreground">{pub.journal}, {pub.year}</p>
        </Link>
    );
}

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const { t } = useTranslation();
    
    const [trials, setTrials] = useState<ClinicalTrial[]>([]);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [trialData, publicationData, expertData] = await Promise.all([
                    searchClinicalTrials(query, 3),
                    searchPublications(query, 3),
                    searchExperts(query, 1, 3).then(d => d.results)
                ]);
                setTrials(trialData);
                setPublications(publicationData);
                setExperts(expertData);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };
        performSearch();
    }, [query]);

    if (!query) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <p>{t('search.prompt')}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-8 w-48 mb-4" />
                        <div className="grid gap-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    const noResults = trials.length === 0 && publications.length === 0 && experts.length === 0;

    if (noResults) {
        return (
             <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                     <Search className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-semibold">{t('search.noResults.title', { query })}</p>
                    <p>{t('search.noResults.description')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {trials.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FlaskConical /> {t('search.trials.title')}</CardTitle>
                        <CardDescription>{t('search.trials.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {trials.map(trial => <TrialCard key={trial.id} trial={trial} />)}
                    </CardContent>
                </Card>
            )}

            {publications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> {t('search.publications.title')}</CardTitle>
                        <CardDescription>{t('search.publications.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {publications.map(pub => <PublicationResultCard key={pub.id} pub={pub} />)}
                    </CardContent>
                </Card>
            )}

            {experts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> {t('search.experts.title')}</CardTitle>
                        <CardDescription>{t('search.experts.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {experts.map(expert => <ExpertResultCard key={expert.id} expert={expert} />)}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function SearchPage() {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">{t('search.title')}</h1>
                <p className="text-muted-foreground">
                    {t('search.description')}
                </p>
            </div>
            <Suspense fallback={<div>{t('search.loading')}</div>}>
                <SearchResults />
            </Suspense>
        </div>
    )
}
