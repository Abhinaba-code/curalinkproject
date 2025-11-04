import { LifeBuoy } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';

export default function HelpPage() {
  return (
    <AppShell>
      <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent>
        <main className="flex-1">
          <section id="help" className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
              <LifeBuoy className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h1 className="font-headline text-4xl font-bold">Help Center</h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                This page is under construction. Please check back later for
                support resources. For immediate assistance, please visit our{' '}
                <a href="/contact" className="text-primary underline">
                  Contact
                </a>{' '}
                page.
              </p>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
