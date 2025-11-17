
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dna,
  HeartPulse,
  Microscope,
  Stethoscope,
  Users,
  FileText,
  FlaskConical,
} from 'lucide-react';
import Link from 'next/link';
import { AppFooter } from '@/components/app-footer';
import { PublicHeader } from '@/components/public-header';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { Chatbot } from '@/components/chatbot';
import { useTranslation } from '@/context/language-provider';

export default function Home() {
  const { t } = useTranslation();

  const featureCards = [
    {
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      title: t('homePage.feature1Title'),
      description: t('homePage.feature1Desc'),
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: t('homePage.feature2Title'),
      description: t('homePage.feature2Desc'),
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('homePage.feature3Title'),
      description: t('homePage.feature3Desc'),
    },
  ];

  return (
    <AppShell>
       <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent className="animate-fade-in">
        <main className="flex-1">
          <section className="relative overflow-hidden py-20 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                <div className="z-10 text-center md:text-left">
                  <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl">
                    {t('homePage.title')}
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                    {t('homePage.subtitle')}
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                    <Button size="lg" asChild className="font-bold">
                      <Link href="/auth/signup?role=patient">
                        {t('homePage.patientButton')}
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="font-bold"
                    >
                      <Link href="/auth/signup?role=researcher">
                        {t('homePage.researcherButton')}
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="relative h-64 md:h-full">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 animate-fade-in">
                    <Dna
                      className="h-10 w-10 animate-pulse text-primary/50"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <Stethoscope
                      className="h-12 w-12 animate-pulse text-primary/40"
                      style={{ animationDelay: '0.3s' }}
                    />
                    <HeartPulse
                      className="h-14 w-14 animate-pulse text-primary/70"
                      style={{ animationDelay: '0.5s' }}
                    />
                    <Microscope
                      className="h-16 w-16 animate-pulse text-primary/60"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="h-8 w-8 rounded-full bg-primary/30 animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                    <FlaskConical
                      className="h-12 w-12 animate-pulse text-primary/60"
                      style={{ animationDelay: '0.6s' }}
                    />
                    <div
                      className="h-10 w-10 rounded-full bg-primary/20 animate-pulse"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <Users
                      className="h-14 w-14 animate-pulse text-primary/50"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="font-headline text-4xl font-bold">
                  {t('homePage.featuresTitle')}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  {t('homePage.featuresSubtitle')}
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                {featureCards.map((feature, index) => (
                   <Card key={index}>
                    <CardHeader className="items-center text-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="font-headline pt-4 text-2xl">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 bg-secondary/30">
            <div className="container mx-auto text-center">
              <h2 className="font-headline text-4xl font-bold">
                {t('homePage.joinTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                {t('homePage.joinSubtitle')}
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">{t('homePage.joinButton')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Chatbot />
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
