import Link from 'next/link';
import { Logo } from './logo';

export function AppFooter() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <Logo />
            <p className="text-sm text-muted-foreground mt-2">
              &copy; {new Date().getFullYear()} CuraLink. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
