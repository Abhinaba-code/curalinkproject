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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CreateProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.name || 'John Doe');
  const [dob, setDob] = useState<Date>();
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this data to your backend.
    // For now, we'll just show a success message and redirect.
    toast({
      title: 'Profile Saved!',
      description: 'Your information has been successfully saved.',
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Create Your Patient Profile
          </CardTitle>
          <CardDescription>
            This information helps us personalize your experience. Keep it up to
            date.
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
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
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
                      {dob ? format(dob, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Your date of birth is used to calculate your age.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Bengaluru, Karnataka, India"
              />
              <p className="text-xs text-muted-foreground">
                Your city, state, and country help us find relevant local
                trials.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little bit about yourself."
              />
              <p className="text-xs text-muted-foreground">
                A brief summary about you (optional).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">
                Medical Conditions or Interests
              </Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., Glioblastoma, Lung Cancer, Immunotherapy"
              />
              <p className="text-xs text-muted-foreground">
                List the conditions or research topics you are interested in,
                separated by commas.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Profile</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
