'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-provider';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');
  const { signup } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'researcher') {
      setRole('researcher');
    } else {
      setRole('patient');
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: "Passwords don't match!",
      });
      return;
    }
    try {
      await signup(email, password, role);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    }
  };

  const otherRole = role === 'patient' ? 'researcher' : 'patient';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-teal-50/50 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">Create a <span className="capitalize">{role}</span> Account</CardTitle>
          <CardDescription>
            Join CuraLink to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full font-bold">
              Sign up as a <span className="capitalize">{role}</span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href={`/auth/login?role=${role}`} className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
          <div className="text-center text-sm text-muted-foreground">
            Are you a {otherRole}?{' '}
            <Link href={`/auth/signup?role=${otherRole}`} className="font-semibold text-primary hover:underline transition-colors">
               Sign up as a <span className="capitalize">{otherRole}</span>
            </Link>
          </div>
          <Button variant="link" asChild className="text-muted-foreground mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
