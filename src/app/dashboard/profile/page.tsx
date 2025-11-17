
'use client';

import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { useFollow } from '@/context/follow-provider';
import type { ClinicalTrial, Expert } from '@/lib/types';
import { useTranslation } from '@/context/language-provider';
import { useEffect, useState } from 'react';
import { searchClinicalTrials } from '@/lib/api';
import TrialCard from '../trials/trial-card';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { t } = useTranslation();

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
        <CardHeader className="flex flex-row items-center gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>{isResearcher ? t('profile.connections.title') : t('profile.following.title')}</CardTitle>
          <CardDescription>{isResearcher ? t('profile.connections.description') : t('profile.following.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {followedExperts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {followedExperts.map((expert) => (
                <FollowedExpertCard
                  key={expert.id}
                  expert={expert}
                  onUnfollow={() => toggleFollow(expert)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
              <p>{t('profile.following.empty.title')}</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dashboard/experts">{t('profile.following.empty.link')}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    