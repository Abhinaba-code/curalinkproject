

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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useTranslation } from '@/context/language-provider';

export default function CreateProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [dob, setDob] = useState<Date | undefined>(user?.dob ? new Date(user.dob) : undefined);
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [medications, setMedications] = useState(user?.medications?.join(', ') || '');
  const [allergies, setAllergies] = useState(user?.allergies?.join(', ') || '');
  const [pastMedicalTests, setPastMedicalTests] = useState(user?.pastMedicalTests?.join(', ') || '');

  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!fullName || !dob || !location || !interests) {
      toast({
        variant: 'destructive',
        title: t('createProfile.patient.error.title'),
        description: t('createProfile.patient.error.description'),
      });
      setLoading(false);
      return;
    }

    try {
      await updateUserProfile({
        name: fullName,
        dob: dob.toISOString(),
        location,
        bio,
        interests: interests.split(',').map(i => i.trim()).filter(Boolean),
        medications: medications.split(',').map(i => i.trim()).filter(Boolean),
        allergies: allergies.split(',').map(i => i.trim()).filter(Boolean),
        pastMedicalTests: pastMedicalTests.split(',').map(i => i.trim()).filter(Boolean),
      });

      toast({
        title: t('createProfile.patient.success.title'),
        description: t('createProfile.patient.success.description'),
      });
      router.push('/dashboard');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: t('createProfile.patient.saveFailed.title'),
        description: error.message || t('createProfile.patient.saveFailed.description'),
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
            {t('createProfile.patient.title')}
          </CardTitle>
          <CardDescription>
            {t('createProfile.patient.description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">{t('createProfile.patient.fullName.label')}</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('createProfile.patient.fullName.placeholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">{t('createProfile.patient.dob.label')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dob"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dob && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, 'PPP') : <span>{t('createProfile.patient.dob.placeholder')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      initialFocus
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  {t('createProfile.patient.dob.description')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('createProfile.patient.location.label')}</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('createProfile.patient.location.placeholder')}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.patient.location.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('createProfile.patient.bio.label')}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('createProfile.patient.bio.placeholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.patient.bio.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">
                {t('createProfile.patient.interests.label')}
              </Label>
              <Textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={t('createProfile.patient.interests.placeholder')}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.patient.interests.description')}
              </p>
            </div>

             <div className="space-y-2">
              <Label htmlFor="medications">{t('createProfile.patient.medications.label')}</Label>
              <Textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder={t('createProfile.patient.medications.placeholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.patient.medications.description')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">{t('createProfile.patient.allergies.label')}</Label>
              <Textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder={t('createProfile.patient.allergies.placeholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.patient.allergies.description')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="past-tests">{t('createProfile.patient.pastTests.label')}</Label>
              <Textarea
                id="past-tests"
                value={pastMedicalTests}
                onChange={(e) => setPastMedicalTests(e.target.value)}
                placeholder={t('createProfile.patient.pastTests.placeholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('createProfile.patient.pastTests.description')}
              </p>
            </div>

          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createProfile.patient.saveButton')}
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
