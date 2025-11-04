import { User } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === 'about-us');

  return (
    <main className="flex-1">
      <section id="about" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <User className="h-12 w-12 text-primary mb-4" />
              <h1 className="font-headline text-4xl font-bold">
                About This Project
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                CuraLink is a demonstration project built by Abhinaba Roy
                Pradhan to showcase the power of modern web technologies in
                the healthcare space. It was founded on the principle that
                the path to medical breakthroughs is paved with
                collaboration. We believe in empowering patients with
                information and connecting them with the researchers who are
                working tirelessly to find cures. Our mission is to break
                down the barriers in healthcare, making research more
                accessible, transparent, and efficient for everyone
                involved.
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
              Get In Touch
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              This project is maintained by Abhinaba Roy Pradhan.
            </p>
            <div className="mt-8">
              <a
                href="mailto:abhinabapradhan@gmail.com"
                className="inline-block bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg text-lg"
              >
                abhinabapradhan@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
