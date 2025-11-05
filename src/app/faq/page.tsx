
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AppFooter } from '@/components/app-footer';
import { AppShell, AppShellHeader, AppShellContent } from '@/components/app-shell';
import { PublicHeader } from '@/components/public-header';

const faqItems = [
  {
    question: 'What is CuraLink?',
    answer:
      'CuraLink is a platform designed to connect patients and researchers to accelerate medical advancements. We provide tools for finding clinical trials, understanding research, and connecting with experts.',
  },
  {
    question: 'Who can use CuraLink?',
    answer:
      'CuraLink is for everyone! Whether you are a patient seeking treatment options, a caregiver supporting a loved one, or a researcher looking for collaborators and participants, our platform has resources for you.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we take data privacy and security very seriously. We use industry-standard encryption and security protocols to protect your information. Please see our Privacy Policy for more details.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Creating an account and using the basic features of CuraLink is completely free for patients, caregivers, and researchers. We may introduce premium features in the future.',
  },
  {
    question: 'Who developed this project?',
    answer:
      'CuraLink is a demonstration project conceived and built by Abhinaba roy pradhan.',
  },
];

export default function FAQPage() {
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
                  Frequently Asked Questions
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                  Have questions? We've got answers. Here are some of the most
                  common queries we receive.
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
