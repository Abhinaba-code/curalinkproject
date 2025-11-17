

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
  Palette,
  Check,
  Languages,
  Zap,
  MessageSquare,
  TrendingUp,
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
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/theme-provider';
import { useTranslation } from '@/context/language-provider';

function ChangePasswordDialog() {
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('settings.changePassword.errorMatch.title'),
        description: t('settings.changePassword.errorMatch.description'),
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: t('settings.changePassword.errorLength.title'),
        description: t('settings.changePassword.errorLength.description'),
      });
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({
        title: t('settings.changePassword.success.title'),
        description: t('settings.changePassword.success.description'),
      });
      setIsOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('settings.changePassword.errorFailed.title'),
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
          {t('settings.changePassword.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">{t('settings.changePassword.title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('settings.changePassword.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('settings.changePassword.currentPassword')}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('settings.changePassword.newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('settings.changePassword.confirmNewPassword')}</Label>
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
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button onClick={handlePasswordChange} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('settings.changePassword.button')}
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
  const { t } = useTranslation();

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
          <Trash2 className="mr-2 h-4 w-4" /> {t('settings.deleteAccount.button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-center">
          <DialogTitle>{t('settings.deleteAccount.title')}</DialogTitle>
          <DialogDescription>
            {t('settings.deleteAccount.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            {!isConfirmed ? (
                <>
                    <Label htmlFor="email-confirm">{t('settings.deleteAccount.confirmPrompt', { email: user?.email })}</Label>
                    <Input id="email-confirm" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder={t('settings.deleteAccount.emailPlaceholder')} />
                </>
            ) : (
                <div className="text-center text-destructive font-bold text-2xl p-4 rounded-lg bg-destructive/10">
                    {countdown !== null && countdown > 0 ? t('settings.deleteAccount.countdown', { count: countdown }) : t('settings.deleteAccount.readyToDelete')}
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetState}>{t('common.cancel')}</Button>
          </DialogClose>
          {!isConfirmed ? (
              <Button variant="destructive" onClick={handleConfirmClick} disabled={!isEmailMatch}>
                  {t('settings.deleteAccount.confirmButton')}
              </Button>
          ) : (
              <Button variant="destructive" onClick={handleDelete} disabled={countdown !== 0 || isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {countdown !== 0 ? t('settings.deleteAccount.waitingButton') : t('settings.deleteAccount.finalDeleteButton')}
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { name: 'light', colors: ['#e2e8f0', '#3b82f6', '#ec4899'] },
    { name: 'dark', colors: ['#334155', '#60a5fa', '#f472b6'] },
    { name: 'ocean', colors: ['#cbd5e1', '#38bdf8', '#34d399'] },
    { name: 'sunset', colors: ['#fde68a', '#f97316', '#d946ef'] },
    { name: 'forest', colors: ['#dcfce7', '#4d7c0f', '#84cc16'] },
    { name: 'rose', colors: ['#fecdd3', '#f43f5e', '#fb7185'] },
    { name: 'mint', colors: ['#d1fae5', '#10b981', '#6ee7b7'] },
    { name: 'indigo', colors: ['#3730a3', '#818cf8', '#a78bfa'] },
    { name: 'gold', colors: ['#fef3c7', '#f59e0b', '#fbbf24'] },
    { name: 'slate', colors: ['#334155', '#64748b', '#94a3b8'] },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {themes.map((themeOption) => (
        <button
          key={themeOption.name}
          onClick={() => setTheme(themeOption.name as any)}
          className={cn(
            'relative rounded-lg border-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            theme === themeOption.name ? 'border-primary' : 'border-transparent'
          )}
        >
          <div className="flex gap-2">
            {themeOption.colors.map((color, index) => (
              <div
                key={index}
                className="h-8 w-full rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="mt-2 block text-center text-sm capitalize">
            {t('settings.themes.' + themeOption.name)}
          </span>
          {theme === themeOption.name && (
            <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, updateUserProfile, updateWalletBalance } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { t, setLocale, locale } = useTranslation();

  const premiumCost = 59;

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsUpgrading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    if ((user.walletBalance || 0) < premiumCost) {
      toast({
        variant: 'destructive',
        title: t('settings.premium.errorFunds.title'),
        description: t('settings.premium.errorFunds.description'),
      });
      setIsUpgrading(false);
      return;
    }

    try {
      const newBalance = (user.walletBalance || 0) - premiumCost;
      await updateUserProfile({ isPremium: true, walletBalance: newBalance });
      
      toast({
        title: t('settings.premium.success.title'),
        description: t('settings.premium.success.description'),
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: t('settings.premium.errorFailed.title'),
        description: error.message || t('settings.premium.errorFailed.description'),
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleLanguageChange = (language: 'en' | 'hi' | 'bn') => {
    if (user?.isPremium) {
      setLocale(language);
      toast({
        title: t('settings.premium.languageSuccess.title'),
        description: t('settings.premium.languageSuccess.description', { language: t('locales.' + language) }),
      });
    }
  };

  const languages: { code: 'en' | 'hi' | 'bn'; name: string }[] = [
    { code: 'en', name: t('locales.en') },
    { code: 'hi', name: t('locales.hi') },
    { code: 'bn', name: t('locales.bn') },
  ];


  return (
    <div className="space-y-8 animation-fade-in">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="animation-fade-in">
          <CardHeader className="flex flex-row items-center gap-4">
            <User className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings.profile.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t('settings.profile.description')}
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/profile">
                {t('settings.profile.button')} <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="animation-fade-in">
          <CardHeader className="flex flex-row items-center gap-4">
            <KeyRound className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings.account.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              {t('settings.account.description')}
            </CardDescription>
            <ChangePasswordDialog />
          </CardContent>
          <CardFooter className="border-t border-destructive/20 bg-destructive/5 pt-4">
            <DeleteAccountDialog />
          </CardFooter>
        </Card>

        <Card className="animation-fade-in">
          <CardHeader className="flex flex-row items-center gap-4">
            <Bell className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings.notifications.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CardDescription>
              {t('settings.notifications.description')}
            </CardDescription>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="new-trials">{t('settings.notifications.newTrials.label')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.notifications.newTrials.description')}
                </p>
              </div>
              <Switch id="new-trials" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="forum-activity">{t('settings.notifications.forumActivity.label')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.notifications.forumActivity.description')}
                </p>
              </div>
              <Switch id="forum-activity" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">{t('settings.notifications.newsletter.label')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.notifications.newsletter.description')}
                </p>
              </div>
              <Switch id="newsletter" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-1 animation-fade-in">
            <Card className="border-2 border-primary/50 shadow-lg shadow-primary/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>{t('settings.premium.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <MessageSquare className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">{t('settings.premium.expertQA.label')}</h4>
                        <p className="text-xs text-muted-foreground">
                            {t('settings.premium.expertQA.description')}
                        </p>
                    </div>
                </div>
                 <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <TrendingUp className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">{t('settings.premium.priorityMatching.label')}</h4>
                        <p className="text-xs text-muted-foreground">
                            {t('settings.premium.priorityMatching.description')}
                        </p>
                    </div>
                </div>
                 <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <Bell className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">{t('settings.premium.unlimitedReminders.label')}</h4>
                        <p className="text-xs text-muted-foreground">
                            {t('settings.premium.unlimitedReminders.description')}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <Languages className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">{t('settings.premium.multiLanguage.label')}</h4>
                        <p className="text-xs text-muted-foreground">
                            {t('settings.premium.multiLanguage.description')}
                        </p>
                         <div className="flex gap-2 mt-2">
                          {languages.map(lang => (
                            <Button 
                              key={lang.code}
                              variant={locale === lang.code ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleLanguageChange(lang.code)}
                              disabled={!user?.isPremium}
                              className="text-xs"
                            >
                              {locale === lang.code && <Check className="mr-1 h-3 w-3" />}
                              {lang.name}
                            </Button>
                          ))}
                        </div>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                {user?.isPremium ? (
                  <div className="w-full text-center font-semibold text-green-600 flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    {t('settings.premium.premiumMember')}
                  </div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full font-bold" disabled={isUpgrading}>
                        {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('settings.premium.upgradeButton', { price: premiumCost })}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Premium Upgrade</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to subscribe to CuraLink Premium for ₹{premiumCost}/month. This amount will be deducted from your wallet balance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpgrade}>
                          Confirm & Pay
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
        </div>


        <Card className="lg:col-span-2 animation-fade-in">
            <CardHeader className="flex flex-row items-center gap-4">
                <Palette className="h-6 w-6 text-primary" />
                <CardTitle>{t('settings.appearance.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-4">
                    {t('settings.appearance.description')}
                </CardDescription>
                <ThemeSelector />
            </CardContent>
        </Card>
        
      </div>
    </div>
  );
}

    