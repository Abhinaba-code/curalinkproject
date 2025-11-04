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
import { Calendar, MapPin, Stethoscope, User, Edit } from 'lucide-react';
import { Chatbot } from '@/components/chatbot';
import { format } from 'date-fns';

function ProfileDetail({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4">
            <div className="text-muted-foreground mt-1">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
}

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null; // Or a loading skeleton
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'U';

  return (
    <div className="space-y-6">
        <Chatbot />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            This is your personal profile.
          </p>
        </div>
        <Button asChild>
            <Link href="/dashboard/create-profile">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
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
                <Badge className="capitalize mt-2">{user.role}</Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileDetail icon={<User className="h-5 w-5" />} label="About Me" value={user.bio} />
                <ProfileDetail icon={<Calendar className="h-5 w-5" />} label="Date of Birth" value={user.dob ? format(new Date(user.dob), 'PPP') : null} />
                <ProfileDetail icon={<MapPin className="h-5 w-5" />} label="Location" value={user.location} />
                <ProfileDetail icon={<Stethoscope className="h-5 w-5" />} label="Medical Conditions & Interests" value={user.interests?.join(', ')} />
            </div>
            {(user.bio || user.dob || user.location || user.interests) && (
                 <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                    Your profile details help us personalize your recommendations.
                </p>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Following</CardTitle>
          <CardDescription>
            Experts you are following.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
            <p>You are not following any experts yet. Click the "Follow" button on an expert's card to add them here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
