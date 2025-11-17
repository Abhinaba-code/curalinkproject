

'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/auth-provider';
import { ThemeProvider, useTheme } from '@/context/theme-provider';
import { LanguageProvider } from '@/context/language-provider';
import { AuditLogProvider, useAuditLog } from '@/context/audit-log-provider';
import { useEffect, useRef } from 'react';

function AuditLogger() {
  const { user } = useAuth();
  const { addAuditLog } = useAuditLog();
  const previousUserRef = useRef(user);

  useEffect(() => {
    // On login
    if (user && !previousUserRef.current) {
      addAuditLog({
        activity: 'Successful Login',
        details: 'User logged in.',
        type: 'auth',
      });
    }
    
    // On profile update (excluding wallet balance changes to avoid noise)
    if (user && previousUserRef.current && (user.name !== previousUserRef.current.name || user.location !== previousUserRef.current.location)) {
        addAuditLog({
            activity: 'Profile Updated',
            details: 'User profile information was modified.',
            type: 'change'
        });
    }

    previousUserRef.current = user;
  }, [user, addAuditLog]);

  return null;
}


// This component now lives here to correctly access both Auth and Theme contexts.
function PremiumThemeManager() {
  const { user } = useAuth();
  const { setTheme, theme, premiumThemes } = useTheme();

  useEffect(() => {
    if (user?.isPremium) {
      // Premium users can use any theme. We don't need to force change anything here
      // unless we want a default first-time premium theme.
      const manualThemeChoice = localStorage.getItem('cura-theme-manual-choice');
      if (!manualThemeChoice) {
        setTheme('gold');
        localStorage.setItem('cura-theme-manual-choice', 'true');
      }
    } else {
      // If a non-premium user has a premium theme active, revert them.
      if (premiumThemes.includes(theme)) {
        const lastTheme = localStorage.getItem('cura-theme-last-non-premium') as any;
        setTheme(lastTheme || 'light');
      }
    }
  }, [user?.isPremium, setTheme, theme, premiumThemes]);

  return null;
}


function AppProviders({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <AuditLogProvider user={user}>
      <ThemeProvider>
        <LanguageProvider>
          <AuditLogger />
          <PremiumThemeManager />
          {children}
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </AuditLogProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CuraLink</title>
        <meta name="description" content="Connecting patients and researchers for a healthier tomorrow." />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppProviders>
            {children}
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
