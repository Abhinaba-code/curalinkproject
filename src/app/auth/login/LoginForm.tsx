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
import { useTranslation } from '@/context/language-provider';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');
  const { t } = useTranslation();

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
      const user = await login(email, password, role);
      if (!user) {
        toast({
            variant: 'destructive',
            title: t('auth.login.error.title'),
            description: t('auth.login.error.description')
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('auth.login.error.title'),
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
          <CardTitle className="font-headline text-3xl">{t('auth.login.title')}</CardTitle>
          <CardDescription>
            {t('auth.login.description', { role: t('roles.'+role)})}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
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
              <Label htmlFor="password">{t('auth.password')}</Label>
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
              {t('auth.login.button')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
           <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <Link href={`/auth/signup?role=${role}`} className="font-semibold text-primary hover:underline">
              {t('auth.login.signUpLink')}
            </Link>
          </p>
          <div className="text-center text-sm text-muted-foreground">
            {t('auth.login.areYouA', {role: t('roles.'+otherRole)})}{' '}
            <Link href={`/auth/login?role=${otherRole}`} className="font-semibold text-primary hover:underline transition-colors">
               {t('auth.login.signInAs', {role: t('roles.'+otherRole)})}
            </Link>
          </div>
           <Button variant="link" asChild className="text-muted-foreground mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('auth.backToHome')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
