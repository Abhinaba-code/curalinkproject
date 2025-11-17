
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';
import { useTranslation } from '@/context/language-provider';

export default function FAQPage() {
  const { t } = useTranslation();
  const faqItems = [
    {
      question: t('faqPage.q1'),
      answer: t('faqPage.a1'),
    },
    {
      question: t('faqPage.q2'),
      answer: t('faqPage.a2'),
    },
    {
      question: t('faqPage.q3'),
      answer: t('faqPage.a3'),
    },
    {
      question: t('faqPage.q4'),
      answer: t('faqPage.a4'),
    },
    {
      question: t('faqPage.q5'),
      answer: t('faqPage.a5'),
    },
  ];

  return (
    <AppShell>
      <AppShellHeader>
        <PublicHeader />
      </AppShellHeader>
      <AppShellContent>
        <main className="flex-1">
          <section id="faq" className="py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="text-center">
                <h1 className="font-headline text-4xl font-bold">
                  {t('faqPage.title')}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  {t('faqPage.subtitle')}
                </p>
              </div>
              <Accordion type="single" collapsible className="w-full mt-12">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </main>
      </AppShellContent>
      <AppFooter />
    </AppShell>
  );
}
