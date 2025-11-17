
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-provider';
import { searchClinicalTrials, searchExperts, searchPublications } from '@/lib/api';
import type { ClinicalTrial, Expert, Publication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, FlaskConical, Users, ArrowRight, BookOpen, User, Microscope } from 'lucide-react';
import Link from 'next/link';

const RecommendationItem = ({ href, icon, title, subtitle }: { href: string, icon: React.ReactNode, title: string, subtitle?: string }) => (
    <Link href={href} className="block p-3 rounded-lg hover:bg-accent transition-colors">
        <div className="flex items-center gap-4">
            <div className="bg-muted p-2 rounded-full">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-sm">{title}</p>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </div>
    </Link>
);


export function Recommendations() {
    const { user } = useAuth();
    const [trials, setTrials] = useState<ClinicalTrial[]>([]);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user?.interests || user.interests.length === 0) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const query = user.interests.join(' OR ');
                const [trialData, publicationData, expertData] = await Promise.all([
                    searchClinicalTrials(query, 2),
                    searchPublications(query, 2),
                    searchExperts(query, 1, 2).then(d => d.results)
                ]);
                setTrials(trialData);
                setPublications(publicationData);
                setExperts(expertData);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [user?.interests]);

    if (!user?.interests || user.interests.length === 0) {
        return null;
    }
    
    const showCard = !loading && (trials.length > 0 || publications.length > 0 || experts.length > 0);

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Top Recommendations For You</CardTitle>
                <CardDescription>Based on your profile, here are some trials, readings, and experts you might be interested in.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid md:grid-cols-3 gap-4">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                    </div>
                ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {trials.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /> Trials</h3>
                            <div className="space-y-2">
                                {trials.map(trial => (
                                    <RecommendationItem
                                        key={trial.id}
                                        href="/dashboard/trials"
                                        icon={<FlaskConical className="h-4 w-4" />}
                                        title={trial.title}
                                        subtitle={trial.phase}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {publications.length > 0 && (
                        <div>
                             <h3 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Readings</h3>
                             <div className="space-y-2">
                                {publications.map(pub => (
                                    <RecommendationItem
                                        key={pub.id}
                                        href="/dashboard/publications"
                                        icon={<FileText className="h-4 w-4" />}
                                        title={pub.title}
                                        subtitle={`${pub.journal}, ${pub.year}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {experts.length > 0 && (
                        <div>
                             <h3 className="font-semibold mb-2 flex items-center gap-2"><Microscope className="h-5 w-5 text-primary" /> Researchers</h3>
                             <div className="space-y-2">
                                {experts.map(expert => (
                                    <RecommendationItem
                                        key={expert.id}
                                        href="/dashboard/experts"
                                        icon={<User className="h-4 w-4" />}
                                        title={expert.name}
                                        subtitle={expert.specialty}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                )}
                 {!loading && !showCard && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No specific recommendations found at this time.</p>
                        <p className="text-sm">Complete your profile to get better recommendations.</p>
                        <Button variant="link" asChild className="mt-2">
                           <Link href="/dashboard/profile">Update Profile</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

