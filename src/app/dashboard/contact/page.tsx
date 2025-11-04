import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <main className="flex-1">
      <section id="contact" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Phone className="h-12 w-12 text-primary mb-4 mx-auto" />
            <h1 className="font-headline text-4xl font-bold">
              Get In Touch
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We'd love to hear from you. Whether you have a question,
              feedback, or a partnership inquiry, please don't hesitate to
              reach out. This project is maintained by Abhinaba Roy Pradhan.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <a href="mailto:abhinabapradhan@gmail.com">
                  abhinabapradhan@gmail.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
