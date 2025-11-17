
'use client';

import { FileText } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';
import { useTranslation } from '@/context/language-provider';

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent>
        <main className="flex-1">
          <section id="terms" className="py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-3xl">
               <div className="text-center">
                <FileText className="h-12 w-12 text-primary mb-4 mx-auto" />
                <h1 className="font-headline text-4xl font-bold">
                  {t('termsPage.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">{t('termsPage.lastUpdated', { date: new Date().toLocaleDateString() })}</p>
              </div>
              <div className="prose lg:prose-lg max-w-none mx-auto mt-12 text-muted-foreground">
                <h2>{t('termsPage.agreementTitle')}</h2>
                <p>{t('termsPage.agreementText')}</p>

                <h2>{t('termsPage.contentTitle')}</h2>
                <p>{t('termsPage.contentText')}</p>

                <h2>{t('termsPage.accountsTitle')}</h2>
                <p>{t('termsPage.accountsText')}</p>
                
                <h2>{t('termsPage.ipTitle')}</h2>
                <p>{t('termsPage.ipText')}</p>

                <h2>{t('termsPage.disclaimerTitle')}</h2>
                <p>{t('termsPage.disclaimerText')}</p>
                
                <h2>{t('termsPage.lawTitle')}</h2>
                <p>{t('termsPage.lawText')}</p>
                
                <h2>{t('termsPage.changesTitle')}</h2>
                <p>{t('termsPage.changesText')}</p>

                <h2>{t('termsPage.contactTitle')}</h2>
                <p>{t('termsPage.contactText', { email: '' })} <a href="mailto:abhinabapradhan@gmail.com" className="text-primary">abhinabapradhan@gmail.com</a></p>
              </div>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
