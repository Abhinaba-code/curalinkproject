import { cn } from '@/lib/utils';
import * as React from 'react';

const AppShell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex min-h-screen flex-col bg-background', className)}
      {...props}
    />
  );
});
AppShell.displayName = 'AppShell';

const AppShellHeader = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
  return (
    <header
      ref={ref}
      className={cn('h-20', className)}
      {...props}
    />
  );
});
AppShellHeader.displayName = 'AppShellHeader';

const AppShellContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex-1', className)}
      {...props}
    />
  );
});
AppShellContent.displayName = 'AppShellContent';


export { AppShell, AppShellHeader, AppShellContent };
