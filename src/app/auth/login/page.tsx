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
import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'researcher') {
      setRole('researcher');
    } else {
      setRole('patient');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, role);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    }
  };
  
  const otherRole = role === 'patient' ? 'researcher' : 'patient';

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to CuraLink</CardTitle>
          <CardDescription>
            Sign in to your <span className="capitalize font-semibold">{role}</span> account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
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
            <Button type="submit" className="w-full font-bold">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
           <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/signup?role=${role}`} className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
          <div className="text-center text-sm text-muted-foreground">
            Are you a {otherRole}?{' '}
            <Link href={`/auth/login?role=${otherRole}`} className="font-semibold text-primary hover:underline transition-colors">
               Sign in as a <span className="capitalize">{otherRole}</span>
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
