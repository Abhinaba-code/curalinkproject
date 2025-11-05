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

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, verifyOtpAndCompleteSignup } = useAuth();
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: "Passwords don't match!",
      });
      return;
    }
    if (password.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: 'Password must be at least 6 characters long.',
        });
        return;
    }

    setLoading(true);
    try {
      // This will now just send the OTP and not create the user yet.
      const mockOtp = await signup(email, password, role);
      toast({
        title: 'OTP Sent',
        description: `For demonstration, your OTP is: ${mockOtp}`,
        duration: 9000,
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await verifyOtpAndCompleteSignup(email, password, role, otp);
        // The context now handles redirection, so we might not need to do it here.
        // On success, the user will be logged in and redirected.
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Verification Failed',
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
            {step === 'details' ? `Create a ${role} Account` : 'Verify Your Email'}
          </CardTitle>
          <CardDescription>
            {step === 'details' ? 'Join CuraLink to get started.' : `An OTP has been sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign up as a <span className="capitalize">{role}</span>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full font-bold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Create Account
                </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
            {step === 'details' && (
                <>
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
                </>
            )}
             {step === 'otp' && (
                 <p className="text-center text-sm text-muted-foreground">
                    Didn't receive an OTP?{' '}
                    <button onClick={() => setStep('details')} className="font-semibold text-primary hover:underline">
                        Go back and try again
                    </button>
                </p>
            )}
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
