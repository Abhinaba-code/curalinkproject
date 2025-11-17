

'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Stethoscope,
  User,
  Edit,
  X,
  Building,
  BookUser,
  Link2,
  Pill,
  Ban,
  ClipboardList,
  FlaskConical,
  Loader2,
  Check,
  Mail,
  Send,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useFollow } from '@/context/follow-provider';
import type { ClinicalTrial, Expert } from '@/lib/types';
import { useTranslation } from '@/context/language-provider';
import { useEffect, useMemo, useState } from 'react';
import { searchClinicalTrials } from '@/lib/api';
import TrialCard from '../trials/trial-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useForum, type Notification } from '@/context/forum-provider';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function ProfileDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function FollowedExpertCard({
  expert,
  onUnfollow,
}: {
  expert: Expert;
  onUnfollow: (expert: Expert) => void;
}) {
  const { t } = useTranslation();
  const initials = expert.name
    ? expert.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '??';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={expert.avatarUrl} alt={expert.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{expert.name}</p>
          <p className="text-sm text-muted-foreground">{expert.specialty}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onUnfollow(expert)}>
        <X className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">{t('profile.unfollowAria')}</span>
      </Button>
    </div>
  );
}

function ConnectionRequestCard({ request, onAccept, onDecline }: { request: Notification, onAccept: (request: Notification) => void, onDecline: (id: string) => void }) {
    const fromUser = {
        id: request.authorId,
        name: request.authorName,
        avatarUrl: `https://picsum.photos/seed/${request.authorId}/200/200`,
        specialty: 'Researcher', // Placeholder
    };
    const initials = fromUser.name ? fromUser.name.split(' ').map(n => n[0]).join('') : 'U';

    return (
        <Card className="bg-secondary/50">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={fromUser.avatarUrl} alt={fromUser.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{fromUser.name} wants to connect.</p>
                        {request.originalRequest?.content && (
                            <p className="text-sm text-muted-foreground mt-1 p-2 border bg-background rounded-md">
                                "{request.originalRequest.content}"
                            </p>
                        )}
                         <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => onAccept(request)}>
                                <Check className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onDecline(request.id)}>
                                <X className="mr-2 h-4 w-4" /> Decline
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function EditRequestDialog({ request, onCancel, onUpdate }: { request: Notification; onCancel: (id: string) => void; onUpdate: (id: string, newContent: string, newName?: string, newEmail?: string) => void; }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(request.originalRequest?.content || '');
  const [name, setName] = useState(request.authorName);
  const [email, setEmail] = useState(''); // Assuming we don't have sender's email in notification, so it's blank.
  const recipientName = request.postTitle;


  const handleUpdate = () => {
    onUpdate(request.id, message, name, email);
    setIsOpen(false);
  };
  
  const handleCancel = () => {
      onCancel(request.id);
      setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="block p-3 rounded-lg border hover:bg-accent cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://picsum.photos/seed/${request.postId}/200/200`} alt={recipientName} />
                <AvatarFallback>{recipientName ? recipientName.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Request to {recipientName}</p>
                <p className="text-xs text-muted-foreground">Sent {formatDistanceToNow(new Date(parseInt(request.id.split('-')[1])), { addSuffix: true })}</p>
              </div>
            </div>
             <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Request to {recipientName}</DialogTitle>
          <DialogDescription>
            You can update your message or cancel the request.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="edit-name">Your Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-email">Your Email</Label>
                <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-message">Your Message</Label>
                <Textarea 
                    id="edit-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                />
            </div>
        </div>
        <DialogFooter className="justify-between">
          <Button variant="destructive" onClick={handleCancel}>Cancel Request</Button>
          <div className="flex gap-2">
            <DialogClose asChild><Button variant="outline">{t('common.cancel')}</Button></DialogClose>
            <Button onClick={handleUpdate}>
                <Send className="mr-2 h-4 w-4" /> Update & Resend
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function RelevantTrialsSection() {
    const { user } = useAuth();
    const [trials, setTrials] = useState<ClinicalTrial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrials = async () => {
            if (user?.interests && user.interests.length > 0) {
                setLoading(true);
                const query = user.interests.join(' OR ');
                const fetchedTrials = await searchClinicalTrials(query, 3);
                setTrials(fetchedTrials);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        fetchTrials();
    }, [user?.interests]);

    if (!user?.interests || user.interests.length === 0) {
        return null;
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FlaskConical />
                    Relevant Clinical Trials
                </CardTitle>
                <CardDescription>
                    Based on your interests, you may be eligible for these trials.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {trials.map((trial) => (
                            <TrialCard key={trial.id} trial={trial} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                        <p>No specific clinical trials found for your interests at this time.</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link href="/dashboard/trials">Explore all trials</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default function ProfilePage() {
  const { user } = useAuth();
  const { followedExperts, toggleFollow } = useFollow();
  const { allNotifications, deleteNotification, updateMeetingRequest } = useForum();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { connectionRequests, outgoingRequests } = useMemo(() => {
    if (!user) return { connectionRequests: [], outgoingRequests: [] };

    const incoming = allNotifications.filter(
      (n) => n.type === 'meeting_request' && n.recipientId === user.id && user.role === 'researcher'
    );

    const outgoing = allNotifications.filter(
      (n) => n.type === 'meeting_request' && n.senderId === user.id
    );

    return { connectionRequests: incoming, outgoingRequests: outgoing };
  }, [allNotifications, user]);

  const handleAcceptRequest = (request: Notification) => {
    // In a real app, you might need more info to create an 'Expert' object
    const newConnection: Expert = {
        id: request.authorId,
        name: request.authorName,
        specialty: 'Researcher', // Placeholder
        address: '', city: '', state: '', zip: '', url: '#',
        avatarUrl: `https://picsum.photos/seed/${request.authorId}/200/200`
    };
    toggleFollow(newConnection);
    deleteNotification(request.id);
    toast({
      title: "Connection Added",
      description: `You are now connected with ${request.authorName}.`
    });
  };

  const handleDeclineRequest = (id: string) => {
    deleteNotification(id);
    toast({
      variant: 'destructive',
      title: "Request Declined",
      description: "The connection request has been removed."
    });
  };

  const handleCancelRequest = (id: string) => {
    deleteNotification(id);
    toast({
        title: "Request Cancelled",
        description: "Your connection request has been withdrawn."
    });
  };
  
  const handleUpdateRequest = (id: string, newContent: string, newName?: string, newEmail?: string) => {
    updateMeetingRequest(id, newContent, newName, newEmail);
    toast({
        title: "Request Updated",
        description: "Your message has been updated and resent."
    });
  };


  if (!user) {
    return null;
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'U';
    
  const isResearcher = user.role === 'researcher';

  const editProfileLink = isResearcher
      ? '/dashboard/create-researcher-profile'
      : '/dashboard/create-profile';
      
  const hasIncomingRequests = connectionRequests.length > 0;
  const hasOutgoingRequests = outgoingRequests.length > 0;
  const hasConnections = followedExperts.length > 0;
  
  const connectionsTitle = isResearcher ? t('profile.connections.title') : t('profile.following.title');
  const connectionsDescription = isResearcher ? t('profile.connections.description') : t('profile.following.description');
  const showEmptyState = !hasIncomingRequests && !hasOutgoingRequests && !hasConnections;


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('profile.title')}</h1>
          <p className="text-muted-foreground">
            {t('profile.description')}
          </p>
        </div>
        <Button asChild>
          <Link href={editProfileLink}>
            <Edit className="mr-2 h-4 w-4" />
            {t('profile.editButton')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <Badge className="capitalize mt-2">{t('roles.' + user.role)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 border-t">
          {user.role === 'patient' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileDetail
                icon={<User className="h-5 w-5" />}
                label={t('profile.patient.about')}
                value={user.bio}
              />
              <ProfileDetail
                icon={<Calendar className="h-5 w-5" />}
                label={t('profile.patient.dob')}
                value={user.dob ? format(new Date(user.dob), 'PPP') : null}
              />
              <ProfileDetail
                icon={<MapPin className="h-5 w-5" />}
                label={t('profile.patient.location')}
                value={user.location}
              />
              <ProfileDetail
                icon={<Stethoscope className="h-5 w-5" />}
                label={t('profile.patient.interests')}
                value={user.interests?.join(', ')}
              />
              <ProfileDetail
                icon={<Pill className="h-5 w-5" />}
                label={t('profile.patient.medications')}
                value={user.medications?.join(', ')}
              />
              <ProfileDetail
                icon={<Ban className="h-5 w-5" />}
                label={t('profile.patient.allergies')}
                value={user.allergies?.join(', ')}
              />
              <ProfileDetail
                icon={<ClipboardList className="h-5 w-5" />}
                label={t('profile.patient.pastTests')}
                value={user.pastMedicalTests?.join(', ')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileDetail
                icon={<Building className="h-5 w-5" />}
                label={t('profile.researcher.affiliation')}
                value={user.affiliation}
              />
              <ProfileDetail
                icon={<User className="h-5 w-5" />}
                label={t('profile.researcher.bio')}
                value={user.bio}
              />
              <ProfileDetail
                icon={<Stethoscope className="h-5 w-5" />}
                label={t('profile.researcher.specialties')}
                value={user.specialties?.join(', ')}
              />
              <ProfileDetail
                icon={<BookUser className="h-5 w-5" />}
                label={t('profile.researcher.researchInterests')}
                value={user.researchInterests?.join(', ')}
              />
              <ProfileDetail
                icon={<Link2 className="h-5 w-5" />}
                label={t('profile.researcher.orcid')}
                value={user.orcidId}
              />
              <ProfileDetail
                icon={<Link2 className="h-5 w-5" />}
                label={t('profile.researcher.researchGate')}
                value={
                  user.researchGateProfile ? (
                    <a
                      href={user.researchGateProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {user.researchGateProfile}
                    </a>
                  ) : null
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {user.role === 'patient' && <RelevantTrialsSection />}

      {isResearcher && (
        <Card>
          <CardHeader>
            <CardTitle>{connectionsTitle}</CardTitle>
            <CardDescription>{connectionsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {hasIncomingRequests && (
                  <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground">Pending Incoming Requests</h3>
                      <div className="grid gap-4">
                          {connectionRequests.map((req) => (
                            <ConnectionRequestCard key={req.id} request={req} onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />
                          ))}
                      </div>
                  </div>
              )}
              
              {hasOutgoingRequests && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Pending Outgoing Requests</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {outgoingRequests.map((req) => (
                          <EditRequestDialog key={req.id} request={req} onCancel={handleCancelRequest} onUpdate={handleUpdateRequest} />
                      ))}
                    </div>
                  </div>
              )}

              {(hasIncomingRequests || hasOutgoingRequests) && hasConnections && <Separator />}

            {hasConnections && (
              <div className="space-y-4">
                  {(hasIncomingRequests || hasOutgoingRequests) && <h3 className="text-sm font-semibold text-muted-foreground">Current Connections</h3>}
                  <div className="grid gap-4 md:grid-cols-2">
                  {followedExperts.map((expert) => (
                      <FollowedExpertCard
                      key={expert.id}
                      expert={expert}
                      onUnfollow={() => toggleFollow(expert)}
                      />
                  ))}
                  </div>
              </div>
            )}
            
            {showEmptyState && (
              <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                  <p>You have no connections or pending requests.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/dashboard/experts">Find Collaborators</Link>
                  </Button>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {!isResearcher && hasConnections && (
          <Card>
            <CardHeader>
              <CardTitle>{connectionsTitle}</CardTitle>
              <CardDescription>{connectionsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
               {followedExperts.map((expert) => (
                    <FollowedExpertCard
                    key={expert.id}
                    expert={expert}
                    onUnfollow={() => toggleFollow(expert)}
                    />
                ))}
            </CardContent>
        </Card>
      )}
      {!isResearcher && !hasConnections && (
           <Card>
            <CardHeader>
              <CardTitle>{connectionsTitle}</CardTitle>
              <CardDescription>{connectionsDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                     <p>{t('profile.following.empty.title')}</p>
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/dashboard/experts">{t('profile.following.empty.link')}</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
