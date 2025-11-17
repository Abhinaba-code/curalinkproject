
'use client';

import { useAuth } from '@/context/auth-provider';
import { Wallet, PlusCircle, MinusCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/context/language-provider';

export function WalletDisplay() {
  const { user, loading, updateUserProfile } = useAuth();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  if (loading) {
    return <Skeleton className="h-9 w-28" />;
  }

  if (!user) {
    return null;
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: t('wallet.deposit.invalidAmount.title'), description: t('wallet.deposit.invalidAmount.description') });
      return;
    }
    
    const newBalance = (user.walletBalance || 0) + amount;
    try {
        await updateUserProfile({ walletBalance: newBalance });
        toast({ title: t('wallet.deposit.success.title'), description: t('wallet.deposit.success.description', { amount: amount.toFixed(2) }) });
        setDepositAmount('');
    } catch (e: any) {
        toast({ variant: 'destructive', title: t('wallet.error.title'), description: e.message });
    }
  };
  
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: t('wallet.withdraw.invalidAmount.title'), description: t('wallet.withdraw.invalidAmount.description') });
      return;
    }

    if (amount > (user.walletBalance || 0)) {
        toast({ variant: 'destructive', title: t('wallet.withdraw.insufficientFunds.title'), description: t('wallet.withdraw.insufficientFunds.description') });
        return;
    }

    const newBalance = (user.walletBalance || 0) - amount;
    try {
        await updateUserProfile({ walletBalance: newBalance });
        toast({ title: t('wallet.withdraw.success.title'), description: t('wallet.withdraw.success.description', { amount: amount.toFixed(2) }) });
        setWithdrawAmount('');
    } catch (e: any) {
        toast({ variant: 'destructive', title: t('wallet.error.title'), description: e.message });
    }
  };


  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(user.walletBalance || 0);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
             <div className="flex items-center gap-2 rounded-md border bg-background/50 px-3 py-1.5 text-sm font-medium text-muted-foreground cursor-pointer hover:bg-accent">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="font-semibold">{formattedBalance}</span>
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">{t('wallet.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('wallet.description')}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">{t('wallet.currentBalance')}</p>
                    <p className="text-2xl font-bold">{formattedBalance}</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="deposit-amount">{t('wallet.deposit.title')}</Label>
                    <div className="flex gap-2">
                        <Input id="deposit-amount" type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                        <Button onClick={handleDeposit}><PlusCircle className="mr-2 h-4 w-4" />{t('wallet.deposit.button')}</Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">{t('wallet.withdraw.title')}</Label>
                    <div className="flex gap-2">
                        <Input id="withdraw-amount" type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                        <Button onClick={handleWithdraw} variant="destructive"><MinusCircle className="mr-2 h-4 w-4" />{t('wallet.withdraw.button')}</Button>
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>
  );
}
