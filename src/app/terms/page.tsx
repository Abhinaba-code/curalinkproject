
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
            <div className="container mx-auto px-4 max-w-3xl">
               <div className="text-center">
                <FileText className="h-12 w-12 text-primary mb-4 mx-auto" />
                <h1 className="font-headline text-4xl font-bold">
                  Terms of Service
                </h1>
                <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="prose lg:prose-lg max-w-none mx-auto mt-12 text-muted-foreground">
                <h2>1. Agreement to Terms</h2>
                <p>By using our services, you agree to be bound by these Terms. If you do not agree to be bound by these Terms, do not use the services. This is a demonstration project developed by Abhinaba roy pradhan and should not be used for actual medical decisions.</p>

                <h2>2. Content</h2>
                <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

                <h2>3. Accounts</h2>
                <p>When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
                
                <h2>4. Intellectual Property</h2>
                <p>The Service and its original content, features and functionality are and will remain the exclusive property of CuraLink and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

                <h2>5. Disclaimer</h2>
                <p>The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied, including, but not to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance. Information provided on CuraLink is not a substitute for professional medical advice.</p>
                
                <h2>6. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
                
                <h2>7. Changes</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect.</p>

                <h2>Contact Us</h2>
                <p>If you have any questions about these Terms, please contact the project developer, Abhinaba roy pradhan, at: <a href="mailto:abhinabapradhan@gmail.com" className="text-primary">abhinabapradhan@gmail.com</a></p>
              </div>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
