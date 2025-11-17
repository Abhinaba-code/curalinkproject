
'use client';

import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';
import { useTranslation } from '@/context/language-provider';

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <AppShell>
        <AppShellHeader>
            <PublicHeader />
        </AppShellHeader>
        <AppShellContent>
            <main className="flex-1">
            <section id="contact" className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                <div className="text-center">
                    <Phone className="h-12 w-12 text-primary mb-4 mx-auto" />
                    <h1 className="font-headline text-4xl font-bold">
                    {t('contactPage.title')}
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    {t('contactPage.paragraph')}
                    </p>
                    <div className="mt-8">
                    <Button size="lg" asChild>
                        <a href="mailto:abhinabapradhan@gmail.com">
                        {t('contactPage.emailButton')}
                        </a>
                    </Button>
                    </div>
                </div>
                </div>
            </section>
            </main>
        </AppShellContent>
        <AppFooter />
    </AppShell>
  );
}
