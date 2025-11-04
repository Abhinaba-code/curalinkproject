import { Shield } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';

export default function PrivacyPage() {
  return (
    <AppShell>
      <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent>
        <main className="flex-1">
          <section id="privacy" className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
              <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h1 className="font-headline text-4xl font-bold">
                Privacy Policy
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                This page is under construction. Our full privacy policy will
                be available here soon. We are committed to protecting your
                data and privacy.
              </p>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
