

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useTranslation } from '@/context/language-provider';

export default function CreateResearcherProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [affiliation, setAffiliation] = useState(user?.affiliation || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [specialties, setSpecialties] = useState(user?.specialties?.join(', ') || '');
  const [researchInterests, setResearchInterests] = useState(user?.researchInterests?.join(', ') || '');
  const [orcidId, setOrcidId] = useState(user?.orcidId || '');
  const [researchGateProfile, setResearchGateProfile] = useState(user?.researchGateProfile || '');
  
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!fullName || !affiliation || !specialties || !researchInterests) {
      toast({
        variant: 'destructive',
        title: t('createProfile.researcher.error.title'),
        description: t('createProfile.researcher.error.description'),
      });
      setLoading(false);
      return;
    }

    try {
      await updateUserProfile({
        name: fullName,
        affiliation,
        bio,
        specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
        researchInterests: researchInterests.split(',').map(i => i.trim()).filter(Boolean),
        orcidId,
        researchGateProfile,
      });

      toast({
        title: t('createProfile.researcher.success.title'),
        description: t('createProfile.researcher.success.description'),
      });
      router.push('/dashboard');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: t('createProfile.researcher.saveFailed.title'),
        description: error.message || t('createProfile.researcher.saveFailed.description'),
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-fade-in">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            {t('createProfile.researcher.title')}
          </CardTitle>
          <CardDescription>
            {t('createProfile.researcher.description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">{t('createProfile.researcher.fullName.label')}</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('createProfile.researcher.fullName.placeholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliation">{t('createProfile.researcher.affiliation.label')}</Label>
              <Input
                id="affiliation"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder={t('createProfile.researcher.affiliation.placeholder')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">{t('createProfile.researcher.bio.label')}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('createProfile.researcher.bio.placeholder')}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.researcher.bio.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">{t('createProfile.researcher.specialties.label')}</Label>
              <Input
                id="specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder={t('createProfile.researcher.specialties.placeholder')}
                required
              />
               <p className="text-xs text-muted-foreground">
                {t('createProfile.researcher.specialties.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="research-interests">{t('createProfile.researcher.researchInterests.label')}</Label>
              <Input
                id="research-interests"
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                placeholder={t('createProfile.researcher.researchInterests.placeholder')}
                required
              />
               <p className="text-xs text-muted-foreground">
                {t('createProfile.researcher.researchInterests.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="orcid">{t('createProfile.researcher.orcid.label')}</Label>
                    <Input
                    id="orcid"
                    value={orcidId}
                    onChange={(e) => setOrcidId(e.target.value)}
                    placeholder="0000-0000-0000-0000"
                    />
                    <p className="text-xs text-muted-foreground">{t('createProfile.researcher.orcid.description')}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="researchgate">{t('createProfile.researcher.researchGate.label')}</Label>
                    <Input
                    id="researchgate"
                    value={researchGateProfile}
                    onChange={(e) => setResearchGateProfile(e.target.value)}
                    placeholder="https://www.researchgate.net/profile/..."
                    />
                    <p className="text-xs text-muted-foreground">{t('createProfile.researcher.researchGate.description')}</p>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createProfile.researcher.saveButton')}
            </Button>
            <Button variant="outline" asChild>
                <Link href="/dashboard">{t('common.cancel')}</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
