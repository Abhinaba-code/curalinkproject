'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  User,
  KeyRound,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

function ChangePasswordDialog() {
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: "New passwords don't match.",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({
        title: 'Success',
        description: 'Your password has been changed successfully.',
      });
      setIsOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handlePasswordChange} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog() {
  const { user, deleteAccount } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEmailMatch = emailInput === user?.email;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleConfirmClick = () => {
    setIsConfirmed(true);
    setCountdown(3);
  };
  
  const handleDelete = async () => {
    if (countdown === 0) {
        setIsDeleting(true);
        await deleteAccount();
        // The AuthProvider will handle the redirect
    }
  }
  
  const resetState = () => {
      setEmailInput('');
      setIsConfirmed(false);
      setCountdown(null);
      setIsDeleting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete
            your account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            {!isConfirmed ? (
                <>
                    <Label htmlFor="email-confirm">Please type <span className="font-bold">{user?.email}</span> to confirm.</Label>
                    <Input id="email-confirm" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Enter your email" />
                </>
            ) : (
                <div className="text-center text-destructive font-bold text-2xl p-4 rounded-lg bg-destructive/10">
                    {countdown !== null && countdown > 0 ? `Deleting in ${countdown}...` : "Ready to delete"}
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetState}>Cancel</Button>
          </DialogClose>
          {!isConfirmed ? (
              <Button variant="destructive" onClick={handleConfirmClick} disabled={!isEmailMatch}>
                  Confirm
              </Button>
          ) : (
              <Button variant="destructive" onClick={handleDelete} disabled={countdown !== 0 || isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {countdown !== 0 ? 'Waiting...' : 'Delete Permanently'}
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Adjust your account and notification settings.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <User className="h-6 w-6" />
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Manage your personal information, medical interests, and public
              profile. This information helps us personalize your experience.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/create-profile">
                Edit Profile <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <KeyRound className="h-6 w-6" />
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Manage your login credentials and account status.
            </CardDescription>
            <ChangePasswordDialog />
          </CardContent>
          <CardFooter className="border-t border-destructive/20 bg-destructive/5 pt-4">
            <DeleteAccountDialog />
          </CardFooter>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Bell className="h-6 w-6" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CardDescription>
              Choose how you receive notifications from CuraLink.
            </CardDescription>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="new-trials">New Trial Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Receive emails about new trials matching your interests.
                </p>
              </div>
              <Switch id="new-trials" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="forum-activity">Forum Activity</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about replies to your posts and mentions.
                </p>
              </div>
              <Switch id="forum-activity" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Newsletter</Label>
                <p className="text-xs text-muted-foreground">
                  Receive our monthly community newsletter.
                </p>
              </div>
              <Switch id="newsletter" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
