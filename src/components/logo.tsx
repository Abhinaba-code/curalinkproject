import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HeartPulse } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2 text-xl font-bold font-headline text-foreground',
        className
      )}
    >
      <HeartPulse className="h-6 w-6 text-primary" />
      <span>CuraLink</span>
    </Link>
  );
}
