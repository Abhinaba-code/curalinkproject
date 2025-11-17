
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HeartPulse,
  Users,
  FlaskConical,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { AppFooter } from '@/components/app-footer';
import { PublicHeader } from '@/components/public-header';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { Chatbot } from '@/components/chatbot';
import { useTranslation } from '@/context/language-provider';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { t } = useTranslation();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const joinImage = PlaceHolderImages.find(img => img.id === 'join-background');

  const featureCards = [
    {
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      title: t('homePage.feature1Title'),
      description: t('homePage.feature1Desc'),
      link: '/dashboard/trials'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('homePage.feature3Title'),
      description: t('homePage.feature3Desc'),
      link: '/dashboard/experts'
    },
    {
      icon: <HeartPulse className="h-8 w-8 text-primary" />,
      title: t('homePage.feature2Title'),
      description: t('homePage.feature2Desc'),
      link: '/dashboard/publications'
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Tell us about your interests and background, whether you are a patient or a researcher.'
    },
    {
      step: 2,
      title: 'Discover & Connect',
      description: 'Find relevant clinical trials, read the latest research, and connect with experts in the field.'
    },
    {
      step: 3,
      title: 'Accelerate Research',
      description: 'Collaborate and share knowledge to help advance medical science and improve patient outcomes.'
    }
  ]

  return (
    <AppShell>
       <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent className="animate-fade-in">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-secondary/30">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
                <div className="text-center lg:text-left">
                     <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl">
                        {t('homePage.title')}
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-muted-foreground md:text-xl">
                        {t('homePage.subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                        <Button size="lg" asChild className="font-bold shadow-lg">
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
                <div className="relative h-80 lg:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl">
                    {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint={heroImage.imageHint}
                    />
                    )}
                </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center">
                  <h2 className="font-headline text-4xl font-bold">How It Works</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    A simple path to connection and discovery.
                  </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
                {howItWorksSteps.map((step) => (
                  <div key={step.step} className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 mx-auto mb-6 rounded-full bg-primary text-primary-foreground font-bold text-2xl shadow-lg">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 md:py-32 bg-secondary/30">
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
                   <Card key={index} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <CardHeader>
                      <div className="rounded-lg bg-primary/10 p-4 w-fit">
                        {feature.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="font-bold text-xl mb-2">
                        {feature.title}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                       <Link href={feature.link} className="font-semibold text-primary group-hover:underline flex items-center gap-2">
                          Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                       </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Join Section */}
          <section className="relative py-20 md:py-32">
             {joinImage && (
              <Image
                src={joinImage.imageUrl}
                alt={joinImage.description}
                fill
                className="object-cover"
                data-ai-hint={joinImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-primary/80" />
            <div className="container mx-auto text-center relative z-10 text-primary-foreground">
              <h2 className="font-headline text-4xl font-bold">
                {t('homePage.joinTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
                {t('homePage.joinSubtitle')}
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary" asChild>
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
