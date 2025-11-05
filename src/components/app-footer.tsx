
import Link from 'next/link';
import { Logo } from './logo';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

const footerLinks = [
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'FAQ', href: '/faq' },
        ]
    },
    {
        title: 'Legal',
        links: [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
        ]
    }
];


export function AppFooter() {
  return (
    <footer className="bg-secondary border-t relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-24 bg-background/30 [mask-image:url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20viewBox%3d%220%200%201440%20120%22%3e%3cpath%20d%3d%22M1440%2c32L1320%2c64L1200%2c42.7L1080%2c42.7L960%2c21.3L840%2c53.3L720%2c32L600%2c64L480%2c74.7L360%2c64L240%2c32L120%2c42.7L0%2c21.3L0%2c120L120%2c120L240%2c120L360%2c120L480%2c120L600%2c120L720%2c120L840%2c120L960%2c120L1080%2c120L1200%2c120L1320%2c120L1440%2c120Z%22%20fill%3d%22%23fff%22%2f%3e%3c/svg%3e')] mask-repeat: no-repeat mask-size: cover"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="text-sm text-muted-foreground mt-4">
                Connecting patients and researchers for a healthier tomorrow.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
                <div key={group.title}>
                    <h3 className="font-semibold text-foreground mb-4">{group.title}</h3>
                    <ul className="space-y-2">
                        {group.links.map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
             <div>
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex items-center gap-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                        <Twitter className="h-5 w-5"/>
                        <span className="sr-only">Twitter</span>
                    </Link>
                     <Link href="#" className="text-muted-foreground hover:text-primary">
                        <Linkedin className="h-5 w-5"/>
                        <span className="sr-only">LinkedIn</span>
                    </Link>
                     <Link href="#" className="text-muted-foreground hover:text-primary">
                        <Facebook className="h-5 w-5"/>
                        <span className="sr-only">Facebook</span>
                    </Link>
                </div>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
