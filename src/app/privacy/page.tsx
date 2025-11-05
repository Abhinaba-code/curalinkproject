
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
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="text-center">
                <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
                <h1 className="font-headline text-4xl font-bold">
                  Privacy Policy
                </h1>
                <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="prose lg:prose-lg max-w-none mx-auto mt-12 text-muted-foreground">
                <p>Welcome to CuraLink, a demonstration project developed by Abhinaba roy pradhan. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
                
                <h2>Collection of Your Information</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</p>

                <h2>Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul>
                  <li>Create and manage your account.</li>
                  <li>Email you regarding your account or order.</li>
                  <li>Enable user-to-user communications.</li>
                  <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                  <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                  <li>Increase the efficiency and operation of the Site.</li>
                </ul>

                <h2>Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

                <h2>Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact the project developer, Abhinaba roy pradhan, at: <a href="mailto:abhinabapradhan@gmail.com" className="text-primary">abhinabapradhan@gmail.com</a></p>
              </div>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
