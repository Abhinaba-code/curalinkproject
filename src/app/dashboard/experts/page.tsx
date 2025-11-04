'use client';

import { useEffect, useState } from 'react';
import type { Expert, ClinicalTrial } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Microscope, ExternalLink, Loader2, Search, Pin, User, Calendar, Mail, Phone, Plus, Star, Bell, Check, Send } from 'lucide-react';
import { searchExperts, searchClinicalTrials } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/context/favorites-provider';
import { useFollow } from '@/context/follow-provider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import TrialCard from '../trials/trial-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForum } from '@/context/forum-provider';
import { useAuth } from '@/context/auth-provider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


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

function RequestMeetingDialog({ expert, onRequested }: { expert: Expert, onRequested: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { sendMeetingRequest } = useForum();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [reason, setReason] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSendRequest = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.' });
            return;
        }
        sendMeetingRequest(expert, user, reason);
        toast({
            title: "Meeting Request Sent!",
            description: `Your request regarding ${expert.name} has been sent to researchers.`,
        });
        onRequested();
        setIsOpen(false);
        setReason('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Request Meeting
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request a Meeting with {expert.name}</DialogTitle>
                    <DialogDescription>
                        Please provide your details below. Your request will be sent to the researcher.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Your Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Your Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="reason" className="text-right pt-2">
                           Reason for Meeting (Optional)
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="col-span-3 min-h-[100px]"
                            placeholder="Briefly explain why you'd like to connect..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSendRequest}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ExpertProfileDialog({ expert, children }: { expert: Expert, children: React.ReactNode }) {
    const initials = expert.name ? expert.name.split(' ').map(n => n[0]).join('') : '??';
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl">{expert.name}</DialogTitle>
                            <DialogDescription>{expert.specialty}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This is a simulated profile. In a real application, this would contain more details about the health expert.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <Pin className="h-4 w-4 text-muted-foreground" />
                        <span>{expert.address}, {expert.city}, {expert.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>contact@example.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>(555) 123-4567</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ExpertCard({ expert }: { expert: Expert }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isFollowing, toggleFollow } = useFollow();
    const { sendNudgeNotification, removeNudgeNotification, removeMeetingRequest } = useForum();
    const { toast } = useToast();
    const initials = expert.name ? expert.name.split(' ').map(n => n[0]).join('') : '??';
    const favorite = isFavorite(expert.id);
    const following = isFollowing(expert.id);
    const [nudged, setNudged] = useState(false);
    const [meetingRequested, setMeetingRequested] = useState(false);

    const handleFollow = () => {
        toggleFollow(expert);
    };

    const handleNudge = () => {
        if (!nudged) {
            sendNudgeNotification(expert);
            toast({
                title: "Nudge Sent!",
                description: `A notification has been sent to researchers about ${expert.name}.`,
            });
        } else {
            removeNudgeNotification(expert.id);
            toast({
                title: "Nudge Canceled",
                description: `The nudge for ${expert.name} has been recalled.`,
                variant: 'destructive'
            });
        }
        setNudged(!nudged);
    };
    
    const handleCancelRequest = () => {
        removeMeetingRequest(expert.id);
        toast({
            title: "Meeting Request Canceled",
            description: `Your request for ${expert.name} has been withdrawn.`,
            variant: "destructive",
        });
        setMeetingRequested(false);
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
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
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => toggleFavorite(expert, 'expert')}>
                        <Star className={`h-5 w-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    {expert.address}, {expert.city}, {expert.state} {expert.zip}
                 </p>
                 <a href={expert.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
                    <ExternalLink className="h-3 w-3" />
                    View on NPI Registry
                 </a>
            </CardContent>
            <CardFooter>
                 <div className="flex flex-col gap-2 w-full">
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button variant={following ? 'secondary' : 'default'} onClick={handleFollow} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            {following ? 'Unfollow' : 'Follow'}
                        </Button>
                        <ExpertProfileDialog expert={expert}>
                            <Button variant="outline" size="sm" className="w-full"><User className="mr-2 h-4 w-4" />View Profile</Button>
                        </ExpertProfileDialog>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <Button variant="outline" onClick={handleNudge}>
                            {nudged ? <Check className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                            {nudged ? 'Nudged' : 'Nudge to Join'}
                        </Button>
                        {meetingRequested ? (
                             <Button variant="destructive" onClick={handleCancelRequest}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Cancel Request
                            </Button>
                        ) : (
                            <RequestMeetingDialog expert={expert} onRequested={() => setMeetingRequested(true)} />
                        )}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function ExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [trials, setTrials] = useState<ClinicalTrial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentQuery, setCurrentQuery] = useState('Cardiology');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    
    useEffect(() => {
        let isMounted = true;
        async function fetchData(query: string, page: number) {
            setLoading(true);
            try {
                // Fetch both experts and trials
                const [expertData, trialData] = await Promise.all([
                    searchExperts(query, page, PAGE_SIZE),
                    searchClinicalTrials(query, 6) // Fetch 6 trials
                ]);
                
                if (isMounted) {
                    setExperts(expertData.results);
                    setTotalResults(expertData.totalCount);
                    setTrials(trialData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                if(isMounted) {
                    setExperts([]);
                    setTotalResults(0);
                    setTrials([]);
                }
            }
            finally {
                 if (isMounted) {
                    setLoading(false);
                }
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
        setCurrentQuery(searchTerm || 'Cardiology');
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
                    Connect with Health Experts & Research
                </h1>
                <p className="text-muted-foreground">
                    Find providers and clinical trials. Search by specialty, name, or location.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Specialty</CardTitle>
                    <CardDescription>Select a category to find experts and trials in that field.</CardDescription>
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
            
            <Tabs defaultValue="experts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="experts">Health Experts ({totalResults})</TabsTrigger>
                    <TabsTrigger value="trials">Clinical Trials ({trials.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="experts">
                    {loading ? (
                         <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
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
                            <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
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
                         <Card className="mt-4 flex items-center justify-center h-64 border-dashed col-span-full">
                            <div className="text-center">
                                <p className="text-lg font-medium">No Providers Found</p>
                                <p className="text-sm text-muted-foreground">
                                    {currentQuery 
                                        ? `Your search for "${currentQuery}" did not return any results.`
                                        : "Select a category or enter a search term."
                                    }
                                </p>
                            </div>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="trials">
                     {loading ? (
                        <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="space-y-4 rounded-lg border p-6">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="space-y-2 pt-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : trials.length > 0 ? (
                        <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
                            {trials.map((trial) => (
                                <TrialCard key={trial.id} trial={trial} />
                            ))}
                        </div>
                    ) : (
                        <Card className="mt-4 flex items-center justify-center h-64 border-dashed col-span-full">
                            <div className="text-center">
                                <p className="text-lg font-medium">No Trials Found</p>
                                <p className="text-sm text-muted-foreground">
                                    Your search for "{currentQuery}" did not return any trials.
                                </p>
                            </div>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
