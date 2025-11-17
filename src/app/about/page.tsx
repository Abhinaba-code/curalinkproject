
'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';
import { useTranslation } from '@/context/language-provider';

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === 'about-us');
  const { t } = useTranslation();

  return (
    <AppShell>
        <AppShellHeader>
            <PublicHeader />
        </AppShellHeader>
        <AppShellContent>
            <main className="flex-1">
            <section id="about" className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                    <User className="h-12 w-12 text-primary mb-4" />
                    <h1 className="font-headline text-4xl font-bold">
                        {t('aboutPage.title')}
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('aboutPage.paragraph')}
                    </p>
                    </div>
                    <div className="h-80 w-full relative rounded-lg overflow-hidden shadow-lg">
                    {aboutImage ? (
                        <Image
                        src={aboutImage.imageUrl}
                        alt={aboutImage.description}
                        fill
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={aboutImage.imageHint}
                        />
                    ) : (
                        <div className="h-full bg-secondary/30 flex items-center justify-center">
                        <p className="text-muted-foreground">
                            [Placeholder for an inspiring image]
                        </p>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            </section>

            <section id="contact" className="py-20 md:py-32 bg-secondary/30">
                <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="font-headline text-4xl font-bold">
                    {t('aboutPage.contactTitle')}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    {t('aboutPage.contactParagraph')}
                    </p>
                    <div className="mt-8">
                    <a
                        href="mailto:abhinabapradhan@gmail.com"
                        className="inline-block bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg text-lg"
                    >
                        {t('aboutPage.contactEmail')}
                    </a>
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
