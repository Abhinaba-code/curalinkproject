
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

export default function CreateResearcherProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
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
        title: 'Incomplete Profile',
        description: 'Please fill out all required fields to continue.',
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
        title: 'Profile Saved!',
        description: 'Your information has been successfully saved.',
      });
      router.push('/dashboard/profile');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not save your profile.',
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
            Your Researcher Profile
          </CardTitle>
          <CardDescription>
            This information will be visible to patients and other researchers. Keep it up to date.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Evelyn Reed"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliation">Affiliation / Institution</Label>
              <Input
                id="affiliation"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="Global Health Institute"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g., I am a neuro-oncologist focused on developing novel therapies..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                A brief professional summary (optional, 200 characters max).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Input
                id="specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="e.g., Neuro-oncology, Glioblastoma"
                required
              />
               <p className="text-xs text-muted-foreground">
                List your clinical or research specialties, separated by commas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="research-interests">Research Interests</Label>
              <Input
                id="research-interests"
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                placeholder="e.g., Targeted Therapy, Immunotherapy, Clinical Trials"
                required
              />
               <p className="text-xs text-muted-foreground">
                List your primary research interests, separated by commas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="orcid">ORCID iD</Label>
                    <Input
                    id="orcid"
                    value={orcidId}
                    onChange={(e) => setOrcidId(e.target.value)}
                    placeholder="0000-0000-0000-0000"
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="researchgate">ResearchGate Profile</Label>
                    <Input
                    id="researchgate"
                    value={researchGateProfile}
                    onChange={(e) => setResearchGateProfile(e.target.value)}
                    placeholder="https://www.researchgate.net/profile/..."
                    />
                    <p className="text-xs text-muted-foreground">Optional</p>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
            <Button variant="outline" asChild>
                <Link href="/dashboard/profile">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
