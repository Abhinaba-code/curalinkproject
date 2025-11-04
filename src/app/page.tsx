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
  LifeBuoy,
  Info,
  MessageSquare,
  Shield,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Chatbot } from '@/components/chatbot';

const featureCards = [
  {
    icon: <FlaskConical className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Trial Matching',
    description:
      'Our intelligent platform analyzes your profile to find the most relevant clinical trials for you.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Simplified Research',
    description:
      'Access AI-summarized medical publications to easily understand complex research.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Health Expert Connections',
    description:
      'Connect with leading health experts and researchers in your field of interest.',
  },
];

const faqItems = [
  {
    question: "What is CuraLink?",
    answer: "CuraLink is a platform designed to connect patients and researchers to accelerate medical advancements. We provide tools for finding clinical trials, understanding research, and connecting with experts."
  },
  {
    question: "Who can use CuraLink?",
    answer: "CuraLink is for everyone! Whether you are a patient seeking treatment options, a caregiver supporting a loved one, or a researcher looking for collaborators and participants, our platform has resources for you."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data privacy and security very seriously. We use industry-standard encryption and security protocols to protect your information. Please see our Privacy Policy for more details."
  },
  {
    question: "How much does it cost?",
    answer: "Creating an account and using the basic features of CuraLink is completely free for patients, caregivers, and researchers. We may introduce premium features in the future."
  }
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-50/50 to-background"></div>
           <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div className="z-10 text-center md:text-left">
                <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl">
                  CuraLink
                </h1>
                <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                  Connecting Patients and Researchers for a Healthier Tomorrow.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                  <Button size="lg" asChild className="font-bold">
                    <Link href="/auth/signup?role=patient">
                      I'm a Patient or Caregiver
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="font-bold">
                    <Link href="/auth/signup?role=researcher">
                      I'm a Researcher
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-64 md:h-full">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 animate-fade-in">
                  <Dna className="h-10 w-10 animate-pulse text-primary/50" style={{ animationDelay: '0.1s' }} />
                  <Stethoscope className="h-12 w-12 animate-pulse text-accent/60" style={{ animationDelay: '0.3s' }} />
                  <HeartPulse className="h-14 w-14 animate-pulse text-primary/70" style={{ animationDelay: '0.5s' }} />
                  <Microscope className="h-16 w-16 animate-pulse text-accent/80" style={{ animationDelay: '0.2s' }} />
                  <div className="h-8 w-8 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <FlaskConical className="h-12 w-12 animate-pulse text-primary/60" style={{ animationDelay: '0.6s' }} />
                   <div className="h-10 w-10 rounded-full bg-accent/40 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                   <Users className="h-14 w-14 animate-pulse text-primary/50" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-4xl font-bold">
                A New Era of Collaborative Healthcare
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                CuraLink empowers you with tools and connections to navigate the
                complex world of medical research.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {featureCards.map((feature, index) => (
                <Card
                  key={index}
                  className="transform-gpu transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
                >
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

        <section id="about" className="py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Info className="h-12 w-12 text-primary mb-4" />
                <h2 className="font-headline text-4xl font-bold">About CuraLink</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  CuraLink was founded on the principle that the path to medical breakthroughs is paved with collaboration. We believe in empowering patients with information and connecting them with the researchers who are working tirelessly to find cures. Our mission is to break down the barriers in healthcare, making research more accessible, transparent, and efficient for everyone involved.
                </p>
              </div>
              <div className="h-64 bg-background rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">[Placeholder for an inspiring image]</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 md:py-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center">
              <h2 className="font-headline text-4xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Have questions? We've got answers. Here are some of the most common queries we receive.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="contact" className="py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4">
             <div className="text-center">
              <Phone className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h2 className="font-headline text-4xl font-bold">Get In Touch</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                We'd love to hear from you. Whether you have a question, feedback, or a partnership inquiry, please don't hesitate to reach out.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <a href="mailto:contact@curalink.com">contact@curalink.com</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto text-center">
             <h2 className="font-headline text-4xl font-bold">Ready to Join?</h2>
             <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Become part of a community dedicated to advancing medical science and improving patient outcomes.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Create Your Free Account</Link>
                </Button>
              </div>
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                     <Logo className="text-white"/>
                     <p className="text-sm text-slate-300 mt-2">&copy; {new Date().getFullYear()} CuraLink. All rights reserved.</p>
                </div>
                <div>
                    <h3 className="font-semibold">Company</h3>
                    <ul className="space-y-2 mt-4 text-sm">
                        <li><a href="#about" className="text-slate-300 hover:text-white">About</a></li>
                        <li><a href="#" className="text-slate-300 hover:text-white">Careers</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold">Resources</h3>
                    <ul className="space-y-2 mt-4 text-sm">
                        <li><a href="#contact" className="text-slate-300 hover:text-white">Contact</a></li>
                        <li><a href="#faq" className="text-slate-300 hover:text-white">FAQ</a></li>
                         <li><a href="#" className="text-slate-300 hover:text-white">Help Center</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold">Legal</h3>
                    <ul className="space-y-2 mt-4 text-sm">
                        <li><a href="#" className="text-slate-300 hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" className="text-slate-300 hover:text-white">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
