
'use client';

import { Shield } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';
import { useTranslation } from '@/context/language-provider';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent>
        <main className="flex-1">
          <section id="privacy" className="py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="text-center">
                <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
                <h1 className="font-headline text-4xl font-bold">
                  {t('privacyPage.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">{t('privacyPage.lastUpdated', { date: new Date().toLocaleDateString() })}</p>
              </div>
              <div className="prose lg:prose-lg max-w-none mx-auto mt-12 text-muted-foreground">
                <p>{t('privacyPage.welcome')}</p>
                
                <h2>{t('privacyPage.collectionTitle')}</h2>
                <p>{t('privacyPage.collectionText')}</p>

                <h2>{t('privacyPage.useTitle')}</h2>
                <p>{t('privacyPage.useText')}</p>
                <ul>
                  <li>{t('privacyPage.useL1')}</li>
                  <li>{t('privacyPage.useL2')}</li>
                  <li>{t('privacyPage.useL3')}</li>
                  <li>{t('privacyPage.useL4')}</li>
                  <li>{t('privacyPage.useL5')}</li>
                  <li>{t('privacyPage.useL6')}</li>
                </ul>

                <h2>{t('privacyPage.securityTitle')}</h2>
                <p>{t('privacyPage.securityText')}</p>

                <h2>{t('privacyPage.contactTitle')}</h2>
                <p>{t('privacyPage.contactText', { email: '' })} <a href="mailto:abhinabapradhan@gmail.com" className="text-primary">abhinabapradhan@gmail.com</a></p>
              </div>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
