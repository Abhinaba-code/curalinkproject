

'use client';

import { useEffect, useState } from 'react';
import type { Expert, ClinicalTrial, Publication } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Microscope, ExternalLink, Loader2, Search, Pin, User, Calendar, Mail, Phone, Plus, Star, Bell, Check, Send, Award, BookMarked, Medal, Link as LinkIcon, Users as UsersIcon, MessageSquare } from 'lucide-react';
import { searchExperts, searchClinicalTrials, searchPublications } from '@/lib/api';
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
import { useHistory } from '@/context/history-provider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/context/language-provider';
import { getExpertRecommendations } from '@/ai/flows/ai-powered-expert-recommendations';
import Link from 'next/link';


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

function MessageDialog({ expert, children }: { expert: Expert, children: React.ReactNode }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { sendMeetingRequest, allNotifications } = useForum();
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const conversationHistory = allNotifications.filter(n =>
        (n.senderId === user?.id && n.recipientId === expert.id) ||
        (n.senderId === expert.id && n.recipientId === user?.id)
    ).sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));

    const handleSendMessage = () => {
        if (!user || !message.trim()) {
            toast({ variant: 'destructive', title: 'Message cannot be empty.', duration: 3000 });
            return;
        }
        sendMeetingRequest(expert, user, message, 'meeting_reply'); // Use a different type for direct messages
        
        toast({ title: 'Message Sent!', description: `Your message to ${expert.name} has been sent.`, duration: 3000 });
        setMessage('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg border-4 border-primary/20">
                <DialogHeader>
                    <DialogTitle>Message with {expert.name}</DialogTitle>
                    <DialogDescription>Your conversation history.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 p-4 border rounded-md">
                    <div className="space-y-4">
                        {conversationHistory.map(notif => (
                            <div key={notif.id} className={`flex items-end gap-2 ${notif.senderId === user?.id ? 'justify-end' : ''}`}>
                                {notif.senderId !== user?.id && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://picsum.photos/seed/${notif.senderId}/200/200`} />
                                        <AvatarFallback>{notif.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${notif.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {notif.originalRequest?.content || "..."}
                                </div>
                            </div>
                        ))}
                        {conversationHistory.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</p>}
                    </div>
                </ScrollArea>
                <div className="grid gap-4 py-4">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[80px]"
                        placeholder="Type your message..."
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">{t('common.close')}</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSendMessage}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function RequestMeetingDialog({ expert, onRequested }: { expert: Expert, onRequested: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { sendMeetingRequest } = useForum();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [reason, setReason] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleSendRequest = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.', duration: 3000 });
            return;
        }
        sendMeetingRequest(expert, user, reason);
        
        const isResearcher = user.role === 'researcher';
        const title = isResearcher ? "Connection Request Sent!" : "Meeting Request Sent!";
        const description = isResearcher
            ? `Your request to connect with ${expert.name} has been sent.`
            : `Your request regarding ${expert.name} has been sent to researchers.`;

        toast({ title, description, duration: 3000 });
        onRequested();
        setIsOpen(false);
        setReason('');
    };
    
    const isResearcherToResearcher = user?.role === 'researcher';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    {isResearcherToResearcher ? (
                        <UsersIcon className="mr-2 h-4 w-4" />
                    ) : (
                        <Calendar className="mr-2 h-4 w-4" />
                    )}
                    {isResearcherToResearcher ? 'Connect' : t('notifications.types.meeting_request')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-4 border-primary/20">
                <DialogHeader>
                    <DialogTitle>
                         {isResearcherToResearcher 
                            ? `Connect with ${expert.name}`
                            : t('notifications.meetingRequest.dialogTitle', { name: expert.name })}
                    </DialogTitle>
                    <DialogDescription>
                       {isResearcherToResearcher
                            ? `Send a message to ${expert.name} to start a conversation.`
                            : t('notifications.meetingRequest.dialogDescription', { expertName: expert.name })}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('auth.login.title')}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">{t('notifications.meetingRequest.messageLabel')}</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[120px]"
                            placeholder={isResearcherToResearcher
                                ? `Hi ${expert.name.split(' ')[0]}, I'd like to connect regarding...`
                               : t('notifications.meetingRequest.messagePlaceholder')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSendRequest}>
                        <Send className="mr-2 h-4 w-4" />
                        {isResearcherToResearcher ? 'Send Request' : t('notifications.meetingRequest.sendButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ExpertProfileDialog({ expert, children }: { expert: Expert, children: React.ReactNode }) {
    const { t } = useTranslation();
    const initials = expert.name ? expert.name.split(' ').map(n => n[0]).join('') : '??';
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loadingPubs, setLoadingPubs] = useState(false);
    
    const trialsOfInterest = [
        "NCT04485958: A Study of a New Drug for Lung Cancer",
        "NCT03876121: Immunotherapy for Advanced Melanoma",
    ];

    const fetchExpertPublications = async () => {
        setLoadingPubs(true);
        const query = `${expert.name}[Author] AND (${expert.specialty.split(',').join(' OR ')})`;
        const fetchedPublications = await searchPublications(query, 3);
        setPublications(fetchedPublications);
        setLoadingPubs(false);
    };

    return (
        <Dialog onOpenChange={(open) => { if (open) fetchExpertPublications(); }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0">
                <DialogHeader className="p-6 pb-4">
                    <div className="flex flex-col items-center text-center gap-4">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl">{expert.name}</DialogTitle>
                            <DialogDescription>{expert.specialty}</DialogDescription>
                            <Badge variant="secondary" className="mt-2">
                                <Medal className="mr-1 h-3 w-3 text-yellow-500" />
                                Verified
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[40vh] px-6">
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">{t('profile.researcher.specialties')}</h4>
                            <div className="flex items-center gap-2 text-sm">
                                <Microscope className="h-4 w-4 text-muted-foreground" />
                                <span>{expert.specialty}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">Experience</h4>
                            <p className="text-sm text-muted-foreground">15+ years in clinical practice and research.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">{t('profile.researcher.affiliation')}</h4>
                            <div className="flex items-center gap-2 text-sm">
                                <Pin className="h-4 w-4 text-muted-foreground" />
                                <span>{expert.address}, {expert.city}, {expert.state}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">Recent Publications</h4>
                            {loadingPubs ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ) : publications.length > 0 ? (
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {publications.map((pub) => (
                                        <li key={pub.id}>
                                            <a href={pub.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary group">
                                                <span className="font-medium group-hover:underline">{pub.title}</span>
                                                <div className="text-xs flex items-center gap-1">
                                                     <LinkIcon className="h-3 w-3" /> {pub.journal}, {pub.year}
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent publications found.</p>
                            )}
                        </div>
                         <div className="space-y-4">
                            <h4 className="font-semibold text-primary">Clinical Trials of Interest</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {trialsOfInterest.map((trial, index) => (
                                    <li key={index}>{trial}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary">Certifications</h4>
                            <div className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span>Board Certified in {expert.specialty}</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                 <DialogFooter className="p-6 pt-4 border-t flex-col sm:flex-col sm:space-x-0 gap-2">
                    <Button asChild>
                        <Link href={`/dashboard/forums?tag=${encodeURIComponent(expert.specialty)}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Discussions
                        </Link>
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">{t('common.close')}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ExpertCard({ expert, isTopMatch }: { expert: Expert, isTopMatch: boolean }) {
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isFollowing, toggleFollow, followedExperts } = useFollow();
    const { toast } = useToast();
    const { notifications, sendMeetingRequest, removeMeetingRequest } = useForum();
    const initials = expert.name ? expert.name.split(' ').map(n => n[0]).join('') : '??';
    const favorite = isFavorite(expert.id);
    const following = isFollowing(expert.id);

    const isRequestPending = notifications.some(
        n => n.type === 'meeting_request' && n.postId === expert.id && n.senderId === user?.id
    );

    const [meetingRequested, setMeetingRequested] = useState(isRequestPending);

    const handleFollow = () => {
        toggleFollow(expert);
    };

    const handleCancelRequest = () => {
        removeMeetingRequest(expert.id);
        toast({
            title: "Connection Request Canceled",
            description: `Your request to ${expert.name} has been withdrawn.`,
            variant: "destructive",
            duration: 3000,
        });
        setMeetingRequested(false);
    };
    
    const isCurrentUser = user?.id === expert.id;
    const isResearcher = user?.role === 'researcher';

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
                             {isTopMatch && (
                                <Badge className="mt-2" variant="default">
                                    <Star className="mr-1 h-3 w-3" />
                                    Top Match
                                </Badge>
                            )}
                        </div>
                    </div>
                    {!isCurrentUser && (
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(expert, 'expert')}>
                            <Star className={`h-5 w-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                        </Button>
                    )}
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
            {!isCurrentUser && (
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
                            {isResearcher ? (
                                isFollowing(expert.id) ? (
                                     <MessageDialog expert={expert}>
                                        <Button variant="outline">
                                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                                        </Button>
                                    </MessageDialog>
                                ) : meetingRequested ? (
                                    <Button variant="secondary" disabled>
                                        <Check className="mr-2 h-4 w-4" />
                                        Request Sent
                                    </Button>
                                ) : (
                                    <RequestMeetingDialog expert={expert} onRequested={() => setMeetingRequested(true)} />
                                )
                             ) : (
                                <RequestMeetingDialog expert={expert} onRequested={() => setMeetingRequested(true)} />
                            )}
                        </div>
                    </div>
                </CardFooter>
            )}
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
    const { addHistoryItem } = useHistory();
    const { t } = useTranslation();
    const [topMatches, setTopMatches] = useState<string[]>([]);

    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
    
    useEffect(() => {
        let isMounted = true;
        async function fetchData(query: string, page: number) {
            setLoading(true);
            setTopMatches([]);
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

                    if (expertData.results.length > 0) {
                        try {
                            const recommendations = await getExpertRecommendations({ researchInterests: query });
                            setTopMatches(recommendations.expertRecommendations);
                        } catch (aiError) {
                            console.error("AI recommendation failed:", aiError);
                        }
                    }
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
        const finalQuery = searchTerm || 'Cardiology';
        setCurrentPage(1);
        setCurrentQuery(finalQuery);

        addHistoryItem({
            type: 'expert_search',
            query: finalQuery,
            link: '/dashboard/experts'
        });
    };

    const handleCategoryClick = (category: string) => {
        setSearchTerm(category);
        setCurrentPage(1);
        setCurrentQuery(category);
        addHistoryItem({
            type: 'expert_search',
            query: category,
            link: '/dashboard/experts'
        });
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
                    Connect with Researchers & Specialists
                </h1>
                <p className="text-muted-foreground">
                    Find specialists and clinical trials. Search by specialty, name, or location.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Specialty</CardTitle>
                    <CardDescription>Select a category to find specialists and trials in that field.</CardDescription>
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
                    <TabsTrigger value="experts">Researchers ({totalResults})</TabsTrigger>
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
                                    <ExpertCard 
                                        key={expert.id} 
                                        expert={expert}
                                        isTopMatch={topMatches.includes(expert.name)} 
                                    />
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
                                <p className="text-lg font-medium">No Specialists Found</p>
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
