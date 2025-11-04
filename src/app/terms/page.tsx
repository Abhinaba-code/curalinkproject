import { FileText } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';

export default function TermsPage() {
  return (
    <AppShell>
      <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent>
        <main className="flex-1">
          <section id="terms" className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
              <FileText className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h1 className="font-headline text-4xl font-bold">
                Terms of Service
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                This page is under construction. Our terms of service will be
                detailed here shortly.
              </p>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
