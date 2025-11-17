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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-provider';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('auth.signup.error.title'),
        description: t('auth.signup.error.passwordMismatch'),
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: t('auth.signup.error.title'),
        description: t('auth.signup.error.passwordLength'),
      });
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, role);
      // On success, redirection is handled by the auth context
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('auth.signup.error.title'),
        description: error.message,
      });
    } finally {
      setLoading(false);
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
          <CardTitle className="font-headline text-3xl">
            {t('auth.signup.title', { role: t('roles.'+role)})}
          </CardTitle>
          <CardDescription>{t('auth.signup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full font-bold"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.signup.button', { role: t('roles.'+role)})}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.signup.haveAccount')}{' '}
            <Link
              href={`/auth/login?role=${role}`}
              className="font-semibold text-primary hover:underline"
            >
              {t('auth.signup.loginLink')}
            </Link>
          </p>
          <div className="text-center text-sm text-muted-foreground">
            {t('auth.signup.areYouA', {role: t('roles.'+otherRole)})}{' '}
            <Link
              href={`/auth/signup?role=${otherRole}`}
              className="font-semibold text-primary hover:underline transition-colors"
            >
              {t('auth.signup.signUpAs', {role: t('roles.'+otherRole)})}
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
