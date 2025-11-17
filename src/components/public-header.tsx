
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { useTranslation } from '@/context/language-provider';

export function PublicHeader() {
  const { t } = useTranslation();

  const navLinks = [
    { href: '/about', label: t('publicHeader.about') },
    { href: '/faq', label: t('publicHeader.faq') },
    { href: '/contact', label: t('publicHeader.contact') },
    { href: '/terms', label: t('publicHeader.terms') },
    { href: '/privacy', label: t('publicHeader.privacy') },
  ];

  return (
    <div className="container mx-auto flex h-20 items-center justify-between px-4">
      <Logo />
      <nav className="hidden items-center gap-6 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/auth/login">{t('publicHeader.login')}</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">{t('publicHeader.getStarted')}</Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium pt-10">
              <Logo />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
