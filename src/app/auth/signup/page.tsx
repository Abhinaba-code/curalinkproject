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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/auth-provider';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'patient' || roleParam === 'researcher') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-teal-50/50 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>
            Join CuraLink to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a...</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: 'patient' | 'researcher') =>
                  setRole(value)
                }
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                  <Label
                    htmlFor="patient"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Patient
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="researcher"
                    id="researcher"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="researcher"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Researcher
                  </Label>
                </div>
              </RadioGroup>
            </div>
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full font-bold">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
